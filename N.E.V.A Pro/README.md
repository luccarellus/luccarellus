<<<<<<< HEAD
# ENEM Gamification

Plataforma web de estudos para ENEM com gamificacao, pratica de questoes reais e simulados por dia de prova.

## Explicacao simples do projeto

Este projeto e dividido em duas partes:

- `frontend`: telas HTML/CSS/JS (dashboard, questoes, ranking e simulado).
- `backend`: API NestJS que busca questoes reais da API `enem.dev`, calcula XP, entrega ranking e monta simulados.

Na pratica, o aluno escolhe ano/disciplina, responde questoes reais, recebe XP e pode fazer simulados do Dia 1 ou Dia 2 com limite de tempo.

## Tecnologias

- Frontend: HTML, CSS, JavaScript vanilla, `serve`
- Backend: NestJS (Node.js + TypeScript)
- Banco: PostgreSQL com Prisma
- Dados externos: `https://api.enem.dev/v1`
- Cache local de questoes: `backend/data/questions-data.json`

## Arquitetura

### Frontend

- `frontend/index.html`: dashboard
- `frontend/questoes.html`: pratica de questoes
- `frontend/simulado.html`: simulados completos
- `frontend/ranking.html`: ranking de usuarios
- `frontend/js/main.js`: layout comum (sidebar/navbar)
- `frontend/js/questoes.js`: fluxo de questoes por ano/disciplina
- `frontend/js/simulado.js`: inicio/finalizacao do simulado via backend
- `frontend/js/ranking.js`: consumo e renderizacao do ranking

### Backend

- Prefixo global: `/api/v1`
- Porta padrao: `3333`
- Documentacao Swagger: `/docs`
- Modulos registrados:
  - `questions`
  - `simulados`
  - `ranking`
  - `gamification`
  - `auth` (estrutura inicial)
  - `users` (estrutura inicial)
  - `notifications` (estrutura inicial)
  - `materials` (estrutura inicial)

## Endpoints principais

### Questoes

- `GET /api/v1/questions/exams`
- `GET /api/v1/questions/external?year=2023&limit=100&offset=0`
- `POST /api/v1/questions/external/answer`

### Simulados

- `POST /api/v1/simulados/start`
  - Exemplo de body:
  ```json
  {
    "year": 2023,
    "day": 1,
    "questionCountPerDiscipline": 20
  }
  ```
- `POST /api/v1/simulados/finish`

### Ranking

- `GET /api/v1/ranking`
- `GET /api/v1/ranking/all`

### Gamificacao

- `POST /api/v1/gamification/answer`
- `GET /api/v1/gamification/xp-rules`

## Como rodar (desenvolvimento)

## 1. Instalar dependencias

Na raiz:

```bash
npm install
npm run install-all
```

## 2. Configurar backend

Arquivo: `backend/.env`

Defina pelo menos:

```env
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/DB_NAME
PORT=3333
```

Opcional (se futuramente habilitar Redis/Bull):

```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

## 3. Preparar Prisma

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

## 4. Subir front + back juntos

Na raiz:

```bash
npm run dev
```

Urls esperadas:

- Frontend: `http://localhost:3000` (ou porta exibida pelo `serve`)
- Backend: `http://localhost:3333/api/v1`
- Swagger: `http://localhost:3333/docs`

## Dados reais do ENEM e cache local

O backend tenta buscar dados da API externa `enem.dev`. Se a API falhar/oscilar, usa cache local em `backend/data/questions-data.json`.

Scripts uteis:

```bash
node backend/data/fetch-real-enem.js
node backend/data/expand.js
```

- `fetch-real-enem.js`: baixa questoes reais (com meta de 20 por disciplina para anos alvo).
- `expand.js`: completa disciplinas com menos de 20 via clones locais (fallback de desenvolvimento).

## Estrutura resumida

```txt
.
+- frontend/
|  +- *.html
|  +- js/
+- backend/
|  +- src/
|  |  +- main.ts
|  |  +- app.module.ts
|  |  +- modules/
|  +- prisma/
|  |  +- schema.prisma
|  +- data/
+- package.json
```

## Troubleshooting rapido

- As questoes nao carregam:
  - confirme backend em `http://localhost:3333/api/v1`
  - teste `GET /api/v1/questions/exams`
  - confira CORS e erros no console do navegador
- Simulado nao inicia:
  - teste `POST /api/v1/simulados/start`
  - verifique se retornou `questions` e `totalQuestions`
- Ranking vazio:
  - teste `GET /api/v1/ranking`
  - hoje o ranking usa dados mockados em memoria
- Erro Prisma:
  - valide `DATABASE_URL`
  - rode `npm run prisma:generate` e `npm run prisma:push` dentro de `backend`

## Observacoes atuais

- Parte dos modulos (`auth`, `users`, `notifications`, `materials`) esta em estagio inicial de backend.
- O fluxo principal funcional hoje esta em `questions`, `simulados`, `ranking` e `gamification`.
- O projeto ja esta preparado para continuar evoluindo para autenticacao real, persistencia completa de ranking e notificacoes.
=======

>>>>>>> 023b1b30432d60cd90a345881429af5c9fc7cba8
