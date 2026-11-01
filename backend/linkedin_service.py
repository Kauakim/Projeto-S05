import asyncio
import json
import math
import os
import re
from urllib.parse import parse_qs, unquote, urlparse

import httpx
from bs4 import BeautifulSoup
from curl_cffi import requests as creq
from jobspy import scrape_jobs

# Catálogo expandido de competências técnicas e de engenharia para detecção em perfis e vagas
CATALOGO_SKILLS: dict[str, list[str]] = {
    "Python": ["python"],
    "Back-End": ["back-end", "backend", "back end", "api rest", "restful"],
    "Front-End": ["front-end", "frontend", "front end"],
    "Full-Stack": ["full-stack", "fullstack", "full stack"],
    "React": ["react", "reactjs", "react.js"],
    "JavaScript": ["javascript", "ecmascript"],
    "TypeScript": ["typescript"],
    "FastAPI": ["fastapi", "fast api"],
    "Node.js": ["node.js", "nodejs", "express.js"],
    "Java": ["java", "jvm", "libgdx"],
    "Spring Boot": ["spring boot"],
    "C/C++": ["c++", "linguagem c", "c/c++", "ansi c"],
    "C# / .NET": ["c#", ".net", "dotnet", "unity"],
    "Go": ["golang"],
    "SQL & Bancos de Dados": ["sql", "mysql", "sqlite", "banco de dados"],
    "PostgreSQL": ["postgresql", "postgres"],
    "MongoDB": ["mongodb", "nosql"],
    "Tailwind CSS": ["tailwind", "tailwindcss"],
    "HTML & CSS": ["html", "html5", "css", "css3"],
    "UI/UX & IHM": ["ui/ux", "ui design", "figma", "interface homem", "ihm", "usabilidade"],
    "Docker & Containers": ["docker", "containers", "kubernetes", "k8s"],
    "Cloud (AWS/GCP/Azure)": ["aws", "google cloud", "gcp", "azure", "cloud"],
    "Linux": ["linux", "ubuntu", "debian"],
    "Git & GitHub": ["git", "github", "gitlab", "ci/cd", "devops"],
    "Algoritmos & Estruturas de Dados": ["algorithms", "algoritmos", "estruturas de dados"],
    "Inteligência Artificial & ML": [
        "inteligência artificial",
        "artificial intelligence",
        "machine learning",
        "deep learning",
        "redes neurais",
        "ia generativa",
        "llm",
        "pytorch",
        "tensorflow",
    ],
    "Ciência & Análise de Dados": [
        "data science",
        "análise de dados",
        "ciência de dados",
        "pandas",
        "spark",
        "etl",
        "power bi",
        "bigquery",
    ],
    "Redes & Telecom (5G/6G)": [
        "redes de comunicações",
        "redes móveis",
        "telecom",
        "telecomunicações",
        "5g",
        "6g",
        "xgmobile",
        "tcp/ip",
        "gerenciamento de redes",
    ],
    "IoT, BLE & Sistemas Embarcados": [
        "iot",
        "internet das coisas",
        "internet of things",
        "embarcados",
        "embedded",
        "esp32",
        "arduino",
        "stm32",
        "mqtt",
        "firmware",
        "lora",
        "bluetooth low energy",
        "beacons",
        "sensores",
        "gêmeos digitais",
        "digital twins",
        "indústria 4.0",
    ],
    "Eletrônica & Hardware": [
        "eletrônica",
        "pci",
        "placa de circuito",
        "hardware",
        "recorte eletrônico",
    ],
    "Cibersegurança": [
        "cybersecurity",
        "cibersegurança",
        "segurança cibernética",
        "segurança da informação",
        "capture the flag",
        "ctf",
        "pentest",
        "desenvolvimento seguro",
    ],
    "Pesquisa Científica & P&D": [
        "iniciação científica",
        "cnpq",
        "embrapii",
        "escrita científica",
        "metodologia de pesquisa",
    ],
    "Automação & Controle": ["automação", "plc", "clp", "scada", "robótica"],
    "Metodologias Ágeis": ["scrum", "kanban", "agile", "jira"],
    "Inglês": ["inglês", "english", "bilíngue"],
}

BOILERPLATE_FRASES = (
    "750 million+ members",
    "1 billion members",
    "1 bilhão de usuários",
    "manage your professional identity",
    "build and engage with your professional network",
    "access knowledge, insights and opportunities",
    "entre para ver o perfil",
    "cadastre-se para ver",
    "cadastre-se agora",
    "sign in to view",
    "join linkedin",
    "olá novamente",
    "esqueceu a senha",
    "veja o perfil completo de",
)


def _is_linkedin_boilerplate(texto: str) -> bool:
    t = (texto or "").strip().lower()
    if not t:
        return True
    return any(frase in t for frase in BOILERPLATE_FRASES)


def _is_masked(texto: str) -> bool:
    return "***" in (texto or "")


def _limpar_asteriscos(texto: str) -> str:
    """Remove blocos de asteriscos de máscara do LinkedIn preservando números/notas reais."""
    if not texto:
        return ""
    sem_ast = re.sub(r"\*{2,}", " ", texto)
    sem_ast = re.sub(r"\s+", " ", sem_ast).strip(" -·•|")
    return sem_ast


def _limpar_texto_secao(texto: str) -> str:
    if not texto:
        return ""
    t = texto
    t = re.sub(
        r"\s*(?:Exibir mais|Exibir menos|ver mais|ver menos|See more|See less|Show more|Show less)\s*$",
        "",
        t,
        flags=re.IGNORECASE,
    )
    t = re.sub(
        r"\s*Para mais detalhes sobre o projeto e seu código, acesse o repositório disponível no link abaixo:\s*$",
        "",
        t,
        flags=re.IGNORECASE,
    )
    t = re.sub(r"[ \t]+", " ", t)
    t = re.sub(r"\n{3,}", "\n\n", t)
    return t.strip()


def normalize_linkedin_url(raw_url: str) -> tuple[str, str]:
    """Valida e padroniza uma URL de perfil do LinkedIn, retornando (url_limpa, slug)."""
    texto = (raw_url or "").strip()
    if not texto:
        raise ValueError("Informe o link do seu perfil do LinkedIn.")

    if "/" not in texto and "." not in texto:
        slug = re.sub(r"[^A-Za-z0-9\-_%]", "", texto)
        if len(slug) < 2:
            raise ValueError("Identificador de perfil LinkedIn inválido.")
        return f"https://www.linkedin.com/in/{slug}", unquote(slug)

    if not texto.startswith(("http://", "https://")):
        texto = "https://" + texto

    parsed = urlparse(texto)
    host = parsed.netloc.lower()
    if "linkedin.com" not in host:
        raise ValueError(
            "O link precisa ser um perfil do LinkedIn (ex: https://www.linkedin.com/in/seu-nome)."
        )

    partes = [p for p in parsed.path.split("/") if p]
    if len(partes) >= 2 and partes[0].lower() == "in":
        slug = unquote(partes[1].strip())
    elif len(partes) == 1 and partes[0].lower() not in {"feed", "jobs", "company", "school"}:
        slug = unquote(partes[0].strip())
    else:
        raise ValueError(
            "Use o link direto do seu perfil pessoal contendo '/in/' (ex: https://www.linkedin.com/in/seu-perfil)."
        )

    url_limpa = f"https://www.linkedin.com/in/{slug}"
    return url_limpa, slug


def extrair_skills_de_texto(texto: str, extras: list[str] | None = None) -> list[str]:
    base = (texto or "").lower()
    encontradas: list[str] = []

    if extras:
        for item in extras:
            limpo = str(item).strip()
            if limpo and not _is_masked(limpo) and limpo not in encontradas:
                encontradas.append(limpo)

    for nome_skill, gatilhos in CATALOGO_SKILLS.items():
        for g in gatilhos:
            padrao = r"(?<![a-z0-9])" + re.escape(g) + r"(?![a-z0-9])"
            if re.search(padrao, base):
                if nome_skill not in encontradas:
                    encontradas.append(nome_skill)
                break

    return encontradas[:20]


def _formatar_data_iso(iso_str: str) -> str:
    if not iso_str:
        return ""
    m = re.match(r"^(\d{4})-(\d{2})(?:-(\d{2}))?", str(iso_str).strip())
    if not m:
        return str(iso_str).strip()
    ano, mes, dia = m.group(1), m.group(2), m.group(3)
    if dia:
        return f"{dia}/{mes}/{ano}"
    return f"{mes}/{ano}"


