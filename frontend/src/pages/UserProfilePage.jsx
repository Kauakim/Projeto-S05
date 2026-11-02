import { useEffect, useMemo, useState } from 'react';
import inatelBranco from '@assets/images/Inatel Branco.png';
import logoQuadrada from '@assets/images/Logo INATEL.png';
import Icon from '../components/Icon';
import LinkedInAnalyzerSection from '../components/LinkedInAnalyzerSection';
import { api } from '../services/api';

const CURSOS_INATEL = [
  'Engenharia de Software',
  'Engenharia de Computação',
  'Engenharia de Telecomunicações',
  'Engenharia Elétrica',
  'Engenharia Biomédica',
  'Engenharia de Controle e Automação',
  'Engenharia de Produção',
];

export default function UserProfilePage({
  usuario,
  aulas = [],
  analiseLinkedIn = null,
  secaoSolicitada = null,
  onSecaoSolicitadaConsumida,
  onUsuarioAtualizado,
  onRefreshUsuario,
  onAnaliseLinkedInAtualizada,
  onIrParaVagasLinkedIn,
  onNavigate,
  onNotify,
  onLogout,
}) {
  // Abas internas: 'horas' | 'linkedin' | 'dados' | 'seguranca'
  const [secaoAtiva, setSecaoAtiva] = useState('horas');

  useEffect(() => {
    if (secaoSolicitada) {
      setSecaoAtiva(secaoSolicitada);
      if (onSecaoSolicitadaConsumida) onSecaoSolicitadaConsumida();
    }
  }, [secaoSolicitada, onSecaoSolicitadaConsumida]);

  const [ocultarDadosSensiveis, setOcultarDadosSensiveis] = useState(false);
  const [salvandoDados, setSalvandoDados] = useState(false);
  const [salvandoSenha, setSalvandoSenha] = useState(false);
  const [mostrarSenhas, setMostrarSenhas] = useState(false);

  const [form, setForm] = useState({
    nome: '',
    matricula: '',
    curso: 'Engenharia de Software',
    periodo: 6,
    email: '',
    telefone: '',
    bio: '',
    github: '',
    linkedin: '',
    areas_interesse: '',
    crs: 86.4,
    horas_ac: 112,
    meta_ac: 160,
    horas_cp: 28,
    meta_cp: 40,
    horas_trilha: 80,
    meta_trilha: 120,
  });

  const [senhaForm, setSenhaForm] = useState({
    senha_atual: '',
    nova_senha: '',
    confirmar_senha: '',
  });

  useEffect(() => {
    if (usuario) {
      setForm({
        nome: usuario.nome || '',
        matricula: usuario.matricula ?? '',
        curso: usuario.curso || 'Engenharia de Software',
        periodo: usuario.periodo || 6,
        email: usuario.email || '',
        telefone: usuario.telefone || '',
        bio: usuario.bio || '',
        github: usuario.github || '',
        linkedin: usuario.linkedin || '',
        areas_interesse: usuario.areas_interesse || '',
        crs: usuario.crs ?? 86.4,
        horas_ac: usuario.horas_ac ?? usuario.horas_complementares ?? 0,
        meta_ac: usuario.meta_ac ?? usuario.meta_horas ?? 160,
        horas_cp: usuario.horas_cp ?? 0,
        meta_cp: usuario.meta_cp ?? 40,
        horas_trilha: usuario.horas_trilha ?? 0,
        meta_trilha: usuario.meta_trilha ?? 120,
      });
    }
  }, [usuario]);

  const mediaDisciplinasSemestre = useMemo(() => {
    if (!aulas.length) return 0;
    const soma = aulas.reduce((acc, a) => acc + Number(a.nota || 0), 0);
    return soma / aulas.length;
  }, [aulas]);

  const progressoPilares = useMemo(() => {
    const acAtual = usuario?.horas_ac ?? usuario?.horas_complementares ?? 0;
    const acMeta = Math.max(1, usuario?.meta_ac ?? usuario?.meta_horas ?? 160);
    const cpAtual = usuario?.horas_cp ?? 0;
    const cpMeta = Math.max(1, usuario?.meta_cp ?? 40);
    const trilhaAtual = usuario?.horas_trilha ?? 0;
    const trilhaMeta = Math.max(1, usuario?.meta_trilha ?? 120);

    return {
      ac: {
        atual: acAtual,
        meta: acMeta,
        pct: Math.min(100, Math.round((acAtual / acMeta) * 100)),
      },
      cp: {
        atual: cpAtual,
        meta: cpMeta,
        pct: Math.min(100, Math.round((cpAtual / cpMeta) * 100)),
      },
      trilha: {
        atual: trilhaAtual,
        meta: trilhaMeta,
        pct: Math.min(100, Math.round((trilhaAtual / trilhaMeta) * 100)),
      },
    };
  }, [usuario]);

  const forcaNovaSenha = useMemo(() => {
    const s = senhaForm.nova_senha;
    if (!s) return { nivel: 0, texto: '', cor: 'bg-slate-300' };
    let score = 0;
    if (s.length >= 6) score += 1;
    if (s.length >= 10) score += 1;
    if (/[A-Z]/.test(s) || /[0-9]/.test(s)) score += 1;
    if (/[^A-Za-z0-9]/.test(s)) score += 1;
    if (score <= 1) return { nivel: 33, texto: 'Fraca', cor: 'bg-amber-500' };
    if (score <= 2) return { nivel: 66, texto: 'Boa', cor: 'bg-blue-500' };
    return { nivel: 100, texto: 'Forte', cor: 'bg-emerald-500' };
  }, [senhaForm.nova_senha]);

  const handleSalvarPerfil = async (e) => {
    e.preventDefault();
    setSalvandoDados(true);
    const matTexto = String(form.matricula ?? '').trim();
    const matNumero = Number(matTexto);
    if (!/^\d+$/.test(matTexto) || !Number.isInteger(matNumero) || matNumero < 0 || matNumero > 999999) {
      onNotify('A matrícula deve ser um número inteiro entre 0 e 999999.', 'error');
      setSalvandoDados(false);
      return;
    }
    try {
      const atualizado = await api.updateUsuario({
        ...form,
        matricula: matNumero,
        periodo: Number(form.periodo),
        crs: Number(form.crs),
        horas_ac: Math.max(0, Number(form.horas_ac)),
        meta_ac: Math.max(1, Number(form.meta_ac)),
        horas_cp: Math.max(0, Number(form.horas_cp)),
        meta_cp: Math.max(1, Number(form.meta_cp)),
        horas_trilha: Math.max(0, Number(form.horas_trilha)),
        meta_trilha: Math.max(1, Number(form.meta_trilha)),
      });
      onUsuarioAtualizado(atualizado);
      onNotify('Dados acadêmicos, horas e perfil atualizados com sucesso!');
    } catch (err) {
      onNotify(err.message || 'Erro ao salvar alterações do perfil.', 'error');
    } finally {
      setSalvandoDados(false);
    }
  };

  const handleSalvarTotaisHorasECrs = async (e) => {
    e.preventDefault();
    setSalvandoDados(true);
    try {
      const atualizado = await api.updateUsuario({
        crs: Number(form.crs),
        horas_ac: Math.max(0, Number(form.horas_ac)),
        meta_ac: Math.max(1, Number(form.meta_ac)),
        horas_cp: Math.max(0, Number(form.horas_cp)),
        meta_cp: Math.max(1, Number(form.meta_cp)),
        horas_trilha: Math.max(0, Number(form.horas_trilha)),
        meta_trilha: Math.max(1, Number(form.meta_trilha)),
      });
      onUsuarioAtualizado(atualizado);
      onNotify('Horas de AC, CP, Trilha, metas e CRS atualizados!');
    } catch (err) {
      onNotify(err.message || 'Erro ao salvar horas validadas.', 'error');
    } finally {
      setSalvandoDados(false);
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (senhaForm.nova_senha !== senhaForm.confirmar_senha) {
      onNotify('A confirmação da nova senha não confere.', 'error');
      return;
    }
    setSalvandoSenha(true);
    try {
      const res = await api.alterarSenha(senhaForm);
      setSenhaForm({ senha_atual: '', nova_senha: '', confirmar_senha: '' });
      onNotify(res.mensagem || 'Senha atualizada com sucesso!');
    } catch (err) {
      onNotify(err.message || 'Erro ao alterar senha.', 'error');
    } finally {
      setSalvandoSenha(false);
    }
  };

  return (
    <div className="space-y-7">
      {/* ==========================================
          1. CARTEIRINHA DIGITAL + INDICADORES ACADÊMICOS (AC, CP, TRILHA & CRS)
          ========================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Carteirinha Estudantil Digital Inatel (5 colunas) */}
        <section className="lg:col-span-5 rounded-2xl bg-gradient-to-br from-[#003057] via-[#08427a] to-[#126ae2] text-white p-6 shadow-lg flex flex-col justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center justify-between gap-3">
            <img src={inatelBranco} alt="Inatel" className="h-7 object-contain" />
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOcultarDadosSensiveis((v) => !v)}
                title={ocultarDadosSensiveis ? 'Mostrar dados' : 'Ocultar matrícula e telefone'}
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition cursor-pointer"
              >
                <Icon
                  name={ocultarDadosSensiveis ? 'closedEye' : 'openEye'}
                  className="w-4 h-4 text-white"
                />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <img
              src={logoQuadrada}
              alt="Foto / Brasão"
              className="w-16 h-16 rounded-2xl border-2 border-white/40 shadow-md object-cover shrink-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] uppercase tracking-wider text-sky-200 font-bold">
                Identidade Estudantil Digital
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold truncate">
                {usuario?.nome || 'Kauã'}
              </h1>
              <p className="text-xs sm:text-sm text-white/85 truncate">
                {usuario?.curso} • {usuario?.periodo}º Período
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/20 text-xs">
            <div>
              <span className="text-white/70 block">Matrícula</span>
              <strong className="text-sm font-mono">
                {ocultarDadosSensiveis ? '••••••' : (usuario?.matricula ?? '')}
              </strong>
            </div>
            <div>
              <span className="text-white/70 block">Situação Acadêmica</span>
              <strong className="text-sm text-emerald-300">Regular • Ativo</strong>
            </div>
            <div>
              <span className="text-white/70 block">E-mail Institucional</span>
              <strong className="truncate block">{usuario?.email}</strong>
            </div>
            <div>
              <span className="text-white/70 block">Telefone</span>
              <strong>
                {ocultarDadosSensiveis
                  ? '(••) •••••-••••'
                  : usuario?.telefone || 'Não informado'}
              </strong>
            </div>
          </div>
        </section>

        {/* Indicadores de Rendimento Acadêmico (7 colunas) */}
        <section className="lg:col-span-7 theme-surface border rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <Icon name="chartBar" className="w-5 h-5 theme-accent-text" />
                Central da Conta &amp; Horas Curriculares
              </h2>
              <p className="text-xs sm:text-sm theme-text-secondary">
                Gerencie seu CRS, horas validadas de AC, CP e Trilha, dados pessoais e senha.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSecaoAtiva('horas')}
                className="theme-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Icon name="hourglass" className="w-3.5 h-3.5" />
                <span>Editar AC, CP &amp; Trilha</span>
              </button>
              <button
                type="button"
                onClick={() => setSecaoAtiva('dados')}
                className="theme-muted border px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-85 transition cursor-pointer"
              >
                <Icon name="edit" className="w-3.5 h-3.5" />
                <span>Editar Dados</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => setSecaoAtiva('horas')}
              className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">CRS</span>
                <Icon name="chartPie" className="w-4 h-4 theme-accent-text" />
              </div>
              <p className="text-xl font-extrabold">{usuario?.crs !== undefined ? `${Number(usuario.crs).toFixed(1)}%` : '86.4%'}</p>
              <span className="text-[11px] theme-text-secondary">Coeficiente semestral</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('dashboard')}
              className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">Média</span>
                <Icon name="cap" className="w-4 h-4 theme-accent-text" />
              </div>
              <p className="text-xl font-extrabold">{mediaDisciplinasSemestre.toFixed(1)}</p>
              <span className="text-[11px] theme-text-secondary">{aulas.length} disciplinas</span>
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('horas')}
              className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">Horas</span>
                <Icon name="hourglass" className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-extrabold">
                {progressoPilares.ac.atual +
                  progressoPilares.cp.atual +
                  progressoPilares.trilha.atual}
                h
              </p>
              <span className="text-[11px] theme-text-secondary">AC + CP + Trilha</span>
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('linkedin')}
              className="theme-muted border rounded-xl p-3 text-left hover:border-[#126ae2] transition cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">LinkedIn</span>
                <Icon name="link" className="w-4 h-4 theme-accent-text" />
              </div>
              <p className="text-xl font-extrabold">
                {analiseLinkedIn ? `${analiseLinkedIn.pontuacao_perfil}/100` : '—'}
              </p>
              <span className="text-[11px] theme-text-secondary">
                {analiseLinkedIn ? 'Força do perfil' : 'Analisar perfil'}
              </span>
            </button>
          </div>

          {/* 3 Barras de Progresso: AC, CP e Trilha */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => setSecaoAtiva('horas')}
              className="theme-muted border rounded-xl p-3 text-left space-y-1.5 hover:border-[#126ae2] transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold theme-accent-text">AC</span>
                <span className="font-bold">
                  {progressoPilares.ac.atual}/{progressoPilares.ac.meta}h ({progressoPilares.ac.pct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#126ae2] transition-all duration-500"
                  style={{ width: `${progressoPilares.ac.pct}%` }}
                />
              </div>
              <span className="text-[10px] theme-text-secondary block">
                Atividades Complementares
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('horas')}
              className="theme-muted border rounded-xl p-3 text-left space-y-1.5 hover:border-emerald-500 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400">CP</span>
                <span className="font-bold">
                  {progressoPilares.cp.atual}/{progressoPilares.cp.meta}h ({progressoPilares.cp.pct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${progressoPilares.cp.pct}%` }}
                />
              </div>
              <span className="text-[10px] theme-text-secondary block">
                Competências Pessoais
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSecaoAtiva('horas')}
              className="theme-muted border rounded-xl p-3 text-left space-y-1.5 hover:border-purple-500 transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-purple-600 dark:text-purple-400">Trilha</span>
                <span className="font-bold">
                  {progressoPilares.trilha.atual}/{progressoPilares.trilha.meta}h (
                  {progressoPilares.trilha.pct}%)
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full rounded-full bg-purple-500 transition-all duration-500"
                  style={{ width: `${progressoPilares.trilha.pct}%` }}
                />
              </div>
              <span className="text-[10px] theme-text-secondary block">
                Trilhas de Especialização
              </span>
            </button>
          </div>
        </section>
      </div>

      {/* ==========================================
          NAVEGAÇÃO DE ABAS DA CONTA DO USUÁRIO
          ========================================== */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
        <button
          type="button"
          onClick={() => setSecaoAtiva('horas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
            secaoAtiva === 'horas'
              ? 'theme-btn-primary border-transparent shadow-xs'
              : 'theme-surface hover:opacity-85'
          }`}
        >
          <Icon name="hourglass" className="w-4 h-4" />
          <span>Horas AC, CP &amp; Trilha</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/15">
            {progressoPilares.ac.atual + progressoPilares.cp.atual + progressoPilares.trilha.atual}h
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('linkedin')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
            secaoAtiva === 'linkedin'
              ? 'theme-btn-primary border-transparent shadow-xs'
              : 'theme-surface hover:opacity-85'
          }`}
        >
          <Icon name="link" className="w-4 h-4" />
          <span>Análise LinkedIn</span>
          {analiseLinkedIn && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-black/15">
              {analiseLinkedIn.pontuacao_perfil} pts
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('dados')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
            secaoAtiva === 'dados'
              ? 'theme-btn-primary border-transparent shadow-xs'
              : 'theme-surface hover:opacity-85'
          }`}
        >
          <Icon name="edit" className="w-4 h-4" />
          <span>Dados Cadastrais</span>
        </button>

        <button
          type="button"
          onClick={() => setSecaoAtiva('seguranca')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
            secaoAtiva === 'seguranca'
              ? 'theme-btn-primary border-transparent shadow-xs'
              : 'theme-surface hover:opacity-85'
          }`}
        >
          <Icon name="key" className="w-4 h-4" />
          <span>Segurança &amp; Senha</span>
        </button>
      </div>

      {/* ==========================================
          ABA HORAS VALIDADAS: AC, CP, TRILHA & CRS (METAS E HORAS MANUAIS)
          ========================================== */}
      {secaoAtiva === 'horas' && (
        <div className="space-y-6">
          <section className="theme-surface border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Icon name="hourglass" className="w-5 h-5 theme-accent-text" />
                  Controle de Horas Validadas (AC, CP &amp; Trilha) e CRS
                </h2>
                <p className="text-xs sm:text-sm theme-text-secondary mt-0.5">
                  Acompanhe suas metas curriculares e ajuste manualmente as horas já validadas e o CRS do semestre.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold theme-badge-soft hover:opacity-90 transition cursor-pointer"
                >
                  Gerenciar Aulas &amp; Provas →
                </button>
              </div>
            </div>

            <form onSubmit={handleSalvarTotaisHorasECrs} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* AC */}
                <div className="theme-muted border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase theme-accent-text">
                      AC
                    </span>
                    <span className="text-xs font-bold">{progressoPilares.ac.pct}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold theme-text-secondary block mb-1">
                        Validadas (h)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={form.horas_ac}
                        onChange={(e) => setForm((p) => ({ ...p, horas_ac: e.target.value }))}
                        className="w-full theme-surface border rounded-xl px-3 py-2 text-sm font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold theme-text-secondary block mb-1">
                        Meta (h)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={form.meta_ac}
                        onChange={(e) => setForm((p) => ({ ...p, meta_ac: e.target.value }))}
                        className="w-full theme-surface border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* CP */}
                <div className="theme-muted border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-emerald-600 dark:text-emerald-400">
                      CP
                    </span>
                    <span className="text-xs font-bold">{progressoPilares.cp.pct}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold theme-text-secondary block mb-1">
                        Validadas (h)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={form.horas_cp}
                        onChange={(e) => setForm((p) => ({ ...p, horas_cp: e.target.value }))}
                        className="w-full theme-surface border rounded-xl px-3 py-2 text-sm font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold theme-text-secondary block mb-1">
                        Meta (h)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={form.meta_cp}
                        onChange={(e) => setForm((p) => ({ ...p, meta_cp: e.target.value }))}
                        className="w-full theme-surface border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Trilha */}
                <div className="theme-muted border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase text-purple-600 dark:text-purple-400">
                      Trilha
                    </span>
                    <span className="text-xs font-bold">{progressoPilares.trilha.pct}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold theme-text-secondary block mb-1">
                        Validadas (h)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={form.horas_trilha}
                        onChange={(e) => setForm((p) => ({ ...p, horas_trilha: e.target.value }))}
                        className="w-full theme-surface border rounded-xl px-3 py-2 text-sm font-extrabold"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold theme-text-secondary block mb-1">
                        Meta (h)
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={1000}
                        value={form.meta_trilha}
                        onChange={(e) => setForm((p) => ({ ...p, meta_trilha: e.target.value }))}
                        className="w-full theme-surface border rounded-xl px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* CRS */}
                <div className="theme-muted border rounded-2xl p-4 space-y-3 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase">CRS</span>
                    {aulas.length > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((p) => ({
                            ...p,
                            crs: Math.round(mediaDisciplinasSemestre * 10 * 10) / 10,
                          }))
                        }
                        className="text-[11px] font-bold theme-accent-text hover:underline cursor-pointer"
                      >
                        Usar notas ({(mediaDisciplinasSemestre * 10).toFixed(1)}%)
                      </button>
                    )}
                  </div>
                  <div>
                    <label className="text-[11px] font-bold theme-text-secondary block mb-1">
                      Rendimento do Semestre (0 a 100%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min={0}
                      max={100}
                      value={form.crs}
                      onChange={(e) => setForm((p) => ({ ...p, crs: e.target.value }))}
                      className="w-full theme-surface border rounded-xl px-3 py-2 text-sm font-extrabold"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={salvandoDados}
                  className="theme-btn-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Icon name="check" className="w-4 h-4" />
                  <span>{salvandoDados ? 'Salvando...' : 'Salvar Horas Validadas, Metas & CRS'}</span>
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* ==========================================
          ABA LINKEDIN: COLETA E ANÁLISE DO PERFIL
          ========================================== */}
      {secaoAtiva === 'linkedin' && (
        <LinkedInAnalyzerSection
          usuario={usuario}
          analise={analiseLinkedIn}
          onAnaliseAtualizada={onAnaliseLinkedInAtualizada}
          onRefreshUsuario={onRefreshUsuario}
          onIrParaVagasLinkedIn={onIrParaVagasLinkedIn}
          onNotify={onNotify}
        />
      )}

      {/* ==========================================
          ABA DADOS CADASTRAIS: EDITAR NOME, EMAIL, MATRÍCULA E PERFIL
          ========================================== */}
      {secaoAtiva === 'dados' && (
        <section className="theme-surface border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
          <div className="border-b border-[var(--border-subtle)] pb-4">
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <Icon name="edit" className="w-5 h-5 theme-accent-text" />
              Alterar Dados da Conta &amp; Perfil Acadêmico
            </h2>
            <p className="text-xs sm:text-sm theme-text-secondary mt-1">
              Se você alterar seu <strong>e-mail</strong> ou <strong>matrícula</strong>, já poderá
              usá-los imediatamente no próximo login!
            </p>
          </div>

          <form onSubmit={handleSalvarPerfil} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold block mb-1">Nome Completo</label>
                <input
                  required
                  minLength={2}
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Matrícula</label>
                <input
                  type="number"
                  min={0}
                  max={999999}
                  step={1}
                  inputMode="numeric"
                  required
                  value={form.matricula ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      matricula: e.target.value.replace(/\D/g, '').slice(0, 6),
                    }))
                  }
                  placeholder="Ex: 2048"
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Curso</label>
                <select
                  value={form.curso}
                  onChange={(e) => setForm((p) => ({ ...p, curso: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3 py-2.5 text-sm"
                >
                  {CURSOS_INATEL.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Período</label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  required
                  value={form.periodo}
                  onChange={(e) => setForm((p) => ({ ...p, periodo: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Telefone</label>
                <input
                  value={form.telefone}
                  onChange={(e) => setForm((p) => ({ ...p, telefone: e.target.value }))}
                  placeholder="(35) 99999-9999"
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">GitHub</label>
                <input
                  value={form.github}
                  onChange={(e) => setForm((p) => ({ ...p, github: e.target.value }))}
                  placeholder="https://github.com/..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">LinkedIn</label>
                <input
                  value={form.linkedin}
                  onChange={(e) => setForm((p) => ({ ...p, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">CRS</label>
                <input
                  type="number"
                  step="0.1"
                  min={0}
                  max={100}
                  value={form.crs}
                  onChange={(e) => setForm((p) => ({ ...p, crs: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Horas de AC Validadas (h)</label>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={form.horas_ac}
                  onChange={(e) => setForm((p) => ({ ...p, horas_ac: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Horas de CP Validadas (h)</label>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={form.horas_cp}
                  onChange={(e) => setForm((p) => ({ ...p, horas_cp: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Horas de Trilha Validadas (h)</label>
                <input
                  type="number"
                  min={0}
                  max={1000}
                  value={form.horas_trilha}
                  onChange={(e) => setForm((p) => ({ ...p, horas_trilha: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-bold block mb-1">
                  Áreas de Interesse (separadas por vírgula)
                </label>
                <input
                  value={form.areas_interesse}
                  onChange={(e) => setForm((p) => ({ ...p, areas_interesse: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-3">
                <label className="text-xs font-bold block mb-1">Sobre mim</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={salvandoDados}
                className="theme-btn-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                <Icon name="check" className="w-4 h-4" />
                <span>{salvandoDados ? 'Salvando...' : 'Salvar Dados da Conta'}</span>
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ==========================================
          ABA SEGURANÇA: ALTERAÇÃO DE SENHA
          ========================================== */}
      {secaoAtiva === 'seguranca' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <section className="lg:col-span-7 theme-surface border rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
              <div>
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Icon name="key" className="w-5 h-5 theme-accent-text" />
                  Alterar Senha de Acesso
                </h2>
                <p className="text-xs sm:text-sm theme-text-secondary mt-1">
                  Informe sua senha atual e escolha uma nova senha segura com pelo menos 6
                  caracteres.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostrarSenhas((v) => !v)}
                className="px-3 py-1.5 rounded-lg theme-muted border text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name={mostrarSenhas ? 'closedEye' : 'openEye'} className="w-3.5 h-3.5" />
                <span>{mostrarSenhas ? 'Ocultar' : 'Mostrar'}</span>
              </button>
            </div>

            <form onSubmit={handleAlterarSenha} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Senha Atual *</label>
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  required
                  value={senhaForm.senha_atual}
                  onChange={(e) => setSenhaForm((p) => ({ ...p, senha_atual: e.target.value }))}
                  placeholder="Digite sua senha atual"
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Nova Senha (mín. 6) *</label>
                  <input
                    type={mostrarSenhas ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={senhaForm.nova_senha}
                    onChange={(e) => setSenhaForm((p) => ({ ...p, nova_senha: e.target.value }))}
                    placeholder="Nova senha"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Confirmar Nova Senha *</label>
                  <input
                    type={mostrarSenhas ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={senhaForm.confirmar_senha}
                    onChange={(e) =>
                      setSenhaForm((p) => ({ ...p, confirmar_senha: e.target.value }))
                    }
                    placeholder="Repita a nova senha"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              {senhaForm.nova_senha && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="theme-text-secondary">Força da nova senha:</span>
                    <span>{forcaNovaSenha.texto}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full transition-all ${forcaNovaSenha.cor}`}
                      style={{ width: `${forcaNovaSenha.nivel}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={salvandoSenha}
                  className="theme-btn-primary px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <Icon name="key" className="w-4 h-4" />
                  <span>{salvandoSenha ? 'Atualizando...' : 'Atualizar Senha'}</span>
                </button>
              </div>
            </form>
          </section>

          {/* Card lateral de Sessão Ativa */}
          <section className="lg:col-span-5 theme-surface border rounded-2xl p-6 shadow-xs space-y-4">
            <h3 className="text-base font-extrabold">Sessão &amp; Privacidade</h3>
            <div className="theme-muted border rounded-xl p-4 text-xs space-y-2">
              <p className="flex justify-between">
                <span className="theme-text-secondary">Usuário autenticado:</span>
                <strong>{usuario?.nome}</strong>
              </p>
              <p className="flex justify-between">
                <span className="theme-text-secondary">Login por e-mail:</span>
                <strong>{usuario?.email}</strong>
              </p>
              <p className="flex justify-between">
                <span className="theme-text-secondary">Login por matrícula:</span>
                <strong>{usuario?.matricula ?? ''}</strong>
              </p>
              {usuario?.atualizado_em && (
                <p className="flex justify-between">
                  <span className="theme-text-secondary">Última atualização:</span>
                  <strong>{usuario.atualizado_em}</strong>
                </p>
              )}
            </div>

            <p className="text-xs theme-text-secondary leading-relaxed">
              Sua senha é armazenada no banco com hash criptográfico{' '}
              <strong>PBKDF2-HMAC-SHA256</strong> e sua sessão utiliza token assinado{' '}
              <strong>JWT (HS256)</strong>.
            </p>

            <button
              type="button"
              onClick={onLogout}
              className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white transition cursor-pointer"
            >
              Encerrar Sessão neste Dispositivo
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
