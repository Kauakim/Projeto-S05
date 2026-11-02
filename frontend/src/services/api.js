import { handleMockFallback } from './mockData';

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

  try {
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
  } catch (err) {
    // Se a chamada de rede falhou (ERR_CONNECTION_REFUSED, offline, GitHub Pages sem backend local)
    const isNetworkError =
      err.name === 'TypeError' ||
      err.message?.includes('Failed to fetch') ||
      err.message?.includes('NetworkError') ||
      err.message?.includes('Load failed');

    if (isNetworkError) {
      return handleMockFallback(path, options);
    }
    throw err;
  }
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

  // Painel (Aulas, Turmas, Provas, Notas & Eventos)
  getAulas: (dia) => {
    const q = dia && dia !== 'todas' ? `?dia=${encodeURIComponent(dia)}` : '';
    return request(`/api/aulas${q}`);
  },
  createAula: (payload) =>
    request('/api/aulas', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAula: (aulaId, payload) =>
    request(`/api/aulas/${aulaId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  deleteAula: (aulaId) =>
    request(`/api/aulas/${aulaId}`, {
      method: 'DELETE',
    }),
  getEventos: () => request('/api/eventos'),

  // Notícias Oficiais do Portal Inatel
  getNoticias: ({ busca = '', categoria = 'todas' } = {}) => {
    const params = new URLSearchParams();
    if (busca.trim()) params.set('busca', busca.trim());
    if (categoria && categoria !== 'todas') params.set('categoria', categoria);
    const qs = params.toString();
    return request(`/api/noticias${qs ? `?${qs}` : ''}`);
  },
  sincronizarNoticias: () =>
    request('/api/noticias/sincronizar', {
      method: 'POST',
    }),
  lerNoticia: (noticiaId) => request(`/api/noticias/${noticiaId}`),

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
