/**
 * Banco de Dados Simulado em LocalStorage para Demonstração (GitHub Pages / Modo Offline)
 * Permite que o professor avalie o site completo no GitHub Pages mesmo sem o backend rodando.
 */

const STORAGE_KEYS = {
  USER: 'inatel_mock_user',
  AULAS: 'inatel_mock_aulas',
  EVENTOS: 'inatel_mock_eventos',
  NOTICIAS: 'inatel_mock_noticias',
  LINKEDIN_ANALISE: 'inatel_mock_linkedin_analise',
  LINKEDIN_VAGAS: 'inatel_mock_linkedin_vagas',
};

const USUARIO_INICIAL = {
  id: 1,
  nome: 'Kauã',
  matricula: 2048,
  curso: 'Engenharia de Software',
  periodo: 6,
  email: 'kaua@ges.inatel.br',
  telefone: '(35) 99912-3456',
  bio: 'Estudante de Engenharia de Software no Inatel, apaixonado por interfaces modernas (IHM), desenvolvimento Full-Stack com React e Python e projetos de inovação no Vale da Eletrônica.',
  github: 'https://github.com/kaua',
  linkedin: 'https://linkedin.com/in/kaua',
  areas_interesse: 'Full-Stack, UI/UX (IHM), Cloud, Inteligência Artificial',
  crs: 86.4,
  horas_ac: 112,
  meta_ac: 200,
  horas_cp: 28,
  meta_cp: 40,
  horas_trilha: 45,
  meta_trilha: 60,
  disponivel_estagio: true,
  atualizado_em: '31/10/2026',
};

