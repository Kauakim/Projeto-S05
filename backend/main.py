import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import delete, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

import database
from auth import (
    create_access_token,
    get_current_user,
    get_optional_user,
    hash_password,
    verify_password,
)
from database import close_database, get_db, get_db_status, init_database
from linkedin_service import coletar_e_analisar_perfil_linkedin, coletar_vagas_linkedin
from news_service import chave_ordenacao_noticia, sincronizar_noticias_no_banco
from models import (
    AnaliseLinkedIn,
    Aula,
    Candidatura,
    Evento,
    Noticia,
    Usuario,
    Vaga,
    VagaLinkedInCache,
)
from schemas import (
    AlterarSenhaRequest,
    AnalisarPerfilLinkedInRequest,
    AnaliseLinkedInOut,
    AulaOut,
    AuthResponse,
    BuscarVagasLinkedInRequest,
    CandidaturaCreate,
    CandidaturaOut,
    EventoOut,
    LoginRequest,
    NoticiaCreate,
    NoticiaOut,
    RegistroRequest,
    SincronizarNoticiasOut,
    UsuarioOut,
    UsuarioUpdate,
    VagaCreate,
    VagaLinkedInOut,
    VagaOut,
)
from seed import seed_initial_data


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_database()
    assert database.SessionLocal is not None
    async with database.SessionLocal() as session:
        await seed_initial_data(session)
    yield
    await close_database()


app = FastAPI(
    title="Inatel Portal Acadêmico API",
    description="Backend FastAPI + PostgreSQL com Autenticação JWT, Painel do Aluno, Perfil, Vagas (NESP) e Notícias.",
    version="2.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "inatel-portal-api",
        "database": get_db_status(),
    }


# ==========================================
# AUTENTICAÇÃO (LOGIN, REGISTRO E SESSÃO)
# ==========================================
@app.post("/api/auth/login", response_model=AuthResponse)
async def fazer_login(
    credenciais: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    ident = credenciais.identificador.strip().lower()
    stmt = select(Usuario).where(
        or_(
            func.lower(Usuario.email) == ident,
            func.lower(Usuario.matricula) == ident,
        )
    )
    res = await db.execute(stmt)
    user = res.scalar_one_or_none()

    if user is None or not verify_password(credenciais.senha, user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="E-mail/matrícula ou senha incorretos.",
        )

    token = create_access_token(user.id)
    return AuthResponse(access_token=token, usuario=UsuarioOut.model_validate(user))


@app.post(
    "/api/auth/registro",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
)
async def registrar_usuario(
    dados: RegistroRequest,
    db: AsyncSession = Depends(get_db),
):
    email_limpo = dados.email.strip().lower()
    matricula_limpa = dados.matricula.strip().upper()

    res_email = await db.execute(
        select(Usuario).where(func.lower(Usuario.email) == email_limpo)
    )
    if res_email.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma conta cadastrada com este e-mail.",
        )

    res_mat = await db.execute(
        select(Usuario).where(func.lower(Usuario.matricula) == matricula_limpa.lower())
    )
    if res_mat.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um aluno cadastrado com esta matrícula.",
        )

    novo_usuario = Usuario(
        nome=dados.nome.strip(),
        matricula=matricula_limpa,
        curso=dados.curso.strip(),
        periodo=dados.periodo,
        email=email_limpo,
        telefone=dados.telefone.strip(),
        senha_hash=hash_password(dados.senha),
        bio=f"Estudante de {dados.curso.strip()} ({dados.periodo}º período) no Inatel.",
        areas_interesse="Tecnologia, Engenharia, Inovação",
        ira=80.0,
        horas_complementares=0,
        meta_horas=160,
        disponivel_estagio=True,
        atualizado_em=datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M"),
    )
    db.add(novo_usuario)
    await db.commit()
    await db.refresh(novo_usuario)

    token = create_access_token(novo_usuario.id)
    return AuthResponse(
        access_token=token,
        usuario=UsuarioOut.model_validate(novo_usuario),
    )


@app.get("/api/auth/me", response_model=UsuarioOut)
async def obter_sessao_atual(current_user: Usuario = Depends(get_current_user)):
    return current_user


# ==========================================
# USUÁRIO / PERFIL E ALTERAÇÃO DE SENHA
# ==========================================
@app.get("/api/usuario", response_model=UsuarioOut)
async def obter_usuario(current_user: Usuario = Depends(get_current_user)):
    return current_user


