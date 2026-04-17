# 🎮 ENEM Gamification

Este documento define a estrutura, funcionamento e organização da plataforma **ENEM Gamification**, com foco em prática com questões reais, simulados e sistema de gamificação.

---

## 📌 Objetivo

- Facilitar o estudo para o ENEM com prática real
- Aplicar gamificação para aumentar engajamento
- Simular o ambiente real de prova (Dia 1 e Dia 2)
- Oferecer ranking e acompanhamento de desempenho

---

## 🧠 Visão Geral do Sistema

A plataforma é dividida em duas partes principais:

### 🖥 Frontend

Responsável pela interface do usuário:

- Dashboard
- Questões
- Simulados
- Ranking

### ⚙️ Backend

Responsável pela lógica da aplicação:

- Consumo de API externa (questões reais)
- Cálculo de XP
- Geração de simulados
- Ranking de usuários

---

## 🏗 Estrutura do Projeto


.
├── frontend/
│ ├── index.html
│ ├── questoes.html
│ ├── simulado.html
│ ├── ranking.html
│ └── js/
├── backend/
│ ├── src/
│ ├── prisma/
│ └── data/
└── package.json


---

## 🛠 Tecnologias Utilizadas

### Frontend

- HTML
- CSS
- JavaScript (Vanilla)

### Backend

- NestJS (Node.js + TypeScript)

### Banco de Dados

- PostgreSQL
- Prisma ORM

### Integrações

- API externa: https://api.enem.dev/v1

---

## 📘 Funcionalidades Principais

### 📚 Prática de Questões

- Seleção por ano e disciplina
- Questões reais do ENEM
- Correção automática
- Envio de respostas para cálculo de XP

---

### 🧪 Simulados

Simulam o formato oficial do ENEM:

- Separação por **Dia 1** e **Dia 2**
- Tempo controlado
- Quantidade de questões por disciplina
- Finalização com envio de resultado

---

### 🏆 Ranking

- Exibição de usuários com maior pontuação
- Baseado em XP acumulado
- Versão atual utiliza dados em memória

---

### 🎯 Gamificação

Sistema responsável por:

- Cálculo de XP
- Regras de pontuação
- Progressão do usuário

---

## 🔌 Endpoints Principais

### 📘 Questões

- `GET /api/v1/questions/exams`
- `GET /api/v1/questions/external`
- `POST /api/v1/questions/external/answer`

---

### 🧪 Simulados

- `POST /api/v1/simulados/start`
- `POST /api/v1/simulados/finish`

---

### 🏆 Ranking

- `GET /api/v1/ranking`
- `GET /api/v1/ranking/all`

---

### 🎯 Gamificação

- `POST /api/v1/gamification/answer`
- `GET /api/v1/gamification/xp-rules`

---

## ⚙️ Configurações do Sistema

### Backend

- Prefixo global: `/api/v1`
- Porta padrão: `3333`
- Swagger: `/docs`

---

## 🚀 Execução do Projeto

### 1. Instalar dependências

```bash
npm install
npm run install-all
2. Configurar ambiente

Arquivo: backend/.env

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME
PORT=3333
3. Configurar banco (Prisma)
cd backend
npm run prisma:generate
npm run prisma:push
4. Rodar aplicação
npm run dev
🌐 Acesso
Frontend: http://localhost:3000
Backend: http://localhost:3333/api/v1
Swagger: http://localhost:3333/docs
📊 Fonte de Dados

O sistema utiliza dados reais do ENEM via API externa.

Estratégia de fallback

Caso a API esteja indisponível:

Utiliza cache local em:
backend/data/questions-data.json
Scripts auxiliares
node backend/data/fetch-real-enem.js
node backend/data/expand.js
fetch-real-enem.js → coleta questões reais
expand.js → completa dados para desenvolvimento
🔁 Lógica de Funcionamento
Fluxo do usuário
Escolhe ano/disciplina
Resolve questões
Envia respostas
Recebe XP
Participa do ranking
Realiza simulados
🛠 Troubleshooting
Problemas comuns
Questões não carregam
Verificar backend ativo
Testar /questions/exams
Simulado não inicia
Testar /simulados/start
Ranking vazio
Atualmente usa dados mockados
Erro no Prisma
Verificar DATABASE_URL
Rodar comandos de migração
⚠️ Status do Projeto
✅ Funcional
questions
simulados
ranking
gamification
🚧 Em desenvolvimento
auth
users
notifications
materials
📌 Padrões do Sistema
Toda resposta gera XP
Simulados seguem estrutura oficial do ENEM
Ranking baseado em pontuação acumulada
Fallback de dados obrigatório para estabilidade
👨‍💻 Autor

Projeto desenvolvido para estudo e prática com foco em preparação para o ENEM.
