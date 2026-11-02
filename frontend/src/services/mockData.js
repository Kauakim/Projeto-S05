/**
 * Banco de Dados Simulado Completo em LocalStorage para Demonstração (GitHub Pages / Modo Offline)
 * Sincronizado 100% com o seed do ecossistema Inatel (backend/seed.py e backend/inatel_local.db).
 */

const MOCK_VERSION = 's05_seed_v5_inatel';

const STORAGE_KEYS = {
  VERSION: 'inatel_mock_version',
  USER: 'inatel_mock_user',
  AULAS: 'inatel_mock_aulas',
  EVENTOS: 'inatel_mock_eventos',
  NOTICIAS: 'inatel_mock_noticias',
  LINKEDIN_ANALISE: 'inatel_mock_linkedin_analise',
  LINKEDIN_VAGAS: 'inatel_mock_linkedin_vagas',
};

export const USUARIO_INICIAL = {
  "id": 1,
  "nome": "Kauã de Oliveira Ribeiro",
  "matricula": 777,
  "curso": "Engenharia de Software",
  "periodo": 4,
  "email": "kaua.ribeiro@ges.inatel.br",
  "telefone": "(35) 99826-0834",
  "bio": "Estudante de Engenharia de Software no Inatel, apaixonado por desenvolvimento Full-Stack de aplicações e projetos de inovação.",
  "github": "https://github.com/kauakim",
  "linkedin": "https://www.linkedin.com/in/kaua-ribeiro17",
  "areas_interesse": "Full-Stack, UI/UX, Cloud, Inteligência Artificial, Python, Back-End, JavaScript, Git & GitHub, Algoritmos & Estruturas de Dados, Inteligência Artificial & ML",
  "crs": 90.7,
  "horas_complementares": 173,
  "meta_horas": 200,
  "horas_ac": 173,
  "meta_ac": 200,
  "horas_cp": 28,
  "meta_cp": 40,
  "horas_trilha": 86,
  "meta_trilha": 60,
  "disponivel_estagio": true,
  "atualizado_em": "02/11/2026 07:19"
};

export const AULAS_INICIAIS = [
  {
    "id": 1,
    "usuario_id": 1,
    "codigo": "C206",
    "turma": "A",
    "disciplina": "Programação Orientada a Objetos",
    "professor": "Prof. Chris Lima",
    "dia": "seg, qua",
    "horario": "Seg: 08:00 - 09:40 | Qua: 08:00 - 09:40",
    "local": "I-16",
    "prova_alert": false,
    "prova_data": "24/11",
    "frequencia": "",
    "nota": 88.0,
    "avaliacoes": [
      {
        "id": "c206-np1",
        "titulo": "NP1",
        "tipo": "Prova",
        "data": "16/09",
        "realizada": true,
        "nota": 86.0,
        "peso": 1.0
      },
      {
        "id": "c206-lab",
        "titulo": "Exercício",
        "tipo": "Laboratório",
        "data": "14/10",
        "realizada": true,
        "nota": 90.0,
        "peso": 1.0
      },
      {
        "id": "c206-np2",
        "titulo": "NP2",
        "tipo": "Prova",
        "data": "24/11",
        "realizada": false,
        "nota": null,
        "peso": 1.0
      }
    ]
  },
  {
    "id": 2,
    "usuario_id": 1,
    "codigo": "S202",
    "turma": "L3",
    "disciplina": "Banco de Dados II",
    "professor": "Prof. Marcelo Cysneiros",
    "dia": "seg",
    "horario": "10:00 - 11:40",
    "local": "I-15",
    "prova_alert": true,
    "prova_data": "10/11",
    "frequencia": "",
    "nota": 92.0,
    "avaliacoes": [
      {
        "id": "s202-np1",
        "titulo": "NP1",
        "tipo": "Prova",
        "data": "22/09",
        "realizada": true,
        "nota": 90.0,
        "peso": 1.0
      },
      {
        "id": "s202-proj",
        "titulo": "Projeto",
        "tipo": "Projeto",
        "data": "20/10",
        "realizada": true,
        "nota": 94.0,
        "peso": 1.0
      },
      {
        "id": "s202-np2",
        "titulo": "NP2",
        "tipo": "Prova",
        "data": "10/11",
        "realizada": false,
        "nota": null,
        "peso": 1.0
      }
    ]
  },
  {
    "id": 3,
    "usuario_id": 1,
    "codigo": "S05",
    "turma": "A",
    "disciplina": "Interface Homem-Máquina",
    "professor": "Prof. Raphael Cardoso",
    "dia": "qui",
    "horario": "Qui: 19:30 - 21:10",
    "local": "I-19",
    "prova_alert": false,
    "prova_data": "12/11",
    "frequencia": "",
    "nota": 90.0,
    "avaliacoes": [
      {
        "id": "s05-np1",
        "titulo": "NP1",
        "tipo": "Prova",
        "data": "17/09",
        "realizada": true,
        "nota": 88.0,
        "peso": 1.0
      },
      {
        "id": "s05-prot",
        "titulo": "Protótipo",
        "tipo": "Projeto",
        "data": "21/10",
        "realizada": true,
        "nota": 92.0,
        "peso": 1.0
      },
      {
        "id": "s05-np2",
        "titulo": "NP2 & Entrega Final",
        "tipo": "Prova",
        "data": "12/11",
        "realizada": false,
        "nota": null,
        "peso": 1.0
      }
    ]
  },
  {
    "id": 4,
    "usuario_id": 1,
    "codigo": "E01",
    "turma": "B",
    "disciplina": "Circuitos Elétricos em Corrente Contínua",
    "professor": "Prof. Carlos Henrique",
    "dia": "ter",
    "horario": "13:30 - 15:10",
    "local": "III-4",
    "prova_alert": true,
    "prova_data": "05/11",
    "frequencia": "",
    "nota": 54.0,
    "avaliacoes": [
      {
        "id": "e01-np1",
        "titulo": "NP1",
        "tipo": "Prova",
        "data": "19/09",
        "realizada": true,
        "nota": 50.0,
        "peso": 1.0
      },
      {
        "id": "e01-lab",
        "titulo": "Relatório",
        "tipo": "Laboratório",
        "data": "17/10",
        "realizada": true,
        "nota": 58.0,
        "peso": 1.0
      },
      {
        "id": "e01-np2",
        "titulo": "NP2",
        "tipo": "Prova",
        "data": "05/11",
        "realizada": false,
        "nota": null,
        "peso": 1.0
      }
    ]
  },
  {
    "id": 5,
    "usuario_id": 1,
    "codigo": "M02",
    "turma": "A",
    "disciplina": "Álgebra e Geometria Analítica",
    "professor": "Profa. Karina",
    "dia": "qua",
    "horario": "10:00 - 11:40",
    "local": "I-3",
    "prova_alert": true,
    "prova_data": "07/11",
    "frequencia": "",
    "nota": 72.0,
    "avaliacoes": [
      {
        "id": "m02-np1",
        "titulo": "NP1",
        "tipo": "Prova",
        "data": "18/09",
        "realizada": true,
        "nota": 72.0,
        "peso": 1.0
      },
      {
        "id": "m02-np2",
        "titulo": "NP2",
        "tipo": "Prova",
        "data": "07/11",
        "realizada": false,
        "nota": null,
        "peso": 1.0
      }
    ]
  },
  {
    "id": 6,
    "usuario_id": 1,
    "codigo": "S204",
    "turma": "P1",
    "disciplina": "Engenharia de Software",
    "professor": "Prof. Renzo Mesquita",
    "dia": "qui",
    "horario": "15:30 - 17:10",
    "local": "Laboratório de Ideação",
    "prova_alert": false,
    "prova_data": "28/11",
    "frequencia": "",
    "nota": 95.0,
    "avaliacoes": [
      {
        "id": "s204-sp1",
        "titulo": "Sprint 1",
        "tipo": "Projeto",
        "data": "25/09",
        "realizada": true,
        "nota": 95.0,
        "peso": 1.0
      },
      {
        "id": "s204-sp2",
        "titulo": "Sprint 2",
        "tipo": "Projeto",
        "data": "28/11",
        "realizada": false,
        "nota": null,
        "peso": 1.0
      }
    ]
  },
  {
    "id": 7,
    "usuario_id": 1,
    "codigo": "C115",
    "turma": "L3",
    "disciplina": "Redes de Computadores",
    "professor": "Prof. Guilherme Aquino",
    "dia": "sex",
    "horario": "08:00 - 09:40",
    "local": "Lab CS&I",
    "prova_alert": false,
    "prova_data": "21/11",
    "frequencia": "",
    "nota": 81.0,
    "avaliacoes": [
      {
        "id": "c115-np1",
        "titulo": "NP1",
        "tipo": "Prova",
        "data": "26/09",
        "realizada": true,
        "nota": 81.0,
        "peso": 1.0
      },
      {
        "id": "c115-np2",
        "titulo": "NP2",
        "tipo": "Prova",
        "data": "21/11",
        "realizada": false,
        "nota": null,
        "peso": 1.0
      }
    ]
  }
];