const AULAS_INICIAIS = [
  {
    id: 1,
    usuario_id: 1,
    codigo: 'C206',
    turma: 'A',
    disciplina: 'Programação Orientada a Objetos',
    professor: 'Prof. Chris Lima',
    dia: 'seg, qua',
    horario: 'Seg: 08:00 - 09:40 | Qua: 08:00 - 09:40',
    local: 'P1-S12',
    prova_alert: false,
    prova_data: '24/11',
    nota: 88.0,
    avaliacoes: [
      { id: 'c206-np1', titulo: 'NP1', tipo: 'Prova', data: '16/09', realizada: true, nota: 86.0, peso: 1.0 },
      { id: 'c206-lab', titulo: 'Exercícios Lab POO', tipo: 'Laboratório', data: '14/10', realizada: true, nota: 90.0, peso: 1.0 },
      { id: 'c206-np2', titulo: 'NP2', tipo: 'Prova', data: '24/11', realizada: false, nota: null, peso: 1.0 },
    ],
  },
  {
    id: 2,
    usuario_id: 1,
    codigo: 'S202',
    turma: 'L3',
    disciplina: 'Banco de Dados II',
    professor: 'Prof. Marcelo Cysneiros',
    dia: 'seg',
    horario: '10:00 - 11:40',
    local: 'Lab Soft 03',
    prova_alert: true,
    prova_data: '10/11',
    nota: 92.0,
    avaliacoes: [
      { id: 's202-np1', titulo: 'NP1', tipo: 'Prova', data: '22/09', realizada: true, nota: 90.0, peso: 1.0 },
      { id: 's202-proj', titulo: 'Projeto Modelagem NoSQL/SQL', tipo: 'Projeto', data: '20/10', realizada: true, nota: 94.0, peso: 1.0 },
      { id: 's202-np2', titulo: 'NP2', tipo: 'Prova', data: '10/11', realizada: false, nota: null, peso: 1.0 },
    ],
  },
  {
    id: 3,
    usuario_id: 1,
    codigo: 'S05',
    turma: 'A',
    disciplina: 'Interface Homem-Máquina',
    professor: 'Prof. Raphael Cardoso',
    dia: 'ter, qui',
    horario: 'Ter: 10:00 - 11:40 | Qui: 08:00 - 09:40',
    local: 'P1-S17',
    prova_alert: false,
    prova_data: '12/11',
    nota: 90.0,
    avaliacoes: [
      { id: 's05-np1', titulo: 'NP1 — Heurísticas & UX', tipo: 'Prova', data: '17/09', realizada: true, nota: 88.0, peso: 1.0 },
      { id: 's05-prot', titulo: 'Protótipo Portal Inatel', tipo: 'Projeto', data: '21/10', realizada: true, nota: 92.0, peso: 1.0 },
      { id: 's05-np2', titulo: 'NP2 & Entrega Final', tipo: 'Prova', data: '12/11', realizada: false, nota: null, peso: 1.0 },
    ],
  },
  {
    id: 4,
    usuario_id: 1,
    codigo: 'E01',
    turma: 'B',
    disciplina: 'Circuitos Elétricos em Corrente Contínua',
    professor: 'Prof. Guilherme Aquino',
    dia: 'ter',
    horario: '13:30 - 15:10',
    local: 'P1-S17',
    prova_alert: true,
    prova_data: '05/11',
    nota: 54.0,
    avaliacoes: [
      { id: 'e01-np1', titulo: 'NP1', tipo: 'Prova', data: '19/09', realizada: true, nota: 50.0, peso: 1.0 },
      { id: 'e01-lab', titulo: 'Relatórios Lab Circuitos', tipo: 'Laboratório', data: '17/10', realizada: true, nota: 58.0, peso: 1.0 },
      { id: 'e01-np2', titulo: 'NP2', tipo: 'Prova', data: '05/11', realizada: false, nota: null, peso: 1.0 },
    ],
  },
  {
    id: 5,
    usuario_id: 1,
    codigo: 'M02',
    turma: 'A',
    disciplina: 'Álgebra e Geometria Analítica',
    professor: 'Profa. Tamara Campos',
    dia: 'qua',
    horario: '10:00 - 11:40',
    local: 'P1-S19',
    prova_alert: true,
    prova_data: '07/11',
    nota: 72.0,
    avaliacoes: [
      { id: 'm02-np1', titulo: 'NP1', tipo: 'Prova', data: '18/09', realizada: true, nota: 72.0, peso: 1.0 },
      { id: 'm02-np2', titulo: 'NP2', tipo: 'Prova', data: '07/11', realizada: false, nota: null, peso: 1.0 },
    ],
  },
  {
    id: 6,
    usuario_id: 1,
    codigo: 'S204',
    turma: 'P1',
    disciplina: 'Engenharia de Produto de Software',
    professor: 'Prof. Renzo Mesquita',
    dia: 'qui',
    horario: '15:30 - 17:10',
    local: 'Lab Ideia / P3',
    prova_alert: false,
    prova_data: '28/11',
    nota: 95.0,
    avaliacoes: [
      { id: 's204-sp1', titulo: 'Sprint 1 — Discovery & Backlog', tipo: 'Projeto', data: '25/09', realizada: true, nota: 95.0, peso: 1.0 },
      { id: 's204-sp2', titulo: 'Sprint 2 — MVP & Testes', tipo: 'Projeto', data: '28/11', realizada: false, nota: null, peso: 1.0 },
    ],
  },
  {
    id: 7,
    usuario_id: 1,
    codigo: 'C115',
    turma: 'L1',
    disciplina: 'Redes de Computadores e IoT',
    professor: 'Prof. Antônio Marcos Alberti',
    dia: 'sex',
    horario: '08:00 - 09:40',
    local: 'Lab CS&I',
    prova_alert: false,
    prova_data: '21/11',
    nota: 81.0,
    avaliacoes: [
      { id: 'c115-np1', titulo: 'NP1', tipo: 'Prova', data: '26/09', realizada: true, nota: 81.0, peso: 1.0 },
      { id: 'c115-np2', titulo: 'NP2 & Prática Packet Tracer', tipo: 'Prova', data: '21/11', realizada: false, nota: null, peso: 1.0 },
    ],
  },
];

const EVENTOS_INICIAIS = [
  {
    id: 1,
    titulo: 'Semana do Software Inatel 2026',
    data: '12/11',
    horario: '10:00',
    local: 'Teatro Inatel & Salão de Eventos',
    tipo: 'tech',
    descricao: 'Uma semana inteira dedicada à engenharia de software, IA generativa, cloud computing e maratona de programação com empresas parceiras.',
    imagem_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000&h=450',
  },
  {
    id: 2,
    titulo: 'Workshop Prático de IoT & Redes 6G',
    data: '19/11',
    horario: '08:30',
    local: 'Laboratório CS&I / xGMobile',
    tipo: 'tech',
    descricao: 'Hands-on prático sobre Internet das Coisas, sensores inteligentes e aplicações conectadas para Indústria 4.0 nos laboratórios do Inatel.',
    imagem_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000&h=450',
  },
  {
    id: 3,
    titulo: 'Feira de Oportunidades e Carreiras (FINATEL)',
    data: '25/11',
    horario: '09:00',
    local: 'Ginásio Poliesportivo do Inatel',
    tipo: 'academic',
    descricao: 'Conecte-se diretamente com recrutadores de mais de 40 empresas de tecnologia do Vale da Eletrônica e multinacionais parceiras do Inatel.',
    imagem_url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000&h=450',
  },
  {
    id: 4,
    titulo: 'Festival Cultural & Integração dos Alunos',
    data: '05/12',
    horario: '19:00',
    local: 'Área Esportiva do Inatel',
    tipo: 'cultural',
    descricao: 'Encerramento do semestre com bandas estudantis, praça gastronômica e celebração das equipes de competição tecnológica.',
    imagem_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000&h=450',
  },
];

