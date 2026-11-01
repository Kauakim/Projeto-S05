import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import LinkedInJobsSection from '../components/LinkedInJobsSection';
import { api } from '../services/api';

const TIPOS_VAGA = ['todas', 'Estágio', 'Iniciação Científica', 'Júnior', 'Trainee'];
const MODALIDADES = ['todas', 'Presencial', 'Híbrido', 'Remoto'];
const CATEGORIAS_NOTICIA = [
  'todas',
  'Inovação',
  'Pesquisa',
  'Acadêmico',
  'Eventos',
  'Carreira',
  'Região',
];
const ORIGENS_NOTICIA = [
  { id: 'todas', label: 'Inatel + Região' },
  { id: 'inatel', label: 'Só Inatel' },
  { id: 'regiao', label: 'Santa Rita & Sul de MG' },
];

function parseConteudoResumao(conteudo = '') {
  const texto = (conteudo || '').trim();
  if (!texto.includes('RESUMÃO EM TÓPICOS:')) {
    return { topicos: [], paragrafos: texto ? texto.split(/\n{2,}/) : [] };
  }
  const [blocoTopicos, blocoSintese = ''] = texto.split(/SÍNTESE DA REPORTAGEM:\s*/i);
  const topicos = blocoTopicos
    .replace(/RESUMÃO EM TÓPICOS:\s*/i, '')
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
  const titulo = (noticia?.titulo || '').toLowerCase();
  return url.includes('inatel.br') || fonte.includes('inatel') || titulo.includes('inatel');
}

const VAGA_VAZIA = {
  titulo: '',
  empresa: '',
  tipo: 'Estágio',
  modalidade: 'Híbrido',
  localizacao: 'Santa Rita do Sapucaí - MG',
  bolsa_ou_salario: '',
  area: 'Desenvolvimento de Software',
  requisitos: '',
  descricao: '',
  prazo: '30/11/2026',
  contato_email: 'nesp@inatel.br',
};

const NOTICIA_VAZIA = {
  titulo: '',
  resumo: '',
  conteudo: '',
  categoria: 'Inovação',
  autor: 'Portal Inatel',
  url_original: '',
  tempo_leitura: '3 min',
  imagem_url: '',
  destaque: false,
};