def _classificar_rotulo_site(url: str, texto_ancora: str = "") -> str:
    u = url.lower()
    if "github.com/" in u and ".github.io" not in u:
        return "GitHub"
    if ".github.io" in u or "portfolio" in u or "vercel.app" in u or "netlify.app" in u:
        return "Portfólio"
    if "gitlab.com" in u:
        return "GitLab"
    if "lattes.cnpq.br" in u:
        return "Currículo Lattes"
    if "medium.com" in u or "dev.to" in u:
        return "Blog Técnico"
    limpo = re.sub(r"https?://\S+", "", texto_ancora or "").strip(" -|·")
    return limpo if (limpo and len(limpo) <= 24) else "Site Externo"


def _extrair_texto_card_descricao(container) -> str:
    if container is None:
        return ""
    more_el = container.select_one(".show-more-less-text__text--more")
    if more_el:
        return _limpar_texto_secao(more_el.get_text("\n", strip=True))
    less_el = container.select_one(".show-more-less-text__text--less")
    if less_el:
        return _limpar_texto_secao(less_el.get_text("\n", strip=True))
    return ""


def _parse_linkedin_profile_html(html_text: str, slug: str) -> dict | None:
    """
    Extrai diretamente do HTML público + Schema.org JSON-LD do LinkedIn todas as seções reais
    do perfil: Identidade, Foto, Banner, Sites, Sobre, Experiências, Formação, Projetos,
    Licenças & Certificados, Cursos, Prêmios, Idiomas e Publicações Autorais.
    """
    if not html_text or len(html_text) < 2500:
        return None

    soup_full = BeautifulSoup(html_text, "html.parser")

    # 1. Metadados OpenGraph / Profile
    meta: dict[str, str] = {}
    for m in soup_full.find_all("meta"):
        chave = m.get("property") or m.get("name")
        conteudo = m.get("content")
        if chave and conteudo:
            meta[str(chave)] = str(conteudo).strip()

    og_title = meta.get("og:title") or (
        soup_full.title.get_text(" ", strip=True) if soup_full.title else ""
    )
    meta_desc = meta.get("description") or meta.get("og:description") or ""

    # Se a página inteira for apenas o authwall genérico do LinkedIn sem Person/profile, aborta
    has_profile_marker = (
        meta.get("og:type") == "profile"
        or meta.get("pageKey", "").startswith("public_profile")
        or '"@type":"Person"' in html_text
        or '"@type": "Person"' in html_text
    )
    if not has_profile_marker and _is_linkedin_boilerplate(meta_desc):
        return None

    # 2. Extrai JSON-LD (Schema.org Person + DiscussionForumPosting)
    person_ld: dict = {}
    posts_ld: list[dict] = []
    for script_tag in soup_full.find_all("script", attrs={"type": "application/ld+json"}):
        raw_txt = script_tag.get_text(strip=True)
        if not raw_txt:
            continue
        try:
            bloco = json.loads(raw_txt)
        except Exception:
            continue
        candidatos = bloco.get("@graph", [bloco]) if isinstance(bloco, dict) else bloco
        if not isinstance(candidatos, list):
            candidatos = [candidatos]
        for item in candidatos:
            if not isinstance(item, dict):
                continue
            tipo = item.get("@type")
            if tipo == "ProfilePage" and isinstance(item.get("mainEntity"), dict):
                if item["mainEntity"].get("@type") == "Person":
                    person_ld = item["mainEntity"]
            elif tipo == "Person":
                person_ld = item
            elif tipo == "DiscussionForumPosting":
                posts_ld.append(item)

    # 3. Extrai Foto Oficial, Banner de Capa e Sites (antes de remover modais, pois 'Sites' fica em modal)
    foto_url = ""
    img_ld = person_ld.get("image")
    if isinstance(img_ld, dict):
        foto_url = str(img_ld.get("contentUrl") or "")
    elif isinstance(img_ld, str):
        foto_url = img_ld
    if not foto_url:
        foto_url = meta.get("og:image") or ""
    if "static.licdn.com" in foto_url:
        foto_url = ""

    banner_url = ""
    bg_el = soup_full.select_one(
        "img[src*='profile-displaybackgroundimage'], img[data-delayed-url*='profile-displaybackgroundimage']"
    )
    if bg_el:
        banner_url = str(bg_el.get("src") or bg_el.get("data-delayed-url") or "").strip()

    sites: list[dict] = []
    urls_vistas: set[str] = set()
    for a_site in soup_full.select("a[href*='public_profile_website']"):
        href = str(a_site.get("href") or "")
        qs = parse_qs(urlparse(href).query)
        real_url = unquote(qs["url"][0]).strip() if qs.get("url") else href
        if real_url and real_url.startswith("http") and real_url not in urls_vistas:
            urls_vistas.add(real_url)
            pai_txt = a_site.parent.get_text(" ", strip=True) if a_site.parent else ""
            sites.append(
                {
                    "rotulo": _classificar_rotulo_site(real_url, pai_txt),
                    "url": real_url,
                }
            )

    # 4. Remove modais de login, banners promocionais e coluna lateral de posts de terceiros
    soup = soup_full
    for ruido in soup.select(
        ".modal__wrapper, .contextual-sign-in-modal, .sign-in-modal, "
        ".aside-section-container, .right-rail, .bottom-cta-banner, .hidden-summary, footer"
    ):
        ruido.decompose()

    # 5. Identidade do Topo (Nome, Instituição Atual, Localização, Seguidores/Conexões)
    nome_completo = ""
    h1_el = soup.select_one("h1.top-card-layout__title, .top-card-layout h1")
    if h1_el:
        cand_h1 = h1_el.get_text(" ", strip=True)
        if not _is_linkedin_boilerplate(cand_h1) and not _is_masked(cand_h1):
            nome_completo = cand_h1

    if not nome_completo and person_ld.get("name"):
        nome_completo = str(person_ld["name"]).strip()

    if not nome_completo and (meta.get("profile:first_name") or meta.get("profile:last_name")):
        nome_completo = (
            f"{meta.get('profile:first_name', '')} {meta.get('profile:last_name', '')}".strip()
        )

    instituicao_atual = ""
    if og_title and " - " in og_title:
        sem_li = re.sub(r"\s*\|\s*LinkedIn.*$", "", og_title, flags=re.IGNORECASE).strip()
        partes_og = [p.strip() for p in sem_li.split(" - ", 1)]
        if not nome_completo and partes_og[0] and not _is_linkedin_boilerplate(partes_og[0]):
            nome_completo = partes_og[0]
        if len(partes_og) > 1 and not _is_linkedin_boilerplate(partes_og[1]):
            instituicao_atual = partes_og[1]

    if not instituicao_atual:
        comp_el = soup.select_one(
            "a[href*='topcard-current-company'], a[href*='topcard-school']"
        )
        if comp_el:
            instituicao_atual = comp_el.get_text(" ", strip=True)

    # Localização
    localizacao = ""
    addr = person_ld.get("address")
    if isinstance(addr, dict):
        localizacao = str(addr.get("addressLocality") or "").strip()
    if not localizacao:
        sub_el = soup.select_one(".top-card-layout__first-subline")
        if sub_el:
            sub_txt = sub_el.get_text(" | ", strip=True).split("|")[0].strip()
            sub_txt = re.sub(r"\s*Informações de contato.*$", "", sub_txt, flags=re.I).strip()
            if sub_txt and not _is_linkedin_boilerplate(sub_txt):
                localizacao = sub_txt

    # Seguidores e Conexões
    partes_rede: list[str] = []
    inter_ld = person_ld.get("interactionStatistic")
    inter_list = inter_ld if isinstance(inter_ld, list) else ([inter_ld] if isinstance(inter_ld, dict) else [])
    for st in inter_list:
        cnt = st.get("userInteractionCount")
        if isinstance(cnt, int) and cnt > 0:
            cnt_fmt = f"{cnt:,}".replace(",", ".")
            partes_rede.append(f"{cnt_fmt} seguidores")
            break

    subline_el = soup.select_one(".top-card-layout__first-subline")
    if subline_el:
        sub_all = subline_el.get_text(" ", strip=True)
        m_con = re.search(
            r"(\+\s*de\s*\d+\s*conexões|\d+\+?\s*conexões|\d+\+?\s*connections)",
            sub_all,
            flags=re.IGNORECASE,
        )
        if m_con:
            partes_rede.append(re.sub(r"\s+", " ", m_con.group(1)).strip())
        elif not partes_rede:
            m_seg = re.search(
                r"([\d.,]+\s*(?:mil\s*)?(?:seguidores|followers))",
                sub_all,
                flags=re.IGNORECASE,
            )
            if m_seg:
                partes_rede.append(re.sub(r"\s+", " ", m_seg.group(1)).strip())

    conexoes_ou_seguidores = " • ".join(partes_rede)

    # 6. Seção Sobre (Resumo) e Headline direta do perfil
    resumo = ""
    sum_sec = soup.select_one("section[data-section='summary'], section.summary")
    if sum_sec:
        cand_sum = _extrair_texto_card_descricao(sum_sec)
        if not cand_sum:
            content_div = sum_sec.select_one(".core-section-container__content")
            if content_div:
                cand_sum = _limpar_texto_secao(content_div.get_text("\n", strip=True))
        if cand_sum and not _is_linkedin_boilerplate(cand_sum) and not _is_masked(cand_sum):
            resumo = cand_sum

    if not resumo and person_ld.get("description"):
        cand_desc = _limpar_texto_secao(str(person_ld.get("description") or ""))
        if cand_desc and not _is_linkedin_boilerplate(cand_desc) and not _is_masked(cand_desc):
            resumo = cand_desc

    headline = ""
    h2_top = soup.select_one(".top-card-layout__headline")
    if h2_top and not h2_top.select_one(".blur"):
        cand_hl = h2_top.get_text(" ", strip=True)
        if cand_hl and not _is_linkedin_boilerplate(cand_hl) and not _is_masked(cand_hl):
            headline = cand_hl

    if not headline:
        jt = person_ld.get("jobTitle")
        if isinstance(jt, list):
            limpos_jt = [str(x).strip() for x in jt if x and not _is_masked(str(x))]
            if limpos_jt:
                headline = " | ".join(limpos_jt[:2])
        elif isinstance(jt, str) and not _is_masked(jt):
            headline = jt.strip()

    # Se o LinkedIn ocultou o campo separado de título no modo visitante, usa a primeira linha real da descrição/Sobre do próprio perfil
    if not headline and resumo:
        primeira_linha = resumo.splitlines()[0].strip()
        headline = primeira_linha[:220]
    elif not headline and instituicao_atual:
        headline = instituicao_atual

    # 7. Experiências Profissionais & Acadêmicas
    experiencias: list[dict] = []
    exp_sec = soup.select_one("section[data-section='experience']")
    if exp_sec:
        for li in exp_sec.select("li.profile-section-card, li.experience-item"):
            # Verifica se é um grupo de múltiplos cargos na mesma empresa
            sub_roles = li.select("li.experience-group-position")
            if sub_roles:
                emp_grupo_el = li.select_one("h4, .experience-group-header__company")
                emp_grupo = emp_grupo_el.get_text(" ", strip=True) if emp_grupo_el else ""
                for sr in sub_roles:
                    c_el = sr.select_one("h3")
                    d_el = sr.select_one(".date-range")
                    loc_el = sr.select_one(".experience-item__location")
                    cargo_s = _limpar_asteriscos(c_el.get_text(" ", strip=True)) if c_el else ""
                    if cargo_s or emp_grupo:
                        experiencias.append(
                            {
                                "cargo": cargo_s or "Atuação Profissional",
                                "empresa": _limpar_asteriscos(emp_grupo),
                                "periodo": _limpar_texto_secao(d_el.get_text(" ", strip=True)) if d_el else "",
                                "localizacao": loc_el.get_text(" ", strip=True) if loc_el else "",
                                "descricao": _extrair_texto_card_descricao(sr)[:400],
                                "oculto_visitante": False,
                            }
                        )
                continue

            h3 = li.select_one("h3")
            h4 = li.select_one("h4")
            d_el = li.select_one(".date-range")
            cargo_txt = h3.get_text(" ", strip=True) if h3 else ""
            emp_txt = h4.get_text(" ", strip=True) if h4 else ""
            if _is_masked(cargo_txt) and _is_masked(emp_txt):
                continue
            experiencias.append(
                {
                    "cargo": _limpar_asteriscos(cargo_txt) or "Atuação Profissional",
                    "empresa": _limpar_asteriscos(emp_txt),
                    "periodo": _limpar_texto_secao(d_el.get_text(" ", strip=True)) if d_el else "",
                    "localizacao": "",
                    "descricao": _extrair_texto_card_descricao(li)[:400],
                    "oculto_visitante": _is_masked(cargo_txt) or _is_masked(emp_txt),
                }
            )

    works_for_ld = person_ld.get("worksFor") or []
    if isinstance(works_for_ld, dict):
        works_for_ld = [works_for_ld]
    total_experiencias_perfil = max(len(experiencias), len(works_for_ld))

    if not experiencias and works_for_ld:
        ocultas_count = 0
        for wf in works_for_ld:
            if not isinstance(wf, dict):
                continue
            org_name = str(wf.get("name") or "").strip()
            org_loc = str(wf.get("location") or "").strip()
            member = wf.get("member") if isinstance(wf.get("member"), dict) else {}
            role_desc = str(member.get("description") or "").strip()
            s_date = _formatar_data_iso(str(member.get("startDate") or ""))
            e_date = _formatar_data_iso(str(member.get("endDate") or ""))
            periodo_wf = f"{s_date} - {e_date or 'Atual'}".strip(" -") if s_date else ""

            if org_name and not _is_masked(org_name):
                experiencias.append(
                    {
                        "cargo": (
                            _limpar_asteriscos(role_desc)
                            if (role_desc and not _is_masked(role_desc))
                            else "Experiência vinculada no perfil"
                        ),
                        "empresa": org_name,
                        "periodo": periodo_wf,
                        "localizacao": org_loc,
                        "descricao": "",
                        "oculto_visitante": _is_masked(role_desc),
                    }
                )
            else:
                ocultas_count += 1

        if ocultas_count > 0:
            experiencias.append(
                {
                    "cargo": f"+ {ocultas_count} experiência(s) registrada(s) no perfil",
                    "empresa": "Detalhes de cargo protegidos pelo modo visitante do LinkedIn",
                    "periodo": "",
                    "localizacao": localizacao,
                    "descricao": "O LinkedIn contabiliza estas experiências no seu perfil, mas oculta os títulos secundários para visitantes deslogados.",
                    "oculto_visitante": True,
                }
            )

    # 8. Formação Acadêmica
    formacao: list[dict] = []
    edu_sec = soup.select_one(
        "section[data-section='educationsDetails'], section[data-section='education']"
    )
    if edu_sec:
        for li in edu_sec.select("li.profile-section-card, li.education__list-item"):
            h3 = li.select_one("h3")
            h4 = li.select_one("h4")
            d_el = li.select_one(".date-range")
            inst_txt = h3.get_text(" ", strip=True) if h3 else ""
            curso_txt = h4.get_text(" ", strip=True) if h4 else ""
            if _is_masked(inst_txt) and _is_masked(curso_txt):
                continue
            formacao.append(
                {
                    "instituicao": _limpar_asteriscos(inst_txt),
                    "curso": "" if curso_txt == "-" else _limpar_asteriscos(curso_txt),
                    "periodo": _limpar_texto_secao(d_el.get_text(" ", strip=True)) if d_el else "",
                    "nota_ou_detalhe": _extrair_texto_card_descricao(li)[:220],
                    "oculto_visitante": _is_masked(inst_txt) or _is_masked(curso_txt),
                }
            )

    # Extrai notas explícitas (ex: 92.8/100) da seção combinada experience-education se houver
    notas_por_ano: dict[str, str] = {}
    ee_sec = soup.select_one("section.experience-education")
    if ee_sec:
        for li in ee_sec.select("li.profile-section-card"):
            h4 = li.select_one("h4")
            meta_div = li.select_one("div.text-color-text-low-emphasis")
            h4_limpo = _limpar_asteriscos(h4.get_text(" ", strip=True)) if h4 else ""
            per_txt = meta_div.get_text(" ", strip=True) if meta_div else ""
            if h4_limpo and per_txt:
                m_ano = re.search(r"\b(20\d{2})\b", per_txt)
                if m_ano:
                    notas_por_ano[m_ano.group(1)] = h4_limpo

    alumni_ld = [
        a
        for a in (person_ld.get("alumniOf") or [])
        if isinstance(a, dict) and a.get("@type") == "EducationalOrganization"
    ]
    total_formacoes_perfil = max(len(formacao), len(alumni_ld))

    if not formacao and alumni_ld:
        for ed in alumni_ld:
            inst_name = str(ed.get("name") or "").strip()
            member = ed.get("member") if isinstance(ed.get("member"), dict) else {}
            s_raw = str(member.get("startDate") or "")
            e_raw = str(member.get("endDate") or "")
            ano_ini = s_raw[:4] if len(s_raw) >= 4 else ""
            ano_fim = e_raw[:4] if len(e_raw) >= 4 else ""
            periodo_ed = f"{ano_ini} - {ano_fim}".strip(" -") if (ano_ini or ano_fim) else ""
            detalhe_extra = notas_por_ano.get(ano_ini, "")
            nota_fmt = f"Rendimento/Nota no perfil: {detalhe_extra}" if detalhe_extra else ""

            if inst_name and not _is_masked(inst_name):
                formacao.append(
                    {
                        "instituicao": inst_name,
                        "curso": "Formação Acadêmica / Graduação",
                        "periodo": periodo_ed,
                        "nota_ou_detalhe": nota_fmt,
                        "oculto_visitante": False,
                    }
                )
            else:
                formacao.append(
                    {
                        "instituicao": "Instituição de Ensino (registrada no perfil)",
                        "curso": "Detalhes protegidos no modo visitante do LinkedIn",
                        "periodo": periodo_ed,
                        "nota_ou_detalhe": nota_fmt,
                        "oculto_visitante": True,
                    }
                )

    # 9. Projetos (section[data-section='projects'])
    projetos: list[dict] = []
    proj_sec = soup.select_one("section[data-section='projects'], section.projects")
    if proj_sec:
        for li in proj_sec.select("li.profile-section-card"):
            h3 = li.select_one("h3")
            d_el = li.select_one(".date-range")
            titulo_p = _limpar_asteriscos(h3.get_text(" ", strip=True)) if h3 else ""
            if not titulo_p:
                continue
            periodo_p = ""
            if d_el:
                periodo_p = re.sub(r"\s+", " ", d_el.get_text(" ", strip=True)).strip()
            desc_p = _extrair_texto_card_descricao(li)
            projetos.append(
                {
                    "titulo": titulo_p,
                    "periodo": periodo_p,
                    "descricao": desc_p[:700],
                }
            )

    # 10. Licenças e Certificados (section[data-section='certifications'])
    certificacoes: list[dict] = []
    cert_sec = soup.select_one("section[data-section='certifications'], section.certifications")
    if cert_sec:
        for li in cert_sec.select("li.profile-section-card"):
            h3 = li.select_one("h3")
            h4 = li.select_one("h4")
            meta_div = li.select_one("div.text-color-text-low-emphasis")
            nome_c = _limpar_asteriscos(h3.get_text(" ", strip=True)) if h3 else ""
            if not nome_c:
                continue
            emissor_c = _limpar_asteriscos(h4.get_text(" ", strip=True)) if h4 else ""
            data_c = ""
            if meta_div:
                # Pega apenas a linha de emissão (antes de links de credencial)
                txt_m = re.sub(r"Ver credencial|See credential", "", meta_div.get_text(" ", strip=True), flags=re.I)
                data_c = re.sub(r"\s+", " ", txt_m).strip()
            certificacoes.append(
                {
                    "nome": nome_c,
                    "emissor": "" if emissor_c == "-" else emissor_c,
                    "data": data_c,
                }
            )

    # 11. Cursos Complementares (section[data-section='courses'])
    cursos: list[str] = []
    courses_sec = soup.select_one("section[data-section='courses'], section.courses")
    if courses_sec:
        for li in courses_sec.select("li.profile-section-card"):
            h3 = li.select_one("h3")
            nome_curso = _limpar_asteriscos(h3.get_text(" ", strip=True)) if h3 else ""
            if nome_curso and nome_curso not in cursos:
                cursos.append(nome_curso)

    # 12. Reconhecimentos e Prêmios (section[data-section='honors-and-awards'] + Person.awards)
    premios: list[dict] = []
    awards_sec = soup.select_one(
        "section[data-section='honors-and-awards'], section.honors-and-awards"
    )
    if awards_sec:
        for li in awards_sec.select("li.profile-section-card"):
            h3 = li.select_one("h3")
            h4 = li.select_one("h4")
            d_el = li.select_one(".date-range")
            titulo_aw = _limpar_asteriscos(h3.get_text(" ", strip=True)) if h3 else ""
            if not titulo_aw:
                continue
            emissor_aw = _limpar_asteriscos(h4.get_text(" ", strip=True)) if h4 else ""
            data_aw = re.sub(r"\s+", " ", d_el.get_text(" ", strip=True)).strip() if d_el else ""
            desc_aw = _extrair_texto_card_descricao(li)
            premios.append(
                {
                    "titulo": titulo_aw,
                    "emissor": "" if emissor_aw == "-" else emissor_aw,
                    "data": data_aw,
                    "descricao": desc_aw[:500],
                }
            )

    if not premios and isinstance(person_ld.get("awards"), list):
        for aw_str in person_ld["awards"]:
            limpo_aw = _limpar_asteriscos(str(aw_str))
            if limpo_aw:
                premios.append({"titulo": limpo_aw, "emissor": "", "data": "", "descricao": ""})

    # 13. Idiomas (section[data-section='languages'] + Person.knowsLanguage)
    idiomas: list[dict] = []
    lang_sec = soup.select_one("section[data-section='languages'], section.languages")
    if lang_sec:
        for li in lang_sec.select("li.profile-section-card"):
            h3 = li.select_one("h3")
            h4 = li.select_one("h4")
            nome_id = _limpar_asteriscos(h3.get_text(" ", strip=True)) if h3 else ""
            nivel_id = _limpar_asteriscos(h4.get_text(" ", strip=True)) if h4 else ""
            if nome_id:
                idiomas.append({"idioma": nome_id, "nivel": "" if nivel_id == "-" else nivel_id})

    if not idiomas and isinstance(person_ld.get("knowsLanguage"), list):
        for kl in person_ld["knowsLanguage"]:
            nome_kl = kl.get("name") if isinstance(kl, dict) else str(kl)
            if nome_kl:
                idiomas.append({"idioma": str(nome_kl).strip(), "nivel": ""})

    # 14. Publicações Autorais Recentes no LinkedIn (JSON-LD DiscussionForumPosting)
    publicacoes: list[dict] = []
    slug_low = slug.lower()
    for post in posts_ld:
        autor = post.get("author") if isinstance(post.get("author"), dict) else {}
        autor_url = str(autor.get("url") or "").lower()
        # Mantém apenas publicações escritas pelo próprio dono do perfil
        if slug_low not in autor_url and autor.get("name", "").lower() != nome_completo.lower():
            continue
        texto_p = str(post.get("text") or post.get("articleBody") or post.get("headline") or "").strip()
        if not texto_p:
            continue
        inter_p = post.get("interactionStatistic")
        curtidas_p = 0
        if isinstance(inter_p, dict):
            curtidas_p = int(inter_p.get("userInteractionCount") or 0)
        elif isinstance(inter_p, list) and inter_p:
            curtidas_p = int(inter_p[0].get("userInteractionCount") or 0)

        publicacoes.append(
            {
                "texto": texto_p[:550],
                "data": _formatar_data_iso(str(post.get("datePublished") or "")),
                "curtidas": curtidas_p,
                "url": str(post.get("url") or ""),
            }
        )

    return {
        "nome_completo": nome_completo or slug.replace("-", " ").title(),
        "headline": headline,
        "instituicao_atual": instituicao_atual,
        "foto_url": foto_url,
        "banner_url": banner_url,
        "localizacao": localizacao,
        "conexoes_ou_seguidores": conexoes_ou_seguidores,
        "resumo": resumo,
        "sites": sites,
        "experiencias": experiencias[:8],
        "total_experiencias_perfil": total_experiencias_perfil,
        "formacao": formacao[:6],
        "total_formacoes_perfil": total_formacoes_perfil,
        "projetos": projetos[:8],
        "certificacoes": certificacoes[:10],
        "cursos": cursos[:20],
        "premios": premios[:10],
        "idiomas": idiomas[:6],
        "publicacoes": publicacoes[:6],
        "skills_explicitas": [],
    }


