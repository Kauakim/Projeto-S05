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
  vagas = [],
  candidaturas = [],
  vagasSalvasIds = [],
  analiseLinkedIn = null,
  secaoSolicitada = null,
  onSecaoSolicitadaConsumida,
  onUsuarioAtualizado,
  onRefreshUsuario,
  onAnaliseLinkedInAtualizada,
  onIrParaVagasLinkedIn,
  onRefreshVagasECandidaturas,
  onToggleSalvarVaga,
  onNavigate,
  onNotify,
  onLogout,
}) {
  // Abas internas: 'resumo' | 'linkedin' | 'dados' | 'seguranca'
  const [secaoAtiva, setSecaoAtiva] = useState('resumo');

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
    horas_complementares: 0,
    disponivel_estagio: true,
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
        matricula: usuario.matricula || '',
        curso: usuario.curso || 'Engenharia de Software',
        periodo: usuario.periodo || 6,
        email: usuario.email || '',
        telefone: usuario.telefone || '',
        bio: usuario.bio || '',
        github: usuario.github || '',
        linkedin: usuario.linkedin || '',
        areas_interesse: usuario.areas_interesse || '',
        horas_complementares: usuario.horas_complementares ?? 0,
        disponivel_estagio: usuario.disponivel_estagio ?? true,
      });
    }
  }, [usuario]);

  const mediaDisciplinasSemestre = useMemo(() => {
    if (!aulas.length) return 0;
    const soma = aulas.reduce((acc, a) => acc + Number(a.nota || 0), 0);
    return soma / aulas.length;
  }, [aulas]);

  const percentualHoras = useMemo(() => {
    const meta = usuario?.meta_horas || 160;
    const atual = usuario?.horas_complementares || 0;
    return Math.min(100, Math.round((atual / meta) * 100));
  }, [usuario]);

  const vagasSalvas = useMemo(
    () => vagas.filter((v) => vagasSalvasIds.includes(v.id)),
    [vagas, vagasSalvasIds]
  );

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
    try {
      const atualizado = await api.updateUsuario({
        ...form,
        periodo: Number(form.periodo),
        horas_complementares: Number(form.horas_complementares),
      });
      onUsuarioAtualizado(atualizado);
      onNotify('Dados da conta atualizados com sucesso!');
    } catch (err) {
      onNotify(err.message || 'Erro ao salvar alterações do perfil.', 'error');
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

  const handleCancelarCandidatura = async (candId) => {
    try {
      await api.cancelarCandidatura(candId);
      await onRefreshVagasECandidaturas();
      onNotify('Candidatura cancelada com sucesso.');
    } catch (err) {
      onNotify(err.message || 'Erro ao cancelar candidatura.', 'error');
    }
  };

  const handleExportarComprovante = () => {
    const conteudo = [
      '======================================================',
      '   INSTITUTO NACIONAL DE TELECOMUNICAÇÕES - INATEL    ',
      '        COMPROVANTE DIGITAL DE VÍNCULO ACADÊMICO      ',
      '======================================================',
      `Aluno(a): ${usuario?.nome || ''}`,
      `Matrícula: ${usuario?.matricula || ''}`,
      `Curso: ${usuario?.curso || ''} (${usuario?.periodo || ''}º período)`,
      `E-mail institucional: ${usuario?.email || ''}`,
      `IRA / Rendimento: ${usuario?.ira?.toFixed(1) || '86.4'}%`,
      `Horas Complementares: ${usuario?.horas_complementares || 0}/${usuario?.meta_horas || 160}h`,
      `Status NESP: ${usuario?.disponivel_estagio ? 'Disponível para Estágio' : 'Indisponível'}`,
      `Emitido em: ${new Date().toLocaleString('pt-BR')}`,
      '======================================================',
    ].join('\n');

    const blob = new Blob([conteudo], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprovante_inatel_${(usuario?.matricula || 'aluno').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify('Comprovante acadêmico exportado!');
  };

  return (
    <div className="space-y-7">
      {/* ==========================================
          1. CARTEIRINHA DIGITAL + INDICADORES ACADÊMICOS
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
              <button
                type="button"
                onClick={handleExportarComprovante}
                title="Baixar comprovante de matrícula"
                className="p-2 rounded-lg bg-white/15 hover:bg-white/25 transition cursor-pointer"
              >
                <Icon name="download" className="w-4 h-4 text-white" />
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
                {ocultarDadosSensiveis ? '•••-••••' : usuario?.matricula}
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
        <section className="lg:col-span-7 theme-surface border rounded-2xl p-6 shadow-xs flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <Icon name="chartBar" className="w-5 h-5 theme-accent-text" />
                Central da Conta &amp; Rendimento
              </h2>
              <p className="text-xs sm:text-sm theme-text-secondary">
                Gerencie seu nome, e-mail, senha e acompanhe suas métricas no Inatel.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSecaoAtiva('linkedin')}
                className="theme-btn-primary px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Icon name="link" className="w-3.5 h-3.5" />
                <span>Analisar LinkedIn</span>
              </button>
              <button
                type="button"
                onClick={() => setSecaoAtiva('dados')}
                className="theme-muted border px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-85 transition cursor-pointer"
              >
                <Icon name="edit" className="w-3.5 h-3.5" />
                <span>Editar Dados</span>
              </button>
              <button
                type="button"
                onClick={() => setSecaoAtiva('seguranca')}
                className="theme-muted border px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 hover:opacity-85 transition cursor-pointer"
              >
                <Icon name="key" className="w-3.5 h-3.5" />
                <span>Alterar Senha</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="theme-muted border rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">IRA</span>
                <Icon name="chartPie" className="w-4 h-4 theme-accent-text" />
              </div>
              <p className="text-xl font-extrabold">{usuario?.ira?.toFixed(1) || '86.4'}%</p>
              <span className="text-[11px] theme-text-secondary">Rendimento Global</span>
            </div>

            <div className="theme-muted border rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">Média</span>
                <Icon name="cap" className="w-4 h-4 theme-accent-text" />
              </div>
              <p className="text-xl font-extrabold">{mediaDisciplinasSemestre.toFixed(1)}</p>
              <span className="text-[11px] theme-text-secondary">{aulas.length} disciplinas</span>
            </div>

            <div className="theme-muted border rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">Vagas</span>
                <Icon name="check" className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xl font-extrabold">{candidaturas.length}</p>
              <span className="text-[11px] theme-text-secondary">Candidaturas ativas</span>
            </div>

            <div className="theme-muted border rounded-xl p-3.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold theme-text-secondary uppercase">NESP</span>
                <Icon name="user" className="w-4 h-4 theme-accent-text" />
              </div>
              <p className="text-sm font-extrabold mt-1">
                {usuario?.disponivel_estagio ? 'Disponível' : 'Pausado'}
              </p>
              <span className="text-[11px] theme-text-secondary">Status p/ recrutadores</span>
            </div>
          </div>

          {/* Barra de Progresso de Horas Complementares */}
          <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold flex items-center gap-1.5">
                <Icon name="hourglass" className="w-3.5 h-3.5 theme-accent-text" />
                Atividades Complementares (ACs)
              </span>
              <span className="font-extrabold">
                {usuario?.horas_complementares ?? 0}h / {usuario?.meta_horas ?? 160}h (
                {percentualHoras}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${percentualHoras}%` }}
              />
            </div>
          </div>
        </section>
      </div>

      {/* ==========================================
          NAVEGAÇÃO DE ABAS DA CONTA DO USUÁRIO
          ========================================== */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--border-subtle)] pb-3">
        <button
          type="button"
          onClick={() => setSecaoAtiva('resumo')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold border transition cursor-pointer ${
            secaoAtiva === 'resumo'
              ? 'theme-btn-primary border-transparent shadow-xs'
              : 'theme-surface hover:opacity-85'
          }`}
        >
          <Icon name="user" className="w-4 h-4" />
          <span>Visão Geral &amp; Candidaturas</span>
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
          <span>Análise LinkedIn (Scraping)</span>
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
          <span>Dados Cadastrais (Nome, E-mail, Curso...)</span>
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
          ABA 1: VISÃO GERAL, BIO, CANDIDATURAS E SALVAS
          ========================================== */}
      {secaoAtiva === 'resumo' && (
        <div className="space-y-6">
          <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold flex items-center gap-2">
                <Icon name="user" className="w-5 h-5 theme-accent-text" />
                Apresentação &amp; Links Profissionais
              </h2>

              <div className="flex flex-wrap gap-2">
                {usuario?.github && (
                  <a
                    href={usuario.github}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold theme-muted border hover:opacity-80"
                  >
                    <Icon name="link" className="w-3.5 h-3.5" />
                    GitHub
                  </a>
                )}
                {usuario?.linkedin && (
                  <a
                    href={usuario.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold theme-muted border hover:opacity-80"
                  >
                    <Icon name="link" className="w-3.5 h-3.5" />
                    LinkedIn
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => setSecaoAtiva('linkedin')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold theme-badge-soft hover:opacity-90 cursor-pointer"
                >
                  <Icon name="chartBar" className="w-3.5 h-3.5" />
                  <span>
                    {analiseLinkedIn
                      ? `Diagnóstico LinkedIn (${analiseLinkedIn.pontuacao_perfil}/100)`
                      : 'Coletar & Analisar LinkedIn'}
                  </span>
                </button>
              </div>
            </div>

            <p className="text-sm theme-text-secondary leading-relaxed">
              {usuario?.bio || 'Nenhuma biografia cadastrada.'}
            </p>

            {usuario?.areas_interesse && (
              <div className="flex flex-wrap gap-2 pt-1">
                {usuario.areas_interesse
                  .split(',')
                  .map((area) => area.trim())
                  .filter(Boolean)
                  .map((area) => (
                    <span
                      key={area}
                      className="text-xs font-semibold px-3 py-1 rounded-full theme-badge-soft"
                    >
                      {area}
                    </span>
                  ))}
              </div>
            )}
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Minhas Candidaturas */}
            <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Icon name="check" className="w-5 h-5 text-emerald-600" />
                  Minhas Candidaturas ({candidaturas.length})
                </h2>
                <button
                  type="button"
                  onClick={() => onNavigate('vagas-noticias')}
                  className="text-xs font-bold theme-accent-text hover:underline cursor-pointer"
                >
                  Buscar mais vagas →
                </button>
              </div>

              {candidaturas.length === 0 ? (
                <div className="theme-muted border rounded-xl p-6 text-center space-y-2">
                  <p className="text-sm font-semibold">
                    Você ainda não se candidatou a nenhuma vaga.
                  </p>
                  <p className="text-xs theme-text-secondary">
                    Acesse a página de Vagas &amp; Notícias para enviar seu perfil ao NESP!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {candidaturas.map((cand) => (
                    <div
                      key={cand.id}
                      className="theme-muted border rounded-xl p-4 flex flex-col gap-2.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">
                            {cand.status}
                          </span>
                          <h3 className="text-sm font-extrabold mt-1">{cand.vaga_titulo}</h3>
                          <p className="text-xs theme-text-secondary">
                            {cand.vaga_empresa} • {cand.vaga_tipo} ({cand.vaga_modalidade})
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCancelarCandidatura(cand.id)}
                          title="Cancelar candidatura"
                          className="p-2 rounded-lg border border-[var(--border-subtle)] hover:bg-red-500/10 hover:text-red-500 transition cursor-pointer"
                        >
                          <Icon name="trash" className="w-4 h-4" />
                        </button>
                      </div>

                      {cand.mensagem && (
                        <p className="text-xs theme-text-secondary italic border-l-2 border-[var(--border-subtle)] pl-2.5">
                          "{cand.mensagem}"
                        </p>
                      )}

                      <span className="text-[11px] theme-text-secondary">
                        Enviada em {cand.criado_em}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Vagas Salvas / Favoritas */}
            <section className="theme-surface border rounded-2xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-extrabold flex items-center gap-2">
                  <Icon name="bookmark" className="w-5 h-5 text-amber-500" />
                  Vagas Salvas ({vagasSalvas.length})
                </h2>
              </div>

              {vagasSalvas.length === 0 ? (
                <div className="theme-muted border rounded-xl p-6 text-center space-y-2">
                  <p className="text-sm font-semibold">Nenhuma vaga favoritada.</p>
                  <p className="text-xs theme-text-secondary">
                    Clique no ícone de marcador nas vagas do mural NESP para guardá-las aqui.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {vagasSalvas.map((vaga) => (
                    <div
                      key={vaga.id}
                      className="theme-muted border rounded-xl p-4 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <h3 className="text-sm font-extrabold truncate">{vaga.titulo}</h3>
                        <p className="text-xs theme-text-secondary truncate">
                          {vaga.empresa} • {vaga.bolsa_ou_salario}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onNavigate('vagas-noticias')}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold theme-btn-primary cursor-pointer"
                        >
                          Abrir
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleSalvarVaga(vaga.id)}
                          title="Remover dos salvos"
                          className="p-1.5 rounded-lg border border-[var(--border-subtle)] hover:text-red-500 cursor-pointer"
                        >
                          <Icon name="close" className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
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
          ABA 2: EDITAR NOME, EMAIL, MATRÍCULA E PERFIL
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
                <label className="text-xs font-bold block mb-1">Nome Completo / Exibição *</label>
                <input
                  required
                  minLength={2}
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">E-mail de Login *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Matrícula *</label>
                <input
                  required
                  value={form.matricula}
                  onChange={(e) => setForm((p) => ({ ...p, matricula: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm uppercase"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Curso *</label>
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
                <label className="text-xs font-bold block mb-1">Período Atual *</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={form.periodo}
                  onChange={(e) => setForm((p) => ({ ...p, periodo: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Telefone / WhatsApp</label>
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
                <label className="text-xs font-bold block mb-1">Horas Complementares</label>
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={form.horas_complementares}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, horas_complementares: e.target.value }))
                  }
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
                <label className="text-xs font-bold block mb-1">Sobre mim / Bio Profissional</label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={form.disponivel_estagio}
                onChange={(e) =>
                  setForm((p) => ({ ...p, disponivel_estagio: e.target.checked }))
                }
              />
              <span>Deixar meu currículo visível para empresas parceiras do NESP Inatel</span>
            </label>

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
          ABA 3: SEGURANÇA & ALTERAÇÃO DE SENHA
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
                <strong>{usuario?.matricula}</strong>
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
