# 🎮 ENEM Gamification

Plataforma web de estudos para o ENEM com foco em gamificação, prática com questões reais e simulados completos por dia de prova.

## 📚 Visão Geral

O projeto é dividido em duas partes principais:

  * **Frontend:** Interface do usuário (HTML, CSS e JavaScript).
  * **Backend:** API em NestJS responsável pela lógica da aplicação e regras de negócio.

## 💡 Como Funciona

Através da plataforma, o usuário pode:

  * Escolher ano e disciplina para estudo.
  * Resolver questões reais de edições anteriores do ENEM.
  * Ganhar XP através de um sistema de gamificação.
  * Participar de rankings competitivos.
  * Realizar simulados completos (Dia 1 ou Dia 2) com tempo limitado.

-----

## 🛠️ Tecnologias

### Frontend

  * HTML5
  * CSS3
  * JavaScript (Vanilla)
  * **Ferramenta:** `serve` (para rodar a aplicação localmente)

### Backend

  * **Framework:** NestJS (Node.js + TypeScript)
  * **Banco de Dados:** PostgreSQL
  * **ORM:** Prisma ORM
  * **Dados Externos:** API [enem.dev](https://api.enem.dev/v1)
  * **Cache Local:** `backend/data/questions-data.json`

-----

## 🏗️ Arquitetura

### 📁 Frontend

| Arquivo | Descrição |
| :--- | :--- |
| `index.html` | Dashboard principal |
| `questoes.html` | Tela de prática de questões |
| `simulado.html` | Interface para simulados completos |
| `ranking.html` | Visualização do ranking de usuários |
| `js/main.js` | Scripts de layout (sidebar e navbar) |
| `js/questoes.js` | Lógica e fluxo de resolução de questões |
| `js/simulado.js` | Controle de tempo e regras dos simulados |
| `js/ranking.js` | Consumo da API para o ranking |

### ⚙️ Backend

  * **Prefixo global:** `/api/v1`
  * **Porta padrão:** `3333`
  * **Documentação Swagger:** `/docs`

-----

## 🔌 Endpoints Principais

### 📘 Questões

```http
GET /api/v1/questions/exams
GET /api/v1/questions/external?year=2023&limit=100&offset=0
POST /api/v1/questions/external/answer
```

### 🧪 Simulados

```http
POST /api/v1/simulados/start
POST /api/v1/simulados/finish
```

**Exemplo de requisição (`/start`):**

```json
{
  "year": 2023,
  "day": 1,
  "questionCountPerDiscipline": 20
}
```

### 🏆 Ranking

```http
GET /api/v1/ranking
GET /api/v1/ranking/all
```

### 🎯 Gamificação

```http
POST /api/v1/gamification/answer
GET /api/v1/gamification/xp-rules
```

-----

## 🚀 Como Rodar o Projeto

### 1\. Instalar dependências

Na raiz do projeto, execute:

```bash
npm install
npm run install-all
```

### 2\. Configurar o Backend

Crie um arquivo `.env` na pasta `backend/` com as seguintes variáveis:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
PORT=3333

# Opcional (Redis para cache)
REDIS_HOST="localhost"
REDIS_PORT=6379
```

### 3\. Configurar o Prisma

Acesse a pasta do backend e prepare o banco de dados:

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 4\. Executar a aplicação

Na raiz do projeto, inicie os serviços:

```bash
npm run dev
```

-----

## 🌐 URLs e Acessos

  * **Frontend:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
  * **Backend:** [http://localhost:3333/api/v1](https://www.google.com/search?q=http://localhost:3333/api/v1)
  * **Swagger (Docs):** [http://localhost:3333/docs](https://www.google.com/search?q=http://localhost:3333/docs)

-----

## 📊 Dados do ENEM e Cache Local

O backend utiliza a API externa `enem.dev` como fonte primária. Caso haja instabilidade na API, o sistema utiliza um cache local como fallback.

**Arquivo de Cache:**

  * `backend/data/questions-data.json`

**Scripts Úteis para Popular Dados:**

```bash
# Baixa questões reais da API e salva localmente
node backend/data/fetch-real-enem.js

# Completa disciplinas com dados locais (fallback)
node backend/data/expand.js
```

-----

## 📂 Estrutura de Diretórios

```text
.
├── frontend/
│   ├── *.html
│   └── js/
├── backend/
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   └── modules/
│   ├── prisma/
│   │   └── schema.prisma
│   └── data/
└── package.json
```

-----

## 🛠️ Troubleshooting (Solução de Problemas)

**❌ Questões não carregam no Frontend**

  * **Verifique se a API está online:** Acesse `http://localhost:3333/api/v1`.
  * **Teste o Endpoint:** Faça uma requisição para `GET /questions/exams`.
  * **Dica:** Confira se há erros de CORS no console do navegador (F12).

**❌ Simulado não inicia**

  * **Teste o Endpoint:** Faça uma requisição para `POST /simulados/start`.
  * **Dica:** Verifique no retorno da requisição se os arrays `questions` e `totalQuestions` estão sendo populados corretamente.

**❌ Ranking aparece vazio**

  * **Teste o Endpoint:** Acesse `GET /ranking`.
  * **Nota:** Atualmente, este endpoint pode estar utilizando dados mockados em memória dependendo do seu ambiente.

**❌ Erro com o Prisma / Banco de Dados**

  * **Dica:** Valide se a sua `DATABASE_URL` no `.env` está correta e se o PostgreSQL está rodando.
  * **Resolução:** Execute novamente os comandos de sincronização:
    ```bash
    npm run prisma:generate
    npm run prisma:push
    ```

-----

## ⚠️ Status dos Módulos

**✅ Módulos Funcionais:**

  * Questions (Questões)
  * Simulados
  * Ranking
  * Gamification (Gamificação)

**🚧 Em Desenvolvimento:**

  * Auth (Autenticação)
  * Users (Gerenciamento de Usuários)
  * Notifications (Notificações)
  * Materials (Materiais de Apoio)
