# 💸 Finance Dashboard

Dashboard interativo para análise de gastos pessoais, construído com **Streamlit**, **pandas** e **Plotly**.

---

## 📁 Estrutura do Projeto

```
finance_dashboard/
├── app.py           # Interface Streamlit (ponto de entrada)
├── database.py      # Persistência: leitura e escrita no CSV
├── analytics.py     # Métricas, agregações e gráficos Plotly
├── gastos.csv       # Dados (criado automaticamente se ausente)
└── requirements.txt # Dependências Python
```

---

## 🚀 Como executar

### 1. Clone / baixe o projeto

```bash
# Se vier de um repositório
git clone <url-do-repo>
cd finance_dashboard
```

### 2. Crie um ambiente virtual (recomendado)

```bash
python -m venv .venv

# Linux / macOS
source .venv/bin/activate

# Windows
.venv\Scripts\activate
```

### 3. Instale as dependências

```bash
pip install -r requirements.txt
```

### 4. Execute o dashboard

```bash
streamlit run app.py
```

O Streamlit abrirá automaticamente `http://localhost:8501` no navegador.

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| **Registro de Gastos** | Formulário na sidebar: data, valor, categoria e descrição |
| **Métricas no topo** | Total, média, nº de transações e categoria líder |
| **Gráfico de Pizza** | Participação percentual por categoria |
| **Evolução Temporal** | Linha acumulada + barras diárias sobrepostas |
| **Barras Horizontais** | Ranking de gastos por categoria |
| **Mapa de Calor** | Gastos por dia da semana × mês |
| **Barras Mensais** | Comparativo mensal por categoria (Top 5) |
| **Tabela Interativa** | Ordenação, busca e exportação CSV |
| **Filtros** | Período (de/até), categorias (multi-select), mês específico |

---

## 🗂️ Categorias disponíveis

Alimentação · Transporte · Moradia · Saúde · Educação · Lazer · Vestuário · Tecnologia · Outros

---

## 🛠️ Arquitetura

```
app.py
  └─▶ database.py   (I/O: lê e salva gastos.csv)
  └─▶ analytics.py  (cálculos e figuras Plotly)
```

- **`database.py`** — Funções puras de leitura/escrita; sem lógica de UI.
- **`analytics.py`** — Recebe DataFrames filtrados, devolve métricas e `go.Figure`.
- **`app.py`** — Orquestra Streamlit: sidebar, filtros, seções e gráficos.

---

## 📦 Dependências

```
streamlit >= 1.35
pandas    >= 2.2
plotly    >= 5.22
```

---

## 🗑️ Resetar os dados

Apague ou esvazie o `gastos.csv`. O dashboard recria automaticamente o arquivo vazio na próxima execução.

---

> Desenvolvido como projeto de estudo de dashboards financeiros pessoais com Python.