const NOTICIAS_INICIAIS = [
  {
    id: 1,
    titulo: 'Inatel lidera pesquisas pioneiras sobre redes 6G e conectividade inteligente',
    resumo: 'Pesquisadores e alunos desenvolvem algoritmos de inteligência artificial aplicados a redes abertas Open RAN.',
    conteudo: `RESUMO EM TÓPICOS:
• Pesquisadores do Inatel avançam no desenvolvimento da arquitetura para a futura geração de conectividade 6G.
• O projeto integra inteligência artificial em tempo real na otimização de antenas e eficiência energética.
• Parcerias estratégicas com empresas globais fortalecem o polo tecnológico de Santa Rita do Sapucaí.

SÍNTESE DA REPORTAGEM:
O Centro de Referência em Radiocomunicações do Inatel segue como protagonista no cenário internacional de telecomunicações. As iniciativas envolvem estudantes de graduação e pós-graduação em experimentos de alta velocidade e baixa latência.`,
    categoria: 'Inovação',
    autor: 'Portal Inatel',
    fonte_nome: 'Portal Inatel',
    url_original: 'https://inatel.br/noticias/',
    tempo_leitura: '3 min',
    imagem_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000&h=450',
    destaque: true,
    visualizacoes: 142,
    curtidas: 28,
    publicado_em: '30/10/2026',
  },
  {
    id: 2,
    titulo: 'Projetos da FETIN recebem premiação nacional de inovação tecnológica',
    resumo: 'Estudantes do Inatel se destacam com soluções voltadas para cidades inteligentes e saúde digital.',
    conteudo: `RESUMO EM TÓPICOS:
• Três projetos da Feira Tecnológica do Inatel (FETIN) conquistaram prêmios em maratonas nacionais.
• Destaque para dispositivo biomédico de monitoramento e plataforma inteligente de logística urbana.
• Equipes contaram com mentoria no ecossistema do Centro de Empreendedorismo do Inatel (CEI).

SÍNTESE DA REPORTAGEM:
A cultura empreendedora do Inatel continua gerando frutos de impacto social e mercadológico. Os protótipos validados durante a feira agora avançam para fases de incubação e aceleração comercial.`,
    categoria: 'Acadêmico',
    autor: 'Portal Inatel',
    fonte_nome: 'Portal Inatel',
    url_original: 'https://inatel.br/noticias/',
    tempo_leitura: '4 min',
    imagem_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1000&h=450',
    destaque: false,
    visualizacoes: 98,
    curtidas: 19,
    publicado_em: '28/10/2026',
  },
];

const VAGAS_LINKEDIN_INICIAIS = [
  {
    id: 1,
    titulo: 'Estágio em Engenharia de Software / Full-Stack',
    empresa: 'Vale Tech Inovações',
    localizacao: 'Santa Rita do Sapucaí, MG (Híbrido)',
    modalidade: 'Híbrido',
    nivel: 'Estágio',
    salario: 'R$ 2.400 / mês',
    descricao: 'Desenvolvimento de APIs em Python/FastAPI e interfaces web em React. Oportunidade para alunos do Inatel.',
    job_url: 'https://www.linkedin.com/jobs/',
    logo_empresa: '',
    data_publicacao: 'Há 2 dias',
    termo_busca: 'Engenharia de Software',
    fonte: 'LinkedIn Jobs',
    compatibilidade: 95,
    skills_match: ['React', 'Python', 'Full-Stack', 'Git'],
    coletado_em: '31/10/2026',
  },
  {
    id: 2,
    titulo: 'Desenvolvedor(a) Front-End React Júnior',
    empresa: 'Nexus Cloud Systems',
    localizacao: 'Brasil (Remoto)',
    modalidade: 'Remoto',
    nivel: 'Júnior',
    salario: 'R$ 4.500 / mês',
    descricao: 'Construção de dashboards analíticos com React, TypeScript e Tailwind CSS.',
    job_url: 'https://www.linkedin.com/jobs/',
    logo_empresa: '',
    data_publicacao: 'Há 3 dias',
    termo_busca: 'React',
    fonte: 'LinkedIn Jobs',
    compatibilidade: 90,
    skills_match: ['React', 'UI/UX (IHM)', 'JavaScript'],
    coletado_em: '31/10/2026',
  },
];

