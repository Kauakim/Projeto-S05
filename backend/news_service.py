import asyncio
from datetime import datetime
from email.utils import parsedate_to_datetime
import math
import re
from urllib.parse import parse_qs, unquote, urljoin, urlparse
import xml.etree.ElementTree as ET

from bs4 import BeautifulSoup
import httpx

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/131.0.0.0 Safari/537.36"
)

DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
}

MESES_PT = {
    "janeiro": 1,
    "jan": 1,
    "fevereiro": 2,
    "fev": 2,
    "março": 3,
    "marco": 3,
    "mar": 3,
    "abril": 4,
    "abr": 4,
    "maio": 5,
    "mai": 5,
    "junho": 6,
    "jun": 6,
    "julho": 7,
    "jul": 7,
    "agosto": 8,
    "ago": 8,
    "setembro": 9,
    "set": 9,
    "outubro": 10,
    "out": 10,
    "novembro": 11,
    "nov": 11,
    "dezembro": 12,
    "dez": 12,
}

# Slugs institucionais fixos do menu de /noticias/ que não são matérias jornalísticas
INATEL_IGNORED_SLUGS = {
    "",
    "noticias",
    "sala-de-imprensa",
    "sala-de-impresa",
    "webstories",
    "jornal-inatel",
    "contato",
    "categorias",
    "tags",
}

FRASES_RUIDO_PARAGRAFO = (
    "utilizamos cookies",
    "gerenciador de cookies",
    "escolhas de acessibilidade",
    "cookies estritamente necessários",
    "todos os direitos reservados",
    "copyright ©",
    "baixe o app",
    "leia também",
    "veja também",
    "assine nossa newsletter",
    "política de privacidade",
    "— foto:",
    "foto: reprodução",
    "foto: divulgação",
)


def _limpar_espacos(texto: str) -> str:
    return re.sub(r"\s+", " ", (texto or "")).strip()


def _truncar_limpo(texto: str, limite: int) -> str:
    texto = _limpar_espacos(texto)
    if len(texto) <= limite:
        return texto
    corte = texto[: limite - 1]
    ultimo_ponto = max(corte.rfind(". "), corte.rfind("! "), corte.rfind("? "))
    if ultimo_ponto >= int(limite * 0.55):
        return corte[: ultimo_ponto + 1].strip()
    ultimo_espaco = corte.rfind(" ")
    if ultimo_espaco > 40:
        return corte[:ultimo_espaco].rstrip(",;:- ") + "..."
    return corte.rstrip() + "..."


def _limpar_titulo_portal(titulo: str) -> str:
    t = _limpar_espacos(titulo)
    t = re.sub(
        r"\s*(?:\||—|–|-)\s*(?:Notícias\s*-\s*Inatel|Portal\s+Inatel|Inatel).*$",
        "",
        t,
        flags=re.IGNORECASE,
    )
    return _limpar_espacos(t)


def _tentar_parse_data(texto_data: str) -> tuple[str, tuple[int, int, int]] | None:
    if not texto_data:
        return None

    # 1. Tenta ISO / Meta (2026-10-30...)
    m_iso = re.search(r"\b(20\d{2})-(\d{2})-(\d{2})\b", texto_data)
    if m_iso:
        y, mo, d = int(m_iso.group(1)), int(m_iso.group(2)), int(m_iso.group(3))
        if 1 <= mo <= 12 and 1 <= d <= 31:
            return f"{d:02d}/{mo:02d}/{y:04d}", (y, mo, d)

    # 2. Tenta padrão PT-BR extenso ("30 outubro 2026" ou "30 de outubro de 2026")
    m_pt = re.search(
        r"\b(\d{1,2})\s+(?:de\s+)?([a-zç]+)\s+(?:de\s+)?(20\d{2})\b",
        texto_data.lower(),
    )
    if m_pt:
        d = int(m_pt.group(1))
        mes_nome = m_pt.group(2)
        y = int(m_pt.group(3))
        mo = MESES_PT.get(mes_nome, 0)
        if mo and 1 <= d <= 31:
            return f"{d:02d}/{mo:02d}/{y:04d}", (y, mo, d)

    # 3. Tenta dd/mm/yyyy no texto
    m_br = re.search(r"\b(\d{2})/(\d{2})/(20\d{2})\b", texto_data)
    if m_br:
        d, mo, y = int(m_br.group(1)), int(m_br.group(2)), int(m_br.group(3))
        if 1 <= mo <= 12 and 1 <= d <= 31:
            return f"{d:02d}/{mo:02d}/{y:04d}", (y, mo, d)

    # 4. Tenta RFC 2822 (RSS pubDate)
    if "," in texto_data or "GMT" in texto_data:
        try:
            dt = parsedate_to_datetime(texto_data)
            return dt.strftime("%d/%m/%Y"), (dt.year, dt.month, dt.day)
        except Exception:
            pass

    return None


