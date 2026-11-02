import json
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from auth import hash_password
from models import Aula, Evento, Noticia, Usuario


AVALIACOES_PADRAO_POR_CODIGO: dict[str, tuple[str, list[dict]]] = {
    "C206": (
        "A",
        [
            {"id": "c206-np1", "titulo": "NP1", "tipo": "Prova", "data": "16/09", "realizada": True, "nota": 8.6, "peso": 1.0},
            {"id": "c206-lab", "titulo": "Exercícios Lab POO", "tipo": "Laboratório", "data": "14/10", "realizada": True, "nota": 9.0, "peso": 1.0},
            {"id": "c206-np2", "titulo": "NP2", "tipo": "Prova", "data": "24/11", "realizada": False, "nota": None, "peso": 1.0},
        ],
    ),
    "S202": (
        "L3",
        [
            {"id": "s202-np1", "titulo": "NP1", "tipo": "Prova", "data": "22/09", "realizada": True, "nota": 9.0, "peso": 1.0},
            {"id": "s202-proj", "titulo": "Projeto Modelagem NoSQL/SQL", "tipo": "Projeto", "data": "20/10", "realizada": True, "nota": 9.4, "peso": 1.0},
            {"id": "s202-np2", "titulo": "NP2", "tipo": "Prova", "data": "10/11", "realizada": False, "nota": None, "peso": 1.0},
        ],
    ),
    "S05": (
        "A",
        [
            {"id": "s05-np1", "titulo": "NP1 — Heurísticas & UX", "tipo": "Prova", "data": "17/09", "realizada": True, "nota": 8.8, "peso": 1.0},
            {"id": "s05-prot", "titulo": "Protótipo Portal Inatel", "tipo": "Projeto", "data": "21/10", "realizada": True, "nota": 9.2, "peso": 1.0},
            {"id": "s05-np2", "titulo": "NP2 & Entrega Final", "tipo": "Prova", "data": "12/11", "realizada": False, "nota": None, "peso": 1.0},
        ],
    ),
    "E01": (
        "B",
        [
            {"id": "e01-np1", "titulo": "NP1", "tipo": "Prova", "data": "19/09", "realizada": True, "nota": 5.0, "peso": 1.0},
            {"id": "e01-lab", "titulo": "Relatórios Lab Circuitos", "tipo": "Laboratório", "data": "17/10", "realizada": True, "nota": 5.8, "peso": 1.0},
            {"id": "e01-np2", "titulo": "NP2", "tipo": "Prova", "data": "05/11", "realizada": False, "nota": None, "peso": 1.0},
        ],
    ),
    "M02": (
        "A",
        [
            {"id": "m02-np1", "titulo": "NP1", "tipo": "Prova", "data": "18/09", "realizada": True, "nota": 7.2, "peso": 1.0},
            {"id": "m02-np2", "titulo": "NP2", "tipo": "Prova", "data": "07/11", "realizada": False, "nota": None, "peso": 1.0},
        ],
    ),
    "S204": (
        "P1",
        [
            {"id": "s204-sp1", "titulo": "Sprint 1 — Discovery & Backlog", "tipo": "Projeto", "data": "25/09", "realizada": True, "nota": 9.5, "peso": 1.0},
            {"id": "s204-sp2", "titulo": "Sprint 2 — MVP & Testes", "tipo": "Projeto", "data": "28/11", "realizada": False, "nota": None, "peso": 1.0},
        ],
    ),
    "C115": (
        "L1",
        [
            {"id": "c115-np1", "titulo": "NP1", "tipo": "Prova", "data": "26/09", "realizada": True, "nota": 8.1, "peso": 1.0},
            {"id": "c115-np2", "titulo": "NP2 & Prática Packet Tracer", "tipo": "Prova", "data": "21/11", "realizada": False, "nota": None, "peso": 1.0},
        ],
    ),
}


