import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { api } from '../services/api';

const CATEGORIAS_NOTICIA = [
  'todas',
  'Inovação',
  'Pesquisa',
  'Acadêmico',
  'Eventos',
  'Carreira',
];

function parseConteudoResumo(conteudo = '') {
  const texto = (conteudo || '').trim();
  if (!/(?:RESUMO|RESUMÃO)\s+EM\s+TÓPICOS:/i.test(texto)) {
    return { topicos: [], paragrafos: texto ? texto.split(/\n{2,}/) : [] };
  }
  const [blocoTopicos, blocoSintese = ''] = texto.split(/SÍNTESE\s+DA\s+REPORTAGEM:\s*/i);
  const topicos = blocoTopicos
    .replace(/(?:RESUMO|RESUMÃO)\s+EM\s+TÓPICOS:\s*/i, '')
    .split('\n')
    .map((l) => l.replace(/^[•\-*]\s*/, '').trim())
    .filter(Boolean);
  const paragrafos = blocoSintese
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  return { topicos, paragrafos };
}

function ehNoticiaInatel(noticia) {
  const fonte = (noticia?.fonte_nome || noticia?.autor || '').toLowerCase();
  const url = (noticia?.url_original || '').toLowerCase();
  if (url) {
    return url.includes('inatel.br');
  }
  return fonte.includes('inatel');
}