export const EVENTOS_INICIAIS = [
  {
    "id": 1,
    "titulo": "Semana do Software Inatel 2026",
    "data": "12/11",
    "horario": "10:00",
    "local": "Teatro Inatel & Salão de Eventos",
    "tipo": "tech",
    "descricao": "Uma semana inteira dedicada à engenharia de software, IA generativa, cloud computing e maratona de programação com empresas parceiras.",
    "imagem_url": "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1000&h=450"
  },
  {
    "id": 2,
    "titulo": "Workshop Prático de IoT & Redes 6G",
    "data": "19/11",
    "horario": "08:30",
    "local": "Laboratório CS&I / xGMobile",
    "tipo": "tech",
    "descricao": "Hands-on prático sobre Internet das Coisas, sensores inteligentes e aplicações conectadas para Indústria 4.0 nos laboratórios do Inatel.",
    "imagem_url": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1000&h=450"
  },
  {
    "id": 3,
    "titulo": "Feira de Oportunidades e Carreiras (FINATEL)",
    "data": "25/11",
    "horario": "09:00",
    "local": "Ginásio Poliesportivo do Inatel",
    "tipo": "academic",
    "descricao": "Conecte-se diretamente com recrutadores de mais de 40 empresas de tecnologia do Vale da Eletrônica e multinacionais parceiras do Inatel.",
    "imagem_url": "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1000&h=450"
  },
  {
    "id": 4,
    "titulo": "Festival Cultural & Integração dos Alunos",
    "data": "05/12",
    "horario": "19:00",
    "local": "Área Esportiva do Inatel",
    "tipo": "cultural",
    "descricao": "Encerramento do semestre com bandas estudantis, praça gastronômica e celebração das equipes de competição tecnológica.",
    "imagem_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=1000&h=450"
  }
];

