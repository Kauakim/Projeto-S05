import { useEffect, useMemo, useState } from 'react';
import Icon from '../components/Icon';
import { api } from '../services/api';
import { obterMetasPorCurso } from '../utils/metasInatel';

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

const DIAS_LABEL_MAP = {
  seg: 'Segunda',
  ter: 'Terça',
  qua: 'Quarta',
  qui: 'Quinta',
  sex: 'Sexta',
  sab: 'Sábado',
};

function formatarDiasBadge(diaStr = '') {
  const dias = String(diaStr)
    .split(/[,\s/]+/)
    .map((d) => DIAS_LABEL_MAP[d.toLowerCase().slice(0, 3)] || d.toUpperCase())
    .filter(Boolean);
  return dias.length > 0 ? dias.join(', ') : 'SEMANA';
}

function formatarHorariosCard(horarioStr = '', localPadrao = 'P1-S12') {
  if (!horarioStr) return `Sala ${localPadrao}`;
  if (horarioStr.includes('|')) {
    return horarioStr.split('|').map((h) => h.trim()).join(' • ');
  }
  return `Sala ${localPadrao} • ${horarioStr}`;
}

function parseSessoesAula(aula) {
  if (!aula) {
    return [{ dia: 'seg', horario: '08:00 - 09:40', local: 'P1-S12' }];
  }
  const horarioStr = String(aula.horario || '').trim();
  const localStr = String(aula.local || 'P1-S12').trim();
  const diasStr = String(aula.dia || 'seg').trim();

  if (horarioStr.includes('|')) {
    const partes = horarioStr.split('|').map((p) => p.trim()).filter(Boolean);
    const parsed = partes.map((p) => {
      const m = p.match(/^(?:([A-Za-zçãéíóú]+):\s*)?([^()]+)(?:\((.*?)\))?$/i);
      let d = 'seg';
      if (m && m[1]) {
        const diaCod = m[1].toLowerCase().slice(0, 3);
        if (DIAS_LABEL_MAP[diaCod]) d = diaCod;
      }
      const h = m && m[2] ? m[2].trim() : '08:00 - 09:40';
      const l = m && m[3] ? m[3].trim() : localStr;
      return { dia: d, horario: h, local: l };
    });
    if (parsed.length > 0) return parsed;
  }

  const diasLista = diasStr
    .split(/[,\s/]+/)
    .map((d) => d.toLowerCase().slice(0, 3))
    .filter((d) => DIAS_LABEL_MAP[d]);

  if (diasLista.length > 0) {
    return diasLista.map((d) => ({
      dia: d,
      horario: horarioStr || '08:00 - 09:40',
      local: localStr,
    }));
  }

  return [{ dia: aula.dia || 'seg', horario: horarioStr || '08:00 - 09:40', local: localStr }];
}

function formatSessoesParaSalvar(sessoes = [], localPadrao = 'P1-S12') {
  if (!sessoes.length) {
    return {
      dia: 'seg',
      horario: '08:00 - 09:40',
      local: localPadrao,
    };
  }
  const diasUnicos = Array.from(new Set(sessoes.map((s) => s.dia))).join(', ');
  const horarioFormatado = sessoes
    .map((s) => {
      const diaCurto = DIAS_LABEL_MAP[s.dia] || s.dia;
      const salaExtra = s.local && s.local !== localPadrao ? ` (${s.local})` : '';
      return `${diaCurto}: ${s.horario}${salaExtra}`;
    })
    .join(' | ');
  const localFinal = sessoes[0]?.local || localPadrao;
  return {
    dia: diasUnicos,
    horario: horarioFormatado,
    local: localFinal,
  };
}

