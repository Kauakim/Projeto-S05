const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'inatel_auth_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY) || '';
}

export function setStoredToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith('/api/auth/login')) {
      window.dispatchEvent(new CustomEvent('inatel:unauthorized'));
    }
    const detail = data?.detail || `Erro HTTP ${response.status}`;
    throw new Error(typeof detail === 'string' ? detail : JSON.stringify(detail));
  }

  return data;
}

export const api = {
  getHealth: () => request('/api/health'),

  // Autenticação
  login: (identificador, senha) =>
    request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identificador, senha }),
    }),
  registro: (payload) =>
    request('/api/auth/registro', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getMe: () => request('/api/auth/me'),

  // Usuário / Perfil e Senha
  getUsuario: () => request('/api/usuario'),
  updateUsuario: (payload) =>
    request('/api/usuario', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  alterarSenha: (payload) =>
    request('/api/usuario/senha', {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  // Painel (Aulas & Eventos)
  getAulas: (dia) => {
    const q = dia && dia !== 'todas' ? `?dia=${encodeURIComponent(dia)}` : '';
    return request(`/api/aulas${q}`);
  },
  getEventos: () => request('/api/eventos'),

  // Vagas & Candidaturas (NESP)
  getVagas: ({ busca = '', tipo = 'todas', modalidade = 'todas' } = {}) => {
    const params = new URLSearchParams();
    if (busca.trim()) params.set('busca', busca.trim());
    if (tipo && tipo !== 'todas') params.set('tipo', tipo);
    if (modalidade && modalidade !== 'todas') params.set('modalidade', modalidade);
    const qs = params.toString();
    return request(`/api/vagas${qs ? `?${qs}` : ''}`);
  },
  createVaga: (payload) =>
    request('/api/vagas', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  deleteVaga: (vagaId) =>
    request(`/api/vagas/${vagaId}`, {
      method: 'DELETE',
    }),
  candidatarVaga: (vagaId, payload) =>
    request(`/api/vagas/${vagaId}/candidatar`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getCandidaturas: () => request('/api/candidaturas'),
  cancelarCandidatura: (candidaturaId) =>
    request(`/api/candidaturas/${candidaturaId}`, {
      method: 'DELETE',
    }),

  // Notícias Reais (Inatel & Região)
  getNoticias: ({ busca = '', categoria = 'todas', origem = 'todas' } = {}) => {
    const params = new URLSearchParams();
    if (busca.trim()) params.set('busca', busca.trim());
    if (categoria && categoria !== 'todas') params.set('categoria', categoria);
    if (origem && origem !== 'todas') params.set('origem', origem);
    const qs = params.toString();
    return request(`/api/noticias${qs ? `?${qs}` : ''}`);
  },
  sincronizarNoticias: () =>
    request('/api/noticias/sincronizar', {
      method: 'POST',
    }),
  lerNoticia: (noticiaId) => request(`/api/noticias/${noticiaId}`),
  createNoticia: (payload) =>
    request('/api/noticias', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  curtirNoticia: (noticiaId) =>
    request(`/api/noticias/${noticiaId}/curtir`, {
      method: 'POST',
    }),
  deleteNoticia: (noticiaId) =>
    request(`/api/noticias/${noticiaId}`, {
      method: 'DELETE',
    }),

  // Integração LinkedIn (Web Scraping de Perfil & Vagas por Área)
  getAnaliseLinkedIn: () => request('/api/linkedin/analise'),
  analisarPerfilLinkedIn: (payload) =>
    request('/api/linkedin/analisar-perfil', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getVagasLinkedIn: () => request('/api/linkedin/vagas'),
  buscarVagasLinkedIn: (payload) =>
    request('/api/linkedin/vagas/buscar', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};