def _avaliar_perfil(dados: dict, areas_usuario: str = "") -> tuple[int, str, list[dict], list[str], list[str]]:
    """
    Calcula o Índice de Força do Perfil (0-100 pts) dividido em 6 pilares transparentes,
    avaliando todas as seções reais do LinkedIn sem penalizar injustamente o aluno.
    """
    fortes: list[str] = []
    sugestoes: list[str] = []
    pilares: list[dict] = []

    foto = bool(dados.get("foto_url"))
    banner = bool(dados.get("banner_url"))
    localizacao = (dados.get("localizacao") or "").strip()
    rede = (dados.get("conexoes_ou_seguidores") or "").strip()
    sites = dados.get("sites") or []
    headline = (dados.get("headline") or "").strip()
    resumo = (dados.get("resumo") or "").strip()
    experiencias = dados.get("experiencias") or []
    total_exp = max(len(experiencias), int(dados.get("total_experiencias_perfil") or 0))
    formacao = dados.get("formacao") or []
    total_edu = max(len(formacao), int(dados.get("total_formacoes_perfil") or 0))
    projetos = dados.get("projetos") or []
    certificacoes = dados.get("certificacoes") or []
    cursos = dados.get("cursos") or []
    premios = dados.get("premios") or []
    idiomas = dados.get("idiomas") or []
    publicacoes = dados.get("publicacoes") or []
    skills = dados.get("skills") or []

    # PILAR 1: Identidade, Topo & Networking (máx 20 pts)
    p1 = 0
    det1: list[str] = []
    if foto:
        p1 += 5
        det1.append("foto profissional")
    else:
        sugestoes.append("Adicione uma foto profissional visível publicamente no LinkedIn.")

    if banner:
        p1 += 3
        det1.append("capa personalizada")
    else:
        sugestoes.append("Adicione uma imagem de capa (banner) temática da sua área no topo do LinkedIn.")

    if localizacao:
        p1 += 3
        det1.append("localidade")

    if sites:
        p1 += 4
        rotulos = ", ".join(s.get("rotulo", "Link") for s in sites[:3])
        det1.append(f"links ({rotulos})")
        fortes.append(f"Links externos integrados ao topo do perfil ({rotulos}).")
    else:
        sugestoes.append("Adicione o link do seu GitHub ou Portfólio no campo 'Sites' do cabeçalho do LinkedIn.")

    if rede:
        if any(k in rede.lower() for k in ["500", "mil", "1.", "2.", "3.", "4.", "5."]):
            p1 += 5
            fortes.append(f"Rede de contatos expressiva e ativa ({rede}).")
        else:
            p1 += 3
        det1.append(rede)

    pilares.append(
        {
            "nome": "Identidade, Links & Rede",
            "pontos": min(20, p1),
            "maximo": 20,
            "detalhe": ", ".join(det1).capitalize() if det1 else "Cabeçalho básico",
        }
    )

    # PILAR 2: Posicionamento & Seção Sobre (máx 15 pts)
    p2 = 0
    if len(headline) >= 12:
        p2 += 8
        fortes.append("Posicionamento profissional claro logo na abertura do perfil.")
    else:
        sugestoes.append("Defina um título profissional (Headline) destacando sua área de atuação e curso.")

    if len(resumo) >= 40:
        p2 += 7
        fortes.append("Seção 'Sobre' preenchida com apresentação direta de carreira e formação.")
    elif len(resumo) > 0:
        p2 += 5
    else:
        sugestoes.append("Preencha a seção 'Sobre' resumindo sua atuação, stack principal e objetivos.")

    pilares.append(
        {
            "nome": "Headline & Seção Sobre",
            "pontos": min(15, p2),
            "maximo": 15,
            "detalhe": "Apresentação e resumo extraídos do perfil" if p2 >= 12 else "Resumo parcial ou ausente",
        }
    )

    # PILAR 3: Experiências & Formação Acadêmica (máx 20 pts)
    p3 = 0
    if total_exp >= 2:
        p3 += 10
        fortes.append(f"{total_exp} experiências profissionais/acadêmicas registradas no perfil.")
    elif total_exp == 1:
        p3 += 8
        fortes.append("Experiência prática registrada e vinculada ao perfil.")
    else:
        sugestoes.append("Cadastre monitorias, iniciação científica, empresa júnior ou estágios em Experiências.")

    if total_edu >= 1:
        p3 += 8
        tem_inatel_ou_nota = any(
            "inatel" in (f.get("instituicao", "") + " " + f.get("nota_ou_detalhe", "")).lower()
            or f.get("nota_ou_detalhe")
            for f in formacao
        )
        if tem_inatel_ou_nota or total_edu >= 2:
            p3 += 2
        fortes.append(f"Formação acadêmica sólida ({total_edu} registro(s) no histórico educacional).")
    else:
        sugestoes.append("Inclua sua graduação no Inatel na seção Formação Acadêmica.")

    algum_oculto = any(e.get("oculto_visitante") for e in experiencias)
    if algum_oculto:
        p3 = max(0, p3 - 2)
        sugestoes.append(
            "Visibilidade pública (-2 pts): o LinkedIn oculta subtítulos de alguns cargos para visitantes deslogados. Em 'Editar perfil público' no LinkedIn, ative 'Detalhes de experiência' para exibir todos os cargos abertamente."
        )

    pilares.append(
        {
            "nome": "Experiências & Formação",
            "pontos": min(20, p3),
            "maximo": 20,
            "detalhe": f"{total_exp} experiência(s) e {total_edu} formação(ões)",
        }
    )

    # PILAR 4: Projetos Práticos & P&D (máx 15 pts)
    p4 = 0
    if len(projetos) >= 2:
        p4 = 15
        nomes_proj = ", ".join(p["titulo"].split(" - ")[0] for p in projetos[:3])
        fortes.append(f"Portfólio de projetos técnicos robusto ({len(projetos)} projetos: {nomes_proj}).")
    elif len(projetos) == 1:
        p4 = 11
        fortes.append(f"Projeto prático documentado no perfil ({projetos[0]['titulo']}).")
    elif any("iniciação" in c.get("nome", "").lower() or "xgmobile" in c.get("nome", "").lower() for c in certificacoes):
        p4 = 8
        sugestoes.append("Adicione seus projetos práticos (como FETIN ou TCC) na seção dedicada de 'Projetos' do LinkedIn.")
    else:
        sugestoes.append("Cadastre projetos da FETIN, hackathons ou repositórios relevantes na seção 'Projetos'.")

    pilares.append(
        {
            "nome": "Projetos & Inovação",
            "pontos": p4,
            "maximo": 15,
            "detalhe": f"{len(projetos)} projeto(s) detalhado(s)" if projetos else "Nenhum projeto na seção dedicada",
        }
    )

    # PILAR 5: Certificações, Cursos & Idiomas (máx 15 pts)
    p5 = 0
    if len(certificacoes) >= 2:
        p5 += 6
    elif len(certificacoes) == 1:
        p5 += 4
    else:
        sugestoes.append("Adicione certificações técnicas ou trilhas concluídas em 'Licenças e certificados'.")

    if len(cursos) >= 4:
        p5 += 5
    elif len(cursos) >= 1:
        p5 += 3

    if len(idiomas) >= 2:
        p5 += 4
    elif len(idiomas) == 1:
        p5 += 2
    else:
        sugestoes.append("Informe seus idiomas e nível de proficiência na seção 'Idiomas'.")

    if certificacoes or cursos:
        fortes.append(
            f"Educação continuada em destaque ({len(certificacoes)} certificado(s), {len(cursos)} curso(s) e {len(idiomas)} idioma(s))."
        )

    pilares.append(
        {
            "nome": "Certificados, Cursos & Idiomas",
            "pontos": min(15, p5),
            "maximo": 15,
            "detalhe": f"{len(certificacoes)} cert., {len(cursos)} curso(s), {len(idiomas)} idioma(s)",
        }
    )

    # PILAR 6: Premiações, Publicações & Competências (máx 15 pts)
    p6 = 0
    if len(premios) >= 2:
        p6 += 5
        fortes.append(f"{len(premios)} reconhecimentos e prêmios de mérito acadêmico/tecnológico.")
    elif len(premios) == 1:
        p6 += 3
        fortes.append(f"Reconhecimento registrado ({premios[0]['titulo']}).")

    if len(publicacoes) >= 2:
        p6 += 5
        total_likes = sum(int(pub.get("curtidas") or 0) for pub in publicacoes)
        fortes.append(
            f"Presença ativa no feed com {len(publicacoes)} publicações próprias recentes ({total_likes} reações acumuladas)."
        )
    elif len(publicacoes) == 1:
        p6 += 3
    else:
        sugestoes.append("Compartilhe aprendizados de eventos, projetos e conquistas em publicações no LinkedIn.")

    if len(skills) >= 5:
        p6 += 5
        fortes.append(f"{len(skills)} competências técnicas extraídas diretamente das seções do perfil.")
    elif len(skills) >= 2:
        p6 += 3
    else:
        sugestoes.append("Cite tecnologias, linguagens e ferramentas nas descrições dos seus projetos e resumo.")

    pilares.append(
        {
            "nome": "Prêmios, Posts & Skills",
            "pontos": min(15, p6),
            "maximo": 15,
            "detalhe": f"{len(premios)} prêmio(s), {len(publicacoes)} post(s), {len(skills)} skill(s)",
        }
    )

    if areas_usuario:
        termos_area = [a.strip().lower() for a in areas_usuario.split(",") if a.strip()]
        texto_total = f"{headline} {resumo} {' '.join(skills)}".lower()
        alinhadas = [a for a in termos_area if a in texto_total]
        if alinhadas:
            fortes.append(f"Alta aderência às suas áreas no portal: {', '.join(alinhadas[:4])}.")

    pontuacao_total = min(100, sum(item["pontos"] for item in pilares))
    if pontuacao_total >= 85:
        nivel = "Perfil Campeão (All-Star)"
    elif pontuacao_total >= 70:
        nivel = "Perfil Muito Forte"
    elif pontuacao_total >= 50:
        nivel = "Perfil em Evolução"
    else:
        nivel = "Perfil Inicial"

    return pontuacao_total, nivel, pilares, fortes, sugestoes