export const NOTICIAS_INICIAIS = [
  {
    "id": 1,
    "titulo": "RobotBulls conquista três pódios na RCX 2026",
    "resumo": "A RobotBulls, equipe de robótica do Inatel, conquistou três pódios na RCX 2026, com 1º lugar nas categorias Trekking e Futebol Mini e 2º lugar no Hockey.",
    "conteudo": "RESUMO EM TÓPICOS:\n• A RobotBulls, equipe de robótica do Instituto Nacional de Telecomunicações – Inatel, conquistou três pódios na RoboCore Experience (RCX) 2026, realizada entre os dias 9 e 12 de outubro, no Instituto Mauá de Tecnologia, em São Caetano do Sul (SP).\n• Com uma delegação de 20 integrantes, a equipe alcançou o primeiro lugar nas categorias Trekking e Futebol Mini, além do segundo lugar em Hockey.\n• A competição reuniu 91 equipes de robótica de diferentes instituições e desafiou os participantes a desenvolver, testar e aprimorar seus projetos.\n• Embora não tenha conquistado pódios nas categorias de Combate disputadas na RCX 2026, a RobotBulls segue com um novo desafio internacional no calendário.\n\nSÍNTESE DA REPORTAGEM:\nA RobotBulls, equipe de robótica do Instituto Nacional de Telecomunicações – Inatel, conquistou três pódios na RoboCore Experience (RCX) 2026, realizada entre os dias 9 e 12 de outubro, no Instituto Mauá de Tecnologia, em São Caetano do Sul (SP). Com uma delegação de 20 integrantes, a equipe alcançou o primeiro lugar nas categorias Trekking e Futebol Mini, além do segundo lugar em Hockey.\n\nDurante os quatro dias de evento, os estudantes participaram de disputas nas categorias Combate, Sumô, Hockey, Seguidor de Linha, Trekking e Futebol. A competição reuniu 91 equipes de robótica de diferentes instituições e desafiou os participantes a desenvolver, testar e aprimorar seus projetos.\n\nOs resultados da RobotBulls refletem o trabalho de desenvolvimento dos robôs realizado ao longo do ano. Na categoria Trekking, a equipe conquistou o primeiro lugar, ampliando o histórico de resultados do Inatel nessa modalidade. Em Futebol Mini, também garantiu o lugar mais alto do pódio. Já em Hockey, os estudantes ficaram com a segunda colocação.\n\nPara a estudante Beatriz Mayumi, do curso de Engenharia de Computação e vencedora na categoria Trekking, a conquista representa o resultado de meses de dedicação ao projeto. “Foram meses de trabalho duro, todas as semanas aqui no laboratório, e é muito gratificante ver o trabalho tomando forma, principalmente com uma premiação como essa em primeiro lugar”, conta.",
    "categoria": "Eventos",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/robotbulls-conquista-tres-podios-na-rcx-2026",
    "tempo_leitura": "3 min",
    "imagem_url": "https://inatel.br/noticias/image/bcb5c3fdac5554b90abe613b40202de7ef171731891aee9816f5f59352d5ec9e_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "19/10/2026"
  },
  {
    "id": 2,
    "titulo": "Semana da Produção aborda dados, algoritmos e tecnologia",
    "resumo": "O evento promovido pelo Inatel acontece de 27 a 29 de outubro, com o tema “O invisível que move o mundo: dados, algoritmos e tecnologia moldando o mundo”.",
    "conteudo": "RESUMO EM TÓPICOS:\n• Evento reúne palestras, workshops e minicursos com atividades sobre carreira, negócios, algoritmos e tomada de decisão.\n• O Instituto Nacional de Telecomunicações – Inatel promove, de 27 a 29 de outubro, mais uma edição da Semana da Engenharia de Produção.\n• A programação aborda temas que conectam tecnologia, gestão e negócios.\n• Entre as atividades estão o Prodgame, com foco em tomada de decisão; uma palestra sobre gêmeos digitais e a relação entre tecnologia dos games e Engenharia de Produção; e encontros sobre vendas, marketing, liderança e desenvolvimento profissional.\n\nSÍNTESE DA REPORTAGEM:\nEvento reúne palestras, workshops e minicursos com atividades sobre carreira, negócios, algoritmos e tomada de decisão.\n\nO Instituto Nacional de Telecomunicações – Inatel promove, de 27 a 29 de outubro, mais uma edição da Semana da Engenharia de Produção. Com o tema “O invisível que move o mundo: dados, algoritmos e tecnologia moldando o mundo”, o evento reúne painéis, workshops, palestras e minicursos sobre áreas de atuação, possibilidades profissionais, construção de carreira e habilidades importantes para o mercado de trabalho.\n\nA programação aborda temas que conectam tecnologia, gestão e negócios. Entre as atividades estão o Prodgame, com foco em tomada de decisão; uma palestra sobre gêmeos digitais e a relação entre tecnologia dos games e Engenharia de Produção; e encontros sobre vendas, marketing, liderança e desenvolvimento profissional. Os participantes também poderão conhecer aplicações de dados na tomada de decisões de negócios e no planejamento financeiro, além de discutir o papel dos algoritmos e as possibilidades de carreira em setores como o espacial, o industrial e o de defesa.\n\nAs atividades contam com opções abertas ao público e outras exclusivas, algumas com vagas limitadas. A programação também prevê o minicurso de certificação White Belt e atividades voltadas à análise de dados para decisões de negócios. Conforme atividade, a participação poderá ser validada como horas de Atividade Complementar (AC), Atividade de Treinamento (AT), CP/DPR ou horas da trilha NEMP001, de acordo com as indicações de cada sessão.",
    "categoria": "Eventos",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/semana-da-producao-aborda-dados-algoritmos-e-tecnologia",
    "tempo_leitura": "2 min",
    "imagem_url": "https://inatel.br/noticias/image/dc47c8fec514c5ed9606d3d2630fb82691feb1521546e6b66f0ccaf12cefbb2c_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "21/10/2026"
  },
  {
    "id": 3,
    "titulo": "Pesquisador do Inatel integra lista dos cientistas mais influentes do mundo pelo segundo ano consecutivo",
    "resumo": "Professor do Inatel, Felipe Figueiredo, está entre os 2% de cientistas mais influentes do mundo no ranking da Elsevier.",
    "conteudo": "RESUMO EM TÓPICOS:\n• O professor e pesquisador Felipe Figueiredo, do Inatel, integra, pelo terceiro ano consecutivo, a lista dos 2% de cientistas mais influentes do mundo, no ranking internacional da Elsevier .\n• A lista reúne pesquisadores com maior impacto científico a partir de métricas de produção, citações e influência acadêmica.\n• O professor também integra um seleto grupo de 19 brasileiros classificados nessa subárea.\n• O reconhecimento reflete um histórico de mais de duas décadas de atuação em pesquisa, iniciado ainda no mestrado, em 2004, e consolidado por meio de publicações científicas, projetos de pesquisa e colaborações nacionais e internacionais.\n\nSÍNTESE DA REPORTAGEM:\nProfessor do Inatel, Felipe Figueiredo, está entre os 2% de cientistas mais influentes do mundo no ranking da Elsevier.\n\nO professor e pesquisador Felipe Figueiredo, do Inatel, integra, pelo terceiro ano consecutivo, a lista dos 2% de cientistas mais influentes do mundo, no ranking internacional da Elsevier . A lista reúne pesquisadores com maior impacto científico a partir de métricas de produção, citações e influência acadêmica.\n\nA classificação é elaborada a partir de uma ampla base de dados que considera pesquisadores de diferentes países e áreas do conhecimento, como engenharia, medicina, física, matemática, biologia, química, ciências ambientais, psicologia e ciências sociais, entre outras.\n\nNa edição mais recente, Felipe aparece novamente entre os pesquisadores de destaque na subárea de redes e telecomunicações, além de constar no ranking geral, que reúne cientistas de todas as áreas. O professor também integra um seleto grupo de 19 brasileiros classificados nessa subárea. O reconhecimento reflete um histórico de mais de duas décadas de atuação em pesquisa, iniciado ainda no mestrado, em 2004, e consolidado por meio de publicações científicas, projetos de pesquisa e colaborações nacionais e internacionais.",
    "categoria": "Pesquisa",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/pesquisador-do-inatel-integra-lista-dos-cientistas-mais-influentes-do-mundo-pelo-segundo-ano-consecutivo",
    "tempo_leitura": "3 min",
    "imagem_url": "https://inatel.br/noticias/image/e9b4a09301a5e660867e7e2db99a1c782cd20f8f9205c98b4a9ae848f33602d9_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "22/10/2026"
  },
  {
    "id": 4,
    "titulo": "Workshop Brasil 6G reúne pesquisas e demonstra aplicações das futuras redes móveis",
    "resumo": "Pesquisas científicas, infraestrutura compartilhada e aplicações tecnológicas para desafios nacionais foram apresentados no 4º Workshop Brasil 6G, no Inatel.",
    "conteudo": "RESUMO EM TÓPICOS:\n• Quarta edição do evento reuniu 22 palestrantes e representantes de 13 instituições, com demonstrações de tecnologias, apresentação de infraestrutura experimental e debates sobre os próximos passos do programa.\n• O evento reuniu palestrantes e representantes de 13 instituições para compartilhar avanços das pesquisas sobre as futuras redes móveis, demonstrar soluções desenvolvidas pelo programa e discutir caminhos para dar continuidade à iniciativa.\n• Um dos destaques do encontro foi a Plataforma Multiusuário Brasil 6G, ambiente que permite testar algoritmos, aplicações e soluções de conectividade em condições reais de operação.\n• Ela é o teste definitivo para resolver um problema de conectividade no nosso país”, explica Luciano Leonel Mendes, professor do Inatel e coordenador do Projeto Brasil 6G.\n\nSÍNTESE DA REPORTAGEM:\nQuarta edição do evento reuniu 22 palestrantes e representantes de 13 instituições, com demonstrações de tecnologias, apresentação de infraestrutura experimental e debates sobre os próximos passos do programa.\n\nPesquisas científicas, infraestrutura compartilhada e aplicações tecnológicas para desafios nacionais estiveram no centro do 4º Workshop Brasil 6G, realizado de 20 a 22 de outubro, no Instituto Nacional de Telecomunicações – Inatel, em Santa Rita do Sapucaí (MG). O evento reuniu palestrantes e representantes de 13 instituições para compartilhar avanços das pesquisas sobre as futuras redes móveis, demonstrar soluções desenvolvidas pelo programa e discutir caminhos para dar continuidade à iniciativa.\n\nRealizado pelo Inatel em parceria com a Rede Nacional de Ensino e Pesquisa (RNP), o encontro reuniu pesquisadores, representantes do governo e profissionais da área em uma programação com palestras, sessões técnicas, apresentação de pôsteres, visitas a laboratórios e demonstrações de projetos em uma fazenda.\n\nUm dos destaques do encontro foi a Plataforma Multiusuário Brasil 6G, ambiente que permite testar algoritmos, aplicações e soluções de conectividade em condições reais de operação. A infraestrutura compartilhada possibilita validar algoritmos, aplicações e soluções de conectividade considerando desafios que nem sempre podem ser reproduzidos integralmente em simulações.",
    "categoria": "Pesquisa",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/workshop-brasil-6g-reune-pesquisas-e-demonstra-aplicacoes-das-futuras-redes-moveis",
    "tempo_leitura": "4 min",
    "imagem_url": "https://inatel.br/noticias/image/971432196a0941396739253848e6aadf84bc9ae12bc48fa9469c65573808d77e_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "26/10/2026"
  },
  {
    "id": 5,
    "titulo": "Engenharia de Telecomunicações do Inatel recebe nota máxima pelo 5º ano consecutivo",
    "resumo": "Curso é o único de instituição privada do país a alcançar cinco estrelas e oferece oportunidades de pesquisa, inovação e desenvolvimento ainda na graduação.",
    "conteudo": "RESUMO EM TÓPICOS:\n• O curso de Engenharia de Telecomunicações do Instituto Nacional de Telecomunicações – Inatel recebeu cinco estrelas no Guia da Faculdade 2026 , avaliação realizada pelo Estadão em parceria com a Quero Educação .\n• Divulgado nesta segunda, 26 de outubro, o resultado mantém o curso como o único de instituição privada do país a alcançar a nota máxima pelo quinto ano consecutivo.\n• \"A conquista de mais uma nota máxima é motivo de muito orgulho e nos dá a oportunidade de parabenizar todos os alunos e professores pelo esforço e dedicação em oferecer um dos cursos de Engenharia de Telecomunicações mais modernos do mundo.\n• Fundado em 1965, o Inatel foi a primeira instituição de ensino superior do Brasil dedicada às telecomunicações.\n\nSÍNTESE DA REPORTAGEM:\nCurso é o único de instituição privada do país a alcançar cinco estrelas no Guia da Faculdade 2026 e oferece oportunidades de pesquisa, inovação e desenvolvimento profissional durante a graduação.\n\nO curso de Engenharia de Telecomunicações do Instituto Nacional de Telecomunicações – Inatel recebeu cinco estrelas no Guia da Faculdade 2026 , avaliação realizada pelo Estadão em parceria com a Quero Educação . Divulgado nesta segunda, 26 de outubro, o resultado mantém o curso como o único de instituição privada do país a alcançar a nota máxima pelo quinto ano consecutivo. As outras seis engenharias do Instituto também receberam destaque na avaliação .\n\nO reconhecimento destaca uma trajetória de investimento na qualidade do ensino, na infraestrutura e na integração entre formação acadêmica, pesquisa e prática. Para os estudantes, essa combinação se reflete em oportunidades de participar de projetos tecnológicos, desenvolver soluções e aprofundar conhecimentos em áreas estratégicas para o setor.\n\n\"A conquista de mais uma nota máxima é motivo de muito orgulho e nos dá a oportunidade de parabenizar todos os alunos e professores pelo esforço e dedicação em oferecer um dos cursos de Engenharia de Telecomunicações mais modernos do mundo. Este reconhecimento de qualidade se traduz na modernidade e abrangência de nossa infraestrutura, com laboratórios temáticos que fazem os estudantes vivenciarem a aplicação prática do conhecimento, e em uma grade curricular estritamente alinhada às necessidades do mercado. Além disso, nossa forte atuação em pesquisas acadêmicas de relevância internacional, os trabalhos práticos desenvolvidos com corporações parceiras e as oportunidades de estágio em projetos internos com empresas nacionais e multinacionais formam um ecossistema único, que nos permite entregar ao mercado nacional e internacional recém-formados com uma sólida e diferenciada bagagem de experiência\" Carlos Nazareth, diretor do Inatel.",
    "categoria": "Pesquisa",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/engenharia-de-telecomunicacoes-do-inatel-recebe-nota-maxima-pelo-5-ano-consecutivo",
    "tempo_leitura": "5 min",
    "imagem_url": "https://inatel.br/noticias/image/4b013b1020b4b71869290615ad5e1daeacb469c3b1da6c349105ef5f61f0f9e9_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "27/10/2026"
  },
  {
    "id": 6,
    "titulo": "Engenharias do Inatel se destacam no Guia da Faculdade 2026",
    "resumo": "Os sete cursos de Engenharia do Instituto Nacional de Telecomunicações – Inatel foram bem avaliados na edição 2026 do Guia da Faculdade.",
    "conteudo": "RESUMO EM TÓPICOS:\n• Engenharia de Telecomunicações recebeu cinco estrelas , nota máxima da avaliação, e foi a única graduação da área oferecida por uma instituição privada do país a alcançar esse resultado.\n• As outras seis Engenharias do Inatel, Computação, Controle e Automação, Produção, Software, Elétrica e Biomédica, receberam quatro estrelas.\n• “Esse resultado é um reconhecimento da formação de excelência oferecida pelo Inatel e do trabalho conjunto de toda a nossa comunidade acadêmica: professores, coordenadores, estudantes e equipes de apoio.\n• Essa conquista também nos motiva a seguir aprimorando a formação de profissionais preparados para desenvolver soluções e contribuir com a sociedade”, destaca o Pró-Diretor de Graduação e Vice-Diretor do Inatel, Guilherme Marcondes.\n\nSÍNTESE DA REPORTAGEM:\nEngenharia de Telecomunicações recebeu cinco estrelas, enquanto os outros seis cursos da instituição conquistaram quatro estrelas na avaliação do Estadão e da Quero Educação\n\nOs sete cursos de Engenharia do Instituto Nacional de Telecomunicações – Inatel foram bem avaliados na edição 2026 do Guia da Faculdade , iniciativa do Estadão em parceria com a Quero Educação . Engenharia de Telecomunicações recebeu cinco estrelas , nota máxima da avaliação, e foi a única graduação da área oferecida por uma instituição privada do país a alcançar esse resultado. As outras seis Engenharias do Inatel, Computação, Controle e Automação, Produção, Software, Elétrica e Biomédica, receberam quatro estrelas.\n\n“Esse resultado é um reconhecimento da formação de excelência oferecida pelo Inatel e do trabalho conjunto de toda a nossa comunidade acadêmica: professores, coordenadores, estudantes e equipes de apoio. Ter todos os nossos cursos bem avaliados reforça nosso compromisso com o ensino de qualidade, aliado à prática e à conexão com as transformações tecnológicas e as demandas do mercado. Essa conquista também nos motiva a seguir aprimorando a formação de profissionais preparados para desenvolver soluções e contribuir com a sociedade”, destaca o Pró-Diretor de Graduação e Vice-Diretor do Inatel, Guilherme Marcondes.\n\nCom formações voltadas a diferentes áreas da tecnologia, os cursos de Engenharia do Inatel preparam profissionais para desenvolver soluções para desafios da indústria, das comunicações, da computação, da energia e da saúde.",
    "categoria": "Acadêmico",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/engenharias-do-inatel-se-destacam-no-guia-da-faculdade-2026",
    "tempo_leitura": "5 min",
    "imagem_url": "https://inatel.br/noticias/image/d42ae59a18d4ed9e6de830665941ce16982160f9a7b547e83cc912b54e171ac7_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "27/10/2026"
  },
  {
    "id": 7,
    "titulo": "Connect Summit 2026 destaca conexões que impulsionam a inovação e os negócios",
    "resumo": "O Inatel promove, de 10 a 12 de novembro, a 21ª edição do Connect Summit, para discutir tendências de mercado, experiências e estimular negócios inovadores.",
    "conteudo": "RESUMO EM TÓPICOS:\n• Evento chega à 21ª edição com programação sobre inteligência artificial que gera faturamento, criação de negócios, saúde do empreendedor e o mercado bilionário de games, de 10 a 12 de novembro, em Santa Rita do Sapucaí.\n• A programação será realizada no campus do Inatel, em Santa Rita do Sapucaí (MG), e integra a Semana Global de Empreendedorismo, movimento internacional presente em mais de 180 países.\n• A edição de 2026 aborda temas como inteligência artificial aplicada aos negócios, saúde mental e alta performance, empreendedorismo estudantil, gestão de projetos e mercado de games.\n• A programação tem início na manhã do dia 10 com o SRI Day, encontro exclusivo para lideranças do Sistema Regional de Inovação (SRI) do Sul de Minas, que é formado por seis municípios.\n\nSÍNTESE DA REPORTAGEM:\nEvento chega à 21ª edição com programação sobre inteligência artificial que gera faturamento, criação de negócios, saúde do empreendedor e o mercado bilionário de games, de 10 a 12 de novembro, em Santa Rita do Sapucaí.\n\nO Instituto Nacional de Telecomunicações – Inatel promove, de 10 a 12 de novembro, a 21ª edição do Connect Summit, evento realizado pelo Inatel Startups que reúne empreendedores, empresários, estudantes, startups e especialistas de várias partes do Brasil para discutir tendências de mercado, compartilhar experiências e estimular a criação de negócios inovadores. A programação será realizada no campus do Inatel, em Santa Rita do Sapucaí (MG), e integra a Semana Global de Empreendedorismo, movimento internacional presente em mais de 180 países.\n\nAnteriormente conhecido como Seminário de Empreendedorismo do Inatel, o evento completa mais de duas décadas de atividades dedicadas ao fortalecimento da cultura empreendedora e tecnológica na região. A edição de 2026 aborda temas como inteligência artificial aplicada aos negócios, saúde mental e alta performance, empreendedorismo estudantil, gestão de projetos e mercado de games.\n\nA programação tem início na manhã do dia 10 com o SRI Day, encontro exclusivo para lideranças do Sistema Regional de Inovação (SRI) do Sul de Minas, que é formado por seis municípios. A atividade prevê discussões sobre o andamento, os resultados e os próximos passos da articulação regional, que reúne poder público, setor produtivo, universidades e sociedade civil para fortalecer o ambiente de negócios e impulsionar a inovação nos seis municípios participantes. À noite, às 19h30, o Teatro Inatel recebe a palestra magna de abertura, com o geofísico e divulgador científico Sérgio Sacani. As inscrições para a palestra estão esgotadas.",
    "categoria": "Eventos",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/connect-summit-2026-destaca-conexoes-que-impulsionam-a-inovacao-e-os-negocios",
    "tempo_leitura": "4 min",
    "imagem_url": "https://inatel.br/noticias/image/fda6f64eb365959de597459eaf40a59fca73ced751c6c89ed521edab36d8c203_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "28/10/2026"
  },
  {
    "id": 8,
    "titulo": "Missões na Europa fortalecem cooperação internacional do xGMobile",
    "resumo": "No último mês, o professor Luciano Leonel Mendes participou de atividades internacionais de pesquisa na Europa.",
    "conteudo": "RESUMO EM TÓPICOS:\n• Professor Luciano Leonel Mendes participou de missão governamental à Finlândia e de agenda em universidades europeias para ampliar parcerias e alinhar pesquisas em tecnologias avançadas e redes 6G.\n• No último mês, o professor Luciano Leonel Mendes, coordenador do Centro de Competência EMBRAPII Inatel em Redes 5G e 6G – xGMobile, do Instituto Nacional de Telecomunicações – Inatel, participou de atividades internacionais de pesquisa na Europa.\n• A programação incluiu uma missão governamental à Finlândia e uma agenda de visitas e encontros em universidades de outros países europeus, com destaque para a apresentação de pesquisas do xGMobile na Islândia.\n• As atividades tiveram como objetivo aproximar o Centro de instituições de referência em pesquisa e desenvolvimento tecnológico, acompanhar avanços em áreas estratégicas e ampliar as oportunidades de cooperação científica internacional.\n\nSÍNTESE DA REPORTAGEM:\nProfessor Luciano Leonel Mendes participou de missão governamental à Finlândia e de agenda em universidades europeias para ampliar parcerias e alinhar pesquisas em tecnologias avançadas e redes 6G.\n\nNo último mês, o professor Luciano Leonel Mendes, coordenador do Centro de Competência EMBRAPII Inatel em Redes 5G e 6G – xGMobile, do Instituto Nacional de Telecomunicações – Inatel, participou de atividades internacionais de pesquisa na Europa. A programação incluiu uma missão governamental à Finlândia e uma agenda de visitas e encontros em universidades de outros países europeus, com destaque para a apresentação de pesquisas do xGMobile na Islândia.\n\nAs atividades tiveram como objetivo aproximar o Centro de instituições de referência em pesquisa e desenvolvimento tecnológico, acompanhar avanços em áreas estratégicas e ampliar as oportunidades de cooperação científica internacional.\n\nNa primeira etapa da viagem, o professor representou o xGMobile em uma missão governamental à Finlândia, liderada pelo Ministério da Ciência, Tecnologia e Inovação (MCTI). A agenda reuniu representantes de instituições brasileiras de Ciência, Tecnologia e Inovação interessados em conhecer o ecossistema finlandês em áreas estratégicas, como tecnologias quânticas e comunicações avançadas.",
    "categoria": "Pesquisa",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/missoes-na-europa-fortalecem-cooperacao-internacional-do-xgmobile",
    "tempo_leitura": "5 min",
    "imagem_url": "https://inatel.br/noticias/image/1c83ee649b388abb3778cd75abf1165aec3c47d60ddd58dbc351b1560847c2e1_1200.jpeg",
    "destaque": false,
    "visualizacoes": 0,
    "curtidas": 0,
    "publicado_em": "29/10/2026"
  },
  {
    "id": 9,
    "titulo": "Criatividade, conhecimento e trabalho em equipe marcam as finais do start_Engenharia 2026",
    "resumo": "O Inatel recebeu, nos dias 22 e 23 de outubro, as finais do projeto start_Engenharia 2026 — Competição reuniu 186 estudantes de escolas de Ensino Médio em desafios práticos nas cinco áreas de Engenharia da instituição.",
    "conteudo": "RESUMO EM TÓPICOS:\n• Competição reuniu 186 estudantes de escolas de Ensino Médio em desafios práticos nas cinco áreas de Engenharia da instituição.\n• O Instituto Nacional de Telecomunicações – Inatel recebeu, nos dias 22 e 23 de outubro, as finais do projeto start_Engenharia 2026.\n• Promovida pelo núcleo start_Inatel, a iniciativa aproxima estudantes de escolas de Ensino Médio das diferentes áreas da Engenharia, por meio de atividades práticas, desafios tecnológicos e competições.\n• Em 2026, o projeto envolveu 1.166 estudantes de 45 instituições de ensino, distribuídas por 27 cidades de três estados: Minas Gerais (19), São Paulo (7) e Rio de Janeiro (1).\n\nSÍNTESE DA REPORTAGEM:\nCompetição reuniu 186 estudantes de escolas de Ensino Médio em desafios práticos nas cinco áreas de Engenharia da instituição.\n\nO Instituto Nacional de Telecomunicações – Inatel recebeu, nos dias 22 e 23 de outubro, as finais do projeto start_Engenharia 2026. Promovida pelo núcleo start_Inatel, a iniciativa aproxima estudantes de escolas de Ensino Médio das diferentes áreas da Engenharia, por meio de atividades práticas, desafios tecnológicos e competições.\n\nPara chegar à etapa final, os estudantes participaram de seletivas realizadas ao longo do ano nas próprias instituições de ensino. Os grupos com melhor desempenho em cada escola conquistaram uma vaga na competição final, no campus do Inatel.\n\nEm 2026, o projeto envolveu 1.166 estudantes de 45 instituições de ensino, distribuídas por 27 cidades de três estados: Minas Gerais (19), São Paulo (7) e Rio de Janeiro (1). O interesse das escolas foi superior à capacidade inicialmente planejada pela equipe, que não conseguiu atender a todas as instituições interessadas.",
    "categoria": "Eventos",
    "autor": "Portal Inatel",
    "fonte_nome": "Portal Inatel",
    "url_original": "https://inatel.br/noticias/criatividade-conhecimento-e-trabalho-em-equipe-marcam-as-finais-do-startengenharia-2026",
    "tempo_leitura": "3 min",
    "imagem_url": "https://inatel.br/noticias/image/f95c969caefbab32a6be59b6241b6e50dc9cb7a8f878cc6c185ae0425d2cd7a6_1200.jpeg",
    "destaque": true,
    "visualizacoes": 1,
    "curtidas": 0,
    "publicado_em": "30/10/2026"
  }
];

