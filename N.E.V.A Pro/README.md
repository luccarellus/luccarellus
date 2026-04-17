🎮 N.E.V.A PRO | ENEM Gamification

Plataforma web de estudos para o ENEM com foco em gamificação, prática com questões reais e simulados completos por dia de prova.

📚 Visão Geral

O projeto é dividido em duas partes principais:

Frontend → Interface do usuário (HTML, CSS e JavaScript)
Backend → API em NestJS responsável pela lógica da aplicação
💡 Como funciona

O usuário pode:

Escolher ano e disciplina
Resolver questões reais do ENEM
Ganhar XP (gamificação)
Participar de rankings
Realizar simulados completos (Dia 1 ou Dia 2 com tempo limitado)
🛠️ Tecnologias
Frontend
HTML
CSS
JavaScript (Vanilla)
serve
Backend
NestJS (Node.js + TypeScript)
Banco de Dados
PostgreSQL
Prisma ORM
Dados Externos
API: https://api.enem.dev/v1
Cache Local
backend/data/questions-data.json
🏗️ Arquitetura
📁 Frontend
Arquivo	Descrição
index.html	Dashboard
questoes.html	Prática de questões
simulado.html	Simulados completos
ranking.html	Ranking de usuários
js/main.js	Layout (sidebar/navbar)
js/questoes.js	Fluxo de questões
js/simulado.js	Controle de simulados
js/ranking.js	Consumo do ranking
⚙️ Backend
Prefixo global: /api/v1
Porta padrão: 3333
Swagger: /docs
📦 Módulos
questions
simulados
ranking
gamification
auth (em desenvolvimento)
users (em desenvolvimento)
notifications (em desenvolvimento)
materials (em desenvolvimento)
🔌 Endpoints Principais
📘 Questões
GET /api/v1/questions/exams
GET /api/v1/questions/external?year=2023&limit=100&offset=0
POST /api/v1/questions/external/answer
🧪 Simulados
POST /api/v1/simulados/start
POST /api/v1/simulados/finish
Exemplo de requisição:
{
  "year": 2023,
  "day": 1,
  "questionCountPerDiscipline": 20
}
🏆 Ranking
GET /api/v1/ranking
GET /api/v1/ranking/all
🎯 Gamificação
POST /api/v1/gamification/answer
GET /api/v1/gamification/xp-rules
🚀 Como Rodar o Projeto
1. Instalar dependências

Na raiz do projeto:

npm install
npm run install-all
2. Configurar o Backend

Arquivo: backend/.env

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME
PORT=3333

Opcional (Redis):

REDIS_HOST=localhost
REDIS_PORT=6379
3. Configurar o Prisma
cd backend
npm run prisma:generate
npm run prisma:push
4. Executar aplicação

Na raiz:

npm run dev
🌐 URLs
Frontend: http://localhost:3000
Backend: http://localhost:3333/api/v1
Swagger: http://localhost:3333/docs
📊 Dados do ENEM e Cache

O backend utiliza a API externa enem.dev. Caso ela falhe, utiliza um cache local.

📁 Arquivo:

backend/data/questions-data.json
Scripts úteis
node backend/data/fetch-real-enem.js
node backend/data/expand.js
fetch-real-enem.js → Baixa questões reais
expand.js → Completa disciplinas com dados locais (fallback)
📂 Estrutura do Projeto
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
🛠️ Troubleshooting
❌ Questões não carregam
Verifique: http://localhost:3333/api/v1
Teste: GET /questions/exams
Confira CORS e console do navegador
❌ Simulado não inicia
Teste: POST /simulados/start
Verifique retorno: questions e totalQuestions
❌ Ranking vazio
Teste: GET /ranking
Atualmente usa dados mockados em memória
❌ Erro com Prisma
Valide DATABASE_URL
Execute:
npm run prisma:generate
npm run prisma:push
⚠️ Observações
Módulos ainda em desenvolvimento:
auth
users
notifications
materials
Módulos já funcionais:
questions
simulados
ranking
gamification
