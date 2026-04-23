# Deploy na Vercel

Este projeto roda melhor com **2 projetos na Vercel**:

- `frontend/` para a interface
- `backend/` para a API NestJS

O Supabase entra como **banco de dados** do backend.

## 1) Backend na Vercel

Crie um projeto novo na Vercel apontando para:

```text
N.E.V.A Pro/backend
```

### Variáveis de ambiente do backend

Copie e cole estas variáveis em **Project Settings > Environment Variables**:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_DO_SUPABASE@aws-0-REGIAO.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres:SUA_SENHA_DO_SUPABASE@db.pykipbdkqxyvlfemygjh.supabase.co:5432/postgres?sslmode=require
SUPABASE_URL=https://pykipbdkqxyvlfemygjh.supabase.co
SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=SUA_SUPABASE_SERVICE_ROLE_KEY
JWT_SECRET=UMA_CHAVE_FORTE_E_UNICA
GOOGLE_CLIENT_ID=SEU_GOOGLE_CLIENT_ID
APPLE_CLIENT_ID=SEU_APPLE_CLIENT_ID
NODE_ENV=production
```

### Onde pegar cada dado

- `SUPABASE_URL`:
  - Supabase > `Project Settings` > `API` > `Project URL`
- `SUPABASE_ANON_KEY`:
  - Supabase > `Project Settings` > `API` > `anon public`
- `SUPABASE_SERVICE_ROLE_KEY`:
  - Supabase > `Project Settings` > `API` > `service_role`
- `DATABASE_URL` e `DIRECT_URL`:
  - Supabase > `Database` > `Connect`
  - use a conexão `Transaction pooler` para `DATABASE_URL`
  - use a conexão `Direct` para `DIRECT_URL`
  - copie exatamente o host e a porta mostrados no painel

### Build do backend

O backend já está preparado para Vercel com:

- `backend/vercel.json`
- `backend/api/index.js`

O build já roda:

```bash
npm run prisma:generate && npm run build
```

---

## 2) Frontend na Vercel

Crie outro projeto apontando para:

```text
N.E.V.A Pro/frontend
```

### Variável de ambiente do frontend

No projeto do frontend, adicione:

```env
BACKEND_API_URL=https://SEU-BACKEND.vercel.app/api/v1
```

### O que isso faz

- o navegador chama `/api/v1`
- a Vercel do frontend repassa para o backend
- o backend responde usando o Supabase

---

## 3) Ordem certa para publicar

1. publique o **backend**
2. copie a URL pública dele
3. coloque essa URL em `BACKEND_API_URL`
4. publique o **frontend**
5. teste login, questões, ranking e simulados

---

## 4) Checklist rápido

- [ ] Backend publicado na Vercel
- [ ] `DATABASE_URL` configurada
- [ ] `DIRECT_URL` configurada
- [ ] `SUPABASE_URL` configurada
- [ ] `SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada
- [ ] `JWT_SECRET` configurada
- [ ] `BACKEND_API_URL` configurada no frontend
- [ ] Google/Apple autorizados para a URL pública