async def _coletar_via_scrapingdog(slug: str, api_key: str) -> dict | None:
    """Coleta perfil via Scrapingdog LinkedIn Profile API (plano gratuito sem cartão)."""
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.get(
                "https://api.scrapingdog.com/linkedin",
                params={"api_key": api_key, "type": "profile", "linkId": slug},
            )
            if resp.status_code == 200:
                payload = resp.json()
                raw = payload[0] if isinstance(payload, list) and payload else payload
                if isinstance(raw, dict) and (raw.get("fullName") or raw.get("first_name") or raw.get("headline")):
                    exps = [
                        {
                            "cargo": str(e.get("position") or e.get("title") or ""),
                            "empresa": str(e.get("company_name") or e.get("company") or ""),
                            "periodo": str(e.get("duration") or f"{e.get('starts_at', '')} - {e.get('ends_at', '')}").strip(" -"),
                            "localizacao": str(e.get("location") or ""),
                            "descricao": str(e.get("summary") or e.get("description") or "")[:400],
                            "oculto_visitante": False,
                        }
                        for e in (raw.get("experience") or [])
                        if isinstance(e, dict)
                    ]
                    edus = [
                        {
                            "instituicao": str(ed.get("college_name") or ed.get("school") or ""),
                            "curso": str(ed.get("college_degree") or ed.get("degree") or ""),
                            "periodo": str(ed.get("college_duration") or ""),
                            "nota_ou_detalhe": str(ed.get("college_activity") or "")[:200],
                            "oculto_visitante": False,
                        }
                        for ed in (raw.get("education") or [])
                        if isinstance(ed, dict)
                    ]
                    projs = [
                        {
                            "titulo": str(p.get("title") or ""),
                            "periodo": str(p.get("duration") or ""),
                            "descricao": str(p.get("description") or "")[:600],
                        }
                        for p in (raw.get("projects") or [])
                        if isinstance(p, dict) and p.get("title")
                    ]
                    certs = [
                        {
                            "nome": str(c.get("certification") or c.get("name") or ""),
                            "emissor": str(c.get("company_name") or c.get("authority") or ""),
                            "data": str(c.get("issue_date") or ""),
                        }
                        for c in (raw.get("certification") or raw.get("certifications") or [])
                        if isinstance(c, dict)
                    ]
                    cursos_sd = [
                        str(c.get("name") if isinstance(c, dict) else c)
                        for c in (raw.get("courses") or [])
                        if c
                    ]
                    premios_sd = [
                        {
                            "titulo": str(a.get("title") or a.get("name") or ""),
                            "emissor": str(a.get("organization") or ""),
                            "data": str(a.get("date") or ""),
                            "descricao": str(a.get("summary") or "")[:400],
                        }
                        for a in (raw.get("awards") or [])
                        if isinstance(a, dict)
                    ]
                    idiomas_sd = [
                        {
                            "idioma": str(l.get("name") if isinstance(l, dict) else l),
                            "nivel": str(l.get("level") or "") if isinstance(l, dict) else "",
                        }
                        for l in (raw.get("languages") or [])
                        if l
                    ]
                    return {
                        "fonte_coleta": "scrapingdog-api",
                        "nome_completo": str(raw.get("fullName") or f"{raw.get('first_name', '')} {raw.get('last_name', '')}").strip(),
                        "headline": str(raw.get("headline") or ""),
                        "instituicao_atual": exps[0]["empresa"] if exps else "",
                        "foto_url": str(raw.get("profile_photo") or ""),
                        "banner_url": str(raw.get("background_cover_image_url") or ""),
                        "localizacao": str(raw.get("location") or ""),
                        "conexoes_ou_seguidores": f"{raw.get('followers') or ''} • {raw.get('connections') or ''}".strip(" •"),
                        "resumo": str(raw.get("about") or raw.get("summary") or ""),
                        "sites": [],
                        "experiencias": exps,
                        "total_experiencias_perfil": len(exps),
                        "formacao": edus,
                        "total_formacoes_perfil": len(edus),
                        "projetos": projs,
                        "certificacoes": certs,
                        "cursos": cursos_sd,
                        "premios": premios_sd,
                        "idiomas": idiomas_sd,
                        "publicacoes": [],
                        "skills_explicitas": [str(s) for s in (raw.get("skills") or []) if s],
                        "dados_brutos": raw,
                    }
    except Exception:
        return None
    return None


