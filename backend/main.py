import json
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import delete, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

import database
from auth import (
    create_access_token,
    get_current_user,
    get_optional_user,
    hash_password,
    verify_password,
)
from curriculo_inatel import obter_metas_por_curso
from database import close_database, get_db, get_db_status, init_database
from linkedin_service import coletar_e_analisar_perfil_linkedin, coletar_vagas_linkedin
from news_service import chave_ordenacao_noticia, sincronizar_noticias_no_banco
from models import (
    AnaliseLinkedIn,
    Aula,
    Evento,
    Noticia,
    Usuario,
    VagaLinkedInCache,
)
from schemas import (
    AlterarSenhaRequest,
    AnalisarPerfilLinkedInRequest,
    AnaliseLinkedInOut,
    AulaCreate,
    AulaOut,
    AulaUpdate,
    AuthResponse,
    AvaliacaoAulaItem,
    BuscarVagasLinkedInRequest,
    EventoOut,
    LoginRequest,
    NoticiaCreate,
    NoticiaOut,
    RegistroRequest,
    SincronizarNoticiasOut,
    UsuarioOut,
    UsuarioUpdate,
    VagaLinkedInOut,
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
    description="Backend FastAPI + PostgreSQL com Autenticação JWT, Painel Acadêmico, Vagas LinkedIn, Notícias do Inatel e Minha Conta.",
    version="2.2.0",
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
    ident_raw = credenciais.identificador.strip()
    ident_lower = ident_raw.lower()
    condicoes = [func.lower(Usuario.email) == ident_lower]
    if ident_raw.isdigit():
        mat_num = int(ident_raw)
        if 0 <= mat_num <= 999999:
            condicoes.append(Usuario.matricula == mat_num)
    stmt = select(Usuario).where(or_(*condicoes))
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
    matricula_int = int(dados.matricula)

    res_email = await db.execute(
        select(Usuario).where(func.lower(Usuario.email) == email_limpo)
    )
    if res_email.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe uma conta cadastrada com este e-mail.",
        )

    res_mat = await db.execute(
        select(Usuario).where(Usuario.matricula == matricula_int)
    )
    if res_mat.scalar_one_or_none() is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Já existe um aluno cadastrado com esta matrícula.",
        )

    novo_usuario = Usuario(
        nome=dados.nome.strip(),
        matricula=matricula_int,
        curso=dados.curso.strip(),
        periodo=dados.periodo,
        email=email_limpo,
        telefone=dados.telefone.strip(),
        senha_hash=hash_password(dados.senha),
        bio=f"Estudante de {dados.curso.strip()} ({dados.periodo}º período) no Inatel.",
        areas_interesse="Tecnologia, Engenharia, Inovação",
        crs=80.0,
        horas_complementares=0,
        meta_horas=160,
        horas_ac=0,
        meta_ac=160,
        horas_cp=0,
        meta_cp=40,
        horas_trilha=0,
        meta_trilha=120,
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
    metas = obter_metas_por_curso(current_user.curso)
    current_user.meta_ac = metas["ac"]
    current_user.meta_horas = metas["ac"]
    current_user.meta_cp = metas["cp"]
    current_user.meta_trilha = metas["trilha"]
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
        nova_mat = int(update_fields["matricula"])
        if nova_mat != current_user.matricula:
            dup_m = await db.execute(
                select(Usuario).where(
                    Usuario.matricula == nova_mat,
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

    # Mantém compatibilidade bidirecional entre horas_ac/meta_ac e horas_complementares/meta_horas
    if "horas_ac" in update_fields and update_fields["horas_ac"] is not None:
        update_fields["horas_complementares"] = update_fields["horas_ac"]
    elif (
        "horas_complementares" in update_fields
        and update_fields["horas_complementares"] is not None
    ):
        update_fields["horas_ac"] = update_fields["horas_complementares"]

    # As metas curriculares são estritas e oficiais do Inatel pelo curso
    curso_final = update_fields.get("curso") or current_user.curso
    metas_oficiais = obter_metas_por_curso(curso_final)
    update_fields["meta_ac"] = metas_oficiais["ac"]  # sempre 200h para qualquer curso
    update_fields["meta_horas"] = metas_oficiais["ac"]
    update_fields["meta_cp"] = metas_oficiais["cp"]
    update_fields["meta_trilha"] = metas_oficiais["trilha"]

    for campo, valor in update_fields.items():
        if valor is not None:
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
# AULAS, TURMAS, PROVAS, NOTAS E HORAS (AC, CP, TRILHA)
# ==========================================
ORDEM_DIAS_SEMANA = {"seg": 1, "ter": 2, "qua": 3, "qui": 4, "sex": 5, "sab": 6}


def _validar_dias(dia_str: str) -> str:
    partes = [p.strip().lower()[:3] for p in dia_str.replace("/", ",").split(",") if p.strip()]
    if not partes:
        raise HTTPException(
            status_code=400,
            detail="Dia inválido. Use seg, ter, qua, qui, sex ou sab.",
        )
    for p in partes:
        if p not in ORDEM_DIAS_SEMANA:
            raise HTTPException(
                status_code=400,
                detail=f"Dia '{p}' inválido. Use seg, ter, qua, qui, sex ou sab.",
            )
    return ", ".join(partes)


def _primeiro_dia_ordem(dia_str: str | None) -> int:
    if not dia_str:
        return 99
    partes = [p.strip().lower()[:3] for p in dia_str.replace("/", ",").split(",") if p.strip()]
    if not partes:
        return 99
    return min(ORDEM_DIAS_SEMANA.get(p, 99) for p in partes)


def _normalizar_nota_0_a_100(valor: float | None) -> float | None:
    if valor is None:
        return None
    v = float(valor)
    # Se valor foi enviado na escala antiga 0..10 (> 0 e <= 10.0), converte para 0..100
    if 0.0 < v <= 10.0:
        v = v * 10.0
    return round(max(0.0, min(100.0, v)), 1)


def _carregar_avaliacoes_aula(aula: Aula) -> list[AvaliacaoAulaItem]:
    try:
        raw = json.loads(aula.avaliacoes_json or "[]")
        if not isinstance(raw, list):
            return []
        saida: list[AvaliacaoAulaItem] = []
        for idx, item in enumerate(raw):
            if not isinstance(item, dict):
                continue
            nota_val = item.get("nota")
            saida.append(
                AvaliacaoAulaItem(
                    id=str(item.get("id") or f"av-{aula.id}-{idx + 1}"),
                    titulo=str(item.get("titulo") or f"Avaliação {idx + 1}"),
                    tipo=str(item.get("tipo") or "Prova"),
                    data=str(item.get("data") or ""),
                    realizada=bool(item.get("realizada", False)),
                    nota=_normalizar_nota_0_a_100(nota_val) if nota_val is not None else None,
                    peso=float(item.get("peso") or 1.0),
                )
            )
        return saida
    except Exception:
        return []


def _serializar_aula(aula: Aula) -> AulaOut:
    return AulaOut(
        id=aula.id,
        usuario_id=aula.usuario_id,
        codigo=aula.codigo,
        turma=aula.turma or "A",
        disciplina=aula.disciplina,
        professor=aula.professor,
        dia=aula.dia,
        horario=aula.horario,
        local=aula.local,
        prova_alert=bool(aula.prova_alert),
        prova_data=aula.prova_data or "",
        frequencia=aula.frequencia or "00/25",
        nota=round(float(aula.nota or 0.0), 1),
        avaliacoes=_carregar_avaliacoes_aula(aula),
    )


def _preparar_avaliacoes_e_media(
    avaliacoes: list[AvaliacaoAulaItem],
    nota_manual: float | None,
    calcular_automatica: bool,
    prova_data_atual: str,
) -> tuple[str, float, str]:
    serializadas: list[dict] = []
    soma_ponderada = 0.0
    soma_pesos = 0.0
    proxima_data_pendente = ""

    for idx, av in enumerate(avaliacoes):
        nota_norm = _normalizar_nota_0_a_100(av.nota) if av.nota is not None else None
        peso_norm = float(av.peso or 1.0)
        realizada_flag = bool(av.realizada)
        if realizada_flag and nota_norm is not None:
            soma_ponderada += nota_norm * peso_norm
            soma_pesos += peso_norm
        elif not realizada_flag and av.data.strip() and not proxima_data_pendente:
            proxima_data_pendente = av.data.strip()

        serializadas.append(
            {
                "id": av.id.strip() or f"av-{idx + 1}",
                "titulo": av.titulo.strip(),
                "tipo": (av.tipo or "Prova").strip() or "Prova",
                "data": (av.data or "").strip(),
                "realizada": realizada_flag,
                "nota": nota_norm,
                "peso": peso_norm,
            }
        )

    nota_final = _normalizar_nota_0_a_100(nota_manual) if nota_manual is not None else 0.0
    if calcular_automatica and soma_pesos > 0:
        nota_final = round(soma_ponderada / soma_pesos, 1)

    prova_data_final = (prova_data_atual or "").strip() or proxima_data_pendente
    return json.dumps(serializadas, ensure_ascii=False), float(nota_final or 0.0), prova_data_final


@app.get("/api/aulas", response_model=list[AulaOut])
async def listar_aulas(
    dia: str | None = Query(default=None, description="Filtra por dia: seg, ter, qua, qui, sex, sab"),
    current_user: Usuario | None = Depends(get_optional_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Aula)
    if current_user is not None:
        stmt = stmt.where(Aula.usuario_id == current_user.id)
    if dia and dia.lower().strip() != "todas":
        dia_filtro = dia.lower().strip()[:3]
        stmt = stmt.where(Aula.dia.ilike(f"%{dia_filtro}%"))

    res = await db.execute(stmt)
    lista = list(res.scalars().all())
    lista.sort(
        key=lambda a: (
            _primeiro_dia_ordem(a.dia),
            a.horario or "",
            a.id,
        )
    )
    return [_serializar_aula(a) for a in lista]


@app.post("/api/aulas", response_model=AulaOut, status_code=status.HTTP_201_CREATED)
async def criar_aula(
    dados: AulaCreate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    dia_norm = _validar_dias(dados.dia)

    av_json, nota_calc, prova_dt = _preparar_avaliacoes_e_media(
        avaliacoes=dados.avaliacoes,
        nota_manual=dados.nota,
        calcular_automatica=dados.calcular_nota_automatica,
        prova_data_atual=dados.prova_data,
    )

    nova_aula = Aula(
        usuario_id=current_user.id,
        codigo=dados.codigo.strip().upper(),
        turma=dados.turma.strip().upper() or "A",
        disciplina=dados.disciplina.strip(),
        professor=dados.professor.strip(),
        dia=dia_norm,
        horario=dados.horario.strip(),
        local=dados.local.strip(),
        prova_alert=dados.prova_alert,
        prova_data=prova_dt,
        frequencia=dados.frequencia.strip() or "00/25",
        nota=nota_calc,
        avaliacoes_json=av_json,
    )
    db.add(nova_aula)
    await db.commit()
    await db.refresh(nova_aula)
    return _serializar_aula(nova_aula)


@app.put("/api/aulas/{aula_id}", response_model=AulaOut)
async def atualizar_aula(
    aula_id: int,
    dados: AulaUpdate,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Aula).where(Aula.id == aula_id, Aula.usuario_id == current_user.id)
    )
    aula = res.scalar_one_or_none()
    if aula is None:
        raise HTTPException(status_code=404, detail="Disciplina/turma não encontrada.")

    if dados.codigo is not None:
        aula.codigo = dados.codigo.strip().upper()
    if dados.turma is not None:
        aula.turma = dados.turma.strip().upper() or "A"
    if dados.disciplina is not None:
        aula.disciplina = dados.disciplina.strip()
    if dados.professor is not None:
        aula.professor = dados.professor.strip()
    if dados.dia is not None:
        aula.dia = _validar_dias(dados.dia)
    if dados.horario is not None:
        aula.horario = dados.horario.strip()
    if dados.local is not None:
        aula.local = dados.local.strip()
    if dados.prova_alert is not None:
        aula.prova_alert = dados.prova_alert
    if dados.frequencia is not None:
        aula.frequencia = dados.frequencia.strip() or "00/25"

    avaliacoes_atuais = (
        dados.avaliacoes if dados.avaliacoes is not None else _carregar_avaliacoes_aula(aula)
    )
    nota_base = dados.nota if dados.nota is not None else aula.nota
    prova_dt_base = dados.prova_data if dados.prova_data is not None else (aula.prova_data or "")

    av_json, nota_calc, prova_dt_final = _preparar_avaliacoes_e_media(
        avaliacoes=avaliacoes_atuais,
        nota_manual=nota_base,
        calcular_automatica=dados.calcular_nota_automatica,
        prova_data_atual=prova_dt_base,
    )
    aula.avaliacoes_json = av_json
    aula.nota = nota_calc
    aula.prova_data = prova_dt_final

    await db.commit()
    await db.refresh(aula)
    return _serializar_aula(aula)


@app.delete("/api/aulas/{aula_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_aula(
    aula_id: int,
    current_user: Usuario = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    res = await db.execute(
        select(Aula).where(Aula.id == aula_id, Aula.usuario_id == current_user.id)
    )
    aula = res.scalar_one_or_none()
    if aula is None:
        raise HTTPException(status_code=404, detail="Disciplina/turma não encontrada.")
    await db.delete(aula)
    await db.commit()


@app.get("/api/eventos", response_model=list[EventoOut])
async def listar_eventos(db: AsyncSession = Depends(get_db)):
    res = await db.execute(select(Evento).order_by(Evento.id.asc()))
    return list(res.scalars().all())


# ==========================================
# SISTEMA DE NOTÍCIAS REAIS (PORTAL INATEL)
# ==========================================
@app.get("/api/noticias", response_model=list[NoticiaOut])
async def listar_noticias(
    busca: str | None = Query(default=None),
    categoria: str | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Noticia).where(
        or_(
            func.lower(func.coalesce(Noticia.url_original, "")).like("%inatel.br%"),
            func.lower(func.coalesce(Noticia.fonte_nome, "")).like("%inatel%"),
            func.lower(func.coalesce(Noticia.autor, "")).like("%inatel%"),
        )
    )

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

