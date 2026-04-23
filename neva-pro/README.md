# 🎮 N.E.V.A Pro | ENEM Game

Plataforma web de estudos para o ENEM com foco em gamificação, prática com questões reais e simulados completos por dia de prova.

## 📚 Visão Geral

O **ENEM Gamification** transforma a rotina de estudos para o Exame Nacional do Ensino Médio em uma experiência interativa e competitiva. Dividido entre um frontend dinâmico e uma API robusta, o projeto motiva o aluno através de recompensas, progressão de nível e desafios baseados em edições reais do exame.

> **💡 O diferencial:** Caso a API externa de questões sofra instabilidades, o sistema possui um robusto esquema de cache e fallback local, garantindo que o estudante nunca pare de estudar.

---

## 🎯 Regras de Negócio e Lógica

### 🏆 Gamificação (Sistema de XP)
O engajamento do usuário é mantido por meio de pontos de experiência (XP):
* **Questão Avulsa Correta:** +10 XP.
* **Questão de Simulado Correta:** +20 XP (peso maior por estar contra o tempo).
* **Ofensiva (Dias seguidos estudando):** Multiplicador de bônus nas recompensas.
* **Ranking:** Os usuários são classificados com base no XP total acumulado, incentivando a consistência nos estudos.

### ⏱️ Simulados Oficiais
Os simulados replicam a estrutura exata do ENEM, divididos por dias:
* **Dia 1:** Linguagens e Códigos, Redação e Ciências Humanas (Tempo limite: 5h30).
* **Dia 2:** Ciências da Natureza e Matemática (Tempo limite: 5h).
* O usuário não sabe a resposta correta até finalizar o simulado ou o tempo expirar.

---

## 🛠️ Stack de Tecnologias

| Camada | Tecnologias Utilizadas |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), `serve` |
| **Backend** | NestJS, TypeScript, Node.js |
| **Banco de Dados** | PostgreSQL, Prisma ORM |
| **Integrações** | API Externa [enem.dev](https://api.enem.dev/v1) |
| **Ferramentas** | Swagger (Documentação API), Git |

---

## 🚀 Execução do Projeto

### 0. Pré-requisitos
Antes de começar, certifique-se de ter instalado em sua máquina:
* **Node.js** (v18 ou superior)
* **PostgreSQL** (rodando localmente ou via Docker)
* **Git**

### 1. Clonar e Instalar
```bash
# Clone o repositório
git clone https://github.com/SEU-USUARIO/enem-gamification.git
cd enem-gamification

# Instale as dependências da raiz (e dos subprojetos)
npm install
npm run install-all
```

### 2. Variáveis de Ambiente
Crie um arquivo `.env` dentro da pasta `backend/` seguindo o modelo:
```env
# Pooler do Supabase (ideal para runtime em produção/serverless)
DATABASE_URL="postgresql://postgres:SUA_SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

# Conexão direta (usada por migrações/prisma)
DIRECT_URL="postgresql://postgres:SUA_SENHA@db.<PROJECT_REF>.supabase.co:5432/postgres?sslmode=require"

# Configurações do Servidor
PORT=3333
NODE_ENV=production

# (Opcional) Chaves do Supabase para futuras integrações de Auth/Storage
SUPABASE_URL="https://<PROJECT_REF>.supabase.co"
SUPABASE_ANON_KEY="SUA_ANON_KEY"
```

> Dica: você pode copiar `backend/.env.example` e preencher os valores reais.

### 3. Configurar o Banco de Dados (Prisma)
Acesse a pasta do backend e prepare as tabelas:
```bash
cd backend
npm run prisma:generate  # Gera o client do Prisma
npm run prisma:push      # Sincroniza o schema com o PostgreSQL
```

### 3.1 Configurar URL da API no Frontend (deploy)
No frontend estático, a URL da API é lida do arquivo `frontend/js/config.js`.

Para produção, copie o exemplo e ajuste:
```bash
cp frontend/js/config.example.js frontend/js/config.js
```

Depois edite para algo como:
```js
window.APP_CONFIG = {
  API_BASE_URL: 'https://SEU_BACKEND.onrender.com/api/v1',
};
```

### 4. Rodar a Aplicação
Volte para a raiz do projeto e inicie os serviços do frontend e backend:
```bash
npm run dev
```

---

## 🌐 Endpoints e Acessos

| Serviço | URL de Acesso |
| :--- | :--- |
| **Frontend (Aplicação)** | http://localhost:3000 |
| **Backend (API Base)** | http://localhost:3333/api/v1 |
| **Swagger (Docs da API)** | http://localhost:3333/docs |

---

## ☁️ Deploy com Supabase + Render + Vercel

Guia rapido e completo: `DEPLOY_SUPABASE.md`

### 1) Banco no Supabase
- Crie um projeto no Supabase.
- Pegue `DATABASE_URL` (pooler) e `DIRECT_URL` (direct) em `Settings > Database`.
- No backend, configure essas variáveis e rode:

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 2) Backend NestJS no Render
- Crie um `Web Service` apontando para a pasta `backend`.
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Environment variables: `DATABASE_URL`, `DIRECT_URL`, `PORT`, `NODE_ENV`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`.

### 3) Frontend no Vercel
- Publique a pasta `frontend` como projeto estático.
- Antes do deploy, ajuste `frontend/js/config.js` com a URL pública do backend.

### 4) Validação rápida
- Abra `https://SEU_BACKEND/docs`.
- No frontend publicado, valide telas de `Questões`, `Simulado` e `Ranking`.

