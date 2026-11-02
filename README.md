# Portal Acadêmico Inatel — S05 (Interação Homem-Máquina)

<div align="center">

**Trabalho Final da Disciplina S05 — Interação Homem-Máquina**  
**Instituto Nacional de Telecomunicações — Inatel**  

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646cff?logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.12-3776ab?logo=python)](https://python.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0_Async-d71f00?logo=sqlalchemy)](https://www.sqlalchemy.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)

</div>

---

## 📌 Visão Geral do Projeto

O **Portal Acadêmico Inatel** é uma aplicação web full-stack desenvolvida especialmente para os estudantes do **Instituto Nacional de Telecomunicações (Inatel)**. Criada como projeto final da disciplina de **Interface Homem-Máquina (S05)**, a aplicação visa resolver pontos críticos de usabilidade encontrados em sistemas acadêmicos legados, unificando em uma interface moderna, ágil e intuitiva:

1. **Gestão Curricular & Horas Complementares**: Acompanhamento claro e dinâmico das metas oficiais do Inatel de **Atividades Complementares (AC)**, **Comportamento Profissional (CP)**, **Trilha** e **Coeficiente de Rendimento Semestral (CRS)**, com cálculo automático baseado na matriz curricular de cada engenharia.
2. **Grade Horária & Sistema de Avaliações Inatel (0 a 100)**: Suporte completo a múltiplos dias e horários semanais para uma mesma turma/disciplina, acompanhamento de notas de NP1, NP2, Projetos e Trabalhos na régua oficial do Inatel.
3. **Vagas no LinkedIn por Afinidade de Curso**: Coleta de vagas reais em tempo real no LinkedIn Jobs via web scraping, calculando percentual de compatibilidade (*% Match*) com base nas competências e cursos do aluno.
4. **Notícias Oficiais do Inatel com Resumo Inteligente**: Extração em tempo real das notícias diretamente do Portal Inatel (`inatel.br/noticias`), apresentando síntese executiva em tópicos e link direto para a matéria completa.
5. **Minha Conta**: Diagnóstico completo de perfil do LinkedIn via URL pública (com pontuação de 0 a 100 e recomendações profissionais).

---

### Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Front-end** | **React 19** | Biblioteca para interfaces reativas baseada em componentes funcionais e hooks modernos. |
| **Build Tool** | **Vite 8** | Servidor de desenvolvimento ultrarrápido com Hot Module Replacement (HMR) e empacotamento otimizado. |
| **Estilização** | **Tailwind CSS v4** | Framework utilitário moderno com suporte a variáveis CSS nativas e tema escuro. |
| **Back-end** | **FastAPI** | Framework Python moderno, assíncrono e de alta performance com tipagem via Pydantic v2. |
| **Segurança** | **JWT + PBKDF2** | Tokens Bearer JWT para autenticação com hash criptográfico de senhas. |
| **ORM** | **SQLAlchemy 2.0 Async** | Mapeamento objeto-relacional totalmente assíncrono com suporte a PostgreSQL e SQLite. |
| **Banco de Dados**| **PostgreSQL 16 / SQLite**| PostgreSQL via Docker Compose com fallback transparente para SQLite assíncrono local (`inatel_local.db`). |
| **Scraping** | **HTTPX + BeautifulSoup** | Coleta assíncrona de reportagens do Portal Inatel e vagas do LinkedIn. |

---

## 📱 Páginas e Módulos da Aplicação

### 1. Autenticação & Cadastro (`LoginPage`)
- Login flexível por **E-mail Institucional** ou **Matrícula**.
- Aba integrada para **Criar Conta** com validações de dados, seleção de curso oficial do Inatel e hash de senha.
- Credenciais padrão pré-semeadas no banco para testes rápidos:
  - **Matrícula:** `777` *(ou e-mail: `kaua.ribeiro@ges.inatel.br`)*
  - **Senha inicial:** `123456`

### 2. Painel Acadêmico (`DashboardPage` • `#dashboard`)
- **Indicadores Rápidos**: Cards clicáveis com CRS, Horas de AC, CP e Trilha com barra de progresso visual.
- **Minhas Aulas, Turmas, Provas & Notas**:
  - Cadastro de matérias.
  - Lançamento de avaliações (NP1, NP2, Trabalhos, Projetos), com cálculo automático da média ponderada da matéria.
  - Filtro interativo por dias da semana.

### 3. Vagas no LinkedIn (`VagasPage` • `#vagas`)
- **LinkedIn Jobs em Tempo Real**: Coleta de oportunidades de estágio, trainee e emprego vinculadas às áreas de interesse e ao curso do estudante.
- **Cálculo de Afinidade (% Match)**: Exibição da compatibilidade baseada em palavras-chave e competências do aluno.

### 4. Notícias do Inatel (`NoticiasPage` • `#noticias`)
- **Coleta Direta de `inatel.br/noticias`**: Atualização sob demanda das matérias oficiais de inovação, pesquisa e extensão.
- **Resumo Inteligente em Tópicos**: Modal com síntese executiva dividida em pontos-chave e leitura acessível, com botão para abrir a matéria original no portal do Inatel.
- **Filtro por Editorias**: Pesquisa livre e categorias (*Inovação*, *Pesquisa*, *Acadêmico*, *Eventos*, *Carreira*).

### 5. Minha Conta (`UserProfilePage` • `#perfil`)
- **Metas Curriculares Oficiais Inatel**:
  - **AC (Atividades Complementares)**: Sempre **200h** para todos os cursos.
  - **Trilha**: **60h** para *Engenharia de Software*, *Computação* e *Produção*; **20h** para *Biomédica*, *Controle e Automação*, *Elétrica* e *Telecomunicações*.
  - **CP (Comportamento Profissional)**: **40h** para *Engenharia de Software*, *Computação* e *Produção*; **20h** para os demais cursos.
  - Permite alterar manualmente o saldo de horas validadas e o CRS do semestre.
- **Análise do LinkedIn por Link**: Campo direto para colar o link público (`linkedin.com/in/...`), extraindo competências, pontuação de completude (0 a 100), pontos fortes e oportunidades de melhoria.
- **Segurança da Conta**: Alteração de senha com medidor dinâmico de força e logout seguro.

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- **Node.js** (versão 18 ou superior) e **npm**
- **Python** (versão 3.10 ou superior)
- *(Opcional)* **Docker** e **Docker Compose** se desejar rodar o PostgreSQL em contêiner.

### 1. Clonar o Repositório
```bash
git clone https://github.com/SEU-USUARIO/S05.git
cd S05
```

### 2. Instalação das Dependências

Instale as dependências da raiz e do frontend:
```bash
npm install
npm --prefix frontend install
```

Crie o ambiente virtual Python e instale as dependências do backend:
```bash
# No Windows (PowerShell)
python -m venv backend/.venv
backend\.venv\Scripts\python.exe -m pip install -r backend/requirements.txt

# No Linux/macOS
python3 -m venv backend/.venv
backend/.venv/bin/pip install -r backend/requirements.txt
```

### 3. Executar o Projeto com um Único Comando

Na raiz do projeto (`S05/`):
```bash
npm start
```

O comando executará simultaneamente com saída colorida:
- **Frontend (React + Vite):** [http://localhost:5173](http://localhost:5173)
- **Backend (FastAPI):** [http://localhost:8000](http://localhost:8000)
- **Documentação Swagger Interativa:** [http://localhost:8000/docs](http://localhost:8000/docs)

> **Nota sobre o Banco de Dados:** O sistema tenta conectar ao PostgreSQL configurado no arquivo `.env`. Caso o serviço do PostgreSQL não esteja em execução, a aplicação ativa **automaticamente o banco assíncrono local de testes (`backend/inatel_local.db`)**, já pré-semeado com os dados do usuário, turmas e matérias, sem que você precise configurar nada manualmente!

---

## 🌐 Como Publicar e Hospedar no GitHub Pages

O frontend do projeto foi configurado com caminhos relativos (`base: './'` no [vite.config.js](frontend/vite.config.js)) para funcionar perfeitamente em qualquer subdiretório do GitHub Pages (`https://<usuario>.github.io/<repositorio>/`).

### Deploy Automático via GitHub Actions

O projeto já inclui um workflow pronto em `.github/workflows/deploy.yml`. Para ativá-lo:

1. No seu repositório no GitHub, acesse a aba **Settings** > **Pages**.
2. Na seção **Build and deployment**:
   - Em **Source**, selecione **GitHub Actions**.
3. Vá até a aba **Actions** e execute o workflow *Deploy Frontend to GitHub Pages* (ou faça um push na branch `main`).
4. Em poucos instantes, o site estará publicado e acessível no link oficial fornecido pelo GitHub Pages!

## 👨‍💻 Autoria & Informações Acadêmicas

- **Aluno:** Kauã de Oliveira Ribeiro (GES - Engenharia de Software)
- **Matrícula:** `777`
- **Disciplina:** S05 — Interação Homem-Máquina
