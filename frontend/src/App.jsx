import { useCallback, useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Icon from './components/Icon';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import VagasNoticiasPage from './pages/VagasNoticiasPage';
import UserProfilePage from './pages/UserProfilePage';
import { api, getStoredToken, setStoredToken } from './services/api';

const PAGINAS_VALIDAS = ['dashboard', 'vagas-noticias', 'perfil'];

function lerPaginaDoHash() {
  const hash = window.location.hash.replace('#', '').trim();
  return PAGINAS_VALIDAS.includes(hash) ? hash : 'dashboard';
}

export default function App() {
  const [activePage, setActivePage] = useState(lerPaginaDoHash);
  const [theme, setTheme] = useState(() => localStorage.getItem('inatel_theme') || 'inatel');

  // Autenticação & Dados da API
  const [autenticandoInicial, setAutenticandoInicial] = useState(() => Boolean(getStoredToken()));
  const [usuario, setUsuario] = useState(null);
  const [dbStatus, setDbStatus] = useState(null);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [erroApi, setErroApi] = useState(null);

  const [aulas, setAulas] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [vagas, setVagas] = useState([]);
  const [noticias, setNoticias] = useState([]);
  const [candidaturas, setCandidaturas] = useState([]);
  const [analiseLinkedIn, setAnaliseLinkedIn] = useState(null);
  const [vagasLinkedIn, setVagasLinkedIn] = useState([]);

  // Atalhos de sub-abas ao navegar entre Perfil <-> Vagas LinkedIn <-> Notícias
  const [abaSolicitadaVagas, setAbaSolicitadaVagas] = useState(null);
  const [noticiaSolicitada, setNoticiaSolicitada] = useState(null);
  const [secaoSolicitadaPerfil, setSecaoSolicitadaPerfil] = useState(null);

  // Favoritos persistidos localmente
  const [vagasSalvasIds, setVagasSalvasIds] = useState(() => {
    try {
      const salvo = JSON.parse(localStorage.getItem('inatel_vagas_salvas') || '[]');
      return Array.isArray(salvo) ? salvo : [];
    } catch {
      return [];
    }
  });

  // Toast de feedback
  const [toast, setToast] = useState(null);

  const showToast = useCallback((mensagem, tipo = 'success') => {
    setToast({ mensagem, tipo });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Aplica tema no <html>
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('inatel_theme', theme);
  }, [theme]);

  // Sincroniza navegação com hash da URL
  useEffect(() => {
    const onHashChange = () => setActivePage(lerPaginaDoHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const handleNavigate = (pageId) => {
    window.location.hash = pageId;
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = useCallback(() => {
    setStoredToken('');
    setUsuario(null);
    setCandidaturas([]);
    setAnaliseLinkedIn(null);
    setVagasLinkedIn([]);
  }, []);

  // Escuta expiração de token
  useEffect(() => {
    const onUnauthorized = () => {
      handleLogout();
      showToast('Sua sessão expirou. Faça login novamente.', 'error');
    };
    window.addEventListener('inatel:unauthorized', onUnauthorized);
    return () => window.removeEventListener('inatel:unauthorized', onUnauthorized);
  }, [handleLogout, showToast]);

  const toggleSalvarVaga = (vagaId) => {
    setVagasSalvasIds((prev) => {
      const proximo = prev.includes(vagaId)
        ? prev.filter((id) => id !== vagaId)
        : [...prev, vagaId];
      localStorage.setItem('inatel_vagas_salvas', JSON.stringify(proximo));
      return proximo;
    });
  };

  const refreshVagasECandidaturas = useCallback(async () => {
    const [listaVagas, listaCand] = await Promise.all([
      api.getVagas(),
      api.getCandidaturas(),
    ]);
    setVagas(listaVagas);
    setCandidaturas(listaCand);
  }, []);

  const refreshNoticias = useCallback(async () => {
    const listaNoticias = await api.getNoticias();
    setNoticias(listaNoticias);
  }, []);

  const refreshUsuario = useCallback(async () => {
    const me = await api.getMe();
    setUsuario(me);
  }, []);

  const irParaVagasLinkedIn = useCallback(() => {
    setAbaSolicitadaVagas('linkedin-vagas');
    window.location.hash = 'vagas-noticias';
    setActivePage('vagas-noticias');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const irParaNoticias = useCallback((noticiaInicial = null) => {
    setAbaSolicitadaVagas('noticias');
    if (noticiaInicial) {
      setNoticiaSolicitada(noticiaInicial);
    }
    window.location.hash = 'vagas-noticias';
    setActivePage('vagas-noticias');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const irParaAnaliseLinkedIn = useCallback(() => {
    setSecaoSolicitadaPerfil('linkedin');
    window.location.hash = 'perfil';
    setActivePage('perfil');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const carregarDadosPortal = useCallback(async () => {
    setCarregandoDados(true);
    setErroApi(null);
    try {
      const [
        health,
        listaAulas,
        listaEventos,
        listaVagas,
        listaNoticias,
        listaCand,
        analiseLi,
        vagasLi,
      ] = await Promise.all([
        api.getHealth(),
        api.getAulas('todas'),
        api.getEventos(),
        api.getVagas(),
        api.getNoticias(),
        api.getCandidaturas(),
        api.getAnaliseLinkedIn(),
        api.getVagasLinkedIn(),
      ]);

      setDbStatus(health?.database || { mode: 'online' });
      setAulas(listaAulas);
      setEventos(listaEventos);
      setVagas(listaVagas);
      setNoticias(listaNoticias);
      setCandidaturas(listaCand);
      setAnaliseLinkedIn(analiseLi);
      setVagasLinkedIn(vagasLi || []);
    } catch (err) {
      setDbStatus(null);
      setErroApi(
        err.message ||
          'Não foi possível conectar ao backend FastAPI em http://localhost:8000.'
      );
    } finally {
      setCarregandoDados(false);
    }
  }, []);

  // Valida sessão existente ao abrir o site
  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setAutenticandoInicial(false);
      return;
    }

    let cancelado = false;
    (async () => {
      try {
        const me = await api.getMe();
        if (!cancelado) {
          setUsuario(me);
          await carregarDadosPortal();
        }
      } catch {
        if (!cancelado) {
          setStoredToken('');
          setUsuario(null);
        }
      } finally {
        if (!cancelado) setAutenticandoInicial(false);
      }
    })();

    return () => {
      cancelado = true;
    };
  }, [carregarDadosPortal]);

  const handleLoginSuccess = async (token, userObj, welcomeMsg) => {
    setStoredToken(token);
    setUsuario(userObj);
    if (welcomeMsg) showToast(welcomeMsg);
    await carregarDadosPortal();
  };

  if (autenticandoInicial) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="theme-surface border rounded-2xl p-10 text-center space-y-3 shadow-sm">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold theme-text-secondary">
            Verificando credenciais acadêmicas...
          </p>
        </div>
      </div>
    );
  }

  // Se não estiver logado, exibe a tela de Login / Cadastro
  if (!usuario) {
    return (
      <>
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          theme={theme}
          onChangeTheme={setTheme}
        />
        {toast && (
          <div className="fixed bottom-5 right-5 z-50 max-w-sm">
            <div
              className={`px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
                toast.tipo === 'error'
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-emerald-600 text-white border-emerald-500'
              }`}
            >
              <Icon name={toast.tipo === 'error' ? 'ban' : 'check'} className="w-4 h-4 text-white" />
              <span>{toast.mensagem}</span>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar
        activePage={activePage}
        onNavigate={handleNavigate}
        theme={theme}
        onChangeTheme={setTheme}
        usuario={usuario}
        totalVagas={vagas.length}
        totalCandidaturas={candidaturas.length}
        dbStatus={dbStatus}
        onLogout={() => {
          handleLogout();
          showToast('Sessão encerrada com segurança.');
        }}
      />

      {/* Alerta caso a API não esteja respondendo */}
      {erroApi && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
            <div className="flex items-center gap-2.5">
              <Icon name="ban" className="w-5 h-5 text-red-500" />
              <span>
                <strong>Backend offline:</strong> {erroApi} Certifique-se de rodar{' '}
                <code className="px-1.5 py-0.5 rounded bg-black/10 font-mono text-xs">
                  npm start
                </code>{' '}
                na raiz do projeto.
              </span>
            </div>
            <button
              type="button"
              onClick={carregarDadosPortal}
              className="px-4 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              Tentar reconectar
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7">
        {carregandoDados ? (
          <div className="theme-surface border rounded-2xl p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold theme-text-secondary">
              Sincronizando portal acadêmico Inatel...
            </p>
          </div>
        ) : (
          <>
            {activePage === 'dashboard' && (
              <DashboardPage
                usuario={usuario}
                aulas={aulas}
                eventos={eventos}
                vagas={vagas}
                noticias={noticias}
                onNavigate={handleNavigate}
                onIrParaNoticias={irParaNoticias}
              />
            )}

            {activePage === 'vagas-noticias' && (
              <VagasNoticiasPage
                usuario={usuario}
                vagas={vagas}
                noticias={noticias}
                vagasLinkedIn={vagasLinkedIn}
                analiseLinkedIn={analiseLinkedIn}
                abaSolicitada={abaSolicitadaVagas}
                onAbaSolicitadaConsumida={() => setAbaSolicitadaVagas(null)}
                noticiaSolicitada={noticiaSolicitada}
                onNoticiaSolicitadaConsumida={() => setNoticiaSolicitada(null)}
                onVagasLinkedInAtualizadas={setVagasLinkedIn}
                onIrParaAnalisePerfil={irParaAnaliseLinkedIn}
                vagasSalvasIds={vagasSalvasIds}
                onToggleSalvarVaga={toggleSalvarVaga}
                onRefreshVagasECandidaturas={refreshVagasECandidaturas}
                onRefreshNoticias={refreshNoticias}
                onSetNoticias={setNoticias}
                onNotify={showToast}
              />
            )}

            {activePage === 'perfil' && (
              <UserProfilePage
                usuario={usuario}
                aulas={aulas}
                vagas={vagas}
                candidaturas={candidaturas}
                vagasSalvasIds={vagasSalvasIds}
                analiseLinkedIn={analiseLinkedIn}
                secaoSolicitada={secaoSolicitadaPerfil}
                onSecaoSolicitadaConsumida={() => setSecaoSolicitadaPerfil(null)}
                onUsuarioAtualizado={setUsuario}
                onRefreshUsuario={refreshUsuario}
                onAnaliseLinkedInAtualizada={setAnaliseLinkedIn}
                onIrParaVagasLinkedIn={irParaVagasLinkedIn}
                onRefreshVagasECandidaturas={refreshVagasECandidaturas}
                onToggleSalvarVaga={toggleSalvarVaga}
                onNavigate={handleNavigate}
                onNotify={showToast}
                onLogout={() => {
                  handleLogout();
                  showToast('Sessão encerrada com segurança.');
                }}
              />
            )}
          </>
        )}
      </main>

      {/* Rodapé Institucional */}
      <footer className="border-t border-[var(--border-subtle)] mt-10 py-6 text-xs theme-text-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            <strong>Instituto Nacional de Telecomunicações (Inatel)</strong> — Santa Rita do
            Sapucaí, MG
          </span>
          <span>Disciplina S05 (Interface Homem-Máquina) • React + Tailwind + FastAPI + PostgreSQL</span>
        </div>
      </footer>

      {/* Toast flutuante */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm">
          <div
            className={`px-4 py-3 rounded-xl shadow-xl border text-xs sm:text-sm font-bold flex items-center gap-2.5 ${
              toast.tipo === 'error'
                ? 'bg-red-600 text-white border-red-500'
                : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            <Icon name={toast.tipo === 'error' ? 'ban' : 'check'} className="w-4 h-4 text-white" />
            <span>{toast.mensagem}</span>
          </div>
        </div>
      )}
    </div>
  );
}