export const VAGAS_LINKEDIN_INICIAIS = [
  {
    "id": 1,
    "usuario_id": 1,
    "external_id": "li-4477017254",
    "titulo": "AI Engineer (Developer) - Autonomous Compliance Foundation",
    "empresa": "SAP",
    "localizacao": "Greater São Paulo Area",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4477017254",
    "logo_empresa": "",
    "data_publicacao": "2026-10-14",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 75,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 2,
    "usuario_id": 1,
    "external_id": "li-4477018184",
    "titulo": "Senior AI Engineer (Developer) - Autonomous Compliance Foundation",
    "empresa": "SAP",
    "localizacao": "Greater São Paulo Area",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4477018184",
    "logo_empresa": "",
    "data_publicacao": "2026-10-14",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 75,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 3,
    "usuario_id": 1,
    "external_id": "li-4485995619",
    "titulo": "Senior Global Data AI Specialist",
    "empresa": "ABB",
    "localizacao": "São Paulo, São Paulo, Brazil",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4485995619",
    "logo_empresa": "",
    "data_publicacao": "2026-11-01",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 4,
    "usuario_id": 1,
    "external_id": "li-4485214775",
    "titulo": "Engenheiro(a) de Inteligência Artificial Sênior/Especialista",
    "empresa": "FOURSYS",
    "localizacao": "Osasco, São Paulo, Brazil",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4485214775",
    "logo_empresa": "",
    "data_publicacao": "2026-10-29",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 5,
    "usuario_id": 1,
    "external_id": "li-4484280461",
    "titulo": "Senior Agentic AI Engineer - Remote Work | REF#306627",
    "empresa": "BairesDev",
    "localizacao": "Greater Rio de Janeiro",
    "modalidade": "Remoto",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4484280461",
    "logo_empresa": "",
    "data_publicacao": "2026-10-27",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 6,
    "usuario_id": 1,
    "external_id": "li-4466954958",
    "titulo": "Analista de Sistemas Sênior - Inteligência Artificial",
    "empresa": "Tokio Marine Seguradora",
    "localizacao": "São Paulo, São Paulo, Brazil",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4466954958",
    "logo_empresa": "",
    "data_publicacao": "2026-10-26",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 7,
    "usuario_id": 1,
    "external_id": "li-4479846475",
    "titulo": "Engenheiro de Inteligência Artificial Generativa",
    "empresa": "Jobbol",
    "localizacao": "Manaus, Amazonas, Brazil",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4479846475",
    "logo_empresa": "",
    "data_publicacao": "2026-10-15",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 8,
    "usuario_id": 1,
    "external_id": "li-4479830988",
    "titulo": "Engenheiro de Inteligência Artificial Generativa",
    "empresa": "Jobbol",
    "localizacao": "Belo Horizonte, Minas Gerais, Brazil",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4479830988",
    "logo_empresa": "",
    "data_publicacao": "2026-10-15",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 9,
    "usuario_id": 1,
    "external_id": "li-4475838704",
    "titulo": "Engenheiro(a) de Inteligência Artificial (Agentes Conversacionais e A2A)",
    "empresa": "Cruzeiro do Sul Educacional",
    "localizacao": "São Paulo, São Paulo, Brazil",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4475838704",
    "logo_empresa": "",
    "data_publicacao": "2026-10-05",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  },
  {
    "id": 10,
    "usuario_id": 1,
    "external_id": "li-4461403903",
    "titulo": "Engenheiro de IA Pleno (foco desenvolvimento de agentes)",
    "empresa": "Franq",
    "localizacao": "Florianópolis, Santa Catarina, Brazil",
    "modalidade": "Presencial / Híbrido",
    "nivel": "",
    "salario": "A combinar (LinkedIn)",
    "descricao": "Oportunidade coletada diretamente do LinkedIn para a busca 'Inteligência Artificial'. Clique para abrir a descrição completa e se candidatar no LinkedIn.",
    "job_url": "https://www.linkedin.com/jobs/view/4461403903",
    "logo_empresa": "",
    "data_publicacao": "2026-09-04",
    "termo_busca": "Inteligência Artificial",
    "fonte": "linkedin-jobspy",
    "compatibilidade": 71,
    "coletado_em": "02/11/2026 07:19",
    "skills_match": [
      "Inteligência Artificial"
    ]
  }
];

