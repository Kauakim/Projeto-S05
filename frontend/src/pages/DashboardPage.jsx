import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';

const DIAS_SEMANA = [
  { id: 'todas', label: 'Semana Toda' },
  { id: 'seg', label: 'Segunda' },
  { id: 'ter', label: 'Terça' },
  { id: 'qua', label: 'Quarta' },
  { id: 'qui', label: 'Quinta' },
  { id: 'sex', label: 'Sexta' },
];

const AVISOS_INICIAIS = [
  {
    id: 'armario',
    icon: 'key',
    categoria: 'Biblioteca & Campus',
    texto: 'Você possui um armário reservado no Prédio 1 com devolução prevista para hoje às 21h30.',
    urgente: true,
  },
  {
    id: 'financeiro',
    icon: 'email',
    categoria: 'Financeiro / Tesouraria',
    texto: 'Boleto de mensalidade com desconto de pontualidade disponível até o dia 10 deste mês.',
    urgente: false,
  },
  {
    id: 'nesp',
    icon: 'cap',
    categoria: 'NESP Carreiras',
    texto: 'Novas vagas de Estágio e Iniciação Científica compatíveis com seu perfil foram publicadas!',
    urgente: false,
    acaoPagina: 'vagas-noticias',
  },
];

function getNotaBadgeStyle(nota) {
  if (nota < 6) {
    return {
      pill: 'bg-red-600 text-white',
      bar: 'bg-red-500',
      status: 'Atenção (NP3)',
    };
  }
  if (nota < 8) {
    return {
      pill: 'bg-amber-500 text-white',
      bar: 'bg-amber-500',
      status: 'Regular',
    };
  }
  return {
    pill: 'bg-emerald-600 text-white',
    bar: 'bg-emerald-500',
    status: 'Ótimo desempenho',
  };
}

const TIPO_EVENTO_LABEL = {
  tech: { texto: 'Tecnologia & Inovação', cor: 'bg-blue-600/90 text-white' },
  academic: { texto: 'Carreira & Acadêmico', cor: 'bg-emerald-600/90 text-white' },
  cultural: { texto: 'Cultura & Integração', cor: 'bg-purple-600/90 text-white' },
};

