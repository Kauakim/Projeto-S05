from pydantic import BaseModel, ConfigDict, Field


class UsuarioBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    matricula: str = Field(..., min_length=2, max_length=30)
    curso: str = Field(..., min_length=2, max_length=120)
    periodo: int = Field(..., ge=1, le=12)
    email: str = Field(..., min_length=5, max_length=150)
    telefone: str = ""
    bio: str = ""
    github: str = ""
    linkedin: str = ""
    areas_interesse: str = ""
    ira: float = Field(default=84.5, ge=0, le=100)
    horas_complementares: int = Field(default=0, ge=0)
    meta_horas: int = Field(default=160, ge=1)
    disponivel_estagio: bool = True


class UsuarioUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=120)
    matricula: str | None = Field(default=None, min_length=2, max_length=30)
    curso: str | None = Field(default=None, min_length=2, max_length=120)
    periodo: int | None = Field(default=None, ge=1, le=12)
    email: str | None = Field(default=None, min_length=5, max_length=150)
    telefone: str | None = None
    bio: str | None = None
    github: str | None = None
    linkedin: str | None = None
    areas_interesse: str | None = None
    horas_complementares: int | None = Field(default=None, ge=0)
    disponivel_estagio: bool | None = None


class UsuarioOut(UsuarioBase):
    id: int
    atualizado_em: str | None = None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    identificador: str = Field(
        ...,
        min_length=2,
        max_length=150,
        description="E-mail institucional ou Matrícula do aluno",
    )
    senha: str = Field(..., min_length=1, max_length=128)