export const ANALISE_LINKEDIN_INICIAL = {
  "id": 1,
  "usuario_id": 1,
  "linkedin_url": "https://www.linkedin.com/in/kaua-ribeiro17",
  "slug": "kaua-ribeiro17",
  "fonte_coleta": "Jina Reader API + LinkedIn Schema.org DOM (gratuita)",
  "nome_completo": "Kaua Ribeiro",
  "headline": "Desenvolvedor de Software Back-end na DevSw e graduando em Engenharia de Software no…",
  "localizacao": "Santa Rita do Sapucaí, Minas Gerais, Brasil",
  "conexoes_ou_seguidores": "2.449 seguidores • + de 500 conexões",
  "resumo": "Desenvolvedor de Software Back-end na DevSw e graduando em Engenharia de Software no…",
  "pontuacao_perfil": 98,
  "atualizado_em": "02/11/2026 07:19",
  "experiencias": [
    {
      "cargo": "Experiência vinculada no perfil",
      "empresa": "Instituto Nacional de Telecomunicações - Inatel",
      "periodo": "",
      "localizacao": "Santa Rita do Sapucaí, Minas Gerais, Brasil",
      "descricao": "",
      "oculto_visitante": true
    },
    {
      "cargo": "+ 2 experiência(s) registrada(s) no perfil",
      "empresa": "Detalhes de cargo protegidos pelo modo visitante do LinkedIn",
      "periodo": "",
      "localizacao": "Santa Rita do Sapucaí, Minas Gerais, Brasil",
      "descricao": "O LinkedIn contabiliza estas experiências no seu perfil, mas oculta os títulos secundários para visitantes deslogados.",
      "oculto_visitante": true
    }
  ],
  "formacao": [
    {
      "instituicao": "Instituto Nacional de Telecomunicações - Inatel",
      "curso": "Formação Acadêmica / Graduação",
      "periodo": "2025 - 2029",
      "nota_ou_detalhe": "Rendimento/Nota no perfil: 92.8/100",
      "oculto_visitante": false
    },
    {
      "instituicao": "Instituição de Ensino (registrada no perfil)",
      "curso": "Detalhes protegidos no modo visitante do LinkedIn",
      "periodo": "2022 - 2024",
      "nota_ou_detalhe": "",
      "oculto_visitante": true
    },
    {
      "instituicao": "Instituição de Ensino (registrada no perfil)",
      "curso": "Detalhes protegidos no modo visitante do LinkedIn",
      "periodo": "2021 - 2021",
      "nota_ou_detalhe": "",
      "oculto_visitante": true
    }
  ],
  "skills": [
    "Python",
    "Back-End",
    "JavaScript",
    "Git & GitHub",
    "Algoritmos & Estruturas de Dados",
    "Inteligência Artificial & ML",
    "Redes & Telecom (5G/6G)",
    "IoT, BLE & Sistemas Embarcados",
    "Eletrônica & Hardware",
    "Cibersegurança",
    "Pesquisa Científica & P&D",
    "Inglês"
  ],
  "pontos_fortes": [
    "Links externos integrados ao topo do perfil (GitHub, Portfólio).",
    "Rede de contatos expressiva e ativa (2.449 seguidores • + de 500 conexões).",
    "Posicionamento profissional claro logo na abertura do perfil.",
    "Seção 'Sobre' preenchida com apresentação direta de carreira e formação.",
    "3 experiências profissionais/acadêmicas registradas no perfil.",
    "Formação acadêmica sólida (3 registro(s) no histórico educacional).",
    "Portfólio de projetos técnicos robusto (3 projetos: SIMTER 2.0, Estação Genesis, LEES).",
    "Educação continuada em destaque (2 certificado(s), 11 curso(s) e 2 idioma(s)).",
    "7 reconhecimentos e prêmios de mérito acadêmico/tecnológico.",
    "Presença ativa no feed com 6 publicações próprias recentes (368 reações acumuladas).",
    "12 competências técnicas extraídas diretamente das seções do perfil.",
    "Alta aderência às suas áreas no portal: inteligência artificial."
  ],
  "sugestoes_melhoria": [
    "Visibilidade pública (-2 pts): o LinkedIn oculta subtítulos de alguns cargos para visitantes deslogados. Em 'Editar perfil público' no LinkedIn, ative 'Detalhes de experiência' para exibir todos os cargos abertamente."
  ],
  "dados_brutos": {
    "url_consultada": "https://br.linkedin.com/in/kaua-ribeiro17",
    "html_bytes": 678167,
    "metodo": "jina-html-jsonld",
    "secoes_extras": {
      "instituicao_atual": "Instituto Nacional de Telecomunicações - Inatel",
      "foto_url": "https://media.licdn.com/dms/image/v2/D4D03AQFsN_Ujp02DNg/profile-displayphoto-scale_200_200/B4DZwhzMNJKEAc-/0/1770093594918?e=2147483647&v=beta&t=Lr4X8_ZwtkkvBGTAKPfhRAJ7WV2oODEZIgaFYwO8Mh4",
      "banner_url": "https://media.licdn.com/dms/image/v2/D4D16AQG14CPme-8s7w/profile-displaybackgroundimage-shrink_200_800/B4DZhCeeqmG8AU-/0/1753461943504?e=2147483647&v=beta&t=_uaE9WM948IrM3J2kVtJCNAjDx8qKHXQypVXEVya-r4",
      "sites": [
        {
          "rotulo": "GitHub",
          "url": "https://github.com/Kauakim"
        },
        {
          "rotulo": "Portfólio",
          "url": "https://kauakim.github.io/Portfolio-KauaRibeiro/"
        }
      ],
      "total_experiencias_perfil": 3,
      "total_formacoes_perfil": 3,
      "projetos": [
        {
          "titulo": "SIMTER 2.0 - Sistema de Monitoramento em Tempo Real",
          "periodo": "fev. de 2025 - set. de 2025",
          "descricao": "O SIMTER - Sistema de Monitoramento em Tempo Real, é uma solução de rastreio indoor criada para monitorar e gerenciar ativos como equipamentos, produtos e pessoas em ambientes industriais, desenvolvido para a FETIN 2025, a feira tecnológica do INATEL.\nO projeto, que atua como um sistema inteligente de rastreamento e gestão indoor de pessoas, ferramentas e ativos, alinhado aos pilares da Indústria 4.0, tem como foco proporcionar visibilidade em tempo real das operações industriais, otimizando o uso de recursos, automatizando tarefas e aumentando a eficiência operacional por meio da utilização de beacons e gateways BLE (Bluetooth Low Energy)."
        },
        {
          "titulo": "Estação Genesis",
          "periodo": "nov. de 2023 - nov. de 2024",
          "descricao": "A Estação Genesis é uma solução inovadora para monitoramento climático, desenvolvida para a ProjETE 2K24, a feira de projetos tecnológicos da ETE FMC.\nO projeto foi criado para coletar dados climáticos de forma autônoma e fornecer previsões meteorológicas precisas, eliminando a dependência de sensores de baixa precisão ou de interpretações humanas complexas, a partir da utilização de diversas tecnologias, como Inteligência Artificial, Gêmeos Digitais, NovaGenesis, LoRa e muitas outras.\nInicialmente projetada para o agronegócio, a Estação Genesis é versátil e pode ser aplicada em outros setores, como turismo, transporte e administração pública, promovendo sustentabilidade, eficiência na gestã"
        },
        {
          "titulo": "LEES - Lixeira Eletrônica Econômica Sustentável",
          "periodo": "fev. de 2023 - set. de 2023",
          "descricao": "A LEES - Lixeira Eletrônica Econômica Sustentável - é um lixeira inteligente inovadora desenvolvida para a ProjETE 2K23, a feira de projetos tecnológicos da ETE FMC.\nProjetada para promover a sustentabilidade e garantir um futuro mais digno e promissor para as futuras gerações, a LEES automatiza, a partir da utilização de redes neurais e sensores capacitivos construídos especificamente para o projeto, a separação de resíduos sólidos com base no material de cada item descartado, facilitando a reciclagem e garantindo o descarte adequado dos resíduos, contribuindo significativamente para a redução do impacto ambiental e reforçando o compromisso com um futuro mais sustentável."
        }
      ],
      "certificacoes": [
        {
          "nome": "Capacitação em Redes de Comunicações Móveis 5G - xGMobile",
          "emissor": "Instituto Nacional de Telecomunicações - Inatel",
          "data": "Emitido em ago. de 2026"
        },
        {
          "nome": "Programa de Iniciação Científica Jr. (PIC)",
          "emissor": "CNPq - Conselho Nacional de Desenvolvimento Científico e Tecnológico",
          "data": "Emitido em dez. de 2021"
        }
      ],
      "cursos": [
        "Apresentações sem Firulas (MINIMIZA)",
        "Fundamentos de Corrosão de PCI (INATEL)",
        "Fundamentos de Recorte Eletrônico (INATEL)",
        "Git e GitHub (Alura)",
        "Instensivão de JavaScript (Hashtag Programação)",
        "Introdução a Modelagem 3D com o Blender (INATEL)",
        "Introdução ao Gerenciamento de Redes com Python (INATEL)",
        "Jornada Python da Hashtag (Hashtag Programação)",
        "Programa de Capacitação de Monitores (INATEL)",
        "Python Aplicado a Segurança Cibernética (INATEL)",
        "The Last Algorithms Course You'll Need (ThePrimeagen)"
      ],
      "premios": [
        {
          "titulo": "Certificado de Excelência de Desempenho Acadêmico",
          "emissor": "",
          "data": "ago. de 2026",
          "descricao": "Certificado recebido por apresentar média geral de notas acima de 90 pontos no primeiro semestre de 2026."
        },
        {
          "titulo": "Programa Jovens Talentos",
          "emissor": "",
          "data": "ago. de 2026",
          "descricao": ""
        },
        {
          "titulo": "Certificado de Excelência de Desempenho Acadêmico",
          "emissor": "",
          "data": "mar. de 2026",
          "descricao": "Certificado recebido por apresentar média geral de notas acima de 90 pontos no segundo semestre de 2025."
        },
        {
          "titulo": "Diploma de Mérito Acadêmico",
          "emissor": "",
          "data": "nov. de 2025",
          "descricao": "Certificado concedido ao aluno com a melhor média entre os formandos dos cursos técnicos, no período diurno, de 2025."
        },
        {
          "titulo": "Certificado de Excelência de Desempenho Acadêmico",
          "emissor": "",
          "data": "ago. de 2025",
          "descricao": "Certificado recebido por apresentar média geral de notas acima de 90 pontos no primeiro semestre de 2025."
        },
        {
          "titulo": "Premiações da ProjETE 2k24",
          "emissor": "ETE FMC",
          "data": "out. de 2024",
          "descricao": "Sucesso obtido como líder do projeto Estação Genesis, premiado na ProjETE 2k24 nas categorias:\n- Projeto Empreendedor da FAI: Reconhecido pela inovação e viabilidade comercial\n- Melhor Projeto de Telecomunicações: Destacado pelo impacto tecnológico e aplicabilidade no setor.\n- Projeto Inovação Municipal: Valorizado por impulsionar o desenvolvimento local e sustentável."
        },
        {
          "titulo": "Conquistas em Olimpíadas de Matemática e Astronomia",
          "emissor": "",
          "data": "",
          "descricao": "Ao longo do ensino básico, fui reconhecido com diversas premiações, como:\n- Medalha de Bronze na OBMEP (2019)\n- Medalha de Prata na OBMEP (2021)\n- Condecoração Municipal pelo desempenho excepcional na OBMEP 2021 (2023)\n- Medalha de Prata na OBA (2017)\n- Medalha de Ouro na OBA (2020)\n- Medalha de Bronze na OBA (2021)\n- Medalha de Bronze na OBA (2023)\n- Medalha de Prata na Matemática sem Fronteiras Regional (2017)\n- Medalha de Bronze na Matemática sem Fronteiras Nacional (2017)\n- Medalha de Ouro n"
        }
      ],
      "idiomas": [
        {
          "idioma": "Inglês",
          "nivel": "Nível nativo ou bilíngue"
        },
        {
          "idioma": "Português",
          "nivel": "Nível nativo ou bilíngue"
        }
      ],
      "publicacoes": [
        {
          "texto": "🎓 Mais um objetivo concluído!\n\nNa última terça-feira (11/08), tive a oportunidade de participar da Aula Magna do Instituto Nacional de Telecomunicações - Inatel, com o tema “O Papel do Engenheiro Biomédico na Indústria 5.0”, dando continuidade à temática dos eventos que acompanhei durante a Semana da Engenharia Biomédica.\n\nNesta ocasião, tive a alegria de receber, pela terceira vez, o Certificado de Excelência em Desempenho Acadêmico, reconhecimento concedido pela instituição aos alunos que se destacaram pelo desempenho ao longo do semestre.\n\nA",
          "data": "17/08/2026",
          "curtidas": 98,
          "url": "https://pt.linkedin.com/posts/kaua-ribeiro17_mais-um-objetivo-conclu%C3%ADdo-na-%C3%BAltima-activity-7495056865635168257-zHOI"
        },
        {
          "texto": "Gostaria de compartilhar que, nos últimos quatro meses, concluí a Capacitação em Redes de Comunicações Móveis 5G do xGMobile, disponível em https://lnkd.in/d64J42yJ.\n\nDurante essa jornada, concluí 40 cursos, organizados em 9 trilhas de conhecimento, totalizando 424 horas de capacitação. Estruturado em um nível equivalente a uma pós-graduação lato sensu, o programa abordou desde os fundamentos das telecomunicações até aplicações avançadas do ecossistema 5G, abrangendo:\n\n• Fundamentos em Telecomunicações;\n• Redes de Acesso 5G;\n• Redes de Transpor",
          "data": "08/08/2026",
          "curtidas": 23,
          "url": "https://pt.linkedin.com/posts/kaua-ribeiro17_gostaria-de-compartilhar-que-nos-%C3%BAltimos-activity-7491893492957286400-bn0i"
        },
        {
          "texto": "📡 Programa de Formação de Talentos do xGMobile\n\nNos últimos três meses tive a oportunidade de ingressar no Programa de Formação de Talentos (PFT) do #xGMobile, iniciativa do Centro de Competência EMBRAPII Inatel em Redes 5G e 6G e do curso de Engenharia de Telecomunicações, voltada à formação de pesquisadores em tecnologias de comunicação móvel de próxima geração.\n\nAo longo dessa etapa, eu e meus colegas, de diferentes cursos e períodos, passamos por uma intensa fase de nivelamento técnico e científico, aprofundando conhecimentos em metodologia",
          "data": "10/07/2026",
          "curtidas": 56,
          "url": "https://pt.linkedin.com/posts/kaua-ribeiro17_xgmobile-activity-7481301213855203328-4I39"
        },
        {
          "texto": "Entre os dias 13 e 17 de maio, tive a oportunidade de participar de mais uma edição da semana das Engenharias de Computação e Software do Instituto Nacional de Telecomunicações - Inatel, uma semana incrível que sempre consegue unir aprendizado, networking e boas risadas.\n\nDurante a semana, acompanhei palestras e painéis sobre áreas como desenvolvimento de software, inteligência artificial e redes, ministrados por professores do INATEL e por grandes empresas da área, como Microsoft, NIC.br e Cadence. Além disso, testei meus conhecimentos nos qui",
          "data": "25/05/2026",
          "curtidas": 88,
          "url": "https://pt.linkedin.com/posts/kaua-ribeiro17_inatel-compsoft-codingpizzaandglory-activity-7464616282479415297-KzZJ"
        },
        {
          "texto": "🚩 No dia 18/04, participei de mais uma edição do CTF INATEL, uma competição no formato Capture the Flag, onde os participantes enfrentam desafios práticos de cibersegurança.\n\nNa minha terceira participação, fica ainda mais claro como meu interesse pela área vem crescendo, principalmente ao aprofundar meus conhecimentos em desenvolvimento seguro de software e hardware, engenharia social e hardware hacking.\n\nEsse tipo de experiência reforça o quanto a segurança da informação é essencial. Mais do que resolver problemas técnicos, trata-se de pensar",
          "data": "24/04/2026",
          "curtidas": 54,
          "url": "https://pt.linkedin.com/posts/kaua-ribeiro17_no-dia-1804-participei-de-mais-uma-edi%C3%A7%C3%A3o-activity-7453549016648151041-A54e"
        },
        {
          "texto": "Nesta última semana, tive novamente a oportunidade de acompanhar a Aula Magna do Instituto Nacional de Telecomunicações - Inatel, na qual o tema abordado foi “O Novo Humanismo na Era Digital”.\n\nNa ocasião, recebi mais uma vez o Certificado de Excelência em Desempenho Acadêmico, reconhecimento concedido pela instituição aos alunos que se destacaram no semestre - uma conquista que reforça, mais uma vez, meu compromisso com a busca constante pela excelência desde o início da minha trajetória na graduação.",
          "data": "16/03/2026",
          "curtidas": 49,
          "url": "https://pt.linkedin.com/posts/kaua-ribeiro17_nesta-%C3%BAltima-semana-tive-novamente-a-oportunidade-activity-7439416433668784128-ccFP"
        }
      ],
      "nivel_perfil": "Perfil Campeão (All-Star)",
      "pilares_nota": [
        {
          "nome": "Identidade, Links & Rede",
          "pontos": 20,
          "maximo": 20,
          "detalhe": "Foto profissional, capa personalizada, localidade, links (github, portfólio), 2.449 seguidores • + de 500 conexões"
        },
        {
          "nome": "Headline & Seção Sobre",
          "pontos": 15,
          "maximo": 15,
          "detalhe": "Apresentação e resumo extraídos do perfil"
        },
        {
          "nome": "Experiências & Formação",
          "pontos": 18,
          "maximo": 20,
          "detalhe": "3 experiência(s) e 3 formação(ões)"
        },
        {
          "nome": "Projetos & Inovação",
          "pontos": 15,
          "maximo": 15,
          "detalhe": "3 projeto(s) detalhado(s)"
        },
        {
          "nome": "Certificados, Cursos & Idiomas",
          "pontos": 15,
          "maximo": 15,
          "detalhe": "2 cert., 11 curso(s), 2 idioma(s)"
        },
        {
          "nome": "Prêmios, Posts & Skills",
          "pontos": 15,
          "maximo": 15,
          "detalhe": "7 prêmio(s), 6 post(s), 12 skill(s)"
        }
      ]
    },
    "curso_portal": "Engenharia de Software",
    "areas_interesse_portal": "Full-Stack, UI/UX, Cloud, Inteligência Artificial"
  }
};