@app.put("/api/usuario", response_model=UsuarioOut)
async def atualizar_usuario(
    dados: UsuarioUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_fields = dados.model_dump(exclude_unset=True)

    # Verifica unicidade se e-mail for alterado
    if "email" in update_fields and update_fields["email"] is not None:
        novo_email = update_fields["email"].strip().lower()
        if novo_email != current_user.email.lower():
            dup = await db.execute(
                select(Usuario).where(
                    func.lower(Usuario.email) == novo_email,
                    Usuario.id != current_user.id,
                )
            )
            if dup.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=400,
                    detail="Este e-mail já está em uso por outro usuário.",
                )
        update_fields["email"] = novo_email

    # Verifica unicidade se matrícula for alterada
    if "matricula" in update_fields and update_fields["matricula"] is not None:
        nova_mat = update_fields["matricula"].strip().upper()
        if nova_mat.lower() != current_user.matricula.lower():
            dup_m = await db.execute(
                select(Usuario).where(
                    func.lower(Usuario.matricula) == nova_mat.lower(),
                    Usuario.id != current_user.id,
                )
            )
            if dup_m.scalar_one_or_none() is not None:
                raise HTTPException(
                    status_code=400,
                    detail="Esta matrícula já pertence a outro aluno.",
                )
        update_fields["matricula"] = nova_mat

    if "nome" in update_fields and update_fields["nome"] is not None:
        update_fields["nome"] = update_fields["nome"].strip()

    for campo, valor in update_fields.items():
        setattr(current_user, campo, valor)

    current_user.atualizado_em = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")
    await db.commit()
    await db.refresh(current_user)
    return current_user


@app.put("/api/usuario/senha")
async def alterar_senha_usuario(
    dados: AlterarSenhaRequest,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(dados.senha_atual, current_user.senha_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A senha atual informada está incorreta.",
        )

    if dados.nova_senha != dados.confirmar_senha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A confirmação da nova senha não confere.",
        )

    if dados.senha_atual == dados.nova_senha:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A nova senha deve ser diferente da senha atual.",
        )

    current_user.senha_hash = hash_password(dados.nova_senha)
    current_user.atualizado_em = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")
    await db.commit()
    return {"mensagem": "Senha alterada com sucesso!"}


# ==========================================
# AULAS E EVENTOS (PAINEL PRINCIPAL)
# ==========================================
@app.get("/api/aulas", response_model=list[AulaOut])
async def listar_aulas(
    dia: str | None = Query(default=None, description="Filtra por dia: seg, ter, qua, qui, sex"),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Aula).order_by(Aula.id.asc())
    if dia:
        stmt = stmt.where(Aula.dia == dia.lower().strip())
    res = await db.execute(stmt)
    return list(res.scalars().all())


@app.get("/api/eventos", response_model=list[EventoOut])
async def listar_eventos(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Evento).order_by(Evento.id.asc()))
    return list(res.scalars().all())


# ==========================================
# SISTEMA DE VAGAS & CANDIDATURAS (NESP)
# ==========================================
@app.get("/api/vagas", response_model=list[VagaOut])
async def listar_vagas(
    busca: str | None = Query(default=None),
    tipo: str | None = Query(default=None),
    modalidade: str | None = Query(default=None),
    current_user: Usuario | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Vaga)
        .options(selectinload(Vaga.candidaturas))
        .where(Vaga.ativa.is_(True))
        .order_by(desc(Vaga.id))
    )

    if tipo and tipo.lower() != "todas":
        stmt = stmt.where(func.lower(Vaga.tipo) == tipo.lower().strip())

    if modalidade and modalidade.lower() != "todas":
        stmt = stmt.where(func.lower(Vaga.modalidade) == modalidade.lower().strip())

    if busca and busca.strip():
        termo = f"%{busca.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Vaga.titulo).like(termo),
                func.lower(Vaga.empresa).like(termo),
                func.lower(Vaga.requisitos).like(termo),
                func.lower(Vaga.area).like(termo),
                func.lower(Vaga.descricao).like(termo),
            )
        )

    res = await db.execute(stmt)
    vagas = res.scalars().all()

    saida: list[VagaOut] = []
    for v in vagas:
        candidatado = (
            any(c.usuario_id == current_user.id for c in v.candidaturas)
            if current_user is not None
            else False
        )
        item = VagaOut.model_validate(v)
        item.candidatado = candidatado
        item.total_candidaturas = len(v.candidaturas)
        saida.append(item)
    return saida


