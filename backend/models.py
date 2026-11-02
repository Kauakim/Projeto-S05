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
    matricula = Column(Integer, nullable=False, unique=True)
    curso = Column(String(120), nullable=False)
    periodo = Column(Integer, nullable=False, default=5)
    email = Column(String(150), nullable=False, unique=True)
    senha_hash = Column(String(255), nullable=False, default="")
    telefone = Column(String(30), nullable=True, default="")
    bio = Column(Text, nullable=True, default="")
    github = Column(String(200), nullable=True, default="")
    linkedin = Column(String(200), nullable=True, default="")
    areas_interesse = Column(String(250), nullable=True, default="")
    crs = Column(Float, nullable=False, default=84.5)
    horas_complementares = Column(Integer, nullable=False, default=112)
    meta_horas = Column(Integer, nullable=False, default=200)
    horas_ac = Column(Integer, nullable=False, default=112)
    meta_ac = Column(Integer, nullable=False, default=200)
    horas_cp = Column(Integer, nullable=False, default=28)
    meta_cp = Column(Integer, nullable=False, default=40)
    horas_trilha = Column(Integer, nullable=False, default=45)
    meta_trilha = Column(Integer, nullable=False, default=60)
    disponivel_estagio = Column(Boolean, nullable=False, default=True)
    atualizado_em = Column(DateTime_compat := String(40), nullable=True)

    aulas = relationship(
        "Aula",
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
    usuario_id = Column(
        Integer,
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
    )
    codigo = Column(String(20), nullable=False)
    turma = Column(String(30), nullable=False, default="A")
    disciplina = Column(String(160), nullable=False)
    professor = Column(String(120), nullable=False)
    dia = Column(String(100), nullable=False, index=True)  # seg, ter, qua, qui, sex, sab (suporta múltiplos dias)
    horario = Column(String(160), nullable=False)
    local = Column(String(80), nullable=False)
    prova_alert = Column(Boolean, nullable=False, default=False)
    prova_data = Column(String(20), nullable=True, default="")
    frequencia = Column(String(30), nullable=True, default="")
    nota = Column(Float, nullable=False, default=0.0)
    avaliacoes_json = Column(Text, nullable=False, default="[]")

    usuario = relationship("Usuario", back_populates="aulas")


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


class Noticia(Base):
    __tablename__ = "noticias"

    id = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(240), nullable=False)
    resumo = Column(String(350), nullable=False)
    conteudo = Column(Text, nullable=False)
    categoria = Column(String(50), nullable=False, index=True)  # Inovação, Acadêmico, Carreira, Pesquisa, Eventos
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


