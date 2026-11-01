from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from auth import hash_password
from models import Aula, Evento, Noticia, Usuario, Vaga


async def seed_initial_data(session: AsyncSession) -> None:
    """Popula dados iniciais realistas do ecossistema Inatel se o banco estiver vazio."""

    # 1. Usuário padrão (Kauã — senha inicial: 123456)
    res_user = await session.execute(select(Usuario).limit(1))
    existing_user = res_user.scalar_one_or_none()
    if existing_user is None:
        session.add(
            Usuario(
                nome="Kauã",
                matricula="GES-2048",
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
                ira=86.4,
                horas_complementares=112,
                meta_horas=160,
                disponivel_estagio=True,
                atualizado_em="31/10/2026",
            )
        )
    elif not existing_user.senha_hash:
        existing_user.senha_hash = hash_password("123456")

    # 2. Grade de Aulas da Semana (preservando S05, E01 e M02 originais e completando Seg-Sex)
    res_aulas = await session.execute(select(Aula).limit(1))
    if res_aulas.scalar_one_or_none() is None:
        session.add_all(
            [
                Aula(
                    codigo="C206",
                    disciplina="Programação Orientada a Objetos",
                    professor="Prof. Chris Lima",
                    dia="seg",
                    horario="08:00 - 09:40",
                    local="P1-S12",
                    prova_alert=False,
                    prova_data="24/11",
                    frequencia="02/25",
                    nota=8.8,
                ),
                Aula(
                    codigo="S202",
                    disciplina="Banco de Dados II",
                    professor="Prof. Marcelo Cysneiros",
                    dia="seg",
                    horario="10:00 - 11:40",
                    local="Lab Soft 03",
                    prova_alert=True,
                    prova_data="10/11",
                    frequencia="04/25",
                    nota=9.2,
                ),
                Aula(
                    codigo="S05",
                    disciplina="Interface Homem-Máquina",
                    professor="Prof. Raphael Cardoso",
                    dia="ter",
                    horario="10:00 - 11:40",
                    local="P1-S17",
                    prova_alert=False,
                    prova_data="12/11",
                    frequencia="03/25",
                    nota=9.0,
                ),
                Aula(
                    codigo="E01",
                    disciplina="Circuitos Elétricos em Corrente Contínua",
                    professor="Prof. Guilherme Aquino",
                    dia="ter",
                    horario="13:30 - 15:10",
                    local="P1-S17",
                    prova_alert=True,
                    prova_data="05/11",
                    frequencia="10/25",
                    nota=5.4,
                ),
                Aula(
                    codigo="M02",
                    disciplina="Álgebra e Geometria Analítica",
                    professor="Profa. Tamara Campos",
                    dia="qua",
                    horario="10:00 - 11:40",
                    local="P1-S19",
                    prova_alert=True,
                    prova_data="07/11",
                    frequencia="06/25",
                    nota=7.2,
                ),
                Aula(
                    codigo="S204",
                    disciplina="Engenharia de Produto de Software",
                    professor="Prof. Renzo Mesquita",
                    dia="qui",
                    horario="15:30 - 17:10",
                    local="Lab Ideia / P3",
                    prova_alert=False,
                    prova_data="28/11",
                    frequencia="01/25",
                    nota=9.5,
                ),
                Aula(
                    codigo="C115",
                    disciplina="Redes de Computadores e IoT",
                    professor="Prof. Antônio Marcos Alberti",
                    dia="sex",
                    horario="08:00 - 09:40",
                    local="Lab CS&I",
                    prova_alert=False,
                    prova_data="21/11",
                    frequencia="02/25",
                    nota=8.1,
                ),
            ]
        )

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
                    titulo="Feira de Oportunidades NESP (FINATEL)",
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

    # 4. Vagas de Estágio / IC / Emprego (NESP Inatel)
    res_vagas = await session.execute(select(Vaga).limit(1))
    if res_vagas.scalar_one_or_none() is None:
        session.add_all(
            [
                Vaga(
                    titulo="Estágio em Desenvolvimento Full-Stack (React + Python)",
                    empresa="ICC - Inatel Competence Center",
                    tipo="Estágio",
                    modalidade="Híbrido",
                    localizacao="Santa Rita do Sapucaí - MG",
                    bolsa_ou_salario="R$ 1.850,00 + Benefícios",
                    area="Desenvolvimento Web",
                    requisitos="React, Tailwind CSS, Python (FastAPI), SQL/PostgreSQL e Git",
                    descricao=(
                        "Atue em projetos reais de PD&I dentro do Inatel Competence Center, "
                        "desenvolvendo dashboards analíticos e APIs REST de alta performance "
                        "em conjunto com engenheiros seniores."
                    ),
                    prazo="15/11/2026",
                    contato_email="talentos.icc@inatel.br",
                    criado_em="28/10/2026",
                ),
                Vaga(
                    titulo="Bolsista de Iniciação Científica — Redes 6G & IA",
                    empresa="Centro xGMobile / Inatel",
                    tipo="Iniciação Científica",
                    modalidade="Presencial",
                    localizacao="Campus Inatel (Lab xGMobile)",
                    bolsa_ou_salario="R$ 1.200,00 (Bolsa FAPEMIG/EMBRAPII)",
                    area="Pesquisa & Telecom",
                    requisitos="Python, Algoritmos de ML, Redes de Computadores, Inglês técnico",
                    descricao=(
                        "Pesquisa aplicada em otimização de redes móveis de 6ª geração utilizando "
                        "aprendizado de máquina para alocação dinâmica de espectro."
                    ),
                    prazo="20/11/2026",
                    contato_email="xgmobile@inatel.br",
                    criado_em="26/10/2026",
                ),
                Vaga(
                    titulo="Desenvolvedor(a) Front-End Júnior (UI/UX & Design System)",
                    empresa="Leucotron Tecnologia",
                    tipo="Júnior",
                    modalidade="Híbrido",
                    localizacao="Santa Rita do Sapucaí - MG",
                    bolsa_ou_salario="R$ 4.200,00 CLT",
                    area="Front-End & IHM",
                    requisitos="React, TypeScript/JavaScript, Figma, Acessibilidade e Usabilidade",
                    descricao=(
                        "Buscamos talentos apaixonados por Interface Homem-Máquina para evoluir "
                        "nossa plataforma de comunicação unificada e atendimento omnichannel."
                    ),
                    prazo="30/11/2026",
                    contato_email="rh@leucotron.com.br",
                    criado_em="25/10/2026",
                ),
                Vaga(
                    titulo="Programa de Estágio Global em Cloud & DevOps",
                    empresa="Ericsson (Parceria Inatel)",
                    tipo="Estágio",
                    modalidade="Remoto",
                    localizacao="Remoto / São José dos Campos - SP",
                    bolsa_ou_salario="R$ 2.300,00 + Auxílio Home Office",
                    area="Cloud & Infraestrutura",
                    requisitos="Linux, Docker, Python ou Go, Noções de redes e CI/CD",
                    descricao=(
                        "Oportunidade exclusiva do convênio NESP/Ericsson para estudantes a partir "
                        "do 5º período interessados em automação em nuvem e microsserviços."
                    ),
                    prazo="18/11/2026",
                    contato_email="nesp@inatel.br",
                    criado_em="22/10/2026",
                ),
                Vaga(
                    titulo="Trainee em Engenharia de Sistemas Embarcados & IoT",
                    empresa="Furukawa Electric LatAm",
                    tipo="Trainee",
                    modalidade="Presencial",
                    localizacao="Santa Rita do Sapucaí / Curitiba",
                    bolsa_ou_salario="R$ 6.800,00 CLT",
                    area="Sistemas Embarcados",
                    requisitos="C/C++, Microcontroladores, Protocolos MQTT/LoRaWAN, Formandos 2026/2027",
                    descricao=(
                        "Programa acelerado de carreira focado em soluções ópticas inteligentes e "
                        "monitoramento IoT industrial."
                    ),
                    prazo="05/12/2026",
                    contato_email="carreiras@furukawaelectric.com",
                    criado_em="20/10/2026",
                ),
            ]
        )

    # 5. Notícias Reais do Portal Inatel e de Santa Rita do Sapucaí / Região (zero dados mockados)
    res_reais = await session.execute(
        select(Noticia).where(Noticia.url_original.is_not(None), Noticia.url_original != "").limit(1)
    )
    tem_noticia_real = res_reais.scalar_one_or_none() is not None

    await session.commit()

    if not tem_noticia_real:
        try:
            from news_service import sincronizar_noticias_no_banco

            inseridas, atualizadas = await sincronizar_noticias_no_banco(session)
            print(
                f"[Notícias] Sincronização inicial concluída: {inseridas} reais inseridas, {atualizadas} atualizadas."
            )
        except Exception as exc:
            print(f"[Notícias] Aviso ao sincronizar notícias reais na inicialização: {exc}")

