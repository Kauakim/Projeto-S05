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
   - Login por **e-mail institucional** ou **matrícula** (conta padrão pré-cadastrada: `kaua@ges.inatel.br` ou `GES-2048` / senha inicial: `123456`).
   - Aba **Criar Conta** para registrar novos alunos com hash criptográfico (`PBKDF2-HMAC-SHA256`) e sessão via token **JWT**.
1. **Painel Acadêmico (`#dashboard`)**:
   - Saudação personalizada sincronizada com o banco, indicadores rápidos (IRA, Horas Complementares e Mural NESP) e Central de Avisos interativa.
   - Grade semanal **Minhas Aulas** com filtro por dia da semana, código de cores por nota, controle de faltas e alertas de prova.
   - **Carrossel de Eventos** do campus com confirmação de presença e seletor dos 3 temas visuais (**Inatel**, **Limão** e **Dark**).
2. **Central de Vagas & Notícias (`#vagas-noticias`)**:
   - **Mural NESP Carreiras:** busca por tecnologia/empresa, filtros por tipo (`Estágio`, `Iniciação Científica`, `Júnior`, `Trainee`) e modalidade (`Presencial`, `Híbrido`, `Remoto`), vagas favoritas, candidatura integrada ao perfil do aluno e publicação de novas vagas.
   - **Vagas LinkedIn (Sua Área):** coleta vagas reais em tempo real no LinkedIn via `python-jobspy` (`POST /api/linkedin/vagas/buscar`) a partir das áreas de interesse e skills do perfil do aluno, calcula o `% Match`, salva no banco (`vagas_linkedin_cache`) e permite exportar em JSON.
   - **Notícias Reais (Inatel & Região):** web scraping assíncrono em tempo real (`POST /api/noticias/sincronizar`) direto do **Portal Inatel** (`inatel.br/noticias`), **g1 Sul de Minas (Santa Rita do Sapucaí)** e imprensa regional, gerando automaticamente um **Resumão em Tópicos** para cada reportagem e disponibilizando o link oficial para abrir a matéria completa na fonte original (sem dados mockados).
3. **Área do Aluno / Perfil (`#perfil`)**:
   - **Carteirinha Estudantil Digital Inatel** com modo de privacidade e exportação de comprovante de vínculo acadêmico.
   - **Análise LinkedIn via Web Scraping (`POST /api/linkedin/analisar-perfil`):** campo para colar o link público do perfil LinkedIn (`https://www.linkedin.com/in/...`), coletando nome, headline, resumo, experiências, formação e skills via API gratuita **Jina Reader (`r.jina.ai`)** sem necessidade de chave (com suporte opcional a `APIFY_API_TOKEN` ou `RAPIDAPI_KEY` via `.env` ou interface), calculando pontuação `0–100`, pontos fortes, recomendações e persistindo tudo na tabela `analises_linkedin` + exportação em JSON.
   - Métricas de desempenho (IRA, média semestral e barra de progresso de Horas Complementares).
   - Edição completa do perfil acadêmico e senha (`PUT /api/usuario`, `PUT /api/auth/senha`), além do acompanhamento de **Minhas Candidaturas** e **Vagas Salvas**.