export default function VagasNoticiasPage({
  usuario,
  vagas = [],
  noticias = [],
  vagasLinkedIn = [],
  analiseLinkedIn = null,
  abaSolicitada = null,
  onAbaSolicitadaConsumida,
  noticiaSolicitada = null,
  onNoticiaSolicitadaConsumida,
  onVagasLinkedInAtualizadas,
  onIrParaAnalisePerfil,
  vagasSalvasIds = [],
  onToggleSalvarVaga,
  onRefreshVagasECandidaturas,
  onRefreshNoticias,
  onSetNoticias,
  onNotify,
}) {
  const [abaAtiva, setAbaAtiva] = useState('vagas'); // 'vagas' | 'linkedin-vagas' | 'noticias'

  useEffect(() => {
    if (abaSolicitada) {
      setAbaAtiva(abaSolicitada);
      if (onAbaSolicitadaConsumida) onAbaSolicitadaConsumida();
    }
  }, [abaSolicitada, onAbaSolicitadaConsumida]);

  // Filtros de Vagas
  const [buscaVaga, setBuscaVaga] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('todas');
  const [filtroModalidade, setFiltroModalidade] = useState('todas');
  const [somenteSalvas, setSomenteSalvas] = useState(false);

  // Filtros de Notícias
  const [buscaNoticia, setBuscaNoticia] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [filtroOrigem, setFiltroOrigem] = useState('todas');
  const [sincronizandoNoticias, setSincronizandoNoticias] = useState(false);

  // Modais
  const [vagaParaCandidatar, setVagaParaCandidatar] = useState(null);
  const [formCandidatura, setFormCandidatura] = useState({
    mensagem: '',
    link_portfolio: usuario?.github || '',
  });
  const [enviandoCandidatura, setEnviandoCandidatura] = useState(false);

  const [modalNovaVaga, setModalNovaVaga] = useState(false);
  const [formNovaVaga, setFormNovaVaga] = useState(VAGA_VAZIA);
  const [salvandoVaga, setSalvandoVaga] = useState(false);

  const [noticiaAberta, setNoticiaAberta] = useState(null);
  const [modalNovaNoticia, setModalNovaNoticia] = useState(false);
  const [formNovaNoticia, setFormNovaNoticia] = useState(NOTICIA_VAZIA);
  const [salvandoNoticia, setSalvandoNoticia] = useState(false);

  // Lista filtrada de Vagas
  const vagasFiltradas = useMemo(() => {
    return vagas.filter((v) => {
      if (somenteSalvas && !vagasSalvasIds.includes(v.id)) return false;
      if (filtroTipo !== 'todas' && v.tipo.toLowerCase() !== filtroTipo.toLowerCase()) return false;
      if (
        filtroModalidade !== 'todas' &&
        v.modalidade.toLowerCase() !== filtroModalidade.toLowerCase()
      ) {
        return false;
      }
      if (buscaVaga.trim()) {
        const q = buscaVaga.toLowerCase();
        const alvo = `${v.titulo} ${v.empresa} ${v.requisitos} ${v.area} ${v.descricao}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }, [vagas, somenteSalvas, vagasSalvasIds, filtroTipo, filtroModalidade, buscaVaga]);

  // Lista filtrada de Notícias
  const noticiasFiltradas = useMemo(() => {
    return noticias.filter((n) => {
      if (filtroOrigem === 'inatel' && !ehNoticiaInatel(n)) return false;
      if (filtroOrigem === 'regiao' && ehNoticiaInatel(n)) return false;
      if (
        filtroCategoria !== 'todas' &&
        n.categoria.toLowerCase() !== filtroCategoria.toLowerCase()
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
  }, [noticias, filtroOrigem, filtroCategoria, buscaNoticia]);

  // Ações de Vagas
  const abrirModalCandidatura = (vaga) => {
    setFormCandidatura({
      mensagem: `Olá! Sou ${usuario?.nome || 'estudante'} (${usuario?.curso || 'Inatel'}, ${usuario?.periodo || 6}º período) e tenho grande interesse nesta oportunidade.`,
      link_portfolio: usuario?.github || usuario?.linkedin || '',
    });
    setVagaParaCandidatar(vaga);
  };

  const handleConfirmarCandidatura = async (e) => {
    e.preventDefault();
    if (!vagaParaCandidatar) return;
    setEnviandoCandidatura(true);
    try {
      await api.candidatarVaga(vagaParaCandidatar.id, formCandidatura);
      await onRefreshVagasECandidaturas();
      setVagaParaCandidatar(null);
      onNotify(`Candidatura enviada para "${vagaParaCandidatar.titulo}"!`);
    } catch (err) {
      onNotify(err.message || 'Não foi possível enviar a candidatura.', 'error');
    } finally {
      setEnviandoCandidatura(false);
    }
  };

  const handleCriarVaga = async (e) => {
    e.preventDefault();
    setSalvandoVaga(true);
    try {
      await api.createVaga(formNovaVaga);
      await onRefreshVagasECandidaturas();
      setFormNovaVaga(VAGA_VAZIA);
      setModalNovaVaga(false);
      onNotify('Nova vaga publicada com sucesso no Mural NESP!');
    } catch (err) {
      onNotify(err.message || 'Erro ao publicar vaga.', 'error');
    } finally {
      setSalvandoVaga(false);
    }
  };

  const handleExcluirVaga = async (vaga) => {
    try {
      await api.deleteVaga(vaga.id);
      await onRefreshVagasECandidaturas();
      onNotify(`Vaga "${vaga.titulo}" removida.`);
    } catch (err) {
      onNotify(err.message || 'Erro ao remover vaga.', 'error');
    }
  };

  // Ações de Notícias
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
      setAbaAtiva('noticias');
      handleAbrirNoticia(noticiaSolicitada);
      if (onNoticiaSolicitadaConsumida) onNoticiaSolicitadaConsumida();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noticiaSolicitada]);

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
        `Notícias reais atualizadas! ${res.total_ativas} matérias do Inatel e da região disponíveis.`
      );
    } catch (err) {
      onNotify(err.message || 'Erro ao sincronizar notícias reais.', 'error');
    } finally {
      setSincronizandoNoticias(false);
    }
  };

  const handleCurtirNoticia = async (noticiaId) => {
    try {
      const atualizada = await api.curtirNoticia(noticiaId);
      if (noticiaAberta?.id === noticiaId) {
        setNoticiaAberta(atualizada);
      }
      await onRefreshNoticias();
    } catch (err) {
      onNotify(err.message || 'Não foi possível registrar curtida.', 'error');
    }
  };

  const handleCriarNoticia = async (e) => {
    e.preventDefault();
    setSalvandoNoticia(true);
    try {
      await api.createNoticia(formNovaNoticia);
      await onRefreshNoticias();
      setFormNovaNoticia(NOTICIA_VAZIA);
      setModalNovaNoticia(false);
      onNotify('Notícia publicada no Mural Inatel!');
    } catch (err) {
      onNotify(err.message || 'Erro ao publicar notícia.', 'error');
    } finally {
      setSalvandoNoticia(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ==========================================
          CABEÇALHO DO PORTAL DE VAGAS & NOTÍCIAS
          ========================================== */}
      <section className="theme-surface border rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full theme-badge-soft">
              <Icon name="link" className="w-3.5 h-3.5" />
              Integração NESP Carreiras &amp; Comunicação Inatel
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Central de Vagas &amp; Notícias
            </h1>
            <p className="text-sm theme-text-secondary max-w-2xl">
              Explore oportunidades de estágio, iniciação científica e emprego no Vale da Eletrônica
              ou acompanhe as últimas notícias acadêmicas e tecnológicas do campus.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {abaAtiva !== 'linkedin-vagas' ? (
              <button
                type="button"
                onClick={() =>
                  abaAtiva === 'vagas' ? setModalNovaVaga(true) : setModalNovaNoticia(true)
                }
                className="theme-btn-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Icon name="plus" className="w-4 h-4" />
                <span>{abaAtiva === 'vagas' ? 'Publicar Vaga' : 'Publicar Notícia'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onIrParaAnalisePerfil}
                className="theme-btn-primary px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition cursor-pointer"
              >
                <Icon name="user" className="w-4 h-4" />
                <span>Meu Diagnóstico LinkedIn</span>
              </button>
            )}
          </div>
        </div>

        {/* Seletor Principal: Vagas NESP vs Vagas LinkedIn vs Notícias */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)] flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setAbaAtiva('vagas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition cursor-pointer ${
              abaAtiva === 'vagas'
                ? 'theme-btn-primary border-transparent shadow-xs'
                : 'theme-muted hover:opacity-85'
            }`}
          >
            <Icon name="cap" className="w-4 h-4" />
            <span>Mural de Vagas NESP</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/15">{vagas.length}</span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('linkedin-vagas')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition cursor-pointer ${
              abaAtiva === 'linkedin-vagas'
                ? 'theme-btn-primary border-transparent shadow-xs'
                : 'theme-muted hover:opacity-85'
            }`}
          >
            <Icon name="link" className="w-4 h-4" />
            <span>Vagas LinkedIn (Sua Área)</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/15">
              {vagasLinkedIn.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setAbaAtiva('noticias')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border transition cursor-pointer ${
              abaAtiva === 'noticias'
                ? 'theme-btn-primary border-transparent shadow-xs'
                : 'theme-muted hover:opacity-85'
            }`}
          >
            <Icon name="file" className="w-4 h-4" />
            <span>Notícias Inatel &amp; Região</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-black/15">{noticias.length}</span>
          </button>
        </div>
      </section>

      {/* ==========================================
          ABA LINKEDIN: BUSCA DE VAGAS POR ÁREA DO PERFIL
          ========================================== */}
      {abaAtiva === 'linkedin-vagas' && (
        <LinkedInJobsSection
          usuario={usuario}
          analiseLinkedIn={analiseLinkedIn}
          vagasLinkedIn={vagasLinkedIn}
          onVagasAtualizadas={onVagasLinkedInAtualizadas}
          onIrParaAnalisePerfil={onIrParaAnalisePerfil}
          onNotify={onNotify}
        />
      )}

      {/* ==========================================
          ABA 1: MURAL DE VAGAS (NESP)
          ========================================== */}
      {abaAtiva === 'vagas' && (
        <section className="space-y-5">
          {/* Barra de Busca e Filtros */}
          <div className="theme-surface border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-6">
                <label className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block mb-1">
                  Buscar por cargo, empresa ou tecnologia
                </label>
                <input
                  type="text"
                  value={buscaVaga}
                  onChange={(e) => setBuscaVaga(e.target.value)}
                  placeholder="Ex: React, Python, Ericsson, 6G, Embarcados..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-3">
                <label className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block mb-1">
                  Modalidade
                </label>
                <select
                  value={filtroModalidade}
                  onChange={(e) => setFiltroModalidade(e.target.value)}
                  className="w-full theme-muted border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MODALIDADES.map((m) => (
                    <option key={m} value={m}>
                      {m === 'todas' ? 'Todas as modalidades' : m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-3 flex items-end">
                <button
                  type="button"
                  onClick={() => setSomenteSalvas((v) => !v)}
                  className={`w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold border transition cursor-pointer ${
                    somenteSalvas
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'theme-muted hover:opacity-85'
                  }`}
                >
                  <Icon name="bookmark" className="w-4 h-4" />
                  <span>Salvas ({vagasSalvasIds.length})</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {TIPOS_VAGA.map((tipo) => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setFiltroTipo(tipo)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    filtroTipo === tipo
                      ? 'theme-btn-primary border-transparent'
                      : 'theme-muted hover:opacity-80'
                  }`}
                >
                  {tipo === 'todas' ? 'Todos os tipos' : tipo}
                </button>
              ))}
            </div>
          </div>

          {/* Listagem de Vagas */}
          {vagasFiltradas.length === 0 ? (
            <div className="theme-surface border rounded-2xl p-10 text-center space-y-2">
              <p className="font-bold text-base">Nenhuma vaga encontrada com esses filtros.</p>
              <p className="text-sm theme-text-secondary">
                Experimente limpar a busca ou publicar uma nova vaga de teste acima.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {vagasFiltradas.map((vaga) => {
                const salva = vagasSalvasIds.includes(vaga.id);
                const chipsRequisitos = vaga.requisitos
                  .split(',')
                  .map((r) => r.trim())
                  .filter(Boolean);

                return (
                  <article
                    key={vaga.id}
                    className="theme-surface border rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-lg theme-badge-soft">
                            {vaga.tipo}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg theme-muted border">
                            {vaga.modalidade}
                          </span>
                          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            {vaga.bolsa_ou_salario}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onToggleSalvarVaga(vaga.id)}
                            title={salva ? 'Remover dos salvos' : 'Salvar vaga'}
                            className={`p-2 rounded-lg border transition cursor-pointer ${
                              salva
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500'
                                : 'theme-muted hover:opacity-80 theme-text-secondary'
                            }`}
                          >
                            <Icon name="bookmark" className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExcluirVaga(vaga)}
                            title="Remover vaga"
                            className="p-2 rounded-lg border theme-muted hover:bg-red-500/10 hover:text-red-500 theme-text-secondary transition cursor-pointer"
                          >
                            <Icon name="trash" className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-extrabold leading-snug">{vaga.titulo}</h3>
                        <p className="text-sm font-semibold theme-accent-text mt-0.5">
                          {vaga.empresa} • <span className="font-normal theme-text-secondary">{vaga.localizacao}</span>
                        </p>
                      </div>

                      <p className="text-sm theme-text-secondary leading-relaxed">
                        {vaga.descricao}
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {chipsRequisitos.map((req) => (
                          <span
                            key={req}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-md theme-muted border"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-4 text-xs theme-text-secondary">
                        <span className="flex items-center gap-1">
                          <Icon name="calendar" className="w-3.5 h-3.5" />
                          Prazo: <strong>{vaga.prazo}</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="group" className="w-3.5 h-3.5" />
                          {vaga.total_candidaturas} cand.
                        </span>
                      </div>

                      {vaga.candidatado ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white">
                          <Icon name="check" className="w-3.5 h-3.5" />
                          Candidatura Enviada
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => abrirModalCandidatura(vaga)}
                          className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Icon name="reply" className="w-3.5 h-3.5" />
                          <span>Candidatar-se</span>
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ==========================================
          ABA 2: NOTÍCIAS REAIS DO INATEL & REGIÃO
          ========================================== */}
      {abaAtiva === 'noticias' && (
        <section className="space-y-5">
          {/* Painel de Sincronização ao Vivo + Busca + Origem + Categorias */}
          <div className="theme-surface border rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold uppercase tracking-wider theme-accent-text">
                  Coleta Real &amp; Resumão Automático (Sem Dados Mockados)
                </p>
                <p className="text-xs theme-text-secondary">
                  Matérias extraídas diretamente do Portal Inatel, g1 Sul de Minas e imprensa regional
                  de Santa Rita do Sapucaí, com síntese em tópicos e link direto para a fonte.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSincronizarNoticias}
                disabled={sincronizandoNoticias}
                className="shrink-0 theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer disabled:opacity-60"
              >
                {sincronizandoNoticias ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Coletando e resumindo...</span>
                  </>
                ) : (
                  <>
                    <Icon name="link" className="w-3.5 h-3.5" />
                    <span>Atualizar Notícias Reais</span>
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-end">
              <div className="lg:col-span-7">
                <label className="text-[11px] font-bold uppercase tracking-wider theme-text-secondary block mb-1">
                  Pesquisar notícias do Inatel e de Santa Rita do Sapucaí / Região
                </label>
                <input
                  type="text"
                  value={buscaNoticia}
                  onChange={(e) => setBuscaNoticia(e.target.value)}
                  placeholder="Buscar por xGMobile, Connect Summit, Santa Rita, vagas no Sul de Minas..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="lg:col-span-5 flex flex-wrap gap-1.5">
                {ORIGENS_NOTICIA.map((orig) => (
                  <button
                    key={orig.id}
                    type="button"
                    onClick={() => setFiltroOrigem(orig.id)}
                    className={`flex-1 min-w-[115px] px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      filtroOrigem === orig.id
                        ? 'theme-btn-primary border-transparent shadow-xs'
                        : 'theme-muted hover:opacity-85'
                    }`}
                  >
                    {orig.label}
                  </button>
                ))}
              </div>
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
              <p className="font-bold text-base">Nenhuma notícia encontrada com este filtro.</p>
              <p className="text-sm theme-text-secondary">
                Limpe os filtros acima ou clique em &ldquo;Atualizar Notícias Reais&rdquo; para buscar
                as últimas reportagens do Inatel e da região.
              </p>
              <button
                type="button"
                onClick={handleSincronizarNoticias}
                disabled={sincronizandoNoticias}
                className="theme-btn-primary px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sincronizandoNoticias ? 'Sincronizando...' : 'Buscar Notícias Reais Agora'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {noticiasFiltradas.map((noticia, idx) => {
                const isHero =
                  noticia.destaque &&
                  idx === 0 &&
                  filtroCategoria === 'todas' &&
                  filtroOrigem === 'todas' &&
                  !buscaNoticia;
                const portalNome = noticia.fonte_nome || noticia.autor;

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

                      <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3 text-xs theme-text-secondary">
                          <span className="flex items-center gap-1" title="Visualizações">
                            <Icon name="openEye" className="w-3.5 h-3.5" />
                            {noticia.visualizacoes}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCurtirNoticia(noticia.id)}
                            className="flex items-center gap-1 hover:text-blue-500 font-semibold cursor-pointer"
                            title="Curtir notícia"
                          >
                            <span>👍</span>
                            <span>{noticia.curtidas}</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => handleAbrirNoticia(noticia)}
                            className="px-3.5 py-2 rounded-xl text-xs font-bold theme-muted border hover:opacity-85 transition cursor-pointer"
                          >
                            Mostrar resumão
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
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ==========================================
          MODAL 1: CANDIDATAR-SE A UMA VAGA
          ========================================== */}
      {vagaParaCandidatar && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="theme-surface border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold theme-accent-text uppercase">
                  Candidatura Rápida NESP
                </span>
                <h3 className="text-lg font-extrabold mt-0.5">{vagaParaCandidatar.titulo}</h3>
                <p className="text-xs theme-text-secondary">{vagaParaCandidatar.empresa}</p>
              </div>
              <button
                type="button"
                onClick={() => setVagaParaCandidatar(null)}
                className="p-1.5 rounded-lg theme-muted cursor-pointer"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <div className="theme-muted border rounded-xl p-3 text-xs space-y-1">
              <p className="font-bold">Dados acadêmicos vinculados automaticamente:</p>
              <p className="theme-text-secondary">
                {usuario?.nome} • Matrícula {usuario?.matricula} • {usuario?.curso} (
                {usuario?.periodo}º período) • {usuario?.email}
              </p>
            </div>

            <form onSubmit={handleConfirmarCandidatura} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">
                  Link do GitHub / LinkedIn / Currículo
                </label>
                <input
                  type="text"
                  value={formCandidatura.link_portfolio}
                  onChange={(e) =>
                    setFormCandidatura((prev) => ({ ...prev, link_portfolio: e.target.value }))
                  }
                  placeholder="https://github.com/..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">
                  Mensagem de apresentação ao recrutador
                </label>
                <textarea
                  rows={3}
                  value={formCandidatura.mensagem}
                  onChange={(e) =>
                    setFormCandidatura((prev) => ({ ...prev, mensagem: e.target.value }))
                  }
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVagaParaCandidatar(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold theme-muted border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviandoCandidatura}
                  className="theme-btn-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {enviandoCandidatura ? 'Enviando...' : 'Confirmar Candidatura'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: PUBLICAR NOVA VAGA (CRUD FASTAPI)
          ========================================== */}
      {modalNovaVaga && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="theme-surface border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Publicar Nova Vaga no Mural NESP</h3>
              <button
                type="button"
                onClick={() => setModalNovaVaga(false)}
                className="p-1.5 rounded-lg theme-muted cursor-pointer"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarVaga} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1">Título da Vaga *</label>
                  <input
                    required
                    minLength={3}
                    value={formNovaVaga.titulo}
                    onChange={(e) => setFormNovaVaga((p) => ({ ...p, titulo: e.target.value }))}
                    placeholder="Ex: Estágio em Cibersegurança & Redes"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Empresa / Laboratório *</label>
                  <input
                    required
                    value={formNovaVaga.empresa}
                    onChange={(e) => setFormNovaVaga((p) => ({ ...p, empresa: e.target.value }))}
                    placeholder="Ex: CS&I Lab / Inatel"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Bolsa ou Salário *</label>
                  <input
                    required
                    value={formNovaVaga.bolsa_ou_salario}
                    onChange={(e) =>
                      setFormNovaVaga((p) => ({ ...p, bolsa_ou_salario: e.target.value }))
                    }
                    placeholder="Ex: R$ 1.800,00"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Tipo</label>
                  <select
                    value={formNovaVaga.tipo}
                    onChange={(e) => setFormNovaVaga((p) => ({ ...p, tipo: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  >
                    {TIPOS_VAGA.filter((t) => t !== 'todas').map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Modalidade</label>
                  <select
                    value={formNovaVaga.modalidade}
                    onChange={(e) => setFormNovaVaga((p) => ({ ...p, modalidade: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  >
                    {MODALIDADES.filter((m) => m !== 'todas').map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Localização *</label>
                  <input
                    required
                    value={formNovaVaga.localizacao}
                    onChange={(e) =>
                      setFormNovaVaga((p) => ({ ...p, localizacao: e.target.value }))
                    }
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Prazo de Inscrição *</label>
                  <input
                    required
                    value={formNovaVaga.prazo}
                    onChange={(e) => setFormNovaVaga((p) => ({ ...p, prazo: e.target.value }))}
                    placeholder="30/11/2026"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1">
                    Requisitos (separados por vírgula) *
                  </label>
                  <input
                    required
                    value={formNovaVaga.requisitos}
                    onChange={(e) =>
                      setFormNovaVaga((p) => ({ ...p, requisitos: e.target.value }))
                    }
                    placeholder="Python, Linux, Redes TCP/IP, Inglês"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold block mb-1">Descrição das atividades *</label>
                  <textarea
                    required
                    minLength={10}
                    rows={3}
                    value={formNovaVaga.descricao}
                    onChange={(e) => setFormNovaVaga((p) => ({ ...p, descricao: e.target.value }))}
                    placeholder="Descreva as responsabilidades, carga horária e benefícios..."
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaVaga(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold theme-muted border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoVaga}
                  className="theme-btn-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {salvandoVaga ? 'Salvando...' : 'Publicar Vaga'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 3: RESUMÃO & ACESSO À NOTÍCIA ORIGINAL
          ========================================== */}
      {noticiaAberta && (() => {
        const { topicos, paragrafos } = parseConteudoResumao(noticiaAberta.conteudo);
        const portalFonte = noticiaAberta.fonte_nome || noticiaAberta.autor;

        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="theme-surface border rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl my-8">
              {noticiaAberta.imagem_url ? (
                <div className="h-56 sm:h-64 w-full bg-slate-900 relative">
                  <img
                    src={noticiaAberta.imagem_url}
                    alt={noticiaAberta.titulo}
                    onError={(e) => {
                      e.currentTarget.parentElement.style.display = 'none';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setNoticiaAberta(null)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 cursor-pointer"
                  >
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="px-6 pt-5 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setNoticiaAberta(null)}
                    className="p-2 rounded-xl theme-muted border cursor-pointer"
                  >
                    <Icon name="close" className="w-4 h-4" />
                  </button>
                </div>
              )}

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold px-2.5 py-1 rounded-full theme-badge-soft">
                      {noticiaAberta.categoria}
                    </span>
                    <span className="font-semibold px-2.5 py-1 rounded-full theme-muted border">
                      Fonte: {portalFonte}
                    </span>
                  </div>
                  <span className="theme-text-secondary">
                    {noticiaAberta.publicado_em} • {noticiaAberta.visualizacoes} leituras
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                  {noticiaAberta.titulo}
                </h2>

                <p className="text-sm font-semibold theme-text-secondary border-l-4 theme-accent-border pl-3">
                  {noticiaAberta.resumo}
                </p>

                {topicos.length > 0 && (
                  <div className="theme-muted border rounded-2xl p-4 space-y-2.5">
                    <p className="text-xs font-extrabold uppercase tracking-wider theme-accent-text">
                      Resumão da Matéria (Pontos Principais)
                    </p>
                    <ul className="space-y-2 text-sm leading-relaxed">
                      {topicos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="theme-accent-text font-extrabold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {paragrafos.length > 0 && (
                  <div className="space-y-3 text-sm leading-relaxed">
                    {topicos.length > 0 && (
                      <p className="text-xs font-extrabold uppercase tracking-wider theme-text-secondary">
                        Síntese Completa Extraída
                      </p>
                    )}
                    {paragrafos.map((par, idx) => (
                      <p key={idx} className="whitespace-pre-line">
                        {par}
                      </p>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => handleCurtirNoticia(noticiaAberta.id)}
                    className="px-4 py-2 rounded-xl text-xs font-bold theme-muted border hover:opacity-85 cursor-pointer"
                  >
                    👍 Curtir ({noticiaAberta.curtidas})
                  </button>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setNoticiaAberta(null)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold theme-muted border cursor-pointer"
                    >
                      Fechar
                    </button>

                    {noticiaAberta.url_original && (
                      <a
                        href={noticiaAberta.url_original}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="theme-btn-primary px-5 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                      >
                        <span>Abrir notícia original em {portalFonte}</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ==========================================
          MODAL 4: PUBLICAR NOVA NOTÍCIA (CRUD FASTAPI)
          ========================================== */}
      {modalNovaNoticia && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="theme-surface border rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold">Publicar Nova Notícia no Portal</h3>
              <button
                type="button"
                onClick={() => setModalNovaNoticia(false)}
                className="p-1.5 rounded-lg theme-muted cursor-pointer"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCriarNoticia} className="space-y-3">
              <div>
                <label className="text-xs font-bold block mb-1">Título da Matéria *</label>
                <input
                  required
                  minLength={5}
                  value={formNovaNoticia.titulo}
                  onChange={(e) => setFormNovaNoticia((p) => ({ ...p, titulo: e.target.value }))}
                  placeholder="Ex: Equipe de Robótica do Inatel conquista pódio nacional"
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Categoria</label>
                  <select
                    value={formNovaNoticia.categoria}
                    onChange={(e) =>
                      setFormNovaNoticia((p) => ({ ...p, categoria: e.target.value }))
                    }
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  >
                    {CATEGORIAS_NOTICIA.filter((c) => c !== 'todas').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Portal / Fonte *</label>
                  <input
                    required
                    value={formNovaNoticia.autor}
                    onChange={(e) => setFormNovaNoticia((p) => ({ ...p, autor: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">
                  Link Oficial da Notícia (URL da fonte)
                </label>
                <input
                  type="url"
                  value={formNovaNoticia.url_original}
                  onChange={(e) =>
                    setFormNovaNoticia((p) => ({ ...p, url_original: e.target.value }))
                  }
                  placeholder="https://inatel.br/noticias/..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Resumo (Subtítulo) *</label>
                <input
                  required
                  minLength={10}
                  value={formNovaNoticia.resumo}
                  onChange={(e) => setFormNovaNoticia((p) => ({ ...p, resumo: e.target.value }))}
                  placeholder="Breve síntese exibida no card da notícia..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">URL da Imagem de Capa (opcional)</label>
                <input
                  value={formNovaNoticia.imagem_url}
                  onChange={(e) =>
                    setFormNovaNoticia((p) => ({ ...p, imagem_url: e.target.value }))
                  }
                  placeholder="https://inatel.br/noticias/image/..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Conteúdo Completo *</label>
                <textarea
                  required
                  minLength={20}
                  rows={4}
                  value={formNovaNoticia.conteudo}
                  onChange={(e) =>
                    setFormNovaNoticia((p) => ({ ...p, conteudo: e.target.value }))
                  }
                  placeholder="Escreva o texto completo da notícia..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={formNovaNoticia.destaque}
                  onChange={(e) =>
                    setFormNovaNoticia((p) => ({ ...p, destaque: e.target.checked }))
                  }
                  className="rounded"
                />
                <span>Marcar como notícia em destaque no topo</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalNovaNoticia(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold theme-muted border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoNoticia}
                  className="theme-btn-primary px-5 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  {salvandoNoticia ? 'Publicando...' : 'Publicar Notícia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