function checkAndResetStorage() {
  try {
    const currentVer = localStorage.getItem(STORAGE_KEYS.VERSION);
    const existingUser = localStorage.getItem(STORAGE_KEYS.USER);
    let shouldReset = currentVer !== MOCK_VERSION;
    if (existingUser) {
      const parsed = JSON.parse(existingUser);
      if (parsed.matricula === 2048 || parsed.email === 'kaua@ges.inatel.br' || parsed.crs === 86.4) {
        shouldReset = true;
      }
    }
    if (shouldReset) {
      localStorage.setItem(STORAGE_KEYS.VERSION, MOCK_VERSION);
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(USUARIO_INICIAL));
      localStorage.setItem(STORAGE_KEYS.AULAS, JSON.stringify(AULAS_INICIAIS));
      localStorage.setItem(STORAGE_KEYS.EVENTOS, JSON.stringify(EVENTOS_INICIAIS));
      localStorage.setItem(STORAGE_KEYS.NOTICIAS, JSON.stringify(NOTICIAS_INICIAIS));
      localStorage.setItem(STORAGE_KEYS.LINKEDIN_VAGAS, JSON.stringify(VAGAS_LINKEDIN_INICIAIS));
      if (ANALISE_LINKEDIN_INICIAL) {
        localStorage.setItem(STORAGE_KEYS.LINKEDIN_ANALISE, JSON.stringify(ANALISE_LINKEDIN_INICIAL));
      }
    }
  } catch {
    // Ignora restrições de localStorage
  }
}