def _extrair_data_pt(texto_data: str, url: str = "") -> tuple[str, tuple[int, int, int]]:
    parsed = _tentar_parse_data(texto_data)
    if parsed:
        return parsed

    m_url = re.search(r"/(20\d{2})/(\d{2})/(\d{2})(?:/|-|$)", url or "")
    if m_url:
        y, mo, d = int(m_url.group(1)), int(m_url.group(2)), int(m_url.group(3))
        if 1 <= mo <= 12 and 1 <= d <= 31:
            return f"{d:02d}/{mo:02d}/{y:04d}", (y, mo, d)

    hoje = datetime.now()
    return hoje.strftime("%d/%m/%Y"), (hoje.year, hoje.month, hoje.day)


def _classificar_categoria(titulo: str, subtitulo: str) -> str:
    alvo = f"{titulo} {subtitulo}".lower()
    if any(
        k in alvo
        for k in ("vaga", "vagas", "emprego", "estágio", "estagio", "concurso", "carreira", "contrata")
    ):
        return "Carreira"
    if any(
        k in alvo
        for k in ("6g", "5g", "pesquisa", "cientista", "xgmobile", "mestrado", "doutorado", "lidar", "laboratório")
    ):
        return "Pesquisa"
    if any(
        k in alvo
        for k in ("mec", "guia da faculdade", "nota máxima", "graduação", "ensino", "vestibular", "curso")
    ):
        return "Acadêmico"
    if any(
        k in alvo
        for k in ("summit", "workshop", "semana", "feira", "fetin", "competição", "finais", "evento", "conquista", "pódio")
    ):
        return "Eventos"
    return "Inovação"


def _paragrafo_valido(p: str) -> bool:
    if len(p) < 55:
        return False
    low = p.lower()
    for ruido in FRASES_RUIDO_PARAGRAFO:
        if ruido in low:
            return False
    return True


def _construir_resumo(titulo: str, subtitulo: str, paragrafos: list[str], fonte_nome: str) -> tuple[str, str, str]:
    vistos: set[str] = set()
    limpos: list[str] = []
    for p in paragrafos:
        pc = _limpar_espacos(p)
        chave = pc[:80].lower()
        if _paragrafo_valido(pc) and chave not in vistos:
            vistos.add(chave)
            limpos.append(pc)

    sub_limpo = _limpar_espacos(subtitulo)
    if sub_limpo.lower() == titulo.lower():
        sub_limpo = ""

    if sub_limpo and len(sub_limpo) >= 45:
        resumo_base = sub_limpo
        if len(resumo_base) < 130 and limpos:
            primeira_frase = re.split(r"(?<=[.!?])\s+", limpos[0])[0]
            if primeira_frase.lower()[:40] not in resumo_base.lower():
                resumo_base = f"{resumo_base.rstrip('.')} — {primeira_frase}"
    elif limpos:
        resumo_base = limpos[0]
    else:
        resumo_base = f"Confira os destaques desta matéria publicada por {fonte_nome}."

    resumo_card = _truncar_limpo(resumo_base, 335)

    candidatas: list[tuple[float, int, str]] = []
    palavras_titulo = {
        w
        for w in re.findall(r"[a-zà-ú0-9]{4,}", titulo.lower())
        if w not in {"para", "como", "mais", "sobre", "após", "entre", "pelo", "pela"}
    }

    idx_sent = 0
    titulo_norm = re.sub(r"[^a-z0-9]", "", titulo.lower())
    for idx_p, p in enumerate(limpos[:10]):
        sentencas = re.split(r"(?<=[.!?])\s+", p)
        for s in sentencas:
            s_clean = _limpar_espacos(s)
            if len(s_clean) < 55 or len(s_clean) > 260:
                continue
            if not s_clean.endswith((".", "!", "?")):
                continue
            if re.sub(r"[^a-z0-9]", "", s_clean.lower()) == titulo_norm:
                continue
            if sub_limpo and s_clean.lower()[:50] == sub_limpo.lower()[:50]:
                continue

            score = 0.0
            score += max(0.0, 4.0 - idx_p * 0.55)
            if re.search(r"\b\d+[\d.,%]*\b", s_clean):
                score += 2.2
            palavras_s = set(re.findall(r"[a-zà-ú0-9]{4,}", s_clean.lower()))
            intersecao = len(palavras_titulo & palavras_s)
            score += min(3.0, intersecao * 0.8)
            if any(
                k in s_clean.lower()
                for k in ("inatel", "estudantes", "pesquisa", "inovação", "tecnologia", "engenharia")
            ):
                score += 1.2

            candidatas.append((score, idx_sent, s_clean))
            idx_sent += 1

    candidatas.sort(key=lambda x: x[0], reverse=True)
    escolhidas: list[tuple[int, str]] = []
    prefixos_escolhidos: set[str] = set()
    for _sc, ordem, sent in candidatas:
        pref = sent[:45].lower()
        if pref in prefixos_escolhidos:
            continue
        prefixos_escolhidos.add(pref)
        escolhidas.append((ordem, sent))
        if len(escolhidas) >= 4:
            break

    escolhidas.sort(key=lambda x: x[0])

    blocos: list[str] = []
    if escolhidas:
        topicos = "\n".join(f"• {s}" for _, s in escolhidas)
        blocos.append(f"RESUMO EM TÓPICOS:\n{topicos}")

    paragrafos_sintese = limpos[:4] if limpos else ([sub_limpo] if sub_limpo else [])
    if paragrafos_sintese:
        blocos.append("SÍNTESE DA REPORTAGEM:\n" + "\n\n".join(paragrafos_sintese))

    conteudo_resumo = "\n\n".join(blocos).strip()
    if len(conteudo_resumo) < 40:
        conteudo_resumo = resumo_card

    total_palavras = sum(len(p.split()) for p in limpos) or len(conteudo_resumo.split())
    minutos = max(2, min(8, math.ceil(total_palavras / 180)))
    tempo_leitura = f"{minutos} min"

    return resumo_card, conteudo_resumo, tempo_leitura