@app.post("/api/vagas", response_model=VagaOut, status_code=status.HTTP_201_CREATED)
async def criar_vaga(
    nova_vaga: VagaCreate,
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    vaga = Vaga(**nova_vaga.model_dump())
    db.add(vaga)
    await db.commit()
    await db.refresh(vaga)
    item = VagaOut.model_validate(vaga)
    item.candidatado = False
    item.total_candidaturas = 0
    return item


@app.delete("/api/vagas/{vaga_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_vaga(
    vaga_id: int,
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Vaga).where(Vaga.id == vaga_id))
    vaga = res.scalar_one_or_none()
    if vaga is None:
        raise HTTPException(status_code=404, detail="Vaga não encontrada.")
    await db.delete(vaga)
    await db.commit()


@app.post(
    "/api/vagas/{vaga_id}/candidatar",
    response_model=CandidaturaOut,
    status_code=status.HTTP_201_CREATED,
)
async def candidatar_vaga(
    vaga_id: int,
    payload: CandidaturaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res_vaga = await db.execute(select(Vaga).where(Vaga.id == vaga_id))
    vaga = res_vaga.scalar_one_or_none()
    if vaga is None:
        raise HTTPException(status_code=404, detail="Vaga não encontrada.")

    res_dup = await db.execute(
        select(Candidatura).where(
            Candidatura.vaga_id == vaga_id,
            Candidatura.usuario_id == current_user.id,
        )
    )
    if res_dup.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=400,
            detail="Você já realizou candidatura para esta vaga.",
        )

    candidatura = Candidatura(
        vaga_id=vaga.id,
        usuario_id=current_user.id,
        mensagem=payload.mensagem.strip(),
        link_portfolio=payload.link_portfolio.strip(),
        status="Em análise pelo NESP",
    )
    db.add(candidatura)
    await db.commit()
    await db.refresh(candidatura)

    return CandidaturaOut(
        id=candidatura.id,
        vaga_id=vaga.id,
        usuario_id=current_user.id,
        mensagem=candidatura.mensagem,
        link_portfolio=candidatura.link_portfolio,
        status=candidatura.status,
        criado_em=candidatura.criado_em,
        vaga_titulo=vaga.titulo,
        vaga_empresa=vaga.empresa,
        vaga_tipo=vaga.tipo,
        vaga_modalidade=vaga.modalidade,
        vaga_bolsa=vaga.bolsa_ou_salario,
    )


@app.get("/api/candidaturas", response_model=list[CandidaturaOut])
async def listar_minhas_candidaturas(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = (
        select(Candidatura)
        .options(selectinload(Candidatura.vaga))
        .where(Candidatura.usuario_id == current_user.id)
        .order_by(desc(Candidatura.id))
    )
    res = await db.execute(stmt)
    candidaturas = res.scalars().all()

    return [
        CandidaturaOut(
            id=c.id,
            vaga_id=c.vaga_id,
            usuario_id=c.usuario_id,
            mensagem=c.mensagem,
            link_portfolio=c.link_portfolio,
            status=c.status,
            criado_em=c.criado_em,
            vaga_titulo=c.vaga.titulo if c.vaga else "",
            vaga_empresa=c.vaga.empresa if c.vaga else "",
            vaga_tipo=c.vaga.tipo if c.vaga else "",
            vaga_modalidade=c.vaga.modalidade if c.vaga else "",
            vaga_bolsa=c.vaga.bolsa_ou_salario if c.vaga else "",
        )
        for c in candidaturas
    ]


@app.delete("/api/candidaturas/{candidatura_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancelar_candidatura(
    candidatura_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Candidatura).where(
            Candidatura.id == candidatura_id,
            Candidatura.usuario_id == current_user.id,
        )
    )
    cand = res.scalar_one_or_none()
    if cand is None:
        raise HTTPException(status_code=404, detail="Candidatura não encontrada.")
    await db.delete(cand)
    await db.commit()