export default function DashboardPage({
  usuario,
  aulas = [],
  eventos = [],
  vagas = [],
  noticias = [],
  onNavigate,
  onIrParaNoticias,
}) {
  const [diaSelecionado, setDiaSelecionado] = useState('ter');
  const [avisosLidos, setAvisosLidos] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [eventosInscritos, setEventosInscritos] = useState([]);

  const aulasFiltradas = useMemo(() => {
    if (diaSelecionado === 'todas') return aulas;
    return aulas.filter((a) => a.dia === diaSelecionado);
  }, [aulas, diaSelecionado]);

  const avisosAtivos = useMemo(
    () => AVISOS_INICIAIS.filter((av) => !avisosLidos.includes(av.id)),
    [avisosLidos]
  );

  // Rotação suave do carrossel de eventos
  useEffect(() => {
    if (eventos.length <= 1) return undefined;
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % eventos.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [eventos.length]);

  const proximoSlide = () => {
    if (!eventos.length) return;
    setSlideIndex((prev) => (prev + 1) % eventos.length);
  };

  const slideAnterior = () => {
    if (!eventos.length) return;
    setSlideIndex((prev) => (prev - 1 + eventos.length) % eventos.length);
  };

  const toggleInscricaoEvento = (eventoId) => {
    setEventosInscritos((prev) =>
      prev.includes(eventoId) ? prev.filter((id) => id !== eventoId) : [...prev, eventoId]
    );
  };

  const noticiasRecentes = useMemo(() => {
    if (!noticias.length) return [];
    const primeira = noticias[0];
    const regional = noticias.find(
      (n) =>
        n.id !== primeira.id &&
        (n.categoria === 'Região' ||
          !(n.url_original || '').toLowerCase().includes('inatel.br'))
    );
    const segunda = regional || noticias[1] || null;
    return segunda ? [primeira, segunda] : [primeira];
  }, [noticias]);
  const vagasRecentes = vagas.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* ==========================================
          1. BANNER DE BOAS-VINDAS + RESUMO DO ALUNO
          ========================================== */}
      <section className="theme-surface rounded-2xl border p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold theme-badge-soft">
              <Icon name="cap" className="w-3.5 h-3.5" />
              <span>
                {usuario?.curso || 'Engenharia de Software'} • {usuario?.periodo || 6}º Período
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {usuario?.nome || 'Kauã'}!
            </h1>
            <p className="text-sm sm:text-base theme-text-secondary max-w-2xl">
              Acompanhe suas aulas da semana, avisos importantes da secretaria, eventos do campus e
              oportunidades abertas no NESP Inatel.
            </p>
          </div>

          {/* Métricas rápidas clicáveis para o Perfil */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('perfil')}
              className="theme-muted border rounded-xl p-3.5 text-left hover:opacity-90 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide theme-text-secondary block">
                IRA / Média
              </span>
              <span className="text-xl font-extrabold theme-accent-text mt-0.5 block">
                {usuario?.ira ? `${usuario.ira.toFixed(1)}%` : '86.4%'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('perfil')}
              className="theme-muted border rounded-xl p-3.5 text-left hover:opacity-90 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide theme-text-secondary block">
                Horas Compl.
              </span>
              <span className="text-xl font-extrabold mt-0.5 block">
                {usuario?.horas_complementares ?? 112}
                <span className="text-xs font-normal theme-text-secondary">
                  /{usuario?.meta_horas ?? 160}h
                </span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('vagas-noticias')}
              className="col-span-2 sm:col-span-1 theme-muted border rounded-xl p-3.5 text-left hover:opacity-90 transition cursor-pointer"
            >
              <span className="text-[11px] font-semibold uppercase tracking-wide theme-text-secondary block">
                Mural NESP
              </span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {vagas.length} vagas
              </span>
            </button>
          </div>
        </div>

        {/* Central de Avisos / Mensagens (evolução do #mensagens original) */}
        <div className="mt-6 pt-5 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider theme-text-secondary flex items-center gap-2">
              <Icon name="email" className="w-4 h-4 theme-accent-text" />
              Avisos &amp; Pendências ({avisosAtivos.length})
            </h2>
            {avisosLidos.length > 0 && (
              <button
                type="button"
                onClick={() => setAvisosLidos([])}
                className="text-xs font-semibold theme-accent-text hover:underline cursor-pointer"
              >
                Restaurar avisos ({avisosLidos.length})
              </button>
            )}
          </div>

          {avisosAtivos.length === 0 ? (
            <div className="theme-muted border rounded-xl px-4 py-3 text-sm theme-text-secondary flex items-center gap-2.5">
              <Icon name="check" className="w-4 h-4 text-emerald-600" />
              Tudo em dia! Você não possui notificações pendentes no momento.
            </div>
          ) : (
            <div className="grid gap-2.5">
              {avisosAtivos.map((aviso) => (
                <div
                  key={aviso.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border px-4 py-3 transition ${
                    aviso.urgente
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'theme-muted'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        aviso.urgente
                          ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          : 'theme-badge-soft'
                      }`}
                    >
                      <Icon name={aviso.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wide theme-text-secondary block">
                        {aviso.categoria}
                      </span>
                      <p className="text-sm font-medium leading-snug">{aviso.texto}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {aviso.acaoPagina && (
                      <button
                        type="button"
                        onClick={() => onNavigate(aviso.acaoPagina)}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg theme-btn-primary transition cursor-pointer"
                      >
                        Conferir
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAvisosLidos((prev) => [...prev, aviso.id])}
                      title="Marcar aviso como lido"
                      className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:bg-black/5 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Icon name="check" className="w-3.5 h-3.5" />
                      <span>Ciente</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          2. MINHAS AULAS (Evolução do <aulas-component>)
          ========================================== */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="calendar" className="w-5 h-5 theme-accent-text" />
              Minhas Aulas &amp; Desempenho
            </h2>
            <p className="text-xs sm:text-sm theme-text-secondary">
              Filtre por dia da semana para consultar salas, horários, frequência e alertas de prova.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {DIAS_SEMANA.map((dia) => {
              const ativo = diaSelecionado === dia.id;
              return (
                <button
                  key={dia.id}
                  type="button"
                  onClick={() => setDiaSelecionado(dia.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                    ativo
                      ? 'theme-btn-primary border-transparent shadow-xs'
                      : 'theme-surface hover:opacity-85'
                  }`}
                >
                  {dia.label}
                </button>
              );
            })}
          </div>
        </div>

        {aulasFiltradas.length === 0 ? (
          <div className="theme-surface border rounded-2xl p-8 text-center theme-text-secondary">
            Nenhuma aula cadastrada para este dia da semana.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aulasFiltradas.map((aula) => {
              const notaInfo = getNotaBadgeStyle(aula.nota);
              return (
                <article
                  key={aula.id}
                  className="theme-surface border border-l-4 theme-accent-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg theme-badge-soft uppercase">
                        {aula.codigo} • {aula.dia.toUpperCase()}
                      </span>

                      {aula.prova_alert ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-600 text-white animate-pulse">
                          <Icon name="clock" className="w-3.5 h-3.5" />
                          PROVA: {aula.prova_data}
                        </span>
                      ) : (
                        aula.prova_data && (
                          <span className="text-xs font-medium theme-text-secondary">
                            Próx. aval.: {aula.prova_data}
                          </span>
                        )
                      )}
                    </div>

                    <h3 className="text-base font-bold leading-snug">
                      {aula.codigo} - {aula.disciplina}
                    </h3>

                    <div className="space-y-1 text-xs theme-text-secondary">
                      <p className="flex items-center gap-1.5">
                        <Icon name="user" className="w-3.5 h-3.5 theme-accent-text" />
                        <span>{aula.professor}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Icon name="clock" className="w-3.5 h-3.5 theme-accent-text" />
                        <span>
                          Sala <strong>{aula.local}</strong> • {aula.horario}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold px-3 py-1 rounded-full theme-muted border">
                        FALTAS: {aula.frequencia}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${notaInfo.pill}`}>
                        NOTA: {aula.nota.toFixed(1)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${notaInfo.bar}`}
                        style={{ width: `${Math.min(100, Math.max(8, aula.nota * 10))}%` }}
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ==========================================
          3. CARROSSEL DE EVENTOS + VITRINE VAGAS/NOTÍCIAS
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Carrossel de Eventos (7 colunas no desktop) */}
        <section className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="bookmark" className="w-5 h-5 theme-accent-text" />
              Agenda de Eventos no Campus
            </h2>
            <span className="text-xs font-semibold theme-text-secondary">
              {eventos.length > 0 ? `${slideIndex + 1} / ${eventos.length}` : ''}
            </span>
          </div>

          {eventos.length > 0 && (
            <div className="theme-surface border rounded-2xl overflow-hidden shadow-xs relative group">
              <div className="relative h-60 sm:h-72 overflow-hidden bg-slate-900">
                <img
                  src={eventos[slideIndex]?.imagem_url}
                  alt={eventos[slideIndex]?.titulo}
                  className="w-full h-full object-cover opacity-90 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

                {/* Categoria */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs ${
                      TIPO_EVENTO_LABEL[eventos[slideIndex]?.tipo]?.cor ||
                      'bg-blue-600/90 text-white'
                    }`}
                  >
                    {TIPO_EVENTO_LABEL[eventos[slideIndex]?.tipo]?.texto || 'Evento Inatel'}
                  </span>
                </div>

                {/* Controles Anterior / Próximo */}
                <button
                  type="button"
                  onClick={slideAnterior}
                  aria-label="Evento anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                >
                  ❮
                </button>
                <button
                  type="button"
                  onClick={proximoSlide}
                  aria-label="Próximo evento"
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/55 hover:bg-black/80 text-white flex items-center justify-center transition cursor-pointer"
                >
                  ❯
                </button>

                {/* Título sobre a imagem */}
                <div className="absolute bottom-4 left-4 right-4 text-white space-y-1">
                  <h3 className="text-lg sm:text-xl font-extrabold leading-tight">
                    {eventos[slideIndex]?.titulo}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/90">
                    <span className="flex items-center gap-1">
                      <Icon name="calendar" className="w-3.5 h-3.5" />
                      {eventos[slideIndex]?.data} às {eventos[slideIndex]?.horario}
                    </span>
                    <span className="flex items-center gap-1">
                      <Icon name="home" className="w-3.5 h-3.5" />
                      {eventos[slideIndex]?.local}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-sm theme-text-secondary leading-relaxed">
                  {eventos[slideIndex]?.descricao}
                </p>

                <button
                  type="button"
                  onClick={() => toggleInscricaoEvento(eventos[slideIndex]?.id)}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    eventosInscritos.includes(eventos[slideIndex]?.id)
                      ? 'bg-emerald-600 text-white'
                      : 'theme-btn-primary'
                  }`}
                >
                  <Icon
                    name={eventosInscritos.includes(eventos[slideIndex]?.id) ? 'check' : 'plus'}
                    className="w-3.5 h-3.5"
                  />
                  <span>
                    {eventosInscritos.includes(eventos[slideIndex]?.id)
                      ? 'Presença Confirmada'
                      : 'Quero Participar'}
                  </span>
                </button>
              </div>

              {/* Indicadores de página */}
              <div className="px-5 pb-4 flex items-center justify-center gap-2">
                {eventos.map((ev, idx) => (
                  <button
                    key={ev.id}
                    type="button"
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`Ir para evento ${idx + 1}`}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === slideIndex ? 'w-7 bg-[#126ae2]' : 'w-2 bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Vitrine Rápida: Vagas NESP & Última Notícia (5 colunas no desktop) */}
        <section className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="folder" className="w-5 h-5 theme-accent-text" />
              Radar NESP &amp; Notícias
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('vagas-noticias')}
              className="text-xs font-bold theme-accent-text hover:underline cursor-pointer"
            >
              Abrir portal completo →
            </button>
          </div>

          {/* Cards de Notícias Reais (Inatel & Região) */}
          {noticiasRecentes.length > 0 && (
            <div className="space-y-3">
              {noticiasRecentes.map((item) => (
                <div
                  key={item.id}
                  className="theme-surface border rounded-2xl p-4 shadow-xs hover:shadow-md transition space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2 text-[11px] font-bold flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full theme-badge-soft">
                        {item.categoria}
                      </span>
                      <span className="px-2 py-0.5 rounded-full theme-muted border text-[10px]">
                        {item.fonte_nome || item.autor}
                      </span>
                    </div>
                    <span className="theme-text-secondary">{item.publicado_em}</span>
                  </div>

                  <h3 className="text-sm font-bold leading-snug">{item.titulo}</h3>
                  <p className="text-xs theme-text-secondary line-clamp-2">{item.resumo}</p>

                  <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onIrParaNoticias ? onIrParaNoticias(item) : onNavigate('vagas-noticias')
                      }
                      className="text-xs font-bold theme-accent-text hover:underline cursor-pointer"
                    >
                      Mostrar resumão →
                    </button>

                    {item.url_original && (
                      <a
                        href={item.url_original}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold theme-muted border hover:opacity-85 transition"
                      >
                        <span>Ir para notícia</span>
                        <span>↗</span>
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Lista compacta de últimas vagas */}
          <div className="theme-surface border rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider theme-text-secondary">
                Últimas Oportunidades Abertas
              </span>
              <span className="text-xs font-semibold text-emerald-600">Inscrições ativas</span>
            </div>

            <div className="divide-y divide-[var(--border-subtle)]">
              {vagasRecentes.map((vaga) => (
                <div
                  key={vaga.id}
                  className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{vaga.titulo}</p>
                    <p className="text-xs theme-text-secondary truncate">
                      {vaga.empresa} • {vaga.tipo} ({vaga.modalidade})
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate('vagas-noticias')}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold theme-muted border hover:opacity-80 cursor-pointer"
                  >
                    Ver vaga
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