async def _raspar_artigo_inatel(
    client: httpx.AsyncClient,
    sem: asyncio.Semaphore,
    url: str,
    data_fallback: str = "",
    titulo_fallback: str = "",
    resumo_fallback: str = "",
) -> dict | None:
    async with sem:
        try:
            resp = await client.get(url, follow_redirects=True, timeout=14.0)
            if resp.status_code >= 400 or not resp.text:
                return None
            url_final = str(resp.url)
            host_final = urlparse(url_final).netloc.lower()
            if "inatel.br" not in host_final:
                return None

            soup = BeautifulSoup(resp.text, "html.parser")

            def _meta(attr_val: str) -> str:
                el = soup.find("meta", property=attr_val) or soup.find("meta", attrs={"name": attr_val})
                return _limpar_espacos(el.get("content", "")) if el else ""

            og_title = _meta("og:title") or _meta("twitter:title")
            h1 = soup.find("h1")
            titulo_bruto = og_title or (h1.get_text(" ") if h1 else "") or titulo_fallback
            titulo = _limpar_titulo_portal(titulo_bruto)
            if len(titulo) < 12:
                return None

            subtitulo = _meta("og:description") or _meta("description") or resumo_fallback

            og_img = _meta("og:image:secure_url") or _meta("og:image") or _meta("twitter:image")
            if og_img and og_img.startswith("/"):
                og_img = urljoin(url_final, og_img)
            if len(og_img) > 580:
                og_img = ""

            fonte_nome = "Portal Inatel"

            data_candidata = (
                _meta("article:published_time")
                or _meta("publish-date")
                or _meta("date")
                or data_fallback
            )
            if not _tentar_parse_data(data_candidata):
                data_candidata = ""
                for sel in (
                    "time",
                    "[itemprop='datePublished']",
                    ".itemDateCreated",
                    "[class*='Date']",
                    "[class*='Data']",
                    "[class*='data']",
                    "[class*='date']",
                ):
                    for el_d in soup.select(sel)[:20]:
                        dt_attr = el_d.get("datetime") or el_d.get_text(" ")
                        dt_txt = _limpar_espacos(dt_attr)
                        if len(dt_txt) <= 80 and _tentar_parse_data(dt_txt):
                            data_candidata = dt_txt
                            break
                    if data_candidata:
                        break

            if not _tentar_parse_data(data_candidata):
                m_cabecalho = re.search(
                    r"\b\d{1,2}\s+(?:de\s+)?(?:janeiro|fevereiro|março|marco|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+(?:de\s+)?20\d{2}\b",
                    soup.get_text(" ")[:5000],
                    flags=re.IGNORECASE,
                )
                if m_cabecalho:
                    data_candidata = m_cabecalho.group(0)

            publicado_em, chave_data = _extrair_data_pt(data_candidata, url_final)
            if chave_data[0] < 2024:
                return None

            for tag_ruido in soup.select(
                "nav, footer, header, aside, script, style, noscript, form, "
                "[id*='cookie'], [class*='cookie'], [class*='lgpd'], [class*='newsletter'], [class*='related']"
            ):
                tag_ruido.decompose()

            seletores_p = (
                "p.content-text__container, article p, main p, .entry-content p, .td-post-content p, p"
            )
            paragrafos = [_limpar_espacos(p.get_text(" ")) for p in soup.select(seletores_p)]

            resumo_card, conteudo_resumo, tempo_leitura = _construir_resumo(
                titulo=titulo,
                subtitulo=subtitulo,
                paragrafos=paragrafos,
                fonte_nome=fonte_nome,
            )
            categoria = _classificar_categoria(titulo, subtitulo)

            return {
                "titulo": _truncar_limpo(titulo, 195),
                "resumo": resumo_card,
                "conteudo": conteudo_resumo,
                "categoria": categoria,
                "autor": fonte_nome,
                "fonte_nome": fonte_nome,
                "url_original": url_final[:595],
                "tempo_leitura": tempo_leitura,
                "imagem_url": og_img,
                "publicado_em": publicado_em,
                "_sort_date": chave_data,
            }
        except Exception:
            return None


