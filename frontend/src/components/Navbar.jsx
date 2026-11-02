import { useState } from 'react';
import inatelBranco from '@assets/images/Inatel Branco.png';
import Icon from './Icon';

const THEMES = [
  { id: 'inatel', label: 'Tema Claro', icon: 'sun' },
  { id: 'dark', label: 'Tema Escuro', icon: 'moon' },
];

export default function Navbar({
  activePage,
  onNavigate,
  theme,
  onChangeTheme,
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
      id: 'vagas',
      label: 'Vagas',
      icon: 'folder',
    },
    {
      id: 'noticias',
      label: 'Notícias',
      icon: 'file',
    },
  ];

  const apiOn = Boolean(dbStatus);

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
            </button>
          </div>

          {/* Centro: Navegação Desktop (Painel Acadêmico, Vagas, Notícias) */}
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
                </button>
              );
            })}
          </nav>

          {/* Direita: Tema Claro/Escuro (Sol/Lua) + API: ON/OFF + Minha Conta (SVG Pessoa) + Sair */}
          <div className="flex items-center gap-2">
            {/* Alternador Tema Claro / Escuro (Sol e Lua) */}
            <div
              className="h-9 p-1 rounded-xl flex items-center gap-1 bg-white/10 border border-white/15 box-border"
              role="group"
              aria-label="Selecionar tema claro ou escuro"
            >
              {THEMES.map((t) => {
                const selected = theme === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChangeTheme(t.id)}
                    title={t.label}
                    aria-label={t.label}
                    className={`h-7 w-7 rounded-lg transition cursor-pointer flex items-center justify-center shrink-0 ${
                      selected
                        ? t.id === 'inatel'
                          ? 'bg-white text-amber-500 shadow-xs'
                          : 'bg-white text-slate-900 shadow-xs'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    <Icon name={t.icon} className="w-4 h-4" />
                  </button>
                );
              })}
            </div>

            {/* Status da API (API: ON ou API: OFF) */}
            <div
              title={
                apiOn
                  ? `API conectada (${dbStatus?.mode === 'postgresql' ? 'PostgreSQL ativo' : 'Banco local ativo'})`
                  : 'API desconectada'
              }
              className="hidden sm:inline-flex h-9 items-center gap-2 px-3 rounded-xl bg-white/10 border border-white/15 text-xs font-bold text-white/95 whitespace-nowrap box-border"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{apiOn ? 'API: ON' : 'API: OFF'}</span>
            </div>

            {/* Botão simples de Minha Conta (SVG pessoa comum) */}
            <button
              type="button"
              onClick={() => handleSelectPage('perfil')}
              title="Minha Conta"
              aria-label="Minha Conta"
              className={`h-9 w-9 rounded-xl border transition cursor-pointer flex items-center justify-center shrink-0 box-border ${
                activePage === 'perfil'
                  ? 'bg-white text-[#003057] border-white shadow-sm'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/15'
              }`}
            >
              <Icon name="person" className="w-4 h-4" />
            </button>

            {/* Botão Sair */}
            <button
              type="button"
              onClick={onLogout}
              title="Encerrar sessão"
              className="hidden sm:inline-flex h-9 items-center justify-center px-3.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/35 text-white border border-red-400/30 transition cursor-pointer box-border shrink-0"
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
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => handleSelectPage('perfil')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition cursor-pointer ${
                activePage === 'perfil' ? 'bg-white text-[#003057]' : 'text-white hover:bg-white/10'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  name="person"
                  className={`w-4 h-4 ${activePage === 'perfil' ? 'text-[#126ae2]' : 'text-white/80'}`}
                />
                Minha Conta
              </span>
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-white/15">
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-bold text-white">
              <span
                className={`w-2 h-2 rounded-full ${
                  apiOn ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                }`}
              />
              <span>{apiOn ? 'API: ON' : 'API: OFF'}</span>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-red-500/25 text-white border border-red-400/30 cursor-pointer"
            >
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
