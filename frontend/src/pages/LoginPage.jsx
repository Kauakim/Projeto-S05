import { useState } from 'react';
import inatelBranco from '@assets/images/Inatel Branco.png';
import logoQuadrada from '@assets/images/Logo INATEL.png';
import Icon from '../components/Icon';
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

const THEMES = [
  { id: 'inatel', label: 'Tema Claro', icon: 'sun' },
  { id: 'dark', label: 'Tema Escuro', icon: 'moon' },
];

export default function LoginPage({ onLoginSuccess, theme, onChangeTheme }) {
  const [modo, setModo] = useState('login'); // 'login' | 'registro'
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  // Estado Login
  const [loginForm, setLoginForm] = useState({
    identificador: '',
    senha: '',
  });

  // Estado Registro
  const [regForm, setRegForm] = useState({
    nome: '',
    matricula: '',
    curso: 'Engenharia de Software',
    periodo: 1,
    email: '',
    telefone: '',
    senha: '',
    confirmarSenha: '',
  });

  const preencherDemo = () => {
    setErro('');
    setModo('login');
    setLoginForm({
      identificador: 'kaua@ges.inatel.br',
      senha: '123456',
    });
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);
    try {
      const res = await api.login(loginForm.identificador, loginForm.senha);
      onLoginSuccess(res.access_token, res.usuario, `Bem-vindo de volta, ${res.usuario.nome}!`);
    } catch (err) {
      setErro(err.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmitRegistro = async (e) => {
    e.preventDefault();
    setErro('');
    const matTexto = String(regForm.matricula ?? '').trim();
    const matNumero = Number(matTexto);
    if (!/^\d+$/.test(matTexto) || !Number.isInteger(matNumero) || matNumero < 0 || matNumero > 999999) {
      setErro('A matrícula deve ser um número inteiro entre 0 e 999999.');
      return;
    }
    if (regForm.senha !== regForm.confirmarSenha) {
      setErro('As senhas informadas não conferem.');
      return;
    }
    setCarregando(true);
    try {
      const res = await api.registro({
        nome: regForm.nome,
        matricula: matNumero,
        curso: regForm.curso,
        periodo: Number(regForm.periodo),
        email: regForm.email,
        telefone: regForm.telefone,
        senha: regForm.senha,
      });
      onLoginSuccess(
        res.access_token,
        res.usuario,
        `Conta acadêmica criada com sucesso! Olá, ${res.usuario.nome}!`
      );
    } catch (err) {
      setErro(err.message || 'Não foi possível concluir o cadastro.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ==========================================
          PAINEL INSTITUCIONAL INATEL (ESQUERDA)
          ========================================== */}
      <div className="lg:w-5/12 bg-gradient-to-br from-[#002240] via-[#003057] to-[#126ae2] text-white p-8 sm:p-12 flex flex-col justify-between gap-8">
        <div className="flex items-center justify-between">
          <img src={inatelBranco} alt="Inatel" className="h-8 sm:h-9 object-contain" />
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/15 border border-white/20">
            Portal Acadêmico S05
          </span>
        </div>

        <div className="space-y-6 my-auto">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/15 text-xs font-semibold">
            <img src={logoQuadrada} alt="" className="w-5 h-5 rounded-md" />
            <span>Santa Rita do Sapucaí • Vale da Eletrônica</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">
            Sua vida acadêmica e carreira conectadas em um só lugar.
          </h1>

          <p className="text-sm sm:text-base text-sky-100/90 leading-relaxed">
            Acesse sua grade horária, acompanhe notas e provas, valide suas horas de AC, CP e Trilha
            e busque vagas no LinkedIn alinhadas à sua área.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 pt-2">
            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl p-3.5">
              <div className="p-2 rounded-lg bg-white/15">
                <Icon name="calendar" className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Grade, Faltas &amp; Avaliações</p>
                <p className="text-[11px] text-white/75">Alertas de provas e desempenho em tempo real</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl p-3.5">
              <div className="p-2 rounded-lg bg-white/15">
                <Icon name="folder" className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Vagas LinkedIn &amp; Notícias Inatel</p>
                <p className="text-[11px] text-white/75">Oportunidades externas e notícias oficiais</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 border border-white/10 rounded-xl p-3.5">
              <div className="p-2 rounded-lg bg-white/15">
                <Icon name="key" className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold">Gestão Completa da Conta</p>
                <p className="text-[11px] text-white/75">Edite nome, e-mail, senha e perfil profissional</p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-xs text-white/65">
          © 2026 Instituto Nacional de Telecomunicações — Projeto S05 (Interface Homem-Máquina)
        </p>
      </div>

      {/* ==========================================
          PAINEL DE AUTENTICAÇÃO (DIREITA)
          ========================================== */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-14">
        {/* Topo: Seletor de Temas (Sol / Lua) */}
        <div className="flex items-center justify-end gap-2">
          <div className="flex items-center theme-surface border p-1 rounded-xl">
            {THEMES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeTheme(t.id)}
                title={t.label}
                aria-label={t.label}
                className={`p-1.5 rounded-lg transition cursor-pointer flex items-center justify-center ${
                  theme === t.id ? 'theme-btn-primary' : 'theme-text-secondary hover:opacity-80'
                }`}
              >
                <Icon name={t.icon} className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        {/* Card Central de Login / Cadastro */}
        <div className="max-w-md w-full mx-auto my-8 space-y-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {modo === 'login' ? 'Acessar Portal do Aluno' : 'Criar Conta Acadêmica'}
            </h2>
            <p className="text-sm theme-text-secondary">
              {modo === 'login'
                ? 'Entre com seu e-mail institucional ou número de matrícula.'
                : 'Cadastre seus dados para acessar o portal acadêmico do Inatel.'}
            </p>
          </div>

          {/* Abas Entrar / Criar Conta */}
          <div className="grid grid-cols-2 p-1 rounded-xl theme-muted border">
            <button
              type="button"
              onClick={() => {
                setModo('login');
                setErro('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                modo === 'login'
                  ? 'theme-surface shadow-xs theme-accent-text'
                  : 'theme-text-secondary'
              }`}
            >
              <Icon name="key" className="w-4 h-4" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModo('registro');
                setErro('');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition cursor-pointer ${
                modo === 'registro'
                  ? 'theme-surface shadow-xs theme-accent-text'
                  : 'theme-text-secondary'
              }`}
            >
              <Icon name="addUser" className="w-4 h-4" />
              <span>Criar Conta</span>
            </button>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-600 dark:text-red-400 font-semibold flex items-center gap-2">
              <Icon name="ban" className="w-4 h-4 shrink-0" />
              <span>{erro}</span>
            </div>
          )}

          {/* FORMULÁRIO 1: LOGIN */}
          {modo === 'login' ? (
            <form onSubmit={handleSubmitLogin} className="theme-surface border rounded-2xl p-6 shadow-sm space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1.5">
                  E-mail ou Matrícula
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={loginForm.identificador}
                    onChange={(e) =>
                      setLoginForm((p) => ({ ...p, identificador: e.target.value }))
                    }
                    placeholder="kaua@ges.inatel.br ou 2048"
                    className="w-full theme-muted border rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-secondary">
                    <Icon name="user" className="w-4 h-4" />
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={loginForm.senha}
                    onChange={(e) => setLoginForm((p) => ({ ...p, senha: e.target.value }))}
                    placeholder="Digite sua senha"
                    className="w-full theme-muted border rounded-xl pl-3.5 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 theme-text-secondary hover:opacity-80 cursor-pointer"
                    title={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    <Icon name={mostrarSenha ? 'closedEye' : 'openEye'} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full theme-btn-primary py-3 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {carregando ? 'Autenticando...' : 'Entrar no Portal'}
              </button>

              {/* Atalho de demonstração para apresentação do trabalho */}
              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
                <div className="theme-text-secondary">
                  <span className="font-bold block">Conta padrão de teste:</span>
                  <span>Matrícula 2048 • Senha inicial: 123456</span>
                </div>
                <button
                  type="button"
                  onClick={preencherDemo}
                  className="px-3 py-1.5 rounded-lg theme-muted border font-bold hover:opacity-80 shrink-0 cursor-pointer"
                >
                  Preencher
                </button>
              </div>
            </form>
          ) : (
            /* FORMULÁRIO 2: REGISTRO DE NOVO USUÁRIO */
            <form onSubmit={handleSubmitRegistro} className="theme-surface border rounded-2xl p-6 shadow-sm space-y-3.5">
              <div>
                <label className="text-xs font-bold block mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={regForm.nome}
                  onChange={(e) => setRegForm((p) => ({ ...p, nome: e.target.value }))}
                  placeholder="Ex: Ana Clara Silva"
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Matrícula</label>
                  <input
                    type="number"
                    min={0}
                    max={999999}
                    step={1}
                    inputMode="numeric"
                    required
                    value={regForm.matricula}
                    onChange={(e) =>
                      setRegForm((p) => ({
                        ...p,
                        matricula: e.target.value.replace(/\D/g, '').slice(0, 6),
                      }))
                    }
                    placeholder="Ex: 2048"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Período *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={regForm.periodo}
                    onChange={(e) => setRegForm((p) => ({ ...p, periodo: e.target.value }))}
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Curso *</label>
                <select
                  value={regForm.curso}
                  onChange={(e) => setRegForm((p) => ({ ...p, curso: e.target.value }))}
                  className="w-full theme-muted border rounded-xl px-3 py-2 text-sm"
                >
                  {CURSOS_INATEL.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">E-mail Institucional *</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="aluno@ges.inatel.br"
                  className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold block mb-1">Senha (mín. 6) *</label>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regForm.senha}
                    onChange={(e) => setRegForm((p) => ({ ...p, senha: e.target.value }))}
                    placeholder="••••••"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Confirmar Senha *</label>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={regForm.confirmarSenha}
                    onChange={(e) => setRegForm((p) => ({ ...p, confirmarSenha: e.target.value }))}
                    placeholder="••••••"
                    className="w-full theme-muted border rounded-xl px-3.5 py-2 text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="w-full theme-btn-primary py-3 rounded-xl text-sm font-bold shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                {carregando ? 'Criando conta...' : 'Cadastrar e Acessar Portal'}
              </button>
            </form>
          )}
        </div>

        <div className="text-center text-xs theme-text-secondary">
          Conexão protegida via Token JWT • FastAPI + PostgreSQL
        </div>
      </div>
    </div>
  );
}