async def _descobrir_urls_inatel(client: httpx.AsyncClient) -> list[str]:
    urls: list[str] = []
    vistos: set[str] = set()

    for pagina in (
        "https://inatel.br/noticias/",
        "https://inatel.br/home/",
        "https://inatel.br/noticias/?start=10",
    ):
        try:
            resp = await client.get(pagina, follow_redirects=True, timeout=14.0)
            if resp.status_code >= 400:
                continue
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"].strip()
                if not href or href.startswith(("#", "javascript:", "mailto:", "tel:")):
                    continue
                abs_url = urljoin(pagina, href).split("#")[0].split("?")[0].rstrip("/")
                if not abs_url.startswith("https://inatel.br/noticias/"):
                    continue
                slug = abs_url.removeprefix("https://inatel.br/noticias/").strip("/")
                if not slug or "/" in slug or slug.lower() in INATEL_IGNORED_SLUGS:
                    continue
                if len(slug) < 18:
                    continue
                if abs_url not in vistos:
                    vistos.add(abs_url)
                    urls.append(abs_url)
        except Exception:
            continue

    return urls[:14]


async def _descobrir_itens_bing_inatel(client: httpx.AsyncClient) -> list[dict]:
    encontrados: list[dict] = []
    vistos: set[str] = set()
    try:
        resp = await client.get(
            "https://www.bing.com/news/search",
            params={"q": "site:inatel.br/noticias", "format": "rss", "mkt": "pt-BR"},
            follow_redirects=True,
            timeout=12.0,
        )
        if resp.status_code < 400 and resp.text:
            root = ET.fromstring(resp.text)
            for item in root.findall(".//item")[:8]:
                titulo = _limpar_espacos(item.findtext("title", ""))
                link_rss = _limpar_espacos(item.findtext("link", ""))
                desc = _limpar_espacos(item.findtext("description", ""))
                pub = _limpar_espacos(item.findtext("pubDate", ""))

                qs = parse_qs(urlparse(link_rss).query)
                real_url = unquote(qs.get("url", [link_rss])[0]).split("#")[0].strip()
                if not real_url.startswith("https://inatel.br/noticias/"):
                    continue
                if real_url not in vistos:
                    vistos.add(real_url)
                    encontrados.append(
                        {
                            "url": real_url,
                            "pub": pub,
                            "titulo": titulo,
                            "desc": desc,
                        }
                    )
    except Exception:
        pass
    return encontrados