---

## 📊 Estratégia de Dados e Fallback

O sistema é resiliente. Ele busca as questões na API oficial em tempo real, mas caso haja indisponibilidade (timeout ou erro 500), ele automaticamente lê do arquivo JSON local (`backend/data/questions-data.json`).

**Scripts úteis para manutenção dos dados locais:**
```bash
# Para atualizar o banco local com questões recentes da API:
node backend/data/fetch-real-enem.js

# Para preencher lacunas de disciplinas no ambiente de dev:
node backend/data/expand.js
```

---

## 📂 Arquitetura de Diretórios

```text
enem-gamification/
├── frontend/                 # UI da Aplicação
│   ├── css/                  # Estilos globais e modulares
│   ├── js/                   # Lógica de consumo da API (Vanilla)
│   ├── *.html                # Telas (index, questoes, simulado, ranking)
│
├── backend/                  # API NestJS
│   ├── src/
│   │   ├── modules/          # Módulos (Questions, Simulados, Gamification)
│   │   ├── main.ts           # Ponto de entrada do Nest
│   ├── prisma/
│   │   └── schema.prisma     # Modelagem do banco de dados
│   ├── data/                 # Scripts de cache e dados JSON de fallback
│   └── .env                  # Variáveis de ambiente
│
└── package.json              # Scripts globais
```

---

## 🛠️ Troubleshooting (Solução de Problemas)

| Sintoma | Possível Causa / Solução |
| :--- | :--- |
| **API não responde (CORS / 404)** | Verifique se a porta no `.env` do backend bate com as chamadas no frontend (padrão: `3333`). |
| **Questões não carregam** | Certifique-se de que o backend está ativo. Teste o endpoint `GET /questions/exams`. |
| **Erro ao salvar resposta/XP** | O banco de dados pode estar desatualizado. Rode `npm run prisma:push` na pasta do backend. |
| **Simulado trava em "Carregando"** | Teste o endpoint `POST /simulados/start` via Swagger. Pode haver falta de questões no Cache/API para o ano selecionado. |
| **Ranking vazio** | Atualmente usa dados mockados. Teste acessando `GET /ranking`. |

---

## ⚠️ Status e Roadmap

- [x] Módulo de Questões e Cache Local
- [x] Lógica de Simulados e Cronômetro
- [x] Atribuição de XP (Gamificação)
- [x] Ranking de Usuários
- [ ] Autenticação e JWT (Sessões)
- [ ] Perfil de Usuário (Histórico de desempenho)
- [ ] Notificações e Lembretes de Estudo
- [ ] Módulo de Materiais de Apoio

---

## 👨‍💻 Autor

Projeto desenvolvido para estudo e prática, com foco em metodologias de aprendizado ativo e preparação para o ENEM.
