from datetime import datetime, timezone
from sqlalchemy import Boolean, Column, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship
from database import Base


def utcnow_naive() -> datetime:
    return datetime.now(timezone.utc).replace(tzinfo=None)


class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(120), nullable=False)
    matricula = Column(String(30), nullable=False, unique=True)
    curso = Column(String(120), nullable=False)
    periodo = Column(Integer, nullable=False, default=5)
    email = Column(String(150), nullable=False, unique=True)
    senha_hash = Column(String(255), nullable=False, default="")
    telefone = Column(String(30), nullable=True, default="")
    bio = Column(Text, nullable=True, default="")
    github = Column(String(200), nullable=True, default="")
    linkedin = Column(String(200), nullable=True, default="")
    areas_interesse = Column(String(250), nullable=True, default="")
    ira = Column(Float, nullable=False, default=84.5)
    horas_complementares = Column(Integer, nullable=False, default=96)
    meta_horas = Column(Integer, nullable=False, default=160)
    disponivel_estagio = Column(Boolean, nullable=False, default=True)
    atualizado_em = Column(DateTime_compat := String(40), nullable=True)

    candidaturas = relationship(
        "Candidatura",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )
    analise_linkedin = relationship(
        "AnaliseLinkedIn",
        back_populates="usuario",
        uselist=False,
        cascade="all, delete-orphan",
    )
    vagas_linkedin = relationship(
        "VagaLinkedInCache",
        back_populates="usuario",
        cascade="all, delete-orphan",
    )


class Aula(Base):
    __tablename__ = "aulas"

    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), nullable=False)
    disciplina = Column(String(160), nullable=False)
    professor = Column(String(120), nullable=False)
    dia = Column(String(10), nullable=False, index=True)  # seg, ter, qua, qui, sex
    horario = Column(String(30), nullable=False)
    local = Column(String(50), nullable=False)
    prova_alert = Column(Boolean, nullable=False, default=False)
    prova_data = Column(String(20), nullable=True, default="")
    frequencia = Column(String(20), nullable=False, default="0/25")
    nota = Column(Float, nullable=False, default=0.0)


class Evento(Base):
    __tablename__ = "eventos"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(160), nullable=False)
    data = Column(String(20), nullable=False)
    horario = Column(String(20), nullable=False)
    local = Column(String(120), nullable=False)
    tipo = Column(String(40), nullable=False)  # tech, cultural, academic
    descricao = Column(Text, nullable=False)
    imagem_url = Column(String(400), nullable=False)


class Vaga(Base):
    __tablename__ = "vagas"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(160), nullable=False)
    empresa = Column(String(120), nullable=False)
    tipo = Column(String(50), nullable=False, index=True)  # Estágio, Iniciação Científica, Júnior, Trainee
    modalidade = Column(String(40), nullable=False)  # Presencial, Híbrido, Remoto
    localizacao = Column(String(120), nullable=False)
    bolsa_ou_salario = Column(String(80), nullable=False)
    area = Column(String(80), nullable=False)
    requisitos = Column(String(300), nullable=False)
    descricao = Column(Text, nullable=False)
    prazo = Column(String(30), nullable=False)
    contato_email = Column(String(150), nullable=True, default="nesp@inatel.br")
    ativa = Column(Boolean, nullable=False, default=True)
    criado_em = Column(String(30), nullable=False, default=lambda: utcnow_naive().strftime("%d/%m/%Y"))

    candidaturas = relationship(
        "Candidatura",
        back_populates="vaga",
        cascade="all, delete-orphan",
    )


class Candidatura(Base):
    __tablename__ = "candidaturas"

    id = Column(Integer, primary_key=True, index=True)
    vaga_id = Column(Integer, ForeignKey("vagas.id", ondelete="CASCADE"), nullable=False, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False, index=True)
    mensagem = Column(Text, nullable=True, default="")
    link_portfolio = Column(String(250), nullable=True, default="")
    status = Column(String(40), nullable=False, default="Em análise pelo NESP")
    criado_em = Column(String(30), nullable=False, default=lambda: utcnow_naive().strftime("%d/%m/%Y %H:%M"))

    vaga = relationship("Vaga", back_populates="candidaturas")
    usuario = relationship("Usuario", back_populates="candidaturas")