async def _coletar_via_apify(linkedin_url: str, apify_token: str) -> dict | None:
    """Coleta perfil completo via Apify Actor Cookie-less."""
    actors = [
        ("dev_fusion~linkedin-profile-scraper", {"profileUrls": [linkedin_url]}),
        ("johnvc~linkedin-profile-api", {"profileUrls": [linkedin_url]}),
    ]
    async with httpx.AsyncClient(timeout=45.0) as client:
        for actor_id, payload in actors:
            try:
                resp = await client.post(
                    f"https://api.apify.com/v2/actors/{actor_id}/run-sync-get-dataset-items",
                    params={"token": apify_token},
                    json=payload,
                )
                if resp.status_code in (200, 201):
                    items = resp.json()
                    if isinstance(items, list) and len(items) > 0 and isinstance(items[0], dict):
                        raw = items[0]
                        exps = [
                            {
                                "cargo": str(e.get("title") or e.get("position") or ""),
                                "empresa": str(e.get("companyName") or e.get("company") or ""),
                                "periodo": f"{e.get('startDate', '')} - {e.get('endDate', 'Atual')}".strip(" -"),
                                "localizacao": str(e.get("location") or ""),
                                "descricao": str(e.get("description") or "")[:400],
                                "oculto_visitante": False,
                            }
                            for e in (raw.get("experiences") or raw.get("experience") or [])
                            if isinstance(e, dict)
                        ]
                        edus = [
                            {
                                "instituicao": str(ed.get("schoolName") or ed.get("school") or ""),
                                "curso": str(ed.get("degreeName") or ed.get("degree") or ed.get("fieldOfStudy") or ""),
                                "periodo": f"{ed.get('startDate', '')} - {ed.get('endDate', '')}".strip(" -"),
                                "nota_ou_detalhe": str(ed.get("grade") or ""),
                                "oculto_visitante": False,
                            }
                            for ed in (raw.get("educations") or raw.get("education") or [])
                            if isinstance(ed, dict)
                        ]
                        raw_skills = [
                            (s.get("name") or s.get("title") if isinstance(s, dict) else str(s))
                            for s in (raw.get("skills") or [])
                        ]
                        return {
                            "fonte_coleta": f"apify ({actor_id.split('~')[0]})",
                            "nome_completo": str(
                                raw.get("fullName")
                                or f"{raw.get('firstName', '')} {raw.get('lastName', '')}".strip()
                            ),
                            "headline": str(raw.get("headline") or ""),
                            "instituicao_atual": exps[0]["empresa"] if exps else "",
                            "foto_url": str(raw.get("profilePic") or raw.get("photoUrl") or ""),
                            "banner_url": str(raw.get("backgroundPic") or ""),
                            "localizacao": str(raw.get("location") or raw.get("addressWithCountry") or ""),
                            "conexoes_ou_seguidores": f"{raw.get('connections') or raw.get('followerCount') or ''} conexões/seguidores".strip(),
                            "resumo": str(raw.get("about") or raw.get("summary") or ""),
                            "sites": [],
                            "experiencias": exps[:8],
                            "total_experiencias_perfil": len(exps),
                            "formacao": edus[:6],
                            "total_formacoes_perfil": len(edus),
                            "projetos": [],
                            "certificacoes": [],
                            "cursos": [],
                            "premios": [],
                            "idiomas": [],
                            "publicacoes": [],
                            "skills_explicitas": [s for s in raw_skills if s],
                            "dados_brutos": raw,
                        }
            except Exception:
                continue
    return None