function getNotaBadgeStyle(nota) {
  const val = Number(nota || 0);
  if (val < 60) {
    return {
      pill: 'bg-red-600 text-white',
      bar: 'bg-red-500',
      status: 'Atenção (NP3 / Exame)',
    };
  }
  if (val < 80) {
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

function calcularMediaAvaliacoes(avaliacoes = []) {
  let soma = 0;
  let pesos = 0;
  for (const av of avaliacoes) {
    if (av.realizada && av.nota !== '' && av.nota !== null && av.nota !== undefined) {
      const n = Number(av.nota);
      const p = Number(av.peso) || 1;
      if (!Number.isNaN(n) && p > 0) {
        soma += n * p;
        pesos += p;
      }
    }
  }
  if (pesos <= 0) return null;
  return Math.round((soma / pesos) * 10) / 10;
}

const FORM_AULA_VAZIO = {
  codigo: '',
  turma: 'A',
  disciplina: '',
  professor: '',
  local: 'P1-S12',
  sessoes: [
    { dia: 'seg', horario: '08:00 - 09:40', local: 'P1-S12' },
  ],
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
    meta_ac: 200,
    horas_cp: 28,
    meta_cp: 40,
    horas_trilha: 45,
    meta_trilha: 60,
  });

  const temAulaSabado = useMemo(() => {
    return aulas.some((a) => {
      const dias = String(a.dia || '')
        .toLowerCase()
        .split(/[,\s/]+/);
      return dias.some((d) => d.startsWith('sab'));
    });
  }, [aulas]);

  const abasDiasVisiveis = useMemo(
    () => DIAS_SEMANA.filter((d) => d.id !== 'sab' || temAulaSabado || diaSelecionado === 'sab'),
    [temAulaSabado, diaSelecionado]
  );

  const aulasFiltradas = useMemo(() => {
    if (diaSelecionado === 'todas') return aulas;
    const target = diaSelecionado.toLowerCase();
    return aulas.filter((a) => {
      const dias = String(a.dia || '')
        .toLowerCase()
        .split(/[,\s/]+/)
        .map((d) => d.slice(0, 3));
      return dias.includes(target);
    });
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
    const diaInicial = diaSelecionado !== 'todas' ? diaSelecionado : 'seg';
    setAulaEditandoId(null);
    setAulaForm({
      ...FORM_AULA_VAZIO,
      local: 'P1-S12',
      sessoes: [
        { dia: diaInicial, horario: '08:00 - 09:40', local: 'P1-S12' },
      ],
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
    const sessoes = parseSessoesAula(aula);
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
      local: aula.local || sessoes[0]?.local || 'P1-S12',
      sessoes:
        sessoes.length > 0
          ? sessoes
          : [{ dia: 'seg', horario: '08:00 - 09:40', local: aula.local || 'P1-S12' }],
      prova_alert: Boolean(aula.prova_alert),
      prova_data: aula.prova_data || '',
      nota: Number(aula.nota ?? 0),
      calcular_nota_automatica: false,
      avaliacoes: avs,
    });
    setModalAulaAberto(true);
  };

  const adicionarSessao = () => {
    setAulaForm((prev) => {
      const ultima = prev.sessoes[prev.sessoes.length - 1];
      const proximoDia = ultima?.dia === 'seg' ? 'qua' : ultima?.dia === 'ter' ? 'qui' : 'sex';
      return {
        ...prev,
        sessoes: [
          ...prev.sessoes,
          {
            dia: proximoDia,
            horario: ultima?.horario || '10:00 - 11:40',
            local: ultima?.local || prev.local || 'P1-S12',
          },
        ],
      };
    });
  };

  const atualizarSessao = (idx, campo, valor) => {
    setAulaForm((prev) => ({
      ...prev,
      sessoes: prev.sessoes.map((s, i) => (i === idx ? { ...s, [campo]: valor } : s)),
    }));
  };

  const removerSessao = (idx) => {
    setAulaForm((prev) => ({
      ...prev,
      sessoes: prev.sessoes.filter((_, i) => i !== idx),
    }));
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

      const { dia, horario, local } = formatSessoesParaSalvar(aulaForm.sessoes, aulaForm.local);

      const payload = {
        codigo: aulaForm.codigo.trim().toUpperCase(),
        turma: aulaForm.turma.trim().toUpperCase() || 'A',
        disciplina: aulaForm.disciplina.trim(),
        professor: aulaForm.professor.trim(),
        dia,
        horario,
        local,
        prova_alert: Boolean(aulaForm.prova_alert),
        prova_data: aulaForm.prova_data.trim(),
        nota: Math.min(100, Math.max(0, notaEfetiva)),
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

  const metasCalculadas = useMemo(() => {
    return obterMetasPorCurso(usuario?.curso);
  }, [usuario?.curso]);

  const abrirModalHoras = () => {
    setHorasForm({
      crs: usuario?.crs ?? 86.4,
      horas_ac: usuario?.horas_ac ?? usuario?.horas_complementares ?? 112,
      meta_ac: metasCalculadas.ac,
      horas_cp: usuario?.horas_cp ?? 28,
      meta_cp: metasCalculadas.cp,
      horas_trilha: usuario?.horas_trilha ?? 45,
      meta_trilha: metasCalculadas.trilha,
    });
    setModalHorasAberto(true);
  };

  const calcularCrsPelasDisciplinas = () => {
    if (!aulas.length) return;
    const soma = aulas.reduce((acc, a) => acc + Number(a.nota || 0), 0);
    const crsCalc = Math.round((soma / aulas.length) * 10) / 10;
    setHorasForm((p) => ({ ...p, crs: Math.min(100, Math.max(0, crsCalc)) }));
  };

  const handleSalvarHorasRapido = async (e) => {
    e.preventDefault();
    setSalvandoHoras(true);
    try {
      const atualizado = await api.updateUsuario({
        crs: Number(horasForm.crs),
        horas_ac: Math.max(0, Number(horasForm.horas_ac)),
        meta_ac: metasCalculadas.ac,
        horas_cp: Math.max(0, Number(horasForm.horas_cp)),
        meta_cp: metasCalculadas.cp,
        horas_trilha: Math.max(0, Number(horasForm.horas_trilha)),
        meta_trilha: metasCalculadas.trilha,
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
  const metaAc = metasCalculadas.ac;
  const horasCp = usuario?.horas_cp ?? 28;
  const metaCp = metasCalculadas.cp;
  const horasTrilha = usuario?.horas_trilha ?? 45;
  const metaTrilha = metasCalculadas.trilha;

  return (
    <div className="space-y-8">
      {/* ==========================================
          1. BANNER DE BOAS-VINDAS + RESUMO DO ALUNO (CRS, AC, CP & TRILHA)
          ========================================== */}
      <section className="theme-surface rounded-2xl border p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold theme-badge-soft">
                <Icon name="cap" className="w-3.5 h-3.5" />
                <span>
                  {usuario?.curso} • {usuario?.periodo}º Período
                </span>
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full theme-muted border">
                Matrícula: {usuario?.matricula}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {usuario?.nome}!
            </h1>
            <p className="text-sm theme-text-secondary max-w-3xl">
              Gerencie suas turmas, frequência, provas, notas e acompanhe o cumprimento das suas metas de {' '}
              <strong>AC, CP e Trilha</strong>.
            </p>
          </div>
        </div>

        {/* Métricas acadêmicas organizadas com barras de progresso */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Card CRS */}
          <button
            type="button"
            onClick={abrirModalHoras}
            title="Clique para visualizar ou editar seu CRS"
            className="theme-muted border rounded-xl p-3.5 text-left hover:border-[#126ae2] transition cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wide theme-text-secondary">
                CRS (Semestre)
              </span>
              <Icon name="edit" className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </div>
            <div>
              <span className="text-2xl font-black theme-accent-text tracking-tight block">
                {usuario?.crs !== undefined ? `${Number(usuario.crs).toFixed(1)}%` : '86.4%'}
              </span>
              <span className="text-[11px] theme-text-secondary">Rendimento semestral</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, Number(usuario?.crs || 86.4)))}%`,
                }}
              />
            </div>
          </button>

          {/* Card Horas AC */}
          <button
            type="button"
            onClick={abrirModalHoras}
            title="Clique para visualizar ou editar horas de AC"
            className="theme-muted border rounded-xl p-3.5 text-left hover:border-[#126ae2] transition cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wide theme-text-secondary">
                Horas AC
              </span>
              <Icon name="edit" className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight">{horasAc}</span>
                <span className="text-xs font-semibold theme-text-secondary">/{metaAc}h</span>
              </div>
              <span className="text-[11px] theme-text-secondary">
                {Math.min(100, Math.round((horasAc / metaAc) * 100))}% concluído
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, Math.round((horasAc / metaAc) * 100)))}%`,
                }}
              />
            </div>
          </button>

          {/* Card Horas CP */}
          <button
            type="button"
            onClick={abrirModalHoras}
            title="Clique para visualizar ou editar horas de CP"
            className="theme-muted border rounded-xl p-3.5 text-left hover:border-[#126ae2] transition cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wide theme-text-secondary">
                Horas CP
              </span>
              <Icon name="edit" className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight">{horasCp}</span>
                <span className="text-xs font-semibold theme-text-secondary">/{metaCp}h</span>
              </div>
              <span className="text-[11px] theme-text-secondary">
                {Math.min(100, Math.round((horasCp / metaCp) * 100))}% concluído
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, Math.round((horasCp / metaCp) * 100)))}%`,
                }}
              />
            </div>
          </button>

          {/* Card Trilha */}
          <button
            type="button"
            onClick={abrirModalHoras}
            title="Clique para visualizar ou editar horas de Trilha"
            className="theme-muted border rounded-xl p-3.5 text-left hover:border-[#126ae2] transition cursor-pointer group flex flex-col justify-between gap-2"
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-[11px] font-bold uppercase tracking-wide theme-text-secondary">
                Trilha
              </span>
              <Icon name="edit" className="w-3 h-3 opacity-50 group-hover:opacity-100" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black tracking-tight">{horasTrilha}</span>
                <span className="text-xs font-semibold theme-text-secondary">/{metaTrilha}h</span>
              </div>
              <span className="text-[11px] theme-text-secondary">
                {Math.min(100, Math.round((horasTrilha / metaTrilha) * 100))}% concluído
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-purple-500 transition-all duration-500"
                style={{
                  width: `${Math.min(100, Math.max(5, Math.round((horasTrilha / metaTrilha) * 100)))}%`,
                }}
              />
            </div>
          </button>
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
              Minhas Aulas, Turmas, Provas &amp; Notas
            </h2>
            <p className="text-xs sm:text-sm theme-text-secondary">
              Cadastre novas disciplinas/turmas, dias e horários semanais, registre provas já feitas e lance notas obtidas (escala 0 a 100).
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
                        {aula.codigo} • Turma {aula.turma || 'A'} • {formatarDiasBadge(aula.dia)}
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

                    <div className="space-y-1.5 text-xs theme-text-secondary">
                      <p className="flex items-center gap-1.5">
                        <Icon name="user" className="w-3.5 h-3.5 theme-accent-text" />
                        <span>{aula.professor}</span>
                      </p>
                      <div className="flex items-start gap-1.5">
                        <Icon name="clock" className="w-3.5 h-3.5 mt-0.5 theme-accent-text shrink-0" />
                        <span className="leading-snug">{formatarHorariosCard(aula.horario, aula.local)}</span>
                      </div>
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
                                  ? Number(av.nota).toFixed(0)
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
                      <span className="text-xs font-semibold theme-text-secondary">
                        Desempenho: <strong className="theme-text-primary">{notaInfo.status}</strong>
                      </span>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-xs ${notaInfo.pill}`}>
                        NOTA FINAL: {Number(aula.nota || 0).toFixed(0)}/100
                      </span>
                    </div>

                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${notaInfo.bar}`}
                        style={{ width: `${Math.min(100, Math.max(6, Number(aula.nota || 0)))}%` }}
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
                  Altere turma, múltiplos dias e horários semanais, provas já realizadas e notas obtidas (0 a 100).
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

                <div className="sm:col-span-6">
                  <label className="text-xs font-bold block mb-1">Professor(a) *</label>
                  <input
                    required
                    placeholder="Ex: Prof. Raphael Cardoso"
                    value={aulaForm.professor}
                    onChange={(e) => setAulaForm((p) => ({ ...p, professor: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                <div className="sm:col-span-6">
                  <label className="text-xs font-bold block mb-1">Sala Principal / Lab *</label>
                  <input
                    required
                    placeholder="Ex: P1-S12, Lab Soft 03"
                    value={aulaForm.local}
                    onChange={(e) => setAulaForm((p) => ({ ...p, local: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                  />
                </div>

                {/* Seção de Múltiplos Dias e Horários da mesma matéria na semana */}
                <div className="sm:col-span-12 theme-surface border rounded-2xl p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5">
                        <Icon name="clock" className="w-3.5 h-3.5 theme-accent-text" />
                        <span>Dias &amp; Horários Semanais da Turma</span>
                      </h4>
                      <p className="text-[11px] theme-text-secondary">
                        Adicione todos os dias e horários em que você tem aula desta disciplina (ex: 2x ou 3x na semana).
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={adicionarSessao}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold theme-btn-primary flex items-center gap-1 cursor-pointer self-start sm:self-auto"
                    >
                      <Icon name="plus" className="w-3 h-3" />
                      <span>+ Adicionar Dia/Horário</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {aulaForm.sessoes.map((sessao, sIdx) => (
                      <div
                        key={sIdx}
                        className="theme-muted border rounded-xl p-2.5 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                      >
                        <div className="sm:col-span-3">
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block mb-0.5">
                            Dia da Semana *
                          </label>
                          <select
                            value={sessao.dia}
                            onChange={(e) => atualizarSessao(sIdx, 'dia', e.target.value)}
                            className="w-full theme-surface border rounded-lg px-2.5 py-1.5 text-xs font-semibold"
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
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block mb-0.5">
                            Horário *
                          </label>
                          <input
                            required
                            placeholder="Ex: 08:00 - 09:40"
                            value={sessao.horario}
                            onChange={(e) => atualizarSessao(sIdx, 'horario', e.target.value)}
                            className="w-full theme-surface border rounded-lg px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-4">
                          <label className="text-[10px] font-bold uppercase theme-text-secondary block mb-0.5">
                            Sala
                          </label>
                          <input
                            placeholder="Ex: P1-S12"
                            value={sessao.local}
                            onChange={(e) => atualizarSessao(sIdx, 'local', e.target.value)}
                            className="w-full theme-surface border rounded-lg px-2.5 py-1.5 text-xs"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end pt-2 sm:pt-4">
                          {aulaForm.sessoes.length > 1 ? (
                            <button
                              type="button"
                              onClick={() => removerSessao(sIdx)}
                              title="Remover este horário"
                              className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:text-red-500 cursor-pointer"
                            >
                              <Icon name="trash" className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] theme-text-secondary opacity-40">1º</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
                      Marque &ldquo;Já feita&rdquo; para informar a nota obtida (0 a 100) ou deixe como agendada.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
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
                            Nota (0-100)
                          </label>
                          <input
                            type="number"
                            step="0.5"
                            min={0}
                            max={100}
                            disabled={!av.realizada}
                            placeholder={av.realizada ? 'Ex: 85' : '—'}
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
                    <label className="text-xs font-bold">Nota Atual / Final (0 a 100)</label>
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
                        Usar média ({mediaCalculadaModal.toFixed(0)})
                      </button>
                    )}
                  </div>
                  <input
                    type="number"
                    step="0.5"
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
                    className="w-24 theme-surface border rounded-xl px-3 py-2 text-sm font-extrabold text-center"/>
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
                      Meta Oficial Inatel
                    </label>
                    <span className="w-full inline-block theme-surface border rounded-lg px-3 py-1.5 text-xs font-bold text-center">
                      {metasCalculadas.ac}h (Geral)
                    </span>
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
                      Meta Oficial Inatel
                    </label>
                    <span className="w-full inline-block theme-surface border rounded-lg px-3 py-1.5 text-xs font-bold text-center">
                      {metasCalculadas.cp}h ({usuario?.curso || 'Curso'})
                    </span>
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
                      Meta Oficial Inatel
                    </label>
                    <span className="w-full inline-block theme-surface border rounded-lg px-3 py-1.5 text-xs font-bold text-center">
                      {metasCalculadas.trilha}h ({usuario?.curso || 'Curso'})
                    </span>
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