// Executa verificação inicial de versão
if (typeof window !== 'undefined') {
  checkAndResetStorage();
}

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
    // ignora
  }
}

export function handleMockFallback(path, options = {}) {
  checkAndResetStorage();
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // 1. Health check
  if (path === '/api/health') {
    return {
      status: 'ok',
      service: 'inatel-portal-offline-demo',
      database: { mode: 'demonstrativo-offline-sincronizado' },
    };
  }

  // 2. Auth: Login
  if (path === '/api/auth/login' && method === 'POST') {
    const ident = String(body.identificador || '').trim();
    const user = getStorageItem(STORAGE_KEYS.USER, USUARIO_INICIAL);
    if (/^\d+$/.test(ident)) {
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
      matricula: parseInt(body.matricula, 10) || 777,
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
    const updated = { ...current, ...body, atualizado_em: '02/11/2026' };
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
    return getStorageItem(STORAGE_KEYS.LINKEDIN_VAGAS, VAGAS_LINKEDIN_INICIAIS);
  }

  // 14. LinkedIn Perfil
  if (path.startsWith('/api/linkedin/analise') || path.startsWith('/api/linkedin/analisar-perfil')) {
    const currentAnalise = getStorageItem(STORAGE_KEYS.LINKEDIN_ANALISE, ANALISE_LINKEDIN_INICIAL);
    return currentAnalise;
  }

  return null;
}
