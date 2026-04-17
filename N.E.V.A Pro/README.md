Com certeza\! Integrei as novas informações (Lógica de Funcionamento, Padrões do Sistema e Autor) e refinei as seções de Execução e Troubleshooting para ficarem ainda mais completas e diretas.

Aqui está o `README.md` atualizado:

-----

# 🎮 ENEM Gamification

Plataforma web de estudos para o ENEM com foco em gamificação, prática com questões reais e simulados completos por dia de prova.

## 📚 Visão Geral

O projeto é dividido em duas partes principais:

  * **Frontend:** Interface do usuário construída com tecnologias web padrão.
  * **Backend:** API robusta em NestJS para gerenciamento de lógica, usuários e dados.

## 🔁 Lógica de Funcionamento

### Fluxo do Usuário

1.  **Escolha:** O usuário seleciona o ano do exame e a disciplina desejada.
2.  **Prática:** Resolve questões reais de edições anteriores.
3.  **Interação:** Envia as respostas para validação imediata.
4.  **Recompensa:** Recebe XP (Experiência) por cada atividade concluída.
5.  **Competição:** Participa do ranking global baseado na pontuação acumulada.
6.  **Simulação:** Realiza simulados cronometrados seguindo a estrutura oficial.

### 📌 Padrões do Sistema

  * Toda resposta correta ou atividade gera XP para o usuário.
  * Os simulados seguem rigorosamente a estrutura de disciplinas e tempo do ENEM oficial.
  * O sistema possui um mecanismo de **fallback obrigatório** para garantir que as questões carreguem mesmo se a API externa falhar.

-----

## 🛠️ Tecnologias

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (Vanilla), `serve` |
| **Backend** | NestJS (Node.js + TypeScript) |
| **Banco de Dados** | PostgreSQL com Prisma ORM |
| **Cache/Dados** | Redis (opcional), JSON local para fallback |
| **API Externa** | [enem.dev](https://api.enem.dev/v1) |

-----

## 🚀 Execução do Projeto

### 1\. Instalar dependências

Na raiz do projeto:

```bash
npm install
npm run install-all
```

### 2\. Configurar Ambiente (`backend/.env`)

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/DB_NAME"
PORT=3333
```

### 3\. Configurar Banco de Dados (Prisma)

```bash
cd backend
npm run prisma:generate
npm run prisma:push
```

### 4\. Rodar Aplicação

Na raiz do projeto:

```bash
npm run dev
```

-----

## 🌐 Acesso e URLs

  * **Frontend:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
  * **Backend:** [http://localhost:3333/api/v1](https://www.google.com/search?q=http://localhost:3333/api/v1)
  * **Swagger (Docs):** [http://localhost:3333/docs](https://www.google.com/search?q=http://localhost:3333/docs)

-----

## 📊 Fonte de Dados e Estratégia de Fallback

O sistema prioriza dados reais do ENEM via API externa. Caso a API esteja indisponível, o sistema ativa automaticamente o **Cache Local**:

  * **Arquivo de Cache:** `backend/data/questions-data.json`

**Scripts Auxiliares:**

  * `node backend/data/fetch-real-enem.js` → Coleta e atualiza as questões reais.
  * `node backend/data/expand.js` → Completa e organiza os dados para o ambiente de desenvolvimento.

-----

## 🛠️ Troubleshooting (Resolução de Problemas)

| Problema | O que verificar |
| :--- | :--- |
| **Questões não carregam** | Certifique-se de que o backend está ativo e teste o endpoint `/questions/exams`. |
| **Simulado não inicia** | Verifique a resposta do endpoint `/simulados/start`. |
| **Ranking vazio** | Atualmente, o sistema pode estar utilizando dados mockados para exibição. |
| **Erro no Prisma** | Valide a `DATABASE_URL` e execute `prisma:push` novamente. |

-----

## ⚠️ Status do Projeto

### ✅ Funcional

  * **Questions:** Sistema de busca e entrega de questões.
  * **Simulados:** Lógica de tempo e estrutura de prova.
  * **Ranking:** Contagem de pontos e posicionamento.
  * **Gamification:** Atribuição de XP e regras de progresso.

### 🚧 Em Desenvolvimento

  * **Auth:** Sistema de login e persistência de sessão.
  * **Users:** Perfil detalhado do estudante.
  * **Notifications:** Alertas de desempenho e lembretes.
  * **Materials:** Biblioteca de apoio e estudos.

-----

## 👨‍💻 Autor

Projeto desenvolvido para estudo e prática, com foco em metodologias de aprendizado ativo e preparação para o ENEM.