async def seed_initial_data(session: AsyncSession) -> None:
    """Popula dados iniciais realistas do ecossistema Inatel se o banco estiver vazio."""

    # 1. Usuário padrão (Kauã — senha inicial: 123456)
    res_user = await session.execute(select(Usuario).order_by(Usuario.id.asc()).limit(1))
    existing_user = res_user.scalar_one_or_none()
    if existing_user is None:
        existing_user = Usuario(
            nome="Kauã",
            matricula=2048,
            curso="Engenharia de Software",
            periodo=6,
            email="kaua@ges.inatel.br",
            senha_hash=hash_password("123456"),
            telefone="(35) 99912-3456",
            bio=(
                "Estudante de Engenharia de Software no Inatel, apaixonado por "
                "interfaces modernas (IHM), desenvolvimento Full-Stack com React e Python "
                "e projetos de inovação no Vale da Eletrônica."
            ),
            github="https://github.com/kaua",
            linkedin="https://linkedin.com/in/kaua",
            areas_interesse="Full-Stack, UI/UX (IHM), Cloud, Inteligência Artificial",
            crs=86.4,
            horas_complementares=112,
            meta_horas=160,
            horas_ac=112,
            meta_ac=160,
            horas_cp=28,
            meta_cp=40,
            horas_trilha=80,
            meta_trilha=120,
            disponivel_estagio=True,
            atualizado_em="31/10/2026",
        )
        session.add(existing_user)
        await session.flush()
    elif not existing_user.senha_hash:
        existing_user.senha_hash = hash_password("123456")

    # 2. Grade de Aulas da Semana (preservando S05, E01 e M02 originais e completando Seg-Sex)
    res_aulas = await session.execute(select(Aula))
    todas_aulas = list(res_aulas.scalars().all())
    if not todas_aulas:
        aulas_seed = [
            Aula(
                usuario_id=existing_user.id,
                codigo="C206",
                turma="A",
                disciplina="Programação Orientada a Objetos",
                professor="Prof. Chris Lima",
                dia="seg",
                horario="08:00 - 09:40",
                local="P1-S12",
                prova_alert=False,
                prova_data="24/11",
                frequencia="02/25",
                nota=8.8,
                avaliacoes_json=json.dumps(AVALIACOES_PADRAO_POR_CODIGO["C206"][1], ensure_ascii=False),
            ),
            Aula(
                usuario_id=existing_user.id,
                codigo="S202",
                turma="L3",
                disciplina="Banco de Dados II",
                professor="Prof. Marcelo Cysneiros",
                dia="seg",
                horario="10:00 - 11:40",
                local="Lab Soft 03",
                prova_alert=True,
                prova_data="10/11",
                frequencia="04/25",
                nota=9.2,
                avaliacoes_json=json.dumps(AVALIACOES_PADRAO_POR_CODIGO["S202"][1], ensure_ascii=False),
            ),
            Aula(
                usuario_id=existing_user.id,
                codigo="S05",
                turma="A",
                disciplina="Interface Homem-Máquina",
                professor="Prof. Raphael Cardoso",
                dia="ter",
                horario="10:00 - 11:40",
                local="P1-S17",
                prova_alert=False,
                prova_data="12/11",
                frequencia="03/25",
                nota=9.0,
                avaliacoes_json=json.dumps(AVALIACOES_PADRAO_POR_CODIGO["S05"][1], ensure_ascii=False),
            ),
            Aula(
                usuario_id=existing_user.id,
                codigo="E01",
                turma="B",
                disciplina="Circuitos Elétricos em Corrente Contínua",
                professor="Prof. Guilherme Aquino",
                dia="ter",
                horario="13:30 - 15:10",
                local="P1-S17",
                prova_alert=True,
                prova_data="05/11",
                frequencia="10/25",
                nota=5.4,
                avaliacoes_json=json.dumps(AVALIACOES_PADRAO_POR_CODIGO["E01"][1], ensure_ascii=False),
            ),
            Aula(
                usuario_id=existing_user.id,
                codigo="M02",
                turma="A",
                disciplina="Álgebra e Geometria Analítica",
                professor="Profa. Tamara Campos",
                dia="qua",
                horario="10:00 - 11:40",
                local="P1-S19",
                prova_alert=True,
                prova_data="07/11",
                frequencia="06/25",
                nota=7.2,
                avaliacoes_json=json.dumps(AVALIACOES_PADRAO_POR_CODIGO["M02"][1], ensure_ascii=False),
            ),
            Aula(
                usuario_id=existing_user.id,
                codigo="S204",
                turma="P1",
                disciplina="Engenharia de Produto de Software",
                professor="Prof. Renzo Mesquita",
                dia="qui",
                horario="15:30 - 17:10",
                local="Lab Ideia / P3",
                prova_alert=False,
                prova_data="28/11",
                frequencia="01/25",
                nota=9.5,
                avaliacoes_json=json.dumps(AVALIACOES_PADRAO_POR_CODIGO["S204"][1], ensure_ascii=False),
            ),
            Aula(
                usuario_id=existing_user.id,
                codigo="C115",
                turma="L1",
                disciplina="Redes de Computadores e IoT",
                professor="Prof. Antônio Marcos Alberti",
                dia="sex",
                horario="08:00 - 09:40",
                local="Lab CS&I",
                prova_alert=False,
                prova_data="21/11",
                frequencia="02/25",
                nota=8.1,
                avaliacoes_json=json.dumps(AVALIACOES_PADRAO_POR_CODIGO["C115"][1], ensure_ascii=False),
            ),
        ]
        session.add_all(aulas_seed)
    else:
        for aula in todas_aulas:
            if aula.usuario_id is None:
                aula.usuario_id = existing_user.id
            padrao = AVALIACOES_PADRAO_POR_CODIGO.get((aula.codigo or "").upper())
            if padrao:
                if not aula.turma or aula.turma == "A":
                    aula.turma = padrao[0]
                if not aula.avaliacoes_json or aula.avaliacoes_json.strip() in ("", "[]"):
                    avaliacoes_json = json.dumps(padrao[1], ensure_ascii=False)
                    aula.avaliacoes_json = avaliacoes_json

    # 3. Eventos do Carrossel (preservando e aprimorando os 4 eventos originais)
    res_eventos = await session.execute(select(Evento).limit(1))
    if res_eventos.scalar_one_or_none() is None:
        session.add_all(
            [
                Evento(
                    titulo="Semana do Software Inatel 2026",
                    data="12/11",
                    horario="10:00",
                    local="Teatro Inatel & Salão de Eventos",
                    tipo="tech",
                    descricao=(
                        "Uma semana inteira dedicada à engenharia de software, IA generativa, "
                        "cloud computing e maratona de programação com empresas parceiras."
                    ),
                    imagem_url="https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000&h=450",
                ),
                Evento(
                    titulo="Workshop Prático de IoT & Redes 6G",
                    data="19/11",
                    horario="08:30",
                    local="Laboratório CS&I / xGMobile",
                    tipo="tech",
                    descricao=(
                        "Hands-on prático sobre Internet das Coisas, sensores inteligentes e "
                        "aplicações conectadas para Indústria 4.0 nos laboratórios do Inatel."
                    ),
                    imagem_url="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000&h=450",
                ),
                Evento(
                    titulo="Feira de Oportunidades e Carreiras (FINATEL)",
                    data="25/11",
                    horario="09:00",
                    local="Ginásio Poliesportivo do Inatel",
                    tipo="academic",
                    descricao=(
                        "Conecte-se diretamente com recrutadores de mais de 40 empresas de tecnologia "
                        "do Vale da Eletrônica e multinacionais parceiras do Inatel."
                    ),
                    imagem_url="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000&h=450",
                ),
                Evento(
                    titulo="Festival Cultural & Integração dos Alunos",
                    data="05/12",
                    horario="19:00",
                    local="Área Esportiva do Inatel",
                    tipo="cultural",
                    descricao=(
                        "Encerramento do semestre com bandas estudantis, praça gastronômica "
                        "e celebração das equipes de competição tecnológica."
                    ),
                    imagem_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000&h=450",
                ),
            ]
        )

    # 4. Notícias Reais exclusivas do Portal Inatel (remove eventuais matérias de outras fontes)
    await session.execute(
        delete(Noticia).where(
            or_(
                Noticia.url_original.is_(None),
                Noticia.url_original == "",
                ~func.lower(Noticia.url_original).like("%inatel.br%"),
            )
        )
    )

    res_reais = await session.execute(
        select(func.count(Noticia.id)).where(
            func.lower(Noticia.url_original).like("%inatel.br%")
        )
    )
    total_noticias_inatel = int(res_reais.scalar_one() or 0)

    await session.commit()

    if total_noticias_inatel < 4:
        try:
            from news_service import sincronizar_noticias_no_banco

            inseridas, atualizadas = await sincronizar_noticias_no_banco(session)
            print(
                f"[Notícias Inatel] Sincronização inicial concluída: {inseridas} inseridas, {atualizadas} atualizadas."
            )
        except Exception as exc:
            print(f"[Notícias Inatel] Aviso ao sincronizar notícias na inicialização: {exc}")