class Noticia(Base):
    __tablename__ = "noticias"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(240), nullable=False)
    resumo = Column(String(350), nullable=False)
    conteudo = Column(Text, nullable=False)
    categoria = Column(String(50), nullable=False, index=True)  # Inovação, Acadêmico, Carreira, Pesquisa, Eventos, Região
    autor = Column(String(100), nullable=False)
    fonte_nome = Column(String(120), nullable=True, default="")
    url_original = Column(String(600), nullable=True, default="")
    tempo_leitura = Column(String(30), nullable=False, default="3 min")
    imagem_url = Column(String(600), nullable=True, default="")
    destaque = Column(Boolean, nullable=False, default=False)
    visualizacoes = Column(Integer, nullable=False, default=0)
    curtidas = Column(Integer, nullable=False, default=0)
    publicado_em = Column(String(30), nullable=False, default=lambda: utcnow_naive().strftime("%d/%m/%Y"))


class AnaliseLinkedIn(Base):
    """Armazena os dados estruturados e brutos coletados do perfil LinkedIn do usuário."""

    __tablename__ = "analises_linkedin"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    linkedin_url = Column(String(250), nullable=False)
    slug = Column(String(120), nullable=False)
    fonte_coleta = Column(String(80), nullable=False, default="jina-reader-api")
    nome_completo = Column(String(160), nullable=True, default="")
    headline = Column(String(350), nullable=True, default="")
    localizacao = Column(String(160), nullable=True, default="")
    conexoes_ou_seguidores = Column(String(100), nullable=True, default="")
    resumo = Column(Text, nullable=True, default="")
    experiencias_json = Column(Text, nullable=False, default="[]")
    formacao_json = Column(Text, nullable=False, default="[]")
    skills_json = Column(Text, nullable=False, default="[]")
    pontuacao_perfil = Column(Integer, nullable=False, default=0)
    pontos_fortes_json = Column(Text, nullable=False, default="[]")
    sugestoes_melhoria_json = Column(Text, nullable=False, default="[]")
    dados_brutos_json = Column(Text, nullable=False, default="{}")
    atualizado_em = Column(
        String(40),
        nullable=False,
        default=lambda: utcnow_naive().strftime("%d/%m/%Y %H:%M"),
    )

    usuario = relationship("Usuario", back_populates="analise_linkedin")


class VagaLinkedInCache(Base):
    """Armazena vagas coletadas do LinkedIn alinhadas à área de interesse do usuário."""

    __tablename__ = "vagas_linkedin_cache"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    external_id = Column(String(120), nullable=True, default="")
    titulo = Column(String(240), nullable=False)
    empresa = Column(String(160), nullable=False)
    localizacao = Column(String(160), nullable=True, default="Brasil")
    modalidade = Column(String(60), nullable=True, default="Presencial / Híbrido")
    nivel = Column(String(80), nullable=True, default="")
    salario = Column(String(120), nullable=True, default="")
    descricao = Column(Text, nullable=True, default="")
    job_url = Column(String(500), nullable=False)
    logo_empresa = Column(String(500), nullable=True, default="")
    data_publicacao = Column(String(60), nullable=True, default="")
    termo_busca = Column(String(160), nullable=False, default="")
    fonte = Column(String(60), nullable=False, default="linkedin-jobspy")
    compatibilidade = Column(Integer, nullable=False, default=70)
    skills_match_json = Column(Text, nullable=False, default="[]")
    coletado_em = Column(
        String(40),
        nullable=False,
        default=lambda: utcnow_naive().strftime("%d/%m/%Y %H:%M"),
    )

    usuario = relationship("Usuario", back_populates="vagas_linkedin")


