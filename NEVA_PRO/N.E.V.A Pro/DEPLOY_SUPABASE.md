# Deploy completo (Supabase + Render + Vercel)

Este guia deixa o projeto pronto em producao com:
- Banco PostgreSQL no Supabase
- API NestJS no Render
- Frontend estatico no Vercel

## 1) Preparar Supabase

1. Crie um projeto no Supabase.
2. Em `Settings > Database`, copie:
   - `Connection string` do **pooler** (porta `6543`)
   - `Connection string` **direct** (porta `5432`)
3. No backend, copie o arquivo de exemplo:

```bash
cp backend/.env.example backend/.env
```

4. Preencha:
- `DATABASE_URL` com o pooler
- `DIRECT_URL` com a conexao direta
- `SUPABASE_URL` e `SUPABASE_ANON_KEY`

## 2) Aplicar schema no banco Supabase

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:push
```

## 3) Subir API no Render

Opcao A (Blueprint):
- Crie um novo projeto no Render e selecione o arquivo `backend/render.yaml`.

Opcao B (Manual):
- Root Directory: `N.E.V.A Pro/backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm run start`
- Health Check Path: `/docs`

Variaveis obrigatorias no Render:
- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `PORT=3333`
- `NODE_ENV=production`

## 4) Apontar frontend para a API publicada

Edite `frontend/js/config.js`:

```js
window.APP_CONFIG.API_BASE_URL = 'https://SEU_BACKEND.onrender.com/api/v1';
```

## 5) Subir frontend no Vercel

- Crie projeto no Vercel com root em `N.E.V.A Pro/frontend`.
- Framework preset: `Other`.
- Output: estatico (padrao).

Arquivo `frontend/vercel.json` ja foi adicionado.

## 6) Teste final

1. Abra `https://SEU_BACKEND.onrender.com/docs`
2. Abra seu frontend publicado e valide:
   - `questoes.html`
   - `simulado.html`
   - `ranking.html`

## Troubleshooting rapido

- Erro de banco no backend:
  - confira se `DATABASE_URL` e `DIRECT_URL` estao corretas
  - confira `sslmode=require`
- Frontend chama localhost em producao:
  - verifique `frontend/js/config.js`
- CORS:
  - backend atual permite `origin: *` em `backend/src/main.ts`