async def coletar_noticias_reais_inatel() -> list[dict]:
    sem = asyncio.Semaphore(6)
    async with httpx.AsyncClient(headers=DEFAULT_HEADERS, verify=True) as client:
        inatel_urls, bing_items = await asyncio.gather(
            _descobrir_urls_inatel(client),
            _descobrir_itens_bing_inatel(client),
        )

        tarefas = []
        urls_agendadas: set[str] = set()

        for u in inatel_urls:
            chave = u.rstrip("/").lower()
            if chave not in urls_agendadas:
                urls_agendadas.add(chave)
                tarefas.append(_raspar_artigo_inatel(client, sem, u))

        for b in bing_items:
            chave = b["url"].rstrip("/").lower()
            if chave not in urls_agendadas:
                urls_agendadas.add(chave)
                tarefas.append(
                    _raspar_artigo_inatel(
                        client,
                        sem,
                        b["url"],
                        data_fallback=b["pub"],
                        titulo_fallback=b["titulo"],
                        resumo_fallback=b["desc"],
                    )
                )

        resultados_brutos = await asyncio.gather(*tarefas)

    artigos_validos: list[dict] = []
    titulos_vistos: set[str] = set()
    urls_vistas: set[str] = set()

    for art in resultados_brutos:
        if not art or not art.get("url_original"):
            continue
        if "inatel.br" not in art["url_original"].lower():
            continue
        chave_url = art["url_original"].rstrip("/").lower()
        chave_titulo = re.sub(r"[^a-z0-9]", "", art["titulo"].lower())[:55]
        if chave_url in urls_vistas or chave_titulo in titulos_vistos:
            continue
        urls_vistas.add(chave_url)
        titulos_vistos.add(chave_titulo)
        artigos_validos.append(art)

    artigos_validos.sort(key=lambda x: x["_sort_date"], reverse=True)

    destaque_definido = False
    for art in artigos_validos:
        if art.get("imagem_url") and not destaque_definido:
            art["destaque"] = True
            destaque_definido = True
        else:
            art["destaque"] = False

    if not destaque_definido and artigos_validos:
        artigos_validos[0]["destaque"] = True

    for art in artigos_validos:
        art.pop("_sort_date", None)

    return artigos_validos


def chave_ordenacao_noticia(noticia) -> tuple:
    """Ordena destaque primeiro e depois pela data real (dd/mm/yyyy) mais recente."""
    pub = getattr(noticia, "publicado_em", "") or ""
    m = re.match(r"^(\d{2})/(\d{2})/(\d{4})$", pub.strip())
    if m:
        data_tupla = (int(m.group(3)), int(m.group(2)), int(m.group(1)))
    else:
        data_tupla = (0, 0, 0)
    return (1 if getattr(noticia, "destaque", False) else 0, data_tupla, getattr(noticia, "id", 0) or 0)


async def sincronizar_noticias_no_banco(session) -> tuple[int, int]:
    """
    Remove notícias que não pertençam ao domínio oficial do Inatel (inatel.br)
    e sincroniza as notícias reais do Portal Inatel no banco.
    Retorna (inseridas, atualizadas).
    """
    from sqlalchemy import delete, func, or_, select
    from models import Noticia

    # Remove qualquer notícia externa/regional ou mockada que não seja do Portal Inatel (inatel.br)
    await session.execute(
        delete(Noticia).where(
            or_(
                Noticia.url_original.is_(None),
                Noticia.url_original == "",
                ~func.lower(Noticia.url_original).like("%inatel.br%"),
            )
        )
    )

    coletadas = await coletar_noticias_reais_inatel()
    if not coletadas:
        await session.commit()
        return (0, 0)

    res_existentes = await session.execute(select(Noticia))
    existentes = list(res_existentes.scalars().all())
    mapa_por_url: dict[str, Noticia] = {}
    for item in existentes:
        if item.url_original:
            item.destaque = False
            mapa_por_url[item.url_original.rstrip("/").lower()] = item

    inseridas = 0
    atualizadas = 0

    for dados in reversed(coletadas):
        chave = dados["url_original"].rstrip("/").lower()
        existente = mapa_por_url.get(chave)
        if existente is not None:
            existente.titulo = dados["titulo"]
            existente.resumo = dados["resumo"]
            existente.conteudo = dados["conteudo"]
            existente.categoria = dados["categoria"]
            existente.autor = dados["autor"]
            existente.fonte_nome = dados["fonte_nome"]
            existente.tempo_leitura = dados["tempo_leitura"]
            if dados.get("imagem_url"):
                existente.imagem_url = dados["imagem_url"]
            existente.publicado_em = dados["publicado_em"]
            existente.destaque = dados["destaque"]
            atualizadas += 1
        else:
            session.add(Noticia(**dados))
            inseridas += 1

    await session.commit()
    return (inseridas, atualizadas)