# ==========================================
# SISTEMA DE NOTÍCIAS REAIS (INATEL & REGIÃO)
# ==========================================
@app.get("/api/noticias", response_model=list[NoticiaOut])
async def listar_noticias(
    busca: str | None = Query(default=None),
    categoria: str | None = Query(default=None),
    origem: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Noticia)

    if categoria and categoria.lower() != "todas":
        stmt = stmt.where(func.lower(Noticia.categoria) == categoria.lower().strip())

    if busca and busca.strip():
        termo = f"%{busca.strip().lower()}%"
        stmt = stmt.where(
            or_(
                func.lower(Noticia.titulo).like(termo),
                func.lower(Noticia.resumo).like(termo),
                func.lower(Noticia.conteudo).like(termo),
                func.lower(Noticia.autor).like(termo),
                func.lower(func.coalesce(Noticia.fonte_nome, "")).like(termo),
            )
        )

    res = await db.execute(stmt)
    lista = list(res.scalars().all())

    if origem and origem.lower() != "todas":
        orig = origem.lower().strip()
        if orig == "inatel":
            lista = [
                n
                for n in lista
                if "inatel" in (n.fonte_nome or "").lower()
                or "inatel" in (n.autor or "").lower()
                or "inatel" in (n.titulo or "").lower()
                or "inatel.br" in (n.url_original or "").lower()
            ]
        elif orig == "regiao":
            lista = [
                n
                for n in lista
                if "inatel.br" not in (n.url_original or "").lower()
                and "portal inatel" not in (n.fonte_nome or "").lower()
            ]

    lista.sort(key=chave_ordenacao_noticia, reverse=True)
    return lista


@app.post("/api/noticias/sincronizar", response_model=SincronizarNoticiasOut)
async def sincronizar_noticias_reais(
    db: AsyncSession = Depends(get_db),
):
    inseridas, atualizadas = await sincronizar_noticias_no_banco(db)
    res = await db.execute(select(Noticia))
    todas = list(res.scalars().all())
    todas.sort(key=chave_ordenacao_noticia, reverse=True)
    return SincronizarNoticiasOut(
        inseridas=inseridas,
        atualizadas=atualizadas,
        total_ativas=len(todas),
        noticias=[NoticiaOut.model_validate(n) for n in todas],
    )


@app.get("/api/noticias/{noticia_id}", response_model=NoticiaOut)
async def ler_noticia(noticia_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Noticia).where(Noticia.id == noticia_id))
    noticia = res.scalar_one_or_none()
    if noticia is None:
        raise HTTPException(status_code=404, detail="Notícia não encontrada.")
    noticia.visualizacoes += 1
    await db.commit()
    await db.refresh(noticia)
    return noticia


@app.post("/api/noticias", response_model=NoticiaOut, status_code=status.HTTP_201_CREATED)
async def publicar_noticia(
    nova_noticia: NoticiaCreate,
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dados = nova_noticia.model_dump()
    if not dados.get("fonte_nome"):
        dados["fonte_nome"] = dados.get("autor") or "Portal Inatel"
    noticia = Noticia(**dados)
    db.add(noticia)
    await db.commit()
    await db.refresh(noticia)
    return noticia


@app.post("/api/noticias/{noticia_id}/curtir", response_model=NoticiaOut)
async def curtir_noticia(noticia_id: int, db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Noticia).where(Noticia.id == noticia_id))
    noticia = res.scalar_one_or_none()
    if noticia is None:
        raise HTTPException(status_code=404, detail="Notícia não encontrada.")
    noticia.curtidas += 1
    await db.commit()
    await db.refresh(noticia)
    return noticia


