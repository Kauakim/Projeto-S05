import { useEffect, useState } from 'react';
import Icon from './Icon';
import { api } from '../services/api';

export default function LinkedInAnalyzerSection({
  usuario,
  analise,
  onAnaliseAtualizada,
  onRefreshUsuario,
  onIrParaVagasLinkedIn,
  onNotify,
}) {
  const [linkedinUrl, setLinkedinUrl] = useState(
    analise?.linkedin_url || usuario?.linkedin || ''
  );
  const [sincronizarAreas, setSincronizarAreas] = useState(true);
  const [mostrarOpcoesApi, setMostrarOpcoesApi] = useState(false);
  const [scrapingdogKey, setScrapingdogKey] = useState('');
  const [apifyToken, setApifyToken] = useState('');
  const [rapidapiKey, setRapidapiKey] = useState('');
  const [coletando, setColetando] = useState(false);
  const [abaSecoes, setAbaSecoes] = useState('todas');

  useEffect(() => {
    if (analise?.linkedin_url) {
      setLinkedinUrl(analise.linkedin_url);
    } else if (usuario?.linkedin) {
      setLinkedinUrl(usuario.linkedin);
    }
  }, [analise?.linkedin_url, usuario?.linkedin]);

  const handleAnalisar = async (e) => {
    e.preventDefault();
    setColetando(true);
    try {
      const resultado = await api.analisarPerfilLinkedIn({
        linkedin_url: linkedinUrl,
        sincronizar_areas: sincronizarAreas,
        scrapingdog_key: scrapingdogKey,
        apify_token: apifyToken,
        rapidapi_key: rapidapiKey,
      });
      onAnaliseAtualizada(resultado);
      if (onRefreshUsuario) {
        await onRefreshUsuario();
      }
      onNotify(
        `Perfil de ${resultado.nome_completo} coletado com sucesso (${resultado.pontuacao_perfil}/100 pts)!`
      );
    } catch (err) {
      onNotify(err.message || 'Erro ao coletar dados do LinkedIn.', 'error');
    } finally {
      setColetando(false);
    }
  };

  const handleExportarJson = () => {
    if (!analise) return;
    const blob = new Blob([JSON.stringify(analise, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analise_linkedin_${analise.slug || 'perfil'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onNotify('JSON completo da análise exportado!');
  };

  const score = analise?.pontuacao_perfil || 0;
  const corScore =
    score >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : score >= 60
        ? 'text-blue-600 dark:text-sky-400'
        : score >= 45
          ? 'text-amber-500'
          : 'text-red-500';

  const barraScore =
    score >= 80
      ? 'bg-emerald-500'
      : score >= 60
        ? 'bg-blue-500'
        : score >= 45
          ? 'bg-amber-500'
          : 'bg-red-500';

  const badgeNivel =
    score >= 80
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
      : score >= 60
        ? 'bg-blue-500/15 text-blue-700 dark:text-sky-300 border-blue-500/30'
        : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';

  const iniciais = (analise?.nome_completo || 'IN')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const totalExp = Math.max(
    analise?.experiencias?.length || 0,
    analise?.total_experiencias_perfil || 0
  );
  const totalEdu = Math.max(
    analise?.formacao?.length || 0,
    analise?.total_formacoes_perfil || 0
  );

  const abasDisponiveis = [
    { id: 'todas', rotulo: 'Visão Completa' },
    ...(analise?.projetos?.length
      ? [{ id: 'projetos', rotulo: `Projetos (${analise.projetos.length})` }]
      : []),
    ...(analise?.experiencias?.length || analise?.formacao?.length
      ? [{ id: 'trajetoria', rotulo: `Experiência & Formação (${totalExp + totalEdu})` }]
      : []),
    ...(analise?.certificacoes?.length || analise?.cursos?.length
      ? [
          {
            id: 'certificados',
            rotulo: `Certificados & Cursos (${(analise.certificacoes?.length || 0) + (analise.cursos?.length || 0)})`,
          },
        ]
      : []),
    ...(analise?.premios?.length
      ? [{ id: 'premios', rotulo: `Prêmios (${analise.premios.length})` }]
      : []),
    ...(analise?.publicacoes?.length
      ? [{ id: 'publicacoes', rotulo: `Publicações (${analise.publicacoes.length})` }]
      : []),
  ];

  const exibirSecao = (idSecao) => abaSecoes === 'todas' || abaSecoes === idSecao;

  return (
    <div className="space-y-6">
      {/* ==========================================
          1. BARRA DE ENTRADA DO LINK E DISPARO DE SCRAPING
          ========================================== */}
      <section className="theme-surface border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full theme-badge-soft mb-1.5">
              <Icon name="link" className="w-3.5 h-3.5" />
              Extração Direta do Perfil LinkedIn (DOM + Schema.org JSON-LD)
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold">
              Análise Completa de Perfil LinkedIn
            </h2>
            <p className="text-xs sm:text-sm theme-text-secondary mt-0.5">
              Informe o link do seu perfil para extrair diretamente sua foto, capa, sobre,
              experiências, formação, projetos, certificados, cursos, prêmios, idiomas e posts.
            </p>
          </div>

          {analise && (
            <button
              type="button"
              onClick={handleExportarJson}
              className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold theme-muted border flex items-center gap-1.5 hover:opacity-85 cursor-pointer"
              title="Baixar todos os dados coletados em JSON"
            >
              <Icon name="download" className="w-4 h-4" />
              <span>Exportar JSON Completo</span>
            </button>
          )}
        </div>

        <form onSubmit={handleAnalisar} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold block mb-1.5">
                Link do seu Perfil no LinkedIn *
              </label>
              <input
                type="text"
                required
                value={linkedinUrl}
                onChange={(e) => setLinkedinUrl(e.target.value)}
                placeholder="https://www.linkedin.com/in/seu-usuario"
                className="w-full theme-muted border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={coletando}
                className="w-full sm:w-auto theme-btn-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 h-[42px]"
              >
                {coletando ? (
                  <>
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>Extraindo seções do LinkedIn...</span>
                  </>
                ) : (
                  <>
                    <Icon name="chartBar" className="w-4 h-4" />
                    <span>{analise ? 'Reanalisar Perfil' : 'Analisar Perfil LinkedIn'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <label className="flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={sincronizarAreas}
                onChange={(e) => setSincronizarAreas(e.target.checked)}
              />
              <span>
                Sincronizar automaticamente as skills detectadas com minhas Áreas de Interesse
              </span>
            </label>

            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setLinkedinUrl('https://www.linkedin.com/in/kaua-ribeiro17')}
                className="font-semibold theme-accent-text hover:underline cursor-pointer"
              >
                Usar meu perfil (kaua-ribeiro17)
              </button>
              <button
                type="button"
                onClick={() => setMostrarOpcoesApi((v) => !v)}
                className="font-semibold theme-text-secondary hover:underline cursor-pointer"
              >
                {mostrarOpcoesApi
                  ? 'Ocultar chaves opcionais'
                  : 'Chaves de API extras (opcional)'}
              </button>
            </div>
          </div>

          {mostrarOpcoesApi && (
            <div className="theme-muted border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="sm:col-span-3 theme-text-secondary">
                <strong>Coleta nativa gratuita já ativa:</strong> o sistema extrai todas as seções
                públicas sem precisar de chave. Caso queira usar chaves opcionais de terceiros
                (Scrapingdog, Apify ou RapidAPI), preencha abaixo:
              </div>
              <div>
                <label className="font-bold block mb-1">Scrapingdog Key (opcional)</label>
                <input
                  type="password"
                  value={scrapingdogKey}
                  onChange={(e) => setScrapingdogKey(e.target.value)}
                  placeholder="Chave gratuita Scrapingdog"
                  className="w-full theme-surface border rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">Apify API Token (opcional)</label>
                <input
                  type="password"
                  value={apifyToken}
                  onChange={(e) => setApifyToken(e.target.value)}
                  placeholder="apify_api_..."
                  className="w-full theme-surface border rounded-lg px-3 py-2 text-xs"
                />
              </div>
              <div>
                <label className="font-bold block mb-1">RapidAPI Key (opcional)</label>
                <input
                  type="password"
                  value={rapidapiKey}
                  onChange={(e) => setRapidapiKey(e.target.value)}
                  placeholder="Fresh LinkedIn Profile Data"
                  className="w-full theme-surface border rounded-lg px-3 py-2 text-xs"
                />
              </div>
            </div>
          )}
        </form>
      </section>

      {/* ==========================================
          2. RESULTADO COMPLETO DO PERFIL LINKEDIN
          ========================================== */}
      {!analise ? (
        <section className="theme-surface border rounded-2xl p-10 text-center space-y-2">
          <p className="text-base font-bold">Nenhum perfil analisado ainda.</p>
          <p className="text-xs sm:text-sm theme-text-secondary max-w-lg mx-auto">
            Cole o link do seu LinkedIn acima e clique em <strong>Analisar Perfil LinkedIn</strong>{' '}
            para extrair todas as seções reais do seu perfil e calcular seu diagnóstico!
          </p>
        </section>
      ) : (
        <div className="space-y-6">
          {/* ==========================================
              TOPO: HERO DO PERFIL (8 COL) + SCORE & PILARES (4 COL)
              ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* HERO CARD ESTILO LINKEDIN COM BANNER E FOTO REAL */}
            <section className="lg:col-span-8 theme-surface border rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
              <div>
                {/* Capa / Banner extraída diretamente do LinkedIn */}
                <div className="h-28 sm:h-36 w-full bg-gradient-to-r from-[#003057] via-[#0a4d8c] to-[#126ae2] relative overflow-hidden">
                  {analise.banner_url && (
                    <img
                      src={analise.banner_url}
                      alt="Capa do LinkedIn"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="px-6 pb-6">
                  {/* Avatar sobreposto + Botões de Links Extraídos */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-4 relative z-10">
                    {analise.foto_url ? (
                      <img
                        src={analise.foto_url}
                        alt={analise.nome_completo}
                        className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[var(--bg-surface)] shadow-lg object-cover bg-slate-800 shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[var(--bg-surface)] shadow-lg bg-[#003057] text-white flex items-center justify-center text-2xl font-extrabold shrink-0">
                        {iniciais}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-2">
                      {analise.sites?.map((site) => (
                        <a
                          key={site.url}
                          href={site.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-xl text-xs font-bold theme-muted border hover:opacity-85 inline-flex items-center gap-1.5"
                        >
                          <Icon name="link" className="w-3.5 h-3.5 theme-accent-text" />
                          <span>{site.rotulo} ↗</span>
                        </a>
                      ))}
                      <a
                        href={analise.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.5 rounded-xl text-xs font-bold theme-btn-primary inline-flex items-center gap-1.5"
                      >
                        <Icon name="link" className="w-3.5 h-3.5" />
                        <span>Abrir LinkedIn ↗</span>
                      </a>
                    </div>
                  </div>

                  {/* Nome, Headline, Instituição, Localidade e Rede */}
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-xl sm:text-2xl font-extrabold">
                        {analise.nome_completo}
                      </h3>
                      {analise.nivel_perfil && (
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border ${badgeNivel}`}
                        >
                          {analise.nivel_perfil}
                        </span>
                      )}
                    </div>

                    {analise.headline && (
                      <p className="text-sm sm:text-base font-semibold theme-accent-text leading-snug">
                        {analise.headline}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs theme-text-secondary pt-1">
                      {analise.instituicao_atual && (
                        <span className="font-semibold flex items-center gap-1">
                          <Icon name="cap" className="w-3.5 h-3.5 theme-accent-text" />
                          {analise.instituicao_atual}
                        </span>
                      )}
                      {analise.localizacao && <span>📍 {analise.localizacao}</span>}
                      {analise.conexoes_ou_seguidores && (
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">
                          👥 {analise.conexoes_ou_seguidores}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Seção Sobre (Resumo extraído diretamente do perfil) */}
                  {analise.resumo && (
                    <div className="mt-5 theme-muted border rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary">
                          Seção Sobre / Resumo do Perfil
                        </span>
                        {analise.resumo.endsWith('…') && (
                          <span className="text-[10px] theme-text-secondary italic">
                            Prévia pública do LinkedIn
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                        {analise.resumo}
                      </p>
                    </div>
                  )}

                  {/* Competências e Idiomas */}
                  <div className="mt-5 space-y-3">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block mb-2">
                        Competências e Tecnologias Extraídas do Perfil ({analise.skills?.length || 0})
                      </span>
                      {analise.skills?.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {analise.skills.map((sk) => (
                            <span
                              key={sk}
                              className="text-xs font-bold px-3 py-1 rounded-full theme-badge-soft"
                            >
                              {sk}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs theme-text-secondary">
                          Nenhuma tecnologia-chave identificada nas seções públicas.
                        </p>
                      )}
                    </div>

                    {analise.idiomas?.length > 0 && (
                      <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary mr-1">
                          Idiomas:
                        </span>
                        {analise.idiomas.map((idItem, i) => (
                          <span
                            key={i}
                            className="text-xs font-semibold px-2.5 py-1 rounded-lg theme-muted border"
                          >
                            🌐 <strong>{idItem.idioma}</strong>
                            {idItem.nivel ? ` • ${idItem.nivel}` : ''}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Barra inferior de resumo quantitativo das seções encontradas */}
              <div className="px-6 py-3.5 bg-black/[0.03] dark:bg-white/[0.03] border-t border-[var(--border-subtle)] grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                <div>
                  <strong className="block text-sm font-extrabold">{totalExp}</strong>
                  <span className="text-[11px] theme-text-secondary">Experiências</span>
                </div>
                <div>
                  <strong className="block text-sm font-extrabold">{totalEdu}</strong>
                  <span className="text-[11px] theme-text-secondary">Formações</span>
                </div>
                <div>
                  <strong className="block text-sm font-extrabold">
                    {analise.projetos?.length || 0}
                  </strong>
                  <span className="text-[11px] theme-text-secondary">Projetos</span>
                </div>
                <div>
                  <strong className="block text-sm font-extrabold">
                    {(analise.certificacoes?.length || 0) + (analise.cursos?.length || 0)}
                  </strong>
                  <span className="text-[11px] theme-text-secondary">Cert. &amp; Cursos</span>
                </div>
                <div>
                  <strong className="block text-sm font-extrabold">
                    {analise.premios?.length || 0}
                  </strong>
                  <span className="text-[11px] theme-text-secondary">Prêmios</span>
                </div>
                <div>
                  <strong className="block text-sm font-extrabold">
                    {analise.publicacoes?.length || 0}
                  </strong>
                  <span className="text-[11px] theme-text-secondary">Publicações</span>
                </div>
              </div>
            </section>

            {/* PAINEL DE PONTUAÇÃO DETALHADA POR PILARES (4 COLUNAS) */}
            <section className="lg:col-span-4 theme-surface border rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-5">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider theme-text-secondary">
                    Índice de Força do Perfil
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className={`text-5xl font-extrabold ${corScore}`}>{score}</span>
                    <span className="text-sm font-bold theme-text-secondary">/ 100 pts</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden mt-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barraScore}`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown dos 6 pilares */}
                {analise.pilares_nota?.length > 0 && (
                  <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)]">
                    <span className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block">
                      Composição da Nota por Seção
                    </span>
                    {analise.pilares_nota.map((pilar, idx) => {
                      const pct = Math.round((pilar.pontos / (pilar.maximo || 20)) * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold truncate pr-2">{pilar.nome}</span>
                            <strong className="shrink-0">
                              {pilar.pontos}/{pilar.maximo}
                            </strong>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-blue-600 dark:bg-sky-400 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          {pilar.detalhe && (
                            <p className="text-[10px] theme-text-secondary truncate">
                              {pilar.detalhe}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="text-[11px] space-y-1">
                  <p className="flex justify-between gap-2">
                    <span className="theme-text-secondary">Fonte:</span>
                    <strong className="text-right truncate max-w-[200px]">
                      {analise.fonte_coleta}
                    </strong>
                  </p>
                  <p className="flex justify-between gap-2">
                    <span className="theme-text-secondary">Coletado em:</span>
                    <strong>{analise.atualizado_em}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onIrParaVagasLinkedIn}
                  className="w-full theme-btn-primary py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Buscar Vagas no LinkedIn p/ meu Perfil →
                </button>
              </div>
            </section>
          </div>

          {/* ==========================================
              DIAGNÓSTICO: PONTOS FORTES E OTIMIZAÇÕES
              ========================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-base font-extrabold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Icon name="check" className="w-5 h-5" />
                Pontos Fortes Detectados ({analise.pontos_fortes?.length || 0})
              </h3>
              {analise.pontos_fortes?.length > 0 ? (
                <ul className="space-y-2 text-xs sm:text-sm">
                  {analise.pontos_fortes.map((pf, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">•</span>
                      <span>{pf}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs theme-text-secondary">
                  Complete mais seções públicas do seu LinkedIn para destravar destaques.
                </p>
              )}
            </section>

            <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-3">
              <h3 className="text-base font-extrabold flex items-center gap-2 text-amber-500">
                <Icon name="chartPie" className="w-5 h-5" />
                Recomendações de Otimização
              </h3>
              {analise.sugestoes_melhoria?.length > 0 ? (
                <ul className="space-y-2 text-xs sm:text-sm">
                  {analise.sugestoes_melhoria.map((sug, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">→</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                  Parabéns! Todas as seções estratégicas do seu perfil estão completas, visíveis e
                  otimizadas para recrutadores.
                </p>
              )}
            </section>
          </div>

          {/* ==========================================
              FILTRO RÁPIDO DAS SEÇÕES EXTRAÍDAS DO LINKEDIN
              ========================================== */}
          {abasDisponiveis.length > 1 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {abasDisponiveis.map((ab) => (
                <button
                  key={ab.id}
                  type="button"
                  onClick={() => setAbaSecoes(ab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    abaSecoes === ab.id
                      ? 'theme-btn-primary border-transparent shadow-xs'
                      : 'theme-surface hover:opacity-85'
                  }`}
                >
                  {ab.rotulo}
                </button>
              ))}
            </div>
          )}

          {/* ==========================================
              SEÇÃO: PROJETOS EXTRAÍDOS DO PERFIL
              ========================================== */}
          {exibirSecao('projetos') && analise.projetos?.length > 0 && (
            <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <Icon name="folder" className="w-5 h-5 theme-accent-text" />
                Projetos em Destaque no Perfil ({analise.projetos.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analise.projetos.map((proj, i) => (
                  <article
                    key={i}
                    className="theme-muted border rounded-xl p-4 flex flex-col justify-between gap-2.5"
                  >
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-extrabold leading-snug">{proj.titulo}</h4>
                      {proj.periodo && (
                        <span className="inline-block text-[11px] font-bold px-2 py-0.5 rounded-md theme-badge-soft">
                          {proj.periodo}
                        </span>
                      )}
                      {proj.descricao && (
                        <p className="text-xs theme-text-secondary leading-relaxed whitespace-pre-line pt-1">
                          {proj.descricao}
                        </p>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* ==========================================
              SEÇÃO: EXPERIÊNCIAS E FORMAÇÃO ACADÊMICA
              ========================================== */}
          {exibirSecao('trajetoria') &&
            (analise.experiencias?.length > 0 || analise.formacao?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <Icon name="folder" className="w-4 h-4 theme-accent-text" />
                    Experiências Registradas ({totalExp})
                  </h3>
                  <div className="space-y-3">
                    {analise.experiencias.map((exp, i) => (
                      <div key={i} className="theme-muted border rounded-xl p-4 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-extrabold">{exp.empresa || exp.cargo}</p>
                          {exp.oculto_visitante && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 shrink-0">
                              Modo visitante
                            </span>
                          )}
                        </div>
                        {exp.empresa && exp.cargo && (
                          <p className="text-xs font-semibold theme-accent-text">{exp.cargo}</p>
                        )}
                        {(exp.periodo || exp.localizacao) && (
                          <p className="text-[11px] theme-text-secondary">
                            {[exp.periodo, exp.localizacao].filter(Boolean).join(' • ')}
                          </p>
                        )}
                        {exp.descricao && (
                          <p className="text-xs theme-text-secondary pt-1 leading-relaxed">
                            {exp.descricao}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </section>

                <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-3">
                  <h3 className="text-base font-extrabold flex items-center gap-2">
                    <Icon name="cap" className="w-4 h-4 theme-accent-text" />
                    Formação Acadêmica ({totalEdu})
                  </h3>
                  <div className="space-y-3">
                    {analise.formacao.map((ed, i) => (
                      <div key={i} className="theme-muted border rounded-xl p-4 space-y-1">
                        <p className="text-sm font-extrabold">{ed.instituicao}</p>
                        {ed.curso && (
                          <p className="text-xs font-semibold theme-accent-text">{ed.curso}</p>
                        )}
                        {ed.periodo && (
                          <p className="text-[11px] theme-text-secondary">Período: {ed.periodo}</p>
                        )}
                        {ed.nota_ou_detalhe && (
                          <span className="inline-block mt-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            {ed.nota_ou_detalhe}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

          {/* ==========================================
              SEÇÃO: LICENÇAS & CERTIFICADOS + CURSOS
              ========================================== */}
          {exibirSecao('certificados') &&
            (analise.certificacoes?.length > 0 || analise.cursos?.length > 0) && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {analise.certificacoes?.length > 0 && (
                  <section className="lg:col-span-6 theme-surface border rounded-2xl p-6 shadow-xs space-y-3">
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      <Icon name="check" className="w-4 h-4 text-emerald-600" />
                      Licenças e Certificados ({analise.certificacoes.length})
                    </h3>
                    <div className="space-y-3">
                      {analise.certificacoes.map((cert, i) => (
                        <div key={i} className="theme-muted border rounded-xl p-4 space-y-1">
                          <p className="text-sm font-extrabold">{cert.nome}</p>
                          {cert.emissor && (
                            <p className="text-xs font-semibold theme-accent-text">
                              {cert.emissor}
                            </p>
                          )}
                          {cert.data && (
                            <p className="text-[11px] theme-text-secondary">{cert.data}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {analise.cursos?.length > 0 && (
                  <section
                    className={`${
                      analise.certificacoes?.length > 0 ? 'lg:col-span-6' : 'lg:col-span-12'
                    } theme-surface border rounded-2xl p-6 shadow-xs space-y-3`}
                  >
                    <h3 className="text-base font-extrabold flex items-center gap-2">
                      <Icon name="file" className="w-4 h-4 theme-accent-text" />
                      Cursos Complementares ({analise.cursos.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {analise.cursos.map((curso, i) => (
                        <span
                          key={i}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl theme-muted border"
                        >
                          {curso}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}

          {/* ==========================================
              SEÇÃO: RECONHECIMENTOS E PRÊMIOS
              ========================================== */}
          {exibirSecao('premios') && analise.premios?.length > 0 && (
            <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <Icon name="chartBar" className="w-5 h-5 text-amber-500" />
                Reconhecimentos e Prêmios ({analise.premios.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analise.premios.map((pr, i) => (
                  <div key={i} className="theme-muted border rounded-xl p-4 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-extrabold">🏆 {pr.titulo}</p>
                      {pr.data && (
                        <span className="text-[11px] font-bold theme-text-secondary shrink-0">
                          {pr.data}
                        </span>
                      )}
                    </div>
                    {pr.emissor && (
                      <p className="text-xs font-semibold theme-accent-text">{pr.emissor}</p>
                    )}
                    {pr.descricao && (
                      <p className="text-xs theme-text-secondary leading-relaxed whitespace-pre-line">
                        {pr.descricao}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ==========================================
              SEÇÃO: PUBLICAÇÕES AUTORAIS NO LINKEDIN
              ========================================== */}
          {exibirSecao('publicacoes') && analise.publicacoes?.length > 0 && (
            <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-4">
              <h3 className="text-base sm:text-lg font-extrabold flex items-center gap-2">
                <Icon name="reply" className="w-5 h-5 theme-accent-text" />
                Publicações Autorais Recentes no LinkedIn ({analise.publicacoes.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analise.publicacoes.map((pub, i) => (
                  <article
                    key={i}
                    className="theme-muted border rounded-xl p-4 flex flex-col justify-between gap-3"
                  >
                    <p className="text-xs sm:text-sm theme-text-secondary leading-relaxed whitespace-pre-line line-clamp-5">
                      {pub.texto}
                    </p>
                    <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
                      <span className="font-semibold theme-text-secondary">
                        {pub.data ? `📅 ${pub.data}` : 'Publicação'} • 👍 {pub.curtidas} reações
                      </span>
                      {pub.url && (
                        <a
                          href={pub.url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-bold theme-accent-text hover:underline"
                        >
                          Abrir post ↗
                        </a>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
