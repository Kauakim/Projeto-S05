import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { api } from '../services/api';

const DIAS_SEMANA = [
  { id: 'todas', label: 'Semana Toda' },
  { id: 'seg', label: 'Segunda' },
  { id: 'ter', label: 'Terça' },
  { id: 'qua', label: 'Quarta' },
  { id: 'qui', label: 'Quinta' },
  { id: 'sex', label: 'Sexta' },
  { id: 'sab', label: 'Sábado' },
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
    id: 'carreira',
    icon: 'link',
    categoria: 'Vagas LinkedIn',
    texto: 'Consulte vagas externas do LinkedIn compatíveis com seu curso e áreas de interesse.',
    urgente: false,
    acaoPagina: 'vagas',
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

function parseFrequencia(freqStr) {
  const m = String(freqStr || '00/25').match(/(\d+)\s*\/\s*(\d+)/);
  if (!m) return { faltas: 0, limite: 25 };
  return { faltas: Number(m[1]), limite: Math.max(1, Number(m[2])) };
}

function formatFrequencia(faltas, limite) {
  const f = Math.max(0, Number(faltas) || 0);
  const l = Math.max(1, Number(limite) || 25);
  return `${String(f).padStart(2, '0')}/${String(l).padStart(2, '0')}`;
}

function calcularMediaAvaliacoes(avaliacoes = []) {
  let soma = 0;
  let pesos = 0;
  for (const av of avaliacoes) {
    if (av.realizada && av.nota !== '' && av.nota !== null && av.nota !== undefined) {
      const n = Number(av.nota);
      const p = Number(av.peso) || 1;
      if (!Number.isNaN(n) && p > 0) {
        const notaNorm = n > 10 ? n / 10 : n;
        soma += notaNorm * p;
        pesos += p;
      }
    }
  }
  if (pesos <= 0) return null;
  return Math.round((soma / pesos) * 10) / 10;
}

const TIPO_EVENTO_LABEL = {
  tech: { texto: 'Tecnologia & Inovação', cor: 'bg-blue-600/90 text-white' },
  academic: { texto: 'Carreira & Acadêmico', cor: 'bg-emerald-600/90 text-white' },
  cultural: { texto: 'Cultura & Integração', cor: 'bg-purple-600/90 text-white' },
};

const FORM_AULA_VAZIO = {
  codigo: '',
  turma: 'A',
  disciplina: '',
  professor: '',
  dia: 'seg',
  horario: '08:00 - 09:40',
  local: 'P1-S12',
  faltas: 0,
  limiteFaltas: 25,
  prova_alert: false,
  prova_data: '',
  nota: 0,
  calcular_nota_automatica: true,
  avaliacoes: [
    { id: 'av-np1', titulo: 'NP1', tipo: 'Prova', data: '', realizada: false, nota: '', peso: 1 },
    { id: 'av-np2', titulo: 'NP2', tipo: 'Prova', data: '', realizada: false, nota: '', peso: 1 },
  ],
};

export default function DashboardPage({
  usuario,
  aulas = [],
  eventos = [],
  noticias = [],
  onNavigate,
  onIrParaNoticias,
  onIrParaHoras,
  onRefreshAulas,
  onUsuarioAtualizado,
  onNotify,
}) {
  const [diaSelecionado, setDiaSelecionado] = useState('todas');
  const [avisosLidos, setAvisosLidos] = useState([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [eventosInscritos, setEventosInscritos] = useState([]);

  // Modal de Disciplina / Turma / Provas / Notas
  const [modalAulaAberto, setModalAulaAberto] = useState(false);
  const [aulaEditandoId, setAulaEditandoId] = useState(null);
  const [aulaForm, setAulaForm] = useState(FORM_AULA_VAZIO);
  const [salvandoAula, setSalvandoAula] = useState(false);
  const [confirmandoExclusaoId, setConfirmandoExclusaoId] = useState(null);

  // Modal rápido de Horas AC / CP / Trilha & CRS
  const [modalHorasAberto, setModalHorasAberto] = useState(false);
  const [salvandoHoras, setSalvandoHoras] = useState(false);
  const [horasForm, setHorasForm] = useState({
    crs: 86.4,
    horas_ac: 112,
    meta_ac: 160,
    horas_cp: 28,
    meta_cp: 40,
    horas_trilha: 80,
    meta_trilha: 120,
  });

  const temAulaSabado = useMemo(() => aulas.some((a) => a.dia === 'sab'), [aulas]);
  const abasDiasVisiveis = useMemo(
    () => DIAS_SEMANA.filter((d) => d.id !== 'sab' || temAulaSabado || diaSelecionado === 'sab'),
    [temAulaSabado, diaSelecionado]
  );

  const aulasFiltradas = useMemo(() => {
    if (diaSelecionado === 'todas') return aulas;
    return aulas.filter((a) => a.dia === diaSelecionado);
  }, [aulas, diaSelecionado]);

  const avisosAtivos = useMemo(
    () => AVISOS_INICIAIS.filter((av) => !avisosLidos.includes(av.id)),
    [avisosLidos]
  );

  const mediaCalculadaModal = useMemo(
    () => calcularMediaAvaliacoes(aulaForm.avaliacoes),
    [aulaForm.avaliacoes]
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

  const abrirModalNovaAula = () => {
    setAulaEditandoId(null);
    setAulaForm({
      ...FORM_AULA_VAZIO,
      dia: diaSelecionado !== 'todas' ? diaSelecionado : 'seg',
      avaliacoes: [
        {
          id: `np1-${Date.now()}`,
          titulo: 'NP1',
          tipo: 'Prova',
          data: '',
          realizada: false,
          nota: '',
          peso: 1,
        },
        {
          id: `np2-${Date.now() + 1}`,
          titulo: 'NP2',
          tipo: 'Prova',
          data: '',
          realizada: false,
          nota: '',
          peso: 1,
        },
      ],
    });
    setModalAulaAberto(true);
  };

  const abrirModalEditarAula = (aula) => {
    const { faltas, limite } = parseFrequencia(aula.frequencia);
    const avs = Array.isArray(aula.avaliacoes)
      ? aula.avaliacoes.map((av, idx) => ({
          id: av.id || `av-${aula.id}-${idx}`,
          titulo: av.titulo || '',
          tipo: av.tipo || 'Prova',
          data: av.data || '',
          realizada: Boolean(av.realizada),
          nota: av.nota !== null && av.nota !== undefined ? av.nota : '',
          peso: av.peso || 1,
        }))
      : [];

    setAulaEditandoId(aula.id);
    setAulaForm({
      codigo: aula.codigo || '',
      turma: aula.turma || 'A',
      disciplina: aula.disciplina || '',
      professor: aula.professor || '',
      dia: aula.dia || 'seg',
      horario: aula.horario || '08:00 - 09:40',
      local: aula.local || '',
      faltas,
      limiteFaltas: limite,
      prova_alert: Boolean(aula.prova_alert),
      prova_data: aula.prova_data || '',
      nota: Number(aula.nota ?? 0),
      calcular_nota_automatica: false,
      avaliacoes: avs,
    });
    setModalAulaAberto(true);
  };

  const adicionarItemAvaliacao = (presetTitulo = '', presetTipo = 'Prova') => {
    setAulaForm((prev) => ({
      ...prev,
      avaliacoes: [
        ...prev.avaliacoes,
        {
          id: `av-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          titulo: presetTitulo || `Avaliação ${prev.avaliacoes.length + 1}`,
          tipo: presetTipo,
          data: '',
          realizada: false,
          nota: '',
          peso: 1,
        },
      ],
    }));
  };

  const atualizarItemAvaliacao = (idx, campo, valor) => {
    setAulaForm((prev) => {
      const novas = prev.avaliacoes.map((item, i) => {
        if (i !== idx) return item;
        const atualizado = { ...item, [campo]: valor };
        if (campo === 'nota' && valor !== '' && !atualizado.realizada) {
          atualizado.realizada = true;
        }
        return atualizado;
      });
      const novaMedia = calcularMediaAvaliacoes(novas);
      return {
        ...prev,
        avaliacoes: novas,
        nota:
          prev.calcular_nota_automatica && novaMedia !== null ? novaMedia : prev.nota,
      };
    });
  };

  const removerItemAvaliacao = (idx) => {
    setAulaForm((prev) => {
      const novas = prev.avaliacoes.filter((_, i) => i !== idx);
      const novaMedia = calcularMediaAvaliacoes(novas);
      return {
        ...prev,
        avaliacoes: novas,
        nota:
          prev.calcular_nota_automatica && novaMedia !== null ? novaMedia : prev.nota,
      };
    });
  };

  const handleSalvarAula = async (e) => {
    e.preventDefault();
    setSalvandoAula(true);
    try {
      const avaliacoesLimpas = aulaForm.avaliacoes
        .filter((av) => String(av.titulo || '').trim().length > 0)
        .map((av) => ({
          id: av.id || '',
          titulo: String(av.titulo).trim(),
          tipo: String(av.tipo || 'Prova').trim(),
          data: String(av.data || '').trim(),
          realizada: Boolean(av.realizada),
          nota:
            av.realizada && av.nota !== '' && av.nota !== null && av.nota !== undefined
              ? Number(av.nota)
              : null,
          peso: Math.max(0.1, Number(av.peso) || 1),
        }));

      const notaEfetiva =
        aulaForm.calcular_nota_automatica && mediaCalculadaModal !== null
          ? mediaCalculadaModal
          : Number(aulaForm.nota || 0);

      const payload = {
        codigo: aulaForm.codigo.trim().toUpperCase(),
        turma: aulaForm.turma.trim().toUpperCase() || 'A',
        disciplina: aulaForm.disciplina.trim(),
        professor: aulaForm.professor.trim(),
        dia: aulaForm.dia,
        horario: aulaForm.horario.trim(),
        local: aulaForm.local.trim(),
        frequencia: formatFrequencia(aulaForm.faltas, aulaForm.limiteFaltas),
        prova_alert: Boolean(aulaForm.prova_alert),
        prova_data: aulaForm.prova_data.trim(),
        nota: notaEfetiva,
        calcular_nota_automatica: Boolean(aulaForm.calcular_nota_automatica),
        avaliacoes: avaliacoesLimpas,
      };

      if (aulaEditandoId) {
        await api.updateAula(aulaEditandoId, payload);
        if (onNotify) onNotify(`Disciplina ${payload.codigo} (Turma ${payload.turma}) atualizada!`);
      } else {
        await api.createAula(payload);
        if (onNotify) onNotify(`Disciplina ${payload.codigo} (Turma ${payload.turma}) cadastrada!`);
      }

      if (onRefreshAulas) await onRefreshAulas();
      setModalAulaAberto(false);
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Erro ao salvar disciplina.', 'error');
    } finally {
      setSalvandoAula(false);
    }
  };

  const handleExcluirAula = async (aula) => {
    try {
      await api.deleteAula(aula.id);
      setConfirmandoExclusaoId(null);
      if (onRefreshAulas) await onRefreshAulas();
      if (onNotify) onNotify(`Disciplina ${aula.codigo} removida da sua grade.`);
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Erro ao remover disciplina.', 'error');
    }
  };

  const abrirModalHoras = () => {
    setHorasForm({
      crs: usuario?.crs ?? 86.4,
      horas_ac: usuario?.horas_ac ?? usuario?.horas_complementares ?? 112,
      meta_ac: usuario?.meta_ac ?? usuario?.meta_horas ?? 160,
      horas_cp: usuario?.horas_cp ?? 28,
      meta_cp: usuario?.meta_cp ?? 40,
      horas_trilha: usuario?.horas_trilha ?? 80,
      meta_trilha: usuario?.meta_trilha ?? 120,
    });
    setModalHorasAberto(true);
  };

  const calcularCrsPelasDisciplinas = () => {
    if (!aulas.length) return;
    const soma = aulas.reduce((acc, a) => acc + Number(a.nota || 0), 0);
    const crsCalc = Math.round((soma / aulas.length) * 10 * 10) / 10;
    setHorasForm((p) => ({ ...p, crs: Math.min(100, Math.max(0, crsCalc)) }));
  };

  const handleSalvarHorasRapido = async (e) => {
    e.preventDefault();
    setSalvandoHoras(true);
    try {
      const atualizado = await api.updateUsuario({
        crs: Number(horasForm.crs),
        horas_ac: Math.max(0, Number(horasForm.horas_ac)),
        meta_ac: Math.max(1, Number(horasForm.meta_ac)),
        horas_cp: Math.max(0, Number(horasForm.horas_cp)),
        meta_cp: Math.max(1, Number(horasForm.meta_cp)),
        horas_trilha: Math.max(0, Number(horasForm.horas_trilha)),
        meta_trilha: Math.max(1, Number(horasForm.meta_trilha)),
      });
      if (onUsuarioAtualizado) onUsuarioAtualizado(atualizado);
      if (onNotify) onNotify('Horas de AC, CP, Trilha e CRS atualizados com sucesso!');
      setModalHorasAberto(false);
    } catch (err) {
      if (onNotify) onNotify(err.message || 'Erro ao atualizar horas.', 'error');
    } finally {
      setSalvandoHoras(false);
    }
  };

  const noticiasRecentes = useMemo(() => {
    return noticias
      .filter((n) => {
        const url = (n?.url_original || '').toLowerCase();
        const fonte = (n?.fonte_nome || n?.autor || '').toLowerCase();
        return url ? url.includes('inatel.br') : fonte.includes('inatel');
      })
      .slice(0, 2);
  }, [noticias]);

  const horasAc = usuario?.horas_ac ?? usuario?.horas_complementares ?? 112;
  const metaAc = usuario?.meta_ac ?? usuario?.meta_horas ?? 160;
  const horasCp = usuario?.horas_cp ?? 28;
  const metaCp = usuario?.meta_cp ?? 40;
  const horasTrilha = usuario?.horas_trilha ?? 80;
  const metaTrilha = usuario?.meta_trilha ?? 120;

  return (
    <div className="space-y-8">
      {/* ==========================================
          1. BANNER DE BOAS-VINDAS + RESUMO DO ALUNO (CRS, AC, CP & TRILHA)
          ========================================== */}
      <section className="theme-surface rounded-2xl border p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
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
              Gerencie suas turmas, provas feitas, notas obtidas e horas validadas de{' '}
              <strong>AC, CP e Trilha</strong> sempre que precisar.
            </p>
          </div>

          {/* Métricas acadêmicas clicáveis p/ edição imediata */}
          <div className="space-y-2.5 shrink-0">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={abrirModalHoras}
                title="Clique para editar seu CRS do semestre"
                className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer group"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide theme-text-secondary flex items-center justify-between gap-1">
                  <span>CRS (Semestre)</span>
                  <Icon name="edit" className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </span>
                <span className="text-xl font-extrabold theme-accent-text mt-0.5 block">
                  {usuario?.crs !== undefined ? `${Number(usuario.crs).toFixed(1)}%` : '86.4%'}
                </span>
              </button>

              <button
                type="button"
                onClick={abrirModalHoras}
                title="Clique para alterar horas validadas de AC"
                className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer group"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide theme-text-secondary flex items-center justify-between gap-1">
                  <span>Horas AC</span>
                  <Icon name="edit" className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </span>
                <span className="text-xl font-extrabold mt-0.5 block">
                  {horasAc}
                  <span className="text-xs font-normal theme-text-secondary">/{metaAc}h</span>
                </span>
              </button>

              <button
                type="button"
                onClick={abrirModalHoras}
                title="Clique para alterar horas validadas de CP"
                className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer group"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide theme-text-secondary flex items-center justify-between gap-1">
                  <span>Horas CP</span>
                  <Icon name="edit" className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </span>
                <span className="text-xl font-extrabold mt-0.5 block">
                  {horasCp}
                  <span className="text-xs font-normal theme-text-secondary">/{metaCp}h</span>
                </span>
              </button>

              <button
                type="button"
                onClick={abrirModalHoras}
                title="Clique para alterar horas validadas de Trilha"
                className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer group"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide theme-text-secondary flex items-center justify-between gap-1">
                  <span>Trilha</span>
                  <Icon name="edit" className="w-3 h-3 opacity-60 group-hover:opacity-100" />
                </span>
                <span className="text-xl font-extrabold mt-0.5 block">
                  {horasTrilha}
                  <span className="text-xs font-normal theme-text-secondary">/{metaTrilha}h</span>
                </span>
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={abrirModalHoras}
                className="text-xs font-bold px-3 py-1.5 rounded-lg theme-badge-soft hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="hourglass" className="w-3.5 h-3.5" />
                <span>Ajustar Horas AC / CP / Trilha &amp; CRS</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          2. MINHAS AULAS, TURMAS, PROVAS & NOTAS (CRUD COMPLETO)
          ========================================== */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="calendar" className="w-5 h-5 theme-accent-text" />
              Minhas Aulas, Turmas, Provas &amp; Notas ({aulas.length})
            </h2>
            <p className="text-xs sm:text-sm theme-text-secondary">
              Cadastre novas disciplinas/turmas, registre provas já feitas, lance notas obtidas e controle suas faltas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={abrirModalNovaAula}
              className="px-3.5 py-2 rounded-xl text-xs font-bold theme-btn-primary shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              <span>Nova Disciplina / Turma</span>
            </button>
          </div>
        </div>

        {/* Filtro de dias da semana */}
        <div className="flex flex-wrap gap-1.5">
          {abasDiasVisiveis.map((dia) => {
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

        {aulasFiltradas.length === 0 ? (
          <div className="theme-surface border rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm font-semibold theme-text-secondary">
              Nenhuma disciplina cadastrada para este filtro.
            </p>
            <button
              type="button"
              onClick={abrirModalNovaAula}
              className="px-4 py-2 rounded-xl text-xs font-bold theme-btn-primary inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="plus" className="w-3.5 h-3.5" />
              <span>Cadastrar Disciplina / Turma</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aulasFiltradas.map((aula) => {
              const notaInfo = getNotaBadgeStyle(aula.nota);
              const avaliacoes = Array.isArray(aula.avaliacoes) ? aula.avaliacoes : [];
              const feitas = avaliacoes.filter((av) => av.realizada);
              const agendadas = avaliacoes.filter((av) => !av.realizada);

              return (
                <article
                  key={aula.id}
                  className="theme-surface border border-l-4 theme-accent-border rounded-2xl p-5 shadow-xs flex flex-col justify-between gap-4 hover:shadow-md transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg theme-badge-soft uppercase">
                        {aula.codigo} • Turma {aula.turma || 'A'} • {aula.dia.toUpperCase()}
                      </span>

                      {aula.prova_alert ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-red-600 text-white animate-pulse">
                          <Icon name="clock" className="w-3.5 h-3.5" />
                          PROVA: {aula.prova_data || 'Em breve'}
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

                    {/* Provas já feitas e notas obtidas + próximas */}
                    {avaliacoes.length > 0 && (
                      <div className="pt-2 border-t border-[var(--border-subtle)] space-y-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider theme-text-secondary block">
                          Provas &amp; Avaliações ({feitas.length} feita{feitas.length === 1 ? '' : 's'})
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {feitas.map((av) => (
                            <span
                              key={av.id || av.titulo}
                              className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
                            >
                              <span>✓ {av.titulo}:</span>
                              <strong>
                                {av.nota !== null && av.nota !== undefined
                                  ? Number(av.nota).toFixed(1)
                                  : '-'}
                              </strong>
                            </span>
                          ))}
                          {agendadas.map((av) => (
                            <span
                              key={av.id || av.titulo}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md theme-muted border"
                            >
                              <span>
                                {av.titulo}
                                {av.data ? ` (${av.data})` : ''}
                              </span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold px-3 py-1 rounded-full theme-muted border">
                        FALTAS: {aula.frequencia}
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${notaInfo.pill}`}>
                        NOTA: {Number(aula.nota || 0).toFixed(1)}
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${notaInfo.bar}`}
                        style={{ width: `${Math.min(100, Math.max(8, Number(aula.nota || 0) * 10))}%` }}
                      />
                    </div>

                    {/* Ações rápidas do card */}
                    {confirmandoExclusaoId === aula.id ? (
                      <div className="flex items-center justify-between gap-2 pt-1 bg-red-500/10 border border-red-500/30 rounded-xl px-3 py-2">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400">
                          Remover {aula.codigo}?
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleExcluirAula(aula)}
                            className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                          >
                            Sim, excluir
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmandoExclusaoId(null)}
                            className="px-2.5 py-1 rounded-lg theme-muted border text-xs font-semibold cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => abrirModalEditarAula(aula)}
                          className="flex-1 py-1.5 px-3 rounded-xl text-xs font-bold theme-muted border hover:border-[#126ae2] transition flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Icon name="edit" className="w-3.5 h-3.5 theme-accent-text" />
                          <span>Editar Turma, Provas &amp; Notas</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmandoExclusaoId(aula.id)}
                          title="Remover disciplina"
                          className="p-1.5 rounded-xl border border-[var(--border-subtle)] hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ==========================================
          MODAL 1: CADASTRAR / EDITAR DISCIPLINA, TURMA, PROVAS E NOTAS
          ========================================== */}
      {modalAulaAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="theme-surface border rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Icon name="calendar" className="w-5 h-5 theme-accent-text" />
                  <span>
                    {aulaEditandoId
                      ? `Editar Disciplina & Provas (${aulaForm.codigo})`
                      : 'Cadastrar Nova Disciplina / Turma'}
                  </span>
                </h2>
                <p className="text-xs theme-text-secondary mt-0.5">
                  Altere turma, horário, faltas, provas já realizadas, próximas provas e notas obtidas.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalAulaAberto(false)}
                className="p-2 rounded-xl theme-muted border hover:opacity-80 cursor-pointer"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarAula} className="space-y-5">
              {/* Dados da Disciplina & Turma */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold block mb-1">Código *</label>
                  <input
                    required
                    placeholder="Ex: S05, C206"
                    value={aulaForm.codigo}
                    onChange={(e) => setAulaForm((p) => ({ ...p, codigo: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm uppercase font-bold"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold block mb-1">Turma *</label>
                  <input
                    required
                    placeholder="Ex: A, B, L1"
                    value={aulaForm.turma}
                    onChange={(e) => setAulaForm((p) => ({ ...p, turma: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm uppercase font-bold"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-xs font-bold block mb-1">Nome da Disciplina *</label>
                  <input
                    required
                    placeholder="Ex: Interface Homem-Máquina"
                    value={aulaForm.disciplina}
                    onChange={(e) => setAulaForm((p) => ({ ...p, disciplina: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-5">
                  <label className="text-xs font-bold block mb-1">Professor(a) *</label>
                  <input
                    required
                    placeholder="Ex: Prof. Raphael Cardoso"
                    value={aulaForm.professor}
                    onChange={(e) => setAulaForm((p) => ({ ...p, professor: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold block mb-1">Dia da Semana *</label>
                  <select
                    value={aulaForm.dia}
                    onChange={(e) => setAulaForm((p) => ({ ...p, dia: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  >
                    <option value="seg">Segunda-feira</option>
                    <option value="ter">Terça-feira</option>
                    <option value="qua">Quarta-feira</option>
                    <option value="qui">Quinta-feira</option>
                    <option value="sex">Sexta-feira</option>
                    <option value="sab">Sábado</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs font-bold block mb-1">Horário *</label>
                  <input
                    required
                    placeholder="10:00 - 11:40"
                    value={aulaForm.horario}
                    onChange={(e) => setAulaForm((p) => ({ ...p, horario: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs font-bold block mb-1">Sala / Laboratório *</label>
                  <input
                    required
                    placeholder="Ex: P1-S17, Lab Soft 03"
                    value={aulaForm.local}
                    onChange={(e) => setAulaForm((p) => ({ ...p, local: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs font-bold block mb-1">Faltas Tidas</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={aulaForm.faltas}
                    onChange={(e) => setAulaForm((p) => ({ ...p, faltas: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs font-bold block mb-1">Limite Máx. de Faltas</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={aulaForm.limiteFaltas}
                    onChange={(e) => setAulaForm((p) => ({ ...p, limiteFaltas: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>
              </div>

              {/* Seção de Provas Feitas, Trabalhos & Próximas Avaliações */}
              <div className="theme-muted border rounded-2xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-extrabold">
                      Provas Já Feitas, Trabalhos &amp; Próximas Avaliações
                    </h3>
                    <p className="text-xs theme-text-secondary">
                      Marque &ldquo;Já feita&rdquo; para informar a nota obtida (0 a 10) ou deixe como agendada.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => adicionarItemAvaliacao('NP1', 'Prova')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold theme-surface border hover:opacity-85 cursor-pointer"
                    >
                      + NP1
                    </button>
                    <button
                      type="button"
                      onClick={() => adicionarItemAvaliacao('NP2', 'Prova')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold theme-surface border hover:opacity-85 cursor-pointer"
                    >
                      + NP2
                    </button>
                    <button
                      type="button"
                      onClick={() => adicionarItemAvaliacao('NP3', 'Prova')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold theme-surface border hover:opacity-85 cursor-pointer"
                    >
                      + NP3
                    </button>
                    <button
                      type="button"
                      onClick={() => adicionarItemAvaliacao('Projeto / Lab', 'Projeto')}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold theme-btn-primary cursor-pointer"
                    >
                      + Avaliação
                    </button>
                  </div>
                </div>

                {aulaForm.avaliacoes.length === 0 ? (
                  <p className="text-xs theme-text-secondary py-2">
                    Nenhuma prova cadastrada ainda. Use os botões acima para adicionar NP1, NP2, trabalhos ou projetos.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {aulaForm.avaliacoes.map((av, idx) => (
                      <div
                        key={av.id || idx}
                        className="theme-surface border rounded-xl p-3 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block">
                            Avaliação
                          </label>
                          <input
                            placeholder="NP1, Lab 1..."
                            value={av.titulo}
                            onChange={(e) => atualizarItemAvaliacao(idx, 'titulo', e.target.value)}
                            className="w-full theme-muted border rounded-lg px-2.5 py-1.5 text-xs font-semibold"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block">
                            Tipo
                          </label>
                          <select
                            value={av.tipo || 'Prova'}
                            onChange={(e) => atualizarItemAvaliacao(idx, 'tipo', e.target.value)}
                            className="w-full theme-muted border rounded-lg px-2 py-1.5 text-xs"
                          >
                            <option value="Prova">Prova</option>
                            <option value="Projeto">Projeto</option>
                            <option value="Laboratório">Laboratório</option>
                            <option value="Trabalho">Trabalho</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block">
                            Data
                          </label>
                          <input
                            placeholder="Ex: 18/09"
                            value={av.data}
                            onChange={(e) => atualizarItemAvaliacao(idx, 'data', e.target.value)}
                            className="w-full theme-muted border rounded-lg px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block">
                            Status
                          </label>
                          <select
                            value={av.realizada ? 'feita' : 'agendada'}
                            onChange={(e) =>
                              atualizarItemAvaliacao(idx, 'realizada', e.target.value === 'feita')
                            }
                            className="w-full theme-muted border rounded-lg px-2 py-1.5 text-xs font-semibold"
                          >
                            <option value="feita">✓ Já feita</option>
                            <option value="agendada">Agendada</option>
                          </select>
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block">
                            Nota (0-10)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min={0}
                            max={100}
                            disabled={!av.realizada}
                            placeholder={av.realizada ? 'Ex: 8.5' : '—'}
                            value={av.realizada ? av.nota : ''}
                            onChange={(e) => atualizarItemAvaliacao(idx, 'nota', e.target.value)}
                            className="w-full theme-muted border rounded-lg px-2.5 py-1.5 text-xs font-bold disabled:opacity-45"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end pt-3 sm:pt-4">
                          <button
                            type="button"
                            onClick={() => removerItemAvaliacao(idx)}
                            title="Remover avaliação"
                            className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:text-red-500 cursor-pointer"
                          >
                            <Icon name="trash" className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nota Geral da Disciplina & Próxima Prova */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end pt-1">
                <div className="sm:col-span-4">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold">Nota Atual / Final (0 a 10)</label>
                    {mediaCalculadaModal !== null && (
                      <button
                        type="button"
                        onClick={() =>
                          setAulaForm((p) => ({
                            ...p,
                            nota: mediaCalculadaModal,
                            calcular_nota_automatica: true,
                          }))
                        }
                        className="text-[11px] font-bold theme-accent-text hover:underline cursor-pointer"
                      >
                        Usar média ({mediaCalculadaModal.toFixed(1)})
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    value={
                      aulaForm.calcular_nota_automatica && mediaCalculadaModal !== null
                        ? mediaCalculadaModal
                        : aulaForm.nota
                    }
                    onChange={(e) =>
                      setAulaForm((p) => ({
                        ...p,
                        nota: e.target.value,
                        calcular_nota_automatica: false,
                      }))
                    }
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm font-extrabold"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="text-xs font-bold block mb-1">
                    Data da Próxima Prova (opcional)
                  </label>
                  <input
                    placeholder="Ex: 12/11"
                    value={aulaForm.prova_data}
                    onChange={(e) => setAulaForm((p) => ({ ...p, prova_data: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-4 pb-2">
                  <label className="flex items-center gap-2 text-xs font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={aulaForm.prova_alert}
                      onChange={(e) =>
                        setAulaForm((p) => ({ ...p, prova_alert: e.target.checked }))
                      }
                    />
                    <span>Destacar alerta de prova próxima</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setModalAulaAberto(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold theme-muted border cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoAula}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold theme-btn-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>{salvandoAula ? 'Salvando...' : 'Salvar Disciplina & Notas'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: EDIÇÃO RÁPIDA DE HORAS (AC, CP, TRILHA) & CRS
          ========================================== */}
      {modalHorasAberto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="theme-surface border rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Icon name="hourglass" className="w-5 h-5 theme-accent-text" />
                  <span>Horas Validadas (AC, CP &amp; Trilha) e CRS</span>
                </h2>
                <p className="text-xs theme-text-secondary mt-0.5">
                  Altere diretamente suas horas validadas de cada componente juntamente ao seu CRS (Coeficiente de Rendimento Semestral).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalHorasAberto(false)}
                className="p-2 rounded-xl theme-muted border hover:opacity-80 cursor-pointer"
              >
                <Icon name="close" className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSalvarHorasRapido} className="space-y-4">
              {/* CRS */}
              <div className="theme-muted border rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <label className="text-xs font-extrabold block">
                    CRS — Coeficiente de Rendimento Semestral
                  </label>
                  <span className="text-[11px] theme-text-secondary">
                    Valor entre 0 e 100 referente a média obtida no semestre.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={100}
                    value={horasForm.crs}
                    onChange={(e) => setHorasForm((p) => ({ ...p, crs: e.target.value }))}
                    className="w-24 theme-surface border rounded-xl px-3 py-2 text-sm font-extrabold text-center"
                  />
                  {aulas.length > 0 && (
                    <button
                      type="button"
                      onClick={calcularCrsPelasDisciplinas}
                      className="px-3 py-2 rounded-xl text-xs font-bold theme-badge-soft hover:opacity-90 cursor-pointer"
                    >
                      Calcular pelas notas
                    </button>
                  )}
                </div>
              </div>

              {/* Cards AC, CP, Trilha */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="theme-muted border rounded-xl p-3.5 space-y-2">
                  <span className="text-xs font-extrabold uppercase theme-accent-text block">
                    AC
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold theme-text-secondary block mb-0.5">
                      Horas Validadas (h)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={horasForm.horas_ac}
                      onChange={(e) => setHorasForm((p) => ({ ...p, horas_ac: e.target.value }))}
                      className="w-full theme-surface border rounded-lg px-3 py-1.5 text-sm font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold theme-text-secondary block mb-0.5">
                      Meta Exigida (h)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={horasForm.meta_ac}
                      onChange={(e) => setHorasForm((p) => ({ ...p, meta_ac: e.target.value }))}
                      className="w-full theme-surface border rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="theme-muted border rounded-xl p-3.5 space-y-2">
                  <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400 block">
                    CP
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold theme-text-secondary block mb-0.5">
                      Horas Validadas (h)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={horasForm.horas_cp}
                      onChange={(e) => setHorasForm((p) => ({ ...p, horas_cp: e.target.value }))}
                      className="w-full theme-surface border rounded-lg px-3 py-1.5 text-sm font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold theme-text-secondary block mb-0.5">
                      Meta Exigida (h)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={horasForm.meta_cp}
                      onChange={(e) => setHorasForm((p) => ({ ...p, meta_cp: e.target.value }))}
                      className="w-full theme-surface border rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>

                <div className="theme-muted border rounded-xl p-3.5 space-y-2">
                  <span className="text-xs font-extrabold uppercase text-purple-600 dark:text-purple-400 block">
                    Trilha
                  </span>
                  <div>
                    <label className="text-[11px] font-semibold theme-text-secondary block mb-0.5">
                      Horas Validadas (h)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={1000}
                      value={horasForm.horas_trilha}
                      onChange={(e) =>
                        setHorasForm((p) => ({ ...p, horas_trilha: e.target.value }))
                      }
                      className="w-full theme-surface border rounded-lg px-3 py-1.5 text-sm font-extrabold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold theme-text-secondary block mb-0.5">
                      Meta Exigida (h)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={horasForm.meta_trilha}
                      onChange={(e) =>
                        setHorasForm((p) => ({ ...p, meta_trilha: e.target.value }))
                      }
                      className="w-full theme-surface border rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="submit"
                  disabled={salvandoHoras}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold theme-btn-primary flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>{salvandoHoras ? 'Salvando...' : 'Salvar Horas & CRS'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
