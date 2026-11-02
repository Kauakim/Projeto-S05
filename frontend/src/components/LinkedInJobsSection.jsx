import { useMemo, useState } from 'react';
import Icon from './Icon';
import { api } from '../services/api';

const LOCAIS_SUGERIDOS = [
  'Brazil',
  'Minas Gerais, Brazil',
  'São Paulo, Brazil',
  'Santa Rita do Sapucaí, Minas Gerais, Brazil',
];

export default function LinkedInJobsSection({
  usuario,
  analiseLinkedIn,
  vagasLinkedIn = [],
  onVagasAtualizadas,
  onIrParaAnalisePerfil,
  onNotify,
}) {
  // Sugestões de áreas baseadas no perfil do aluno e nas skills coletadas do LinkedIn
  const sugestoesArea = useMemo(() => {
    const lista = [];
    if (usuario?.areas_interesse) {
      usuario.areas_interesse.split(',').forEach((a) => {
        const limpo = a.trim();
        if (limpo && !lista.includes(limpo)) lista.push(limpo);
      });
    }
    if (analiseLinkedIn?.skills?.length) {
      analiseLinkedIn.skills.forEach((sk) => {
        if (sk && !lista.includes(sk)) lista.push(sk);
      });
    }
    if (usuario?.curso && !lista.includes(usuario.curso)) {
      lista.push(`Estágio ${usuario.curso}`);
    }
    return lista.slice(0, 8);
  }, [usuario, analiseLinkedIn]);

  const [termoBusca, setTermoBusca] = useState(
    () => sugestoesArea[0] || usuario?.curso || 'Desenvolvedor Software'
  );
  const [localizacao, setLocalizacao] = useState('Brazil');
  const [apenasRemoto, setApenasRemoto] = useState(false);
  const [buscando, setBuscando] = useState(false);

  const dispararBusca = async (termoCustom) => {
    const termoFinal = typeof termoCustom === 'string' ? termoCustom : termoBusca;
    setBuscando(true);
    try {
      const resultado = await api.buscarVagasLinkedIn({
        termo_busca: termoFinal,
        localizacao,
        apenas_remoto: apenasRemoto,
        limite: 10,
      });
      onVagasAtualizadas(resultado);
      onNotify(
        `${resultado.length} vagas reais coletadas do LinkedIn para "${termoFinal}" e salvas no banco!`
      );
    } catch (err) {
      onNotify(err.message || 'Erro ao buscar vagas no LinkedIn.', 'error');
    } finally {
      setBuscando(false);
    }
  };

  const handleExportarVagasJson = () => {
    const blob = new Blob([JSON.stringify(vagasLinkedIn, null, 2)], {
      type: 'application/json;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vagas_linkedin_coletadas.json';
    a.click();
    URL.revokeObjectURL(url);
    onNotify('JSON das vagas do LinkedIn exportado!');
  };

  return (
    <div className="space-y-5">
      {/* ==========================================
          PAINEL DE BUSCA VINCULADO À ÁREA DO USUÁRIO
          ========================================== */}
      <div className="theme-surface border rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Icon name="link" className="w-5 h-5 theme-accent-text" />
              Busca em Tempo Real no LinkedIn (de acordo com sua Área)
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onIrParaAnalisePerfil}
              className="px-3 py-2 rounded-xl text-xs font-bold theme-badge-soft hover:opacity-90 cursor-pointer"
            >
              {analiseLinkedIn ? 'Ver meu Perfil Analisado' : 'Analisar meu LinkedIn'}
            </button>
          </div>
        </div>

        {/* Atalhos rápidos das Áreas de Interesse & Skills do aluno */}
        {sugestoesArea.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block">
              Suas áreas &amp; skills (clique para buscar no LinkedIn):
            </span>
            <div className="flex flex-wrap gap-1.5">
              {sugestoesArea.map((area) => {
                const selecionado = termoBusca.toLowerCase() === area.toLowerCase();
                return (
                  <button
                    key={area}
                    type="button"
                    disabled={buscando}
                    onClick={() => {
                      setTermoBusca(area);
                      dispararBusca(area);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition cursor-pointer ${
                      selecionado
                        ? 'theme-btn-primary border-transparent'
                        : 'theme-muted hover:opacity-80'
                    }`}
                  >
                    {area}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Formulário de busca customizada */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            dispararBusca();
          }}
          className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-1"
        >
          <div className="md:col-span-5">
            <label className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block mb-1">
              Cargo / Área / Tecnologia
            </label>
            <input
              type="text"
              required
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Ex: Estágio Engenharia de Software, Python, React..."
              className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block mb-1">
              Localidade no LinkedIn
            </label>
            <select
              value={localizacao}
              onChange={(e) => setLocalizacao(e.target.value)}
              className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
            >
              {LOCAIS_SUGERIDOS.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3 flex flex-col justify-end gap-2">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={apenasRemoto}
                onChange={(e) => setApenasRemoto(e.target.checked)}
              />
              <span>Somente vagas remotas</span>
            </label>

            <button
              type="submit"
              disabled={buscando}
              className="w-full theme-btn-primary py-2 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {buscando ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Buscando...</span>
                </>
              ) : (
                <span>Buscar no LinkedIn</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ==========================================
          LISTAGEM DE VAGAS COLETADAS DO LINKEDIN
          ========================================== */}
      {vagasLinkedIn.length === 0 ? (
        <div className="theme-surface border rounded-2xl p-10 text-center space-y-3">
          <p className="font-extrabold text-base">
            Nenhuma vaga externa do LinkedIn coletada ainda para esta conta.
          </p>
          <p className="text-xs sm:text-sm theme-text-secondary max-w-lg mx-auto">
            Clique em qualquer uma das suas áreas acima ou no botão{' '}
            <strong>Buscar no LinkedIn</strong> para puxar vagas reais em tempo real e salvá-las no
            banco!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vagasLinkedIn.map((vaga) => {
            const altoMatch = vaga.compatibilidade >= 78;
            return (
              <article
                key={vaga.id}
                className="theme-surface border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {vaga.logo_empresa ? (
                        <img
                          src={vaga.logo_empresa}
                          alt={vaga.empresa}
                          className="w-11 h-11 rounded-xl object-contain bg-white border p-1 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl theme-badge-soft flex items-center justify-center font-extrabold text-sm shrink-0">
                          {vaga.empresa?.slice(0, 2).toUpperCase() || 'IN'}
                        </div>
                      )}

                      <div className="min-w-0">
                        <h3 className="text-base font-extrabold leading-snug line-clamp-2">
                          {vaga.titulo}
                        </h3>
                        <p className="text-xs font-semibold theme-accent-text truncate">
                          {vaga.empresa} •{' '}
                          <span className="font-normal theme-text-secondary">
                            {vaga.localizacao}
                          </span>
                        </p>
                      </div>
                    </div>

                    <span
                      className={`shrink-0 text-xs font-extrabold px-2.5 py-1 rounded-full ${
                        altoMatch
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                          : 'theme-badge-soft'
                      }`}
                      title="Compatibilidade calculada com seu perfil e áreas de interesse"
                    >
                      {vaga.compatibilidade}% Match
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="font-semibold px-2.5 py-0.5 rounded-md theme-muted border">
                      {vaga.modalidade}
                    </span>
                    {vaga.data_publicacao && (
                      <span className="px-2.5 py-0.5 rounded-md theme-muted border theme-text-secondary">
                        Publicada: {vaga.data_publicacao}
                      </span>
                    )}
                    <span className="px-2.5 py-0.5 rounded-md theme-muted border theme-text-secondary">
                      Busca: {vaga.termo_busca}
                    </span>
                  </div>

                  {vaga.skills_match?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {vaga.skills_match.map((sk) => (
                        <span
                          key={sk}
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-sky-300"
                        >
                          ✓ {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                  <span className="text-[11px] theme-text-secondary">
                    Coletada em {vaga.coletado_em}
                  </span>

                  <a
                    href={vaga.job_url}
                    target="_blank"
                    rel="noreferrer"
                    className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition"
                  >
                    <Icon name="link" className="w-3.5 h-3.5" />
                    <span>Ver Vaga no LinkedIn ↗</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

