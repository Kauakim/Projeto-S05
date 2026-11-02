# Portal Acadêmico Inatel — S05 (Interface Homem-Máquina)

Aplicação Full-Stack desenvolvida para o trabalho da disciplina **S05 (IHM)** do **Inatel**, migrada e modernizada com:

- **Front-end:** React + Vite + Tailwind CSS v4 (`frontend/`)
- **Back-end:** Python + FastAPI + SQLAlchemy 2.0 Assíncrono (`backend/`)
- **Banco de Dados:** PostgreSQL (`DATABASE_URL` no `.env` da raiz, com suporte via `docker-compose.yml` e fallback automático assíncrono local caso o serviço do Postgres esteja desligado durante testes rápidos)

---

## Como rodar tudo com um único comando

Na raiz do projeto (`S05/`):

```bash
npm start
```

Isso iniciará simultaneamente no mesmo terminal:
- **Back-end (FastAPI + Swagger):** http://localhost:8000 (Documentação interativa em http://localhost:8000/docs)
- **Front-end (React + Tailwind):** http://localhost:5173

### Subindo o PostgreSQL via Docker (Opcional)
Caso tenha o Docker Desktop aberto e queira subir uma instância limpa do PostgreSQL 16 usando as credenciais do `.env`:

```bash
npm run db:up
```

---

## Páginas e Funcionalidades

0. **Autenticação & Cadastro (`LoginPage`)**:
   - Login por **e-mail institucional** ou **matrícula inteira (`0` a `999999`)** (conta padrão pré-cadastrada: `kaua@ges.inatel.br` ou matrícula `2048` / senha inicial: `123456`).
   - Aba **Criar Conta** para registrar novos alunos com hash criptográfico (`PBKDF2-HMAC-SHA256`) e sessão via token **JWT**.
1. **Painel Acadêmico (`#dashboard`)**:
   - Saudação personalizada sincronizada com o banco, indicadores clicáveis de **CRS** (*Coeficiente de Rendimento*, nota do semestre) e **Horas Validadas (AC, CP e Trilha)** com edição rápida, além da Central de Avisos interativa.
   - **Gestão Completa de Aulas, Turmas, Provas & Notas (`GET/POST/PUT/DELETE /api/aulas`)**: cadastro de novas disciplinas e turmas, registro de provas/trabalhos já realizados (com nota obtida e cálculo automático de média) e próximas avaliações, controle de faltas e alertas de prova.
   - **Carrossel de Eventos** do campus com confirmação de presença, alternador de tema claro/escuro (**Sol** e **Lua**), indicador **API: ON / API: OFF** e rodapé institucional fiel ao portal oficial do Inatel (`inatel.br/home`).
2. **Vagas (`#vagas`)**:
   - **Vagas LinkedIn (Sua Área):** coleta vagas reais em tempo real no LinkedIn via `python-jobspy` (`POST /api/linkedin/vagas/buscar`) a partir das áreas de interesse e skills do perfil do aluno, calcula o `% Match`, salva no banco (`vagas_linkedin_cache`) e permite exportar em JSON.
3. **Notícias (`#noticias`)**:
   - **Notícias Reais do Inatel:** web scraping assíncrono em tempo real (`POST /api/noticias/sincronizar`) direto do **Portal Inatel** (`inatel.br/noticias`), gerando automaticamente um **Resumo em Tópicos** para cada reportagem oficial e disponibilizando o link direto para abrir a matéria completa em `inatel.br`.
4. **Minha Conta (`#perfil`)**:
   - **Carteirinha Estudantil Digital Inatel** com modo de privacidade e exportação de comprovante de vínculo acadêmico.
   - **Controle de Horas Curriculares (`AC`, `CP` e `Trilha`) & CRS (`PUT /api/usuario`)**: metas oficiais calculadas automaticamente por curso conforme a matriz do Inatel (**AC**: sempre 200h; **Trilha**: 60h para Software/Computação/Produção e 20h para Biomédica/Controle e Automação/Elétrica/Telecomunicações; **CP**: 40h para Software/Computação/Produção e 20h para os demais), permitindo ao aluno ajustar suas horas validadas e o CRS do semestre.
   - **Análise LinkedIn via Web Scraping (`POST /api/linkedin/analisar-perfil`):** campo direto para colar o link público do perfil LinkedIn (`https://www.linkedin.com/in/...`), extraindo dados, seções e skills, calculando pontuação `0–100`, pontos fortes e recomendações, e persistindo tudo na tabela `analises_linkedin`.
   - Edição completa de dados cadastrais (incluindo matrícula inteira `0` a `999999`) e senha (`PUT /api/usuario`, `PUT /api/usuario/senha`).