async def _coletar_via_rapidapi(linkedin_url: str, rapidapi_key: str) -> dict | None:
    """Coleta perfil via RapidAPI (Fresh LinkedIn Profile Data)."""
    try:
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.get(
                "https://fresh-linkedin-profile-data.p.rapidapi.com/enrich-lead",
                params={
                    "linkedin_url": linkedin_url,
                    "include_skills": "true",
                    "include_certifications": "true",
                },
                headers={
                    "x-rapidapi-key": rapidapi_key,
                    "x-rapidapi-host": "fresh-linkedin-profile-data.p.rapidapi.com",
                },
            )
            if resp.status_code == 200:
                body = resp.json()
                raw = body.get("data") if isinstance(body, dict) and isinstance(body.get("data"), dict) else body
                if isinstance(raw, dict) and (raw.get("full_name") or raw.get("headline") or raw.get("first_name")):
                    exps = [
                        {
                            "cargo": str(e.get("title") or ""),
                            "empresa": str(e.get("company") or ""),
                            "periodo": str(e.get("date_range") or ""),
                            "localizacao": str(e.get("location") or ""),
                            "descricao": str(e.get("description") or "")[:400],
                            "oculto_visitante": False,
                        }
                        for e in (raw.get("experiences") or [])
                        if isinstance(e, dict)
                    ]
                    edus = [
                        {
                            "instituicao": str(ed.get("school") or ""),
                            "curso": str(ed.get("degree") or ed.get("field_of_study") or ""),
                            "periodo": str(ed.get("date_range") or ""),
                            "nota_ou_detalhe": str(ed.get("grade") or ""),
                            "oculto_visitante": False,
                        }
                        for ed in (raw.get("educations") or [])
                        if isinstance(ed, dict)
                    ]
                    skills_raw = raw.get("skills") or []
                    if isinstance(skills_raw, str):
                        skills_list = [s.strip() for s in skills_raw.split("|") if s.strip()]
                    elif isinstance(skills_raw, list):
                        skills_list = [str(s) for s in skills_raw if s]
                    else:
                        skills_list = []

                    return {
                        "fonte_coleta": "rapidapi (fresh-linkedin-profile-data)",
                        "nome_completo": str(
                            raw.get("full_name")
                            or f"{raw.get('first_name', '')} {raw.get('last_name', '')}".strip()
                        ),
                        "headline": str(raw.get("headline") or ""),
                        "instituicao_atual": exps[0]["empresa"] if exps else "",
                        "foto_url": str(raw.get("profile_image_url") or ""),
                        "banner_url": "",
                        "localizacao": str(raw.get("location") or raw.get("city") or ""),
                        "conexoes_ou_seguidores": f"{raw.get('follower_count') or raw.get('connection_count') or ''} seguidores/conexões".strip(),
                        "resumo": str(raw.get("about") or raw.get("summary") or ""),
                        "sites": [],
                        "experiencias": exps[:8],
                        "total_experiencias_perfil": len(exps),
                        "formacao": edus[:6],
                        "total_formacoes_perfil": len(edus),
                        "projetos": [],
                        "certificacoes": [],
                        "cursos": [],
                        "premios": [],
                        "idiomas": [],
                        "publicacoes": [],
                        "skills_explicitas": skills_list,
                        "dados_brutos": raw,
                    }
    except Exception:
        return None
    return None


