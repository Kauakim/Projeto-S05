"""
Regras Curriculares Oficiais do Inatel por Curso:
- Meta de AC (Atividades Complementares): sempre 200h para qualquer curso.
- Meta de Trilha:
  - Engenharia Biomédica: 20h
  - Engenharia de Controle e Automação: 20h
  - Engenharia de Computação: 60h
  - Engenharia Elétrica: 20h
  - Engenharia de Produção: 60h
  - Engenharia de Software: 60h
  - Engenharia de Telecomunicações: 20h
- Meta de CP (Competências Pessoais):
  - Engenharia Biomédica: 20h
  - Engenharia de Controle e Automação: 20h
  - Engenharia de Computação: 40h
  - Engenharia Elétrica: 20h
  - Engenharia de Produção: 40h
  - Engenharia de Software: 40h
  - Engenharia de Telecomunicações: 20h
"""

METAS_CURSOS_INATEL = {
    "Engenharia Biomédica": {"ac": 200, "cp": 20, "trilha": 20},
    "Engenharia de Controle e Automação": {"ac": 200, "cp": 20, "trilha": 20},
    "Engenharia de Computação": {"ac": 200, "cp": 40, "trilha": 60},
    "Engenharia Elétrica": {"ac": 200, "cp": 20, "trilha": 20},
    "Engenharia de Produção": {"ac": 200, "cp": 40, "trilha": 60},
    "Engenharia de Software": {"ac": 200, "cp": 40, "trilha": 60},
    "Engenharia de Telecomunicações": {"ac": 200, "cp": 20, "trilha": 20},
}


def obter_metas_por_curso(nome_curso: str | None) -> dict[str, int]:
    padrao = {"ac": 200, "cp": 40, "trilha": 60}
    if not nome_curso:
        return padrao
    norm = nome_curso.lower()
    if "software" in norm:
        return {"ac": 200, "cp": 40, "trilha": 60}
    if "computa" in norm:
        return {"ac": 200, "cp": 40, "trilha": 60}
    if "produ" in norm:
        return {"ac": 200, "cp": 40, "trilha": 60}
    if "biom" in norm:
        return {"ac": 200, "cp": 20, "trilha": 20}
    if "controle" in norm or "automa" in norm:
        return {"ac": 200, "cp": 20, "trilha": 20}
    if "elétr" in norm or "eletri" in norm:
        return {"ac": 200, "cp": 20, "trilha": 20}
    if "telecom" in norm:
        return {"ac": 200, "cp": 20, "trilha": 20}
    return padrao