@app.delete("/api/noticias/{noticia_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_noticia(
    noticia_id: int,
    _current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(select(Noticia).where(Noticia.id == noticia_id))
    noticia = res.scalar_one_or_none()
    if noticia is None:
        raise HTTPException(status_code=404, detail="Notícia não encontrada.")
    await db.delete(noticia)
    await db.commit()


# ==========================================
# INTEGRAÇÃO LINKEDIN: WEB SCRAPING DE PERFIL & VAGAS POR ÁREA
# ==========================================
def _serializar_analise(reg: AnaliseLinkedIn) -> AnaliseLinkedInOut:
    def _loads(txt: str, fallback):
        try:
            return json.loads(txt) if txt else fallback
        except Exception:
            return fallback

    brutos = _loads(reg.dados_brutos_json, {})
    extras = brutos.get("secoes_extras", {}) if isinstance(brutos, dict) else {}
    exps = _loads(reg.experiencias_json, [])
    edus = _loads(reg.formacao_json, [])

    return AnaliseLinkedInOut(
        id=reg.id,
        usuario_id=reg.usuario_id,
        linkedin_url=reg.linkedin_url,
        slug=reg.slug,
        fonte_coleta=reg.fonte_coleta,
        nome_completo=reg.nome_completo or "",
        headline=reg.headline or "",
        instituicao_atual=extras.get("instituicao_atual", ""),
        foto_url=extras.get("foto_url", ""),
        banner_url=extras.get("banner_url", ""),
        localizacao=reg.localizacao or "",
        conexoes_ou_seguidores=reg.conexoes_ou_seguidores or "",
        resumo=reg.resumo or "",
        sites=extras.get("sites", []),
        experiencias=exps,
        total_experiencias_perfil=int(extras.get("total_experiencias_perfil") or len(exps)),
        formacao=edus,
        total_formacoes_perfil=int(extras.get("total_formacoes_perfil") or len(edus)),
        projetos=extras.get("projetos", []),
        certificacoes=extras.get("certificacoes", []),
        cursos=extras.get("cursos", []),
        premios=extras.get("premios", []),
        idiomas=extras.get("idiomas", []),
        publicacoes=extras.get("publicacoes", []),
        skills=_loads(reg.skills_json, []),
        pontuacao_perfil=reg.pontuacao_perfil,
        nivel_perfil=extras.get("nivel_perfil", ""),
        pilares_nota=extras.get("pilares_nota", []),
        pontos_fortes=_loads(reg.pontos_fortes_json, []),
        sugestoes_melhoria=_loads(reg.sugestoes_melhoria_json, []),
        dados_brutos=brutos if isinstance(brutos, dict) else {},
        atualizado_em=reg.atualizado_em or "",
    )


def _serializar_vaga_linkedin(v: VagaLinkedInCache) -> VagaLinkedInOut:
    try:
        skills_m = json.loads(v.skills_match_json) if v.skills_match_json else []
    except Exception:
        skills_m = []

    return VagaLinkedInOut(
        id=v.id,
        titulo=v.titulo,
        empresa=v.empresa,
        localizacao=v.localizacao or "Brasil",
        modalidade=v.modalidade or "Presencial / Híbrido",
        nivel=v.nivel or "",
        salario=v.salario or "",
        descricao=v.descricao or "",
        job_url=v.job_url,
        logo_empresa=v.logo_empresa or "",
        data_publicacao=v.data_publicacao or "",
        termo_busca=v.termo_busca or "",
        fonte=v.fonte or "linkedin-jobspy",
        compatibilidade=v.compatibilidade,
        skills_match=skills_m,
        coletado_em=v.coletado_em or "",
    )


@app.get("/api/linkedin/analise", response_model=AnaliseLinkedInOut | None)
async def obter_analise_linkedin(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(AnaliseLinkedIn).where(AnaliseLinkedIn.usuario_id == current_user.id)
    )
    reg = res.scalar_one_or_none()
    return _serializar_analise(reg) if reg is not None else None


@app.post("/api/linkedin/analisar-perfil", response_model=AnaliseLinkedInOut)
async def analisar_perfil_linkedin(
    payload: AnalisarPerfilLinkedInRequest,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    try:
        coleta = await coletar_e_analisar_perfil_linkedin(
            linkedin_url=payload.linkedin_url,
            areas_usuario=current_user.areas_interesse or "",
            curso_usuario=current_user.curso or "",
            apify_token=payload.apify_token,
            rapidapi_key=payload.rapidapi_key,
            scrapingdog_key=payload.scrapingdog_key,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Falha ao consultar API externa de análise do LinkedIn: {exc}",
        ) from exc

    agora = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")

    # Salva o link padronizado no perfil do usuário
    current_user.linkedin = coleta["linkedin_url"]
    if payload.sincronizar_areas and coleta["skills"]:
        atuais = [a.strip() for a in (current_user.areas_interesse or "").split(",") if a.strip()]
        combinadas = list(dict.fromkeys(atuais + coleta["skills"]))[:10]
        current_user.areas_interesse = ", ".join(combinadas)
    current_user.atualizado_em = agora

    res = await db.execute(
        select(AnaliseLinkedIn).where(AnaliseLinkedIn.usuario_id == current_user.id)
    )
    reg = res.scalar_one_or_none()
    if reg is None:
        reg = AnaliseLinkedIn(
            usuario_id=current_user.id,
            linkedin_url=coleta["linkedin_url"],
            slug=coleta["slug"],
        )
        db.add(reg)

    reg.linkedin_url = coleta["linkedin_url"]
    reg.slug = coleta["slug"]
    reg.fonte_coleta = coleta["fonte_coleta"]
    reg.nome_completo = coleta["nome_completo"]
    reg.headline = coleta["headline"]
    reg.localizacao = coleta["localizacao"]
    reg.conexoes_ou_seguidores = coleta["conexoes_ou_seguidores"]
    reg.resumo = coleta["resumo"]
    reg.experiencias_json = json.dumps(coleta["experiencias"], ensure_ascii=False)
    reg.formacao_json = json.dumps(coleta["formacao"], ensure_ascii=False)
    reg.skills_json = json.dumps(coleta["skills"], ensure_ascii=False)
    reg.pontuacao_perfil = coleta["pontuacao_perfil"]
    reg.pontos_fortes_json = json.dumps(coleta["pontos_fortes"], ensure_ascii=False)
    reg.sugestoes_melhoria_json = json.dumps(coleta["sugestoes_melhoria"], ensure_ascii=False)
    reg.dados_brutos_json = json.dumps(coleta["dados_brutos"], ensure_ascii=False)
    reg.atualizado_em = agora

    await db.commit()
    await db.refresh(reg)
    return _serializar_analise(reg)


@app.get("/api/linkedin/vagas", response_model=list[VagaLinkedInOut])
async def listar_vagas_linkedin_salvas(
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(VagaLinkedInCache)
        .where(VagaLinkedInCache.usuario_id == current_user.id)
        .order_by(desc(VagaLinkedInCache.compatibilidade), desc(VagaLinkedInCache.id))
    )
    return [_serializar_vaga_linkedin(v) for v in res.scalars().all()]


@app.post("/api/linkedin/vagas/buscar", response_model=list[VagaLinkedInOut])
async def buscar_e_salvar_vagas_linkedin(
    payload: BuscarVagasLinkedInRequest,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Define termo de busca automaticamente pela área escolhida pelo usuário se vier vazio
    termo = payload.termo_busca.strip()
    if not termo:
        primeira_area = (
            (current_user.areas_interesse or "").split(",")[0].strip()
            if current_user.areas_interesse
            else ""
        )
        termo = primeira_area or current_user.curso or "Desenvolvedor Software"

    # Recupera skills já extraídas do perfil LinkedIn do aluno para calcular o Match %
    res_an = await db.execute(
        select(AnaliseLinkedIn).where(AnaliseLinkedIn.usuario_id == current_user.id)
    )
    reg_an = res_an.scalar_one_or_none()
    skills_extraidas: list[str] = []
    if reg_an and reg_an.skills_json:
        try:
            skills_extraidas = json.loads(reg_an.skills_json)
        except Exception:
            skills_extraidas = []

    try:
        coletadas = await coletar_vagas_linkedin(
            termo_busca=termo,
            localizacao=payload.localizacao or "Brazil",
            apenas_remoto=payload.apenas_remoto,
            limite=payload.limite,
            skills_perfil=skills_extraidas,
            areas_interesse=current_user.areas_interesse or "",
            curso=current_user.curso or "",
        )
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Não foi possível consultar vagas externas do LinkedIn no momento: {exc}",
        ) from exc

    agora = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")

    # Atualiza o cache de vagas LinkedIn deste usuário no banco para uso futuro
    await db.execute(
        delete(VagaLinkedInCache).where(VagaLinkedInCache.usuario_id == current_user.id)
    )

    novos_registros: list[VagaLinkedInCache] = []
    for item in coletadas:
        reg_v = VagaLinkedInCache(
            usuario_id=current_user.id,
            external_id=item["external_id"],
            titulo=item["titulo"],
            empresa=item["empresa"],
            localizacao=item["localizacao"],
            modalidade=item["modalidade"],
            nivel=item["nivel"],
            salario=item["salario"],
            descricao=item["descricao"],
            job_url=item["job_url"],
            logo_empresa=item["logo_empresa"],
            data_publicacao=item["data_publicacao"],
            termo_busca=item["termo_busca"],
            fonte=item["fonte"],
            compatibilidade=item["compatibilidade"],
            skills_match_json=json.dumps(item["skills_match"], ensure_ascii=False),
            coletado_em=agora,
        )
        db.add(reg_v)
        novos_registros.append(reg_v)

    await db.commit()
    for reg_v in novos_registros:
        await db.refresh(reg_v)

    return [_serializar_vaga_linkedin(v) for v in novos_registros]