def _coletar_direto_perfil_gratuito_sync(linkedin_url: str, slug: str) -> dict:
    """
    Coleta 100% gratuita e sem chave diretamente do HTML público + Schema.org JSON-LD do LinkedIn:
      1. Via API gratuita Jina Reader (r.jina.ai em modo X-Return-Format: html + Social Preview UA)
         que contorna bloqueios de IP residencial/datacenter e devolve o DOM integral do perfil.
      2. Fallback direto ao endpoint público br.linkedin.com/in/{slug} com Social Preview UA.
    """
    alvos = [
        f"https://br.linkedin.com/in/{slug}",
        f"https://www.linkedin.com/in/{slug}",
    ]
    erros: list[str] = []

    # 1. Tenta via API gratuita de terceiros Jina Reader (HTML completo + JSON-LD)
    for alvo in alvos:
        try:
            r_jina = creq.get(
                f"https://r.jina.ai/{alvo}",
                headers={
                    "X-Return-Format": "html",
                    "X-User-Agent": "WhatsApp/2.23.20.0",
                    "X-Locale": "pt-BR",
                },
                impersonate="chrome124",
                timeout=24,
            )
            if r_jina.status_code == 200 and len(r_jina.text) > 5000:
                extraido = _parse_linkedin_profile_html(r_jina.text, slug)
                if extraido:
                    return {
                        "fonte_coleta": "Jina Reader API + LinkedIn Schema.org DOM (gratuita)",
                        **extraido,
                        "dados_brutos": {
                            "url_consultada": alvo,
                            "html_bytes": len(r_jina.text),
                            "metodo": "jina-html-jsonld",
                        },
                    }
        except Exception as exc:
            erros.append(f"jina({alvo}): {exc}")

    # 2. Fallback direto via Social Graph Preview User-Agent
    with httpx.Client(follow_redirects=True, timeout=16.0) as client:
        for ua in ("WhatsApp/2.23.20.0", "facebookexternalhit/1.1", "Slackbot-LinkExpanding 1.0"):
            for alvo in alvos:
                try:
                    r_dir = client.get(
                        alvo,
                        headers={
                            "User-Agent": ua,
                            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8",
                        },
                    )
                    if r_dir.status_code == 200 and len(r_dir.text) > 5000:
                        extraido = _parse_linkedin_profile_html(r_dir.text, slug)
                        if extraido:
                            return {
                                "fonte_coleta": "LinkedIn Public Graph + JSON-LD (gratuita)",
                                **extraido,
                                "dados_brutos": {
                                    "url_consultada": alvo,
                                    "html_bytes": len(r_dir.text),
                                    "metodo": f"direct-graph ({ua.split('/')[0]})",
                                },
                            }
                except Exception as exc:
                    erros.append(f"direct({ua}): {exc}")

    raise ValueError(
        "Não foi possível acessar os dados públicos deste perfil no LinkedIn no momento "
        "(verifique se o link /in/ está correto e se a visibilidade pública do perfil está ativa)."
    )


