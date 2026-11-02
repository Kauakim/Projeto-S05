from pydantic import BaseModel, ConfigDict, Field, field_validator


def _validar_matricula_inteira(valor: object) -> int:
    if isinstance(valor, bool):
        raise ValueError("A matrícula deve ser um número inteiro entre 0 e 999999.")
    if isinstance(valor, int):
        num = valor
    elif isinstance(valor, str):
        limpo = valor.strip()
        if not limpo or not limpo.lstrip("-").isdigit():
            raise ValueError("A matrícula deve ser um número inteiro entre 0 e 999999.")
        num = int(limpo)
    else:
        raise ValueError("A matrícula deve ser um número inteiro entre 0 e 999999.")
    if num < 0 or num > 999999:
        raise ValueError("A matrícula deve estar entre 0 e 999999.")
    return num


class UsuarioBase(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    matricula: int = Field(..., ge=0, le=999999)
    curso: str = Field(..., min_length=2, max_length=120)
    periodo: int = Field(..., ge=1, le=12)
    email: str = Field(..., min_length=5, max_length=150)
    telefone: str = ""
    bio: str = ""
    github: str = ""
    linkedin: str = ""
    areas_interesse: str = ""
    crs: float = Field(default=84.5, ge=0, le=100)
    horas_complementares: int = Field(default=0, ge=0)
    meta_horas: int = Field(default=160, ge=1)
    horas_ac: int = Field(default=0, ge=0)
    meta_ac: int = Field(default=160, ge=1)
    horas_cp: int = Field(default=0, ge=0)
    meta_cp: int = Field(default=40, ge=1)
    horas_trilha: int = Field(default=0, ge=0)
    meta_trilha: int = Field(default=120, ge=1)
    disponivel_estagio: bool = True

    @field_validator("matricula", mode="before")
    @classmethod
    def validar_matricula(cls, valor: object) -> int:
        return _validar_matricula_inteira(valor)


class UsuarioUpdate(BaseModel):
    nome: str | None = Field(default=None, min_length=2, max_length=120)
    matricula: int | None = Field(default=None, ge=0, le=999999)
    curso: str | None = Field(default=None, min_length=2, max_length=120)
    periodo: int | None = Field(default=None, ge=1, le=12)
    email: str | None = Field(default=None, min_length=5, max_length=150)
    telefone: str | None = None
    bio: str | None = None
    github: str | None = None
    linkedin: str | None = None
    areas_interesse: str | None = None
    crs: float | None = Field(default=None, ge=0, le=100)
    horas_complementares: int | None = Field(default=None, ge=0)
    meta_horas: int | None = Field(default=None, ge=1)
    horas_ac: int | None = Field(default=None, ge=0)
    meta_ac: int | None = Field(default=None, ge=1)
    horas_cp: int | None = Field(default=None, ge=0)
    meta_cp: int | None = Field(default=None, ge=1)
    horas_trilha: int | None = Field(default=None, ge=0)
    meta_trilha: int | None = Field(default=None, ge=1)
    disponivel_estagio: bool | None = None

    @field_validator("matricula", mode="before")
    @classmethod
    def validar_matricula_opcional(cls, valor: object) -> int | None:
        if valor is None:
            return None
        return _validar_matricula_inteira(valor)


class UsuarioOut(UsuarioBase):
    id: int
    atualizado_em: str | None = None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    identificador: str = Field(
        ...,
        min_length=1,
        max_length=150,
        description="E-mail ou Matrícula do aluno",
    )
    senha: str = Field(..., min_length=1, max_length=128)


class RegistroRequest(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120)
    matricula: int = Field(..., ge=0, le=999999)
    curso: str = Field(default="Engenharia de Software", min_length=2, max_length=120)
    periodo: int = Field(default=1, ge=1, le=12)
    email: str = Field(..., min_length=5, max_length=150)
    telefone: str = ""
    senha: str = Field(..., min_length=6, max_length=128)

    @field_validator("matricula", mode="before")
    @classmethod
    def validar_matricula_registro(cls, valor: object) -> int:
        return _validar_matricula_inteira(valor)


class AlterarSenhaRequest(BaseModel):
    senha_atual: str = Field(..., min_length=1, max_length=128)
    nova_senha: str = Field(..., min_length=6, max_length=128)
    confirmar_senha: str = Field(..., min_length=6, max_length=128)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioOut


class AvaliacaoAulaItem(BaseModel):
    id: str = ""
    titulo: str = Field(..., min_length=1, max_length=100)
    tipo: str = Field(default="Prova", max_length=40)
    data: str = Field(default="", max_length=30)
    realizada: bool = False
    nota: float | None = Field(default=None, ge=0, le=100)
    peso: float = Field(default=1.0, gt=0, le=100)


class AulaCreate(BaseModel):
    codigo: str = Field(..., min_length=1, max_length=20)
    turma: str = Field(default="A", min_length=1, max_length=30)
    disciplina: str = Field(..., min_length=2, max_length=160)
    professor: str = Field(..., min_length=2, max_length=120)
    dia: str = Field(..., min_length=2, max_length=100)
    horario: str = Field(..., min_length=2, max_length=160)
    local: str = Field(..., min_length=1, max_length=80)
    prova_alert: bool = False
    prova_data: str = ""
    frequencia: str = ""
    nota: float = Field(default=0.0, ge=0, le=100)
    calcular_nota_automatica: bool = False
    avaliacoes: list[AvaliacaoAulaItem] = []


class AulaUpdate(BaseModel):
    codigo: str | None = Field(default=None, min_length=1, max_length=20)
    turma: str | None = Field(default=None, min_length=1, max_length=30)
    disciplina: str | None = Field(default=None, min_length=2, max_length=160)
    professor: str | None = Field(default=None, min_length=2, max_length=120)
    dia: str | None = Field(default=None, min_length=2, max_length=100)
    horario: str | None = Field(default=None, min_length=2, max_length=160)
    local: str | None = Field(default=None, min_length=1, max_length=80)
    prova_alert: bool | None = None
    prova_data: str | None = None
    frequencia: str | None = None
    nota: float | None = Field(default=None, ge=0, le=100)
    calcular_nota_automatica: bool = False
    avaliacoes: list[AvaliacaoAulaItem] | None = None


class AulaOut(BaseModel):
    id: int
    usuario_id: int | None = None
    codigo: str
    turma: str = "A"
    disciplina: str
    professor: str
    dia: str
    horario: str
    local: str
    prova_alert: bool
    prova_data: str | None = ""
    frequencia: str
    nota: float
    avaliacoes: list[AvaliacaoAulaItem] = []

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