class RegistroRequest(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    matricula: str = Field(..., min_length=2, max_length=30)
    curso: str = Field(default="Engenharia de Software", min_length=2, max_length=120)
    periodo: int = Field(default=1, ge=1, le=12)
    email: str = Field(..., min_length=5, max_length=150)
    telefone: str = ""
    senha: str = Field(..., min_length=6, max_length=128)


class AlterarSenhaRequest(BaseModel):
    senha_atual: str = Field(..., min_length=1, max_length=128)
    nova_senha: str = Field(..., min_length=6, max_length=128)
    confirmar_senha: str = Field(..., min_length=6, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class AulaOut(BaseModel):
    id: int
    codigo: str
    disciplina: str
    professor: str
    dia: str
    horario: str
    local: str
    prova_alert: bool
    prova_data: str | None = ""
    frequencia: str
    nota: float

    model_config = ConfigDict(from_attributes=True)


class EventoOut(BaseModel):
    id: int
    titulo: str
    data: str
    horario: str
    local: str
    tipo: str
    descricao: str
    imagem_url: str

    model_config = ConfigDict(from_attributes=True)


class VagaCreate(BaseModel):
    titulo: str = Field(..., min_length=3, max_length=160)
    empresa: str = Field(..., min_length=2, max_length=120)
    tipo: str = Field(..., min_length=2, max_length=50)
    modalidade: str = Field(..., min_length=2, max_length=40)
    localizacao: str = Field(..., min_length=2, max_length=120)
    bolsa_ou_salario: str = Field(..., min_length=2, max_length=80)
    area: str = Field(..., min_length=2, max_length=80)
    requisitos: str = Field(..., min_length=2, max_length=300)
    descricao: str = Field(..., min_length=10)
    prazo: str = Field(..., min_length=4, max_length=30)
    contato_email: str = "nesp@inatel.br"


class VagaOut(BaseModel):
    id: int
    titulo: str
    empresa: str
    tipo: str
    modalidade: str
    localizacao: str
    bolsa_ou_salario: str
    area: str
    requisitos: str
    descricao: str
    prazo: str
    contato_email: str | None = None
    ativa: bool
    criado_em: str
    candidatado: bool = False
    total_candidaturas: int = 0

    model_config = ConfigDict(from_attributes=True)


class CandidaturaCreate(BaseModel):
    mensagem: str = ""
    link_portfolio: str = ""


class CandidaturaOut(BaseModel):
    id: int
    vaga_id: int
    usuario_id: int
    mensagem: str | None = ""
    link_portfolio: str | None = ""
    status: str
    criado_em: str
    vaga_titulo: str = ""
    vaga_empresa: str = ""
    vaga_tipo: str = ""
    vaga_modalidade: str = ""
    vaga_bolsa: str = ""

    model_config = ConfigDict(from_attributes=True)


class NoticiaCreate(BaseModel):
    titulo: str = Field(..., min_length=5, max_length=240)
    resumo: str = Field(..., min_length=10, max_length=350)
    conteudo: str = Field(..., min_length=20)
    categoria: str = Field(..., min_length=2, max_length=50)
    autor: str = Field(default="Portal Inatel", min_length=2, max_length=100)
    fonte_nome: str = Field(default="", max_length=120)
    url_original: str = Field(default="", max_length=600)
    tempo_leitura: str = "3 min"
    imagem_url: str = ""
    destaque: bool = False


class NoticiaOut(BaseModel):
    id: int
    titulo: str
    resumo: str
    conteudo: str
    categoria: str
    autor: str
    fonte_nome: str | None = ""
    url_original: str | None = ""
    tempo_leitura: str
    imagem_url: str | None = ""
    destaque: bool
    visualizacoes: int
    curtidas: int
    publicado_em: str

    model_config = ConfigDict(from_attributes=True)


class SincronizarNoticiasOut(BaseModel):
    inseridas: int
    atualizadas: int
    total_ativas: int
    noticias: list[NoticiaOut]


# ==========================================
# SCHEMAS DE INTEGRAÇÃO LINKEDIN (PERFIL & VAGAS)
# ==========================================
class AnalisarPerfilLinkedInRequest(BaseModel):
    linkedin_url: str = Field(..., min_length=3, max_length=250)
    apify_token: str = ""
    rapidapi_key: str = ""
    scrapingdog_key: str = ""
    sincronizar_areas: bool = False


class ExperienciaLinkedInItem(BaseModel):
    cargo: str = ""
    empresa: str = ""
    periodo: str = ""
    localizacao: str = ""
    descricao: str = ""
    oculto_visitante: bool = False


class FormacaoLinkedInItem(BaseModel):
    instituicao: str = ""
    curso: str = ""
    periodo: str = ""
    nota_ou_detalhe: str = ""
    oculto_visitante: bool = False


class SiteLinkedInItem(BaseModel):
    rotulo: str = ""
    url: str = ""


class ProjetoLinkedInItem(BaseModel):
    titulo: str = ""
    periodo: str = ""
    descricao: str = ""


class CertificacaoLinkedInItem(BaseModel):
    nome: str = ""
    emissor: str = ""
    data: str = ""


class PremioLinkedInItem(BaseModel):
    titulo: str = ""
    emissor: str = ""
    data: str = ""
    descricao: str = ""


class IdiomaLinkedInItem(BaseModel):
    idioma: str = ""
    nivel: str = ""


class PublicacaoLinkedInItem(BaseModel):
    texto: str = ""
    data: str = ""
    curtidas: int = 0
    url: str = ""


class PilarNotaItem(BaseModel):
    nome: str = ""
    pontos: int = 0
    maximo: int = 20
    detalhe: str = ""


class AnaliseLinkedInOut(BaseModel):
    id: int
    usuario_id: int
    linkedin_url: str
    slug: str
    fonte_coleta: str
    nome_completo: str = ""
    headline: str = ""
    instituicao_atual: str = ""
    foto_url: str = ""
    banner_url: str = ""
    localizacao: str = ""
    conexoes_ou_seguidores: str = ""
    resumo: str = ""
    sites: list[SiteLinkedInItem] = []
    experiencias: list[ExperienciaLinkedInItem] = []
    total_experiencias_perfil: int = 0
    formacao: list[FormacaoLinkedInItem] = []
    total_formacoes_perfil: int = 0
    projetos: list[ProjetoLinkedInItem] = []
    certificacoes: list[CertificacaoLinkedInItem] = []
    cursos: list[str] = []
    premios: list[PremioLinkedInItem] = []
    idiomas: list[IdiomaLinkedInItem] = []
    publicacoes: list[PublicacaoLinkedInItem] = []
    skills: list[str] = []
    pontuacao_perfil: int = 0
    nivel_perfil: str = ""
    pilares_nota: list[PilarNotaItem] = []
    pontos_fortes: list[str] = []
    sugestoes_melhoria: list[str] = []
    dados_brutos: dict = {}
    atualizado_em: str = ""


class BuscarVagasLinkedInRequest(BaseModel):
    termo_busca: str = ""
    localizacao: str = "Brazil"
    apenas_remoto: bool = False
    limite: int = Field(default=10, ge=3, le=25)


class VagaLinkedInOut(BaseModel):
    id: int
    titulo: str
    empresa: str
    localizacao: str
    modalidade: str
    nivel: str = ""
    salario: str = ""
    descricao: str = ""
    job_url: str
    logo_empresa: str = ""
    data_publicacao: str = ""
    termo_busca: str = ""
    fonte: str = ""
    compatibilidade: int = 0
    skills_match: list[str] = []
    coletado_em: str = ""