async def coletar_e_analisar_perfil_linkedin(
    linkedin_url: str,
    areas_usuario: str = "",
    curso_usuario: str = "",
    apify_token: str = "",
    rapidapi_key: str = "",
    scrapingdog_key: str = "",
) -> dict:
    """
    Executa o pipeline completo de coleta e análise profunda do perfil LinkedIn:
      1. Scrapingdog / Apify / RapidAPI (caso o usuário configure chave opcional)
      2. Jina Reader API (HTML + Schema.org Person JSON-LD + Seções DOM do LinkedIn) — 100% gratuito
    """
    url_limpa, slug = normalize_linkedin_url(linkedin_url)

    chave_sd = (scrapingdog_key or os.getenv("SCRAPINGDOG_API_KEY") or "").strip()
    token_apify = (apify_token or os.getenv("APIFY_API_TOKEN") or "").strip()
    chave_rapid = (rapidapi_key or os.getenv("RAPIDAPI_KEY") or "").strip()

    resultado = None
    if chave_sd:
        resultado = await _coletar_via_scrapingdog(slug, chave_sd)

    if resultado is None and token_apify:
        resultado = await _coletar_via_apify(url_limpa, token_apify)

    if resultado is None and chave_rapid:
        resultado = await _coletar_via_rapidapi(url_limpa, chave_rapid)

    if resultado is None:
        resultado = await asyncio.to_thread(_coletar_direto_perfil_gratuito_sync, url_limpa, slug)

    # Consolida TODAS as seções reais extraídas do perfil para detectar competências com alta precisão
    bloco_texto = " \n ".join(
        [
            resultado.get("headline") or "",
            resultado.get("resumo") or "",
            " ".join(
                f"{e.get('cargo', '')} {e.get('empresa', '')} {e.get('descricao', '')}"
                for e in (resultado.get("experiencias") or [])
                if not e.get("oculto_visitante")
            ),
            " ".join(
                f"{ed.get('instituicao', '')} {ed.get('curso', '')} {ed.get('nota_ou_detalhe', '')}"
                for ed in (resultado.get("formacao") or [])
            ),
            " ".join(
                f"{p.get('titulo', '')} {p.get('descricao', '')}"
                for p in (resultado.get("projetos") or [])
            ),
            " ".join(
                f"{c.get('nome', '')} {c.get('emissor', '')}"
                for c in (resultado.get("certificacoes") or [])
            ),
            " ".join(resultado.get("cursos") or []),
            " ".join(
                f"{pr.get('titulo', '')} {pr.get('descricao', '')}"
                for pr in (resultado.get("premios") or [])
            ),
            " ".join(
                f"{id_item.get('idioma', '')} {id_item.get('nivel', '')}"
                for id_item in (resultado.get("idiomas") or [])
            ),
            " ".join(pub.get("texto", "") for pub in (resultado.get("publicacoes") or [])),
        ]
    )
    skills = extrair_skills_de_texto(bloco_texto, extras=resultado.get("skills_explicitas"))
    resultado["skills"] = skills

    pontuacao, nivel_perfil, pilares, fortes, sugestoes = _avaliar_perfil(
        resultado, areas_usuario=areas_usuario
    )

    secoes_extras = {
        "instituicao_atual": resultado.get("instituicao_atual") or "",
        "foto_url": resultado.get("foto_url") or "",
        "banner_url": resultado.get("banner_url") or "",
        "sites": resultado.get("sites") or [],
        "total_experiencias_perfil": int(resultado.get("total_experiencias_perfil") or len(resultado.get("experiencias") or [])),
        "total_formacoes_perfil": int(resultado.get("total_formacoes_perfil") or len(resultado.get("formacao") or [])),
        "projetos": resultado.get("projetos") or [],
        "certificacoes": resultado.get("certificacoes") or [],
        "cursos": resultado.get("cursos") or [],
        "premios": resultado.get("premios") or [],
        "idiomas": resultado.get("idiomas") or [],
        "publicacoes": resultado.get("publicacoes") or [],
        "nivel_perfil": nivel_perfil,
        "pilares_nota": pilares,
    }

    return {
        "linkedin_url": url_limpa,
        "slug": slug,
        "fonte_coleta": resultado["fonte_coleta"],
        "nome_completo": resultado.get("nome_completo") or slug.replace("-", " ").title(),
        "headline": resultado.get("headline") or "",
        "localizacao": resultado.get("localizacao") or "",
        "conexoes_ou_seguidores": resultado.get("conexoes_ou_seguidores") or "",
        "resumo": resultado.get("resumo") or "",
        "experiencias": resultado.get("experiencias") or [],
        "formacao": resultado.get("formacao") or [],
        "skills": skills,
        "pontuacao_perfil": pontuacao,
        "pontos_fortes": fortes,
        "sugestoes_melhoria": sugestoes,
        **secoes_extras,
        "dados_brutos": {
            **resultado.get("dados_brutos", {}),
            "secoes_extras": secoes_extras,
            "curso_portal": curso_usuario,
            "areas_interesse_portal": areas_usuario,
        },
    }


def _clean_val(v) -> str:
    if v is None:
        return ""
    if isinstance(v, float) and math.isnan(v):
        return ""
    s = str(v).strip()
    return "" if s.lower() in {"nan", "none", "nat"} else s


def _calcular_compatibilidade_vaga(
    texto_vaga: str,
    skills_perfil: list[str],
    areas_interesse: str,
    curso: str,
) -> tuple[int, list[str]]:
    skills_vaga = extrair_skills_de_texto(texto_vaga)
    referencia_usuario = list(skills_perfil)
    for area in (areas_interesse or "").split(","):
        a = area.strip()
        if a and a not in referencia_usuario:
            referencia_usuario.append(a)

    matched: list[str] = []
    texto_low = texto_vaga.lower()

    for sk in referencia_usuario:
        if sk.lower() in texto_low or sk in skills_vaga:
            if sk not in matched:
                matched.append(sk)

    for sv in skills_vaga:
        if any(sv.lower() == r.lower() for r in referencia_usuario) and sv not in matched:
            matched.append(sv)

    base_score = 62
    if matched:
        base_score += min(34, len(matched) * 9)
    if curso and any(
        p in texto_low
        for p in ["software", "computação", "engenharia", "developer", "desenvolvedor", "estágio", "intern"]
    ):
        base_score += 4

    return min(98, base_score), (matched[:6] if matched else skills_vaga[:4])


def _scrape_linkedin_jobs_sync(
    termo_busca: str,
    localizacao: str,
    apenas_remoto: bool,
    limite: int,
    skills_perfil: list[str],
    areas_interesse: str,
    curso: str,
) -> list[dict]:
    df = scrape_jobs(
        site_name=["linkedin"],
        search_term=termo_busca,
        location=localizacao or "Brazil",
        results_wanted=limite,
        is_remote=apenas_remoto,
        linkedin_fetch_description=False,
        verbose=0,
    )

    if df is None or len(df) == 0:
        return []

    vagas_formatadas: list[dict] = []
    for _, row in df.iterrows():
        titulo = _clean_val(row.get("title"))
        empresa = _clean_val(row.get("company"))
        job_url = _clean_val(row.get("job_url"))
        if not titulo or not job_url:
            continue

        loc = _clean_val(row.get("location")) or localizacao or "Brasil"
        remoto_flag = bool(row.get("is_remote")) if row.get("is_remote") is not None else False
        modalidade = (
            "Remoto"
            if (remoto_flag or "remote" in loc.lower() or "remoto" in titulo.lower())
            else "Presencial / Híbrido"
        )
        nivel = _clean_val(row.get("job_level"))
        desc = _clean_val(row.get("description"))
        logo = _clean_val(row.get("company_logo"))
        data_pub = _clean_val(row.get("date_posted"))
        ext_id = _clean_val(row.get("id"))

        min_amt = _clean_val(row.get("min_amount"))
        max_amt = _clean_val(row.get("max_amount"))
        moeda = _clean_val(row.get("currency")) or "BRL"
        salario = (
            f"{moeda} {min_amt} - {max_amt}" if (min_amt and max_amt) else "A combinar (LinkedIn)"
        )

        texto_analise = f"{titulo} {empresa} {loc} {nivel} {desc} {termo_busca}"
        score, matched_skills = _calcular_compatibilidade_vaga(
            texto_analise,
            skills_perfil=skills_perfil,
            areas_interesse=areas_interesse,
            curso=curso,
        )

        vagas_formatadas.append(
            {
                "external_id": ext_id,
                "titulo": titulo,
                "empresa": empresa or "Empresa Confidencial",
                "localizacao": loc,
                "modalidade": modalidade,
                "nivel": nivel,
                "salario": salario,
                "descricao": desc
                or f"Oportunidade coletada diretamente do LinkedIn para a busca '{termo_busca}'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
                "job_url": job_url,
                "logo_empresa": logo,
                "data_publicacao": data_pub,
                "termo_busca": termo_busca,
                "fonte": "linkedin-jobspy",
                "compatibilidade": score,
                "skills_match": matched_skills,
            }
        )

    vagas_formatadas.sort(key=lambda x: x["compatibilidade"], reverse=True)
    return vagas_formatadas


async def coletar_vagas_linkedin(
    termo_busca: str,
    localizacao: str = "Brazil",
    apenas_remoto: bool = False,
    limite: int = 10,
    skills_perfil: list[str] | None = None,
    areas_interesse: str = "",
    curso: str = "",
) -> list[dict]:
    """Busca vagas reais do LinkedIn de acordo com a área do usuário."""
    return await asyncio.to_thread(
        _scrape_linkedin_jobs_sync,
        termo_busca,
        localizacao,
        apenas_remoto,
        limite,
        skills_perfil or [],
        areas_interesse,
        curso,
    )
