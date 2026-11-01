import { useState } from 'react';
import inatelBranco from '@assets/images/Inatel Branco.png';
import logoQuadrada from '@assets/images/Logo INATEL.png';
import Icon from './Icon';

const THEMES = [
  { id: 'inatel', label: 'Inatel', dot: 'bg-[#126ae2]' },
  { id: 'limao', label: 'Limão', dot: 'bg-[#9ACD32]' },
  { id: 'dark', label: 'Dark', dot: 'bg-sky-400' },
];

export default function Navbar({
  activePage,
  onNavigate,
  theme,
  onChangeTheme,
  usuario,
  totalVagas = 0,
  totalCandidaturas = 0,
  dbStatus,
  onLogout,
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Painel Acadêmico',
      icon: 'home',
    },
    {
      id: 'vagas-noticias',
      label: 'Vagas & Notícias',
      icon: 'folder',
      badge: totalVagas > 0 ? totalVagas : null,
    },
    {
      id: 'perfil',
      label: 'Minha Conta',
      icon: 'user',
      badge: totalCandidaturas > 0 ? totalCandidaturas : null,
    },
  ];

  const handleSelectPage = (pageId) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="theme-header sticky top-0 z-40 shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Esquerda: Botão mobile + Logo Inatel */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition cursor-pointer"
              aria-label="Abrir menu"
            >
              <Icon name={mobileMenuOpen ? 'close' : 'bars'} className="w-5 h-5 text-white" />
            </button>

            <button
              type="button"
              onClick={() => handleSelectPage('dashboard')}
              className="flex items-center gap-3 group cursor-pointer text-left"
            >
              <img
                src={inatelBranco}
                alt="Inatel"
                className="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-[1.03]"
              />
              <span className="hidden lg:inline-block text-xs font-medium px-2.5 py-0.5 rounded-full bg-white/15 text-white/90 border border-white/15">
                Portal S05
              </span>
            </button>
          </div>

          {/* Centro: Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-white text-[#003057] shadow-sm'
                      : 'text-white/85 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`w-4 h-4 ${isActive ? 'text-[#126ae2]' : 'text-white/80'}`}
                  />
                  <span>{item.label}</span>
                  {item.badge !== null && item.badge !== undefined && (
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-[#003057] text-white' : 'bg-white/20 text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Direita: Seletor de Temas + Status API + Perfil + Sair */}
          <div className="flex items-center gap-2">
            {/* Seletor de Temas */}
            <div
              className="hidden sm:flex items-center bg-black/25 p-1 rounded-xl border border-white/10"
              role="group"
              aria-label="Selecionar tema visual"
            >
              {THEMES.map((t) => {
                const selected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeTheme(t.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                      selected
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${t.dot}`} />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Indicador de conexão com FastAPI */}
            <div
              title={
                dbStatus
                  ? `API conectada (${dbStatus.mode === 'postgresql' ? 'PostgreSQL ativo' : 'SQLite local de fallback'})`
                  : 'Verificando conexão com FastAPI...'
              }
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-[11px] text-white/90"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  dbStatus ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span>{dbStatus?.mode === 'postgresql' ? 'PostgreSQL' : dbStatus ? 'API Online' : 'Offline'}</span>
            </div>

            {/* Botão do Usuário */}
            <button
              type="button"
              onClick={() => handleSelectPage('perfil')}
              className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border transition cursor-pointer ${
                activePage === 'perfil'
                  ? 'bg-white text-[#003057] border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <img
                src={logoQuadrada}
                alt="Avatar Inatel"
                className="w-7 h-7 rounded-lg object-cover border border-white/30"
              />
              <div className="hidden sm:flex flex-col items-start leading-tight max-w-[110px]">
                <span className="text-xs font-bold truncate w-full">{usuario?.nome || 'Aluno'}</span>
                <span
                  className={`text-[10px] truncate w-full ${
                    activePage === 'perfil' ? 'text-slate-600' : 'text-white/75'
                  }`}
                >
                  {usuario?.matricula || 'GES'}
                </span>
              </div>
            </button>

            {/* Botão Sair */}
            <button
              type="button"
              onClick={onLogout}
              title="Encerrar sessão"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/35 text-white border border-red-400/30 transition cursor-pointer"
            >
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Gaveta Mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-white/15 bg-black/30 backdrop-blur-md px-4 pt-3 pb-4 space-y-3">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectPage(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                    isActive ? 'bg-white text-[#003057]' : 'text-white hover:bg-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon
                      name={item.icon}
                      className={`w-4 h-4 ${isActive ? 'text-[#126ae2]' : 'text-white/80'}`}
                    />
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#126ae2] text-white">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-white/15">
            <p className="text-[11px] uppercase tracking-wider text-white/70 mb-2 font-semibold">
              Tema Visual
            </p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeTheme(t.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer ${
                    theme === t.id
                      ? 'bg-white text-slate-900 border-white'
                      : 'bg-white/10 text-white border-white/15'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${t.dot}`} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 rounded-xl text-xs font-bold bg-red-500/25 text-white border border-red-400/30 cursor-pointer"
          >
            Sair da Conta
          </button>
        </div>
      )}
    </header>
  );
}
