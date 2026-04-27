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

### Configurando a Conexão com o Backend

No projeto do frontend, você não usa variáveis de ambiente padrão. Em vez disso, **você precisa editar o arquivo `frontend/vercel.json`**.

Abra o arquivo `frontend/vercel.json` e substitua a URL `<COLOQUE_A_URL_DO_SEU_BACKEND_AQUI>` pela URL que a Vercel gerou para o seu backend:

```json
  "rewrites": [
    {
      "source": "/api/v1/:path*",
      "destination": "https://SEU-BACKEND-VERCEL.vercel.app/api/v1/:path*"
    }
  ],
```

### O que isso faz

- o navegador chama `/api/v1` (usando a URL do frontend)
- a Vercel do frontend repassa (rewrite) essa chamada para o backend
- o backend responde acessando o Supabase

---

## 3) Ordem certa para publicar

1. publique o **backend** na Vercel
2. copie a URL pública que a Vercel gerou para o backend
3. edite o arquivo `frontend/vercel.json` colocando essa URL
4. publique o **frontend** na Vercel
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