function getStorageItem(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function setStorageItem(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {
    // ignora erro de quota em navegadores restritos
  }
}

export function handleMockFallback(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 1. Health check
  if (path === '/api/health') {
    return {
      status: 'ok',
      service: 'inatel-portal-offline-demo',
      database: { mode: 'demonstrativo-offline' },
    };
  }

  // 2. Auth: Login
  if (path === '/api/auth/login' && method === 'POST') {
    const ident = String(body.identificador || '').trim();
    const user = getStorageItem(STORAGE_KEYS.USER, USUARIO_INICIAL);
    // Aceita 2048, kaua@ges.inatel.br ou qualquer matrícula informada
    if (ident.isdigit && ident.isdigit()) {
      user.matricula = parseInt(ident, 10);
    }
    setStorageItem(STORAGE_KEYS.USER, user);
    return {
      access_token: 'mock-jwt-token-s05-inatel',
      token_type: 'bearer',
      usuario: user,
    };
  }

  // 3. Auth: Registro
  if (path === '/api/auth/registro' && method === 'POST') {
    const user = {
      ...USUARIO_INICIAL,
      nome: body.nome || 'Novo Aluno',
      matricula: parseInt(body.matricula, 10) || 99999,
      email: body.email || 'aluno@ges.inatel.br',
      curso: body.curso || 'Engenharia de Software',
    };
    setStorageItem(STORAGE_KEYS.USER, user);
    return {
      access_token: 'mock-jwt-token-s05-inatel',
      token_type: 'bearer',
      usuario: user,
    };
  }

  // 4. Auth: Me
  if (path === '/api/auth/me') {
    return getStorageItem(STORAGE_KEYS.USER, USUARIO_INICIAL);
  }

  // 5. Usuario: Update
  if (path === '/api/usuario' && method === 'PUT') {
    const current = getStorageItem(STORAGE_KEYS.USER, USUARIO_INICIAL);
    const updated = { ...current, ...body, atualizado_em: new Date().toLocaleDateString('pt-BR') };
    setStorageItem(STORAGE_KEYS.USER, updated);
    return updated;
  }

  // 6. Usuario: Senha
  if (path === '/api/usuario/senha' && method === 'PUT') {
    return { mensagem: 'Senha atualizada com sucesso (modo demonstrativo)!' };
  }

  // 7. Aulas: Listar
  if (path.startsWith('/api/aulas') && method === 'GET') {
    const aulas = getStorageItem(STORAGE_KEYS.AULAS, AULAS_INICIAIS);
    const urlParams = new URLSearchParams(path.split('?')[1] || '');
    const dia = urlParams.get('dia');
    if (dia && dia !== 'todas') {
      const d = dia.toLowerCase();
      return aulas.filter((a) => String(a.dia || '').toLowerCase().includes(d));
    }
    return aulas;
  }

  // 8. Aulas: Criar
  if (path === '/api/aulas' && method === 'POST') {
    const aulas = getStorageItem(STORAGE_KEYS.AULAS, AULAS_INICIAIS);
    const novaAula = {
      ...body,
      id: Date.now(),
      usuario_id: 1,
      avaliacoes: body.avaliacoes || [],
    };
    const atualizadas = [...aulas, novaAula];
    setStorageItem(STORAGE_KEYS.AULAS, atualizadas);
    return novaAula;
  }

  // 9. Aulas: Atualizar
  if (path.startsWith('/api/aulas/') && method === 'PUT') {
    const id = parseInt(path.split('/')[3], 10);
    const aulas = getStorageItem(STORAGE_KEYS.AULAS, AULAS_INICIAIS);
    let alterada = null;
    const atualizadas = aulas.map((a) => {
      if (a.id === id) {
        alterada = { ...a, ...body };
        return alterada;
      }
      return a;
    });
    setStorageItem(STORAGE_KEYS.AULAS, atualizadas);
    return alterada || body;
  }

  // 10. Aulas: Deletar
  if (path.startsWith('/api/aulas/') && method === 'DELETE') {
    const id = parseInt(path.split('/')[3], 10);
    const aulas = getStorageItem(STORAGE_KEYS.AULAS, AULAS_INICIAIS);
    const atualizadas = aulas.filter((a) => a.id !== id);
    setStorageItem(STORAGE_KEYS.AULAS, atualizadas);
    return null;
  }

  // 11. Eventos
  if (path === '/api/eventos') {
    return getStorageItem(STORAGE_KEYS.EVENTOS, EVENTOS_INICIAIS);
  }

  // 12. Notícias
  if (path.startsWith('/api/noticias')) {
    if (method === 'POST' && path.includes('sincronizar')) {
      const noticias = getStorageItem(STORAGE_KEYS.NOTICIAS, NOTICIAS_INICIAIS);
      return { inseridas: 0, atualizadas: noticias.length, total_ativas: noticias.length, noticias };
    }
    if (method === 'GET') {
      const noticias = getStorageItem(STORAGE_KEYS.NOTICIAS, NOTICIAS_INICIAIS);
      const matchId = path.match(/\/api\/noticias\/(\d+)/);
      if (matchId) {
        const id = parseInt(matchId[1], 10);
        return noticias.find((n) => n.id === id) || noticias[0];
      }
      return noticias;
    }
  }

  // 13. LinkedIn Vagas
  if (path.startsWith('/api/linkedin/vagas')) {
    const vagas = getStorageItem(STORAGE_KEYS.LINKEDIN_VAGAS, VAGAS_LINKEDIN_INICIAIS);
    return vagas;
  }

  // 14. LinkedIn Perfil
  if (path.startsWith('/api/linkedin/analise') || path.startsWith('/api/linkedin/analisar-perfil')) {
    const mockAnalise = getStorageItem(STORAGE_KEYS.LINKEDIN_ANALISE, {
      id: 1,
      usuario_id: 1,
      linkedin_url: body.linkedin_url || 'https://www.linkedin.com/in/kaua-ribeiro17',
      slug: 'kaua-ribeiro17',
      fonte_coleta: 'dom-schema-inatel',
      nome_completo: 'Kauã Ribeiro',
      headline: 'Estudante de Engenharia de Software no Inatel • Full-Stack Developer',
      instituicao_atual: 'Instituto Nacional de Telecomunicações - Inatel',
      foto_url: '',
      banner_url: '',
      localizacao: 'Santa Rita do Sapucaí, Minas Gerais, Brasil',
      conexoes_ou_seguidores: '500+ conexões',
      resumo: 'Estudante de Engenharia de Software no Inatel, focado no desenvolvimento de sistemas web com React e Python.',
      skills: ['React', 'JavaScript', 'Python', 'FastAPI', 'UI/UX', 'SQL', 'Git', 'Engenharia de Software'],
      pontuacao_perfil: 96,
      nivel_perfil: 'Campeão (Perfil Completo)',
      experiencias: [
        {
          cargo: 'Desenvolvedor Full-Stack (Iniciação Tecnológica)',
          empresa: 'Inatel Labs',
          periodo: '2024 - Presente',
          localizacao: 'Santa Rita do Sapucaí, MG',
          descricao: 'Desenvolvimento de dashboards e interfaces acessíveis para projetos acadêmicos e industriais.',
        },
      ],
      formacao: [
        {
          instituicao: 'Instituto Nacional de Telecomunicações - Inatel',
          curso: 'Bacharelado em Engenharia de Software',
          periodo: '2023 - 2027',
          nota_ou_detalhe: 'Destaque acadêmico',
        },
      ],
      projetos: [
        {
          titulo: 'Portal Acadêmico Inatel (S05 - IHM)',
          periodo: '2026',
          descricao: 'Plataforma web integrada com foco em usabilidade e experiência do estudante de engenharia.',
        },
      ],
      certificacoes: [
        {
          nome: 'Desenvolvimento Web Full-Stack Moderno',
          emissor: 'Inatel / Alura',
          data: '2025',
        },
      ],
      pontos_fortes: [
        'Perfil detalhado com experiências práticas e formação de engenharia no Inatel.',
        'Conjunto de competências técnicas alinhadas com as vagas mais demandadas da área de software.',
        'URL personalizada e bom nível de conexões profissionais.',
      ],
      sugestoes_melhoria: [
        'Adicionar publicações periódicas sobre seus projetos de IHM e artigos técnicos.',
      ],
      atualizado_em: new Date().toLocaleDateString('pt-BR'),
    });
    setStorageItem(STORAGE_KEYS.LINKEDIN_ANALISE, mockAnalise);
    return mockAnalise;
  }

  return null;
}