export default function NoticiasPage({
  noticias = [],
  noticiaSolicitada = null,
  onNoticiaSolicitadaConsumida,
  onRefreshNoticias,
  onSetNoticias,
  onNotify,
}) {
  const [buscaNoticia, setBuscaNoticia] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [sincronizandoNoticias, setSincronizandoNoticias] = useState(false);

  const [noticiaAberta, setNoticiaAberta] = useState(null);

  const noticiasFiltradas = useMemo(() => {
    return noticias.filter((n) => {
      if (!ehNoticiaInatel(n)) return false;
      if (
        filtroCategoria !== 'todas' &&
        (n.categoria || '').toLowerCase() !== filtroCategoria.toLowerCase()
      ) {
        return false;
      }
      if (buscaNoticia.trim()) {
        const q = buscaNoticia.toLowerCase();
        const alvo = `${n.titulo} ${n.resumo} ${n.conteudo} ${n.autor} ${n.fonte_nome || ''}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }, [noticias, filtroCategoria, buscaNoticia]);

  const handleAbrirNoticia = async (noticia) => {
    setNoticiaAberta(noticia);
    try {
      const atualizada = await api.lerNoticia(noticia.id);
      setNoticiaAberta(atualizada);
      onRefreshNoticias();
    } catch {
      // mantém visualização local se falhar
    }
  };

  useEffect(() => {
    if (noticiaSolicitada) {
      handleAbrirNoticia(noticiaSolicitada);
      if (onNoticiaSolicitadaConsumida) onNoticiaSolicitadaConsumida();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticiaSolicitada]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNoticiaAberta(null);
      }
    };
    if (noticiaAberta) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [noticiaAberta]);

  const handleSincronizarNoticias = async () => {
    setSincronizandoNoticias(true);
    try {
      const res = await api.sincronizarNoticias();
      if (onSetNoticias && Array.isArray(res?.noticias)) {
        onSetNoticias(res.noticias);
      } else {
        await onRefreshNoticias();
      }
      onNotify(
        `Notícias do Inatel atualizadas! ${res.total_ativas} matérias oficiais disponíveis.`
      );
    } catch (err) {
      onNotify(err.message || 'Erro ao sincronizar notícias do Inatel.', 'error');
    } finally {
      setSincronizandoNoticias(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==========================================
          CABEÇALHO DE NOTÍCIAS DO INATEL
          ========================================== */}
      <section className="theme-surface border rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full theme-badge-soft">
              <Icon name="file" className="w-3.5 h-3.5" />
              Portal Oficial de Comunicação • inatel.br/noticias
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Notícias do Inatel
            </h1>
            <p className="text-sm theme-text-secondary max-w-2xl">
              Acompanhe as últimas reportagens oficiais de pesquisa, inovação, eventos e conquistas
              acadêmicas diretamente do Portal Inatel, com resumo automático em tópicos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleSincronizarNoticias}
              disabled={sincronizandoNoticias}
              className="theme-btn-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-60"
            >
              {sincronizandoNoticias ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Coletando e resumindo...</span>
                </>
              ) : (
                <>
                  <Icon name="link" className="w-4 h-4" />
                  <span>Atualizar Notícias do Inatel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ==========================================
          BUSCA + FILTRO DE EDITORIAS + LISTAGEM DE NOTÍCIAS
          ========================================== */}
      <section className="space-y-5">
        <div className="theme-surface border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block mb-1">
              Pesquisar notícias do Portal Inatel
            </label>
            <input
              type="text"
              value={buscaNoticia}
              onChange={(e) => setBuscaNoticia(e.target.value)}
              placeholder="Buscar por xGMobile, 6G, FETIN, pesquisa, bolsas, maratona..."
              className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
            {CATEGORIAS_NOTICIA.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  filtroCategoria === cat
                    ? 'theme-btn-primary border-transparent'
                    : 'theme-muted hover:opacity-80'
                }`}
              >
                {cat === 'todas' ? 'Todas as editorias' : cat}
              </button>
            ))}
          </div>
        </div>

        {noticiasFiltradas.length === 0 ? (
          <div className="theme-surface border rounded-2xl p-10 text-center space-y-3">
            <p className="font-bold text-base">Nenhuma notícia do Inatel encontrada com este filtro.</p>
            <p className="text-sm theme-text-secondary">
              Limpe os filtros acima ou clique em &ldquo;Atualizar Notícias do Inatel&rdquo; para
              buscar as últimas reportagens oficiais.
            </p>
            <button
              type="button"
              onClick={handleSincronizarNoticias}
              disabled={sincronizandoNoticias}
              className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {sincronizandoNoticias ? 'Sincronizando...' : 'Buscar Notícias do Inatel Agora'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {noticiasFiltradas.map((noticia, idx) => {
              const isHero =
                noticia.destaque && idx === 0 && filtroCategoria === 'todas' && !buscaNoticia;
              const portalNome = noticia.fonte_nome || noticia.autor || 'Portal Inatel';

              return (
                <article
                  key={noticia.id}
                  className={`theme-surface border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition flex flex-col ${
                    isHero ? 'md:col-span-2 md:grid md:grid-cols-12' : ''
                  }`}
                >
                  {noticia.imagem_url && (
                    <div
                      className={`bg-slate-900 overflow-hidden ${
                        isHero ? 'md:col-span-6 h-60 md:h-full' : 'h-48'
                      }`}
                    >
                      <img
                        src={noticia.imagem_url}
                        alt={noticia.titulo}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = 'none';
                        }}
                        className="w-full h-full object-cover hover:scale-105 transition duration-500"
                      />
                    </div>
                  )}

                  <div
                    className={`p-5 sm:p-6 flex flex-col justify-between gap-4 flex-1 ${
                      isHero ? 'md:col-span-6' : ''
                    }`}
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full theme-badge-soft">
                            {noticia.categoria}
                          </span>
                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full theme-muted border">
                            {portalNome}
                          </span>
                          {noticia.destaque && (
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                              Destaque
                            </span>
                          )}
                        </div>
                        <span className="text-xs theme-text-secondary flex items-center gap-1">
                          <Icon name="clock" className="w-3.5 h-3.5" />
                          {noticia.tempo_leitura} • {noticia.publicado_em}
                        </span>
                      </div>

                      <h3
                        className={`font-extrabold leading-snug ${
                          isHero ? 'text-xl sm:text-2xl' : 'text-lg'
                        }`}
                      >
                        {noticia.titulo}
                      </h3>

                      <p className="text-sm theme-text-secondary leading-relaxed">
                        {noticia.resumo}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleAbrirNoticia(noticia)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold theme-muted border hover:opacity-85 transition cursor-pointer"
                      >
                        Resumo
                      </button>

                      {noticia.url_original ? (
                        <a
                          href={noticia.url_original}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="theme-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
                        >
                          <span>Ir para notícia</span>
                          <span>↗</span>
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleAbrirNoticia(noticia)}
                          className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                        >
                          Ler matéria →
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ==========================================
          MODAL: RESUMO E ACESSO À NOTÍCIA ORIGINAL NO PORTAL INATEL
          ========================================== */}
      {noticiaAberta &&
        (() => {
          const { topicos, paragrafos } = parseConteudoResumo(noticiaAberta.conteudo);
          const portalFonte = noticiaAberta.fonte_nome || noticiaAberta.autor || 'Portal Inatel';

          return (
            <div
              className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-hidden"
              onClick={(e) => {
                if (e.target === e.currentTarget) setNoticiaAberta(null);
              }}
            >
              <div
                className="theme-surface border rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-noticia-titulo"
              >
                {/* BARRA SUPERIOR FIXA DO MODAL */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--surface-primary)]">
                  <div className="flex items-center gap-2 text-xs font-bold theme-text-secondary truncate pr-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 inline-block" />
                    <span className="truncate">Resumo da Notícia • {portalFonte}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNoticiaAberta(null)}
                    className="p-1.5 rounded-lg theme-muted border hover:opacity-80 transition cursor-pointer text-xs flex items-center gap-1 font-semibold shrink-0"
                    title="Fechar modal (Esc)"
                    aria-label="Fechar modal"
                  >
                    <Icon name="close" className="w-4 h-4" />
                    <span className="hidden sm:inline">Fechar</span>
                  </button>
                </div>

                {/* CORPO ROLÁVEL COM IMAGEM, RESUMO E SÍNTESE */}
                <div className="flex-1 overflow-y-auto overscroll-contain p-5 sm:p-6 space-y-4">
                  {noticiaAberta.imagem_url && (
                    <div className="rounded-xl overflow-hidden bg-slate-900 border border-[var(--border-subtle)] max-h-60 sm:max-h-72">
                      <img
                        src={noticiaAberta.imagem_url}
                        alt={noticiaAberta.titulo}
                        onError={(e) => {
                          e.currentTarget.parentElement.style.display = 'none';
                        }}
                        className="w-full h-48 sm:h-64 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold px-2.5 py-1 rounded-full theme-badge-soft">
                        {noticiaAberta.categoria}
                      </span>
                      <span className="font-semibold px-2.5 py-1 rounded-full theme-muted border">
                        Fonte: {portalFonte}
                      </span>
                      {noticiaAberta.destaque && (
                        <span className="font-bold px-2.5 py-0.5 rounded-full bg-amber-500 text-white">
                          Destaque
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 theme-text-secondary font-medium">
                      {noticiaAberta.tempo_leitura && (
                        <span>{noticiaAberta.tempo_leitura} de leitura</span>
                      )}
                      {noticiaAberta.publicado_em && (
                        <>
                          <span>•</span>
                          <span>{noticiaAberta.publicado_em}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <h2
                    id="modal-noticia-titulo"
                    className="text-xl sm:text-2xl font-extrabold leading-tight text-[var(--text-primary)]"
                  >
                    {noticiaAberta.titulo}
                  </h2>

                  {noticiaAberta.resumo && (
                    <p className="text-sm font-semibold theme-text-secondary border-l-4 theme-accent-border pl-3.5 py-1">
                      {noticiaAberta.resumo}
                    </p>
                  )}

                  {topicos.length > 0 && (
                    <div className="theme-muted border rounded-xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <Icon name="check" className="w-4 h-4 theme-accent-text" />
                        <p className="text-xs font-extrabold uppercase tracking-wider theme-accent-text">
                          Resumo da Notícia (Pontos Principais)
                        </p>
                      </div>
                      <ul className="space-y-2 text-sm leading-relaxed">
                        {topicos.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2.5">
                            <span className="theme-accent-text font-black text-base leading-none mt-0.5">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {paragrafos.length > 0 && (
                    <div className="space-y-3 text-sm leading-relaxed pt-1">
                      {topicos.length > 0 && (
                        <p className="text-xs font-extrabold uppercase tracking-wider theme-text-secondary">
                          Síntese Completa da Notícia
                        </p>
                      )}
                      {paragrafos.map((par, idx) => (
                        <p key={idx} className="whitespace-pre-line leading-relaxed theme-text-primary">
                          {par}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* BARRA INFERIOR FIXA DE AÇÕES */}
                <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--surface-primary)] flex items-center justify-end gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setNoticiaAberta(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold theme-muted border hover:opacity-85 transition cursor-pointer"
                  >
                    Fechar
                  </button>

                  {noticiaAberta.url_original && (
                    <a
                      href={noticiaAberta.url_original}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition shadow-xs"
                    >
                      <span>Abrir notícia original no {portalFonte}</span>
                      <span>↗</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
    </div>
  );
}

