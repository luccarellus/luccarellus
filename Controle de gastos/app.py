import streamlit as st
import pandas as pd
from datetime import date, timedelta, datetime

import database as db
import analytics as an

# ─── Configuração da página ────────────────────────────────────────────────────
st.set_page_config(
    page_title="Finance Dashboard",
    page_icon="💸",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── CSS global ───────────────────────────────────────────────────────────────
st.markdown(
    """
    <style>
    /* ── Imports ── */
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

    /* ── Base ── */
    html, body, [class*="css"] {
        font-family: 'DM Sans', sans-serif;
        background-color: #060B18;
        color: #E2E8F0;
    }

    /* ── Sidebar ── */
    [data-testid="stSidebar"] {
        background: linear-gradient(180deg, #0D1629 0%, #070E1F 100%);
        border-right: 1px solid rgba(255,255,255,0.06);
    }
    [data-testid="stSidebar"] * { color: #CBD5E1; }
    [data-testid="stSidebar"] .stSelectbox label,
    [data-testid="stSidebar"] .stDateInput label,
    [data-testid="stSidebar"] .stMultiSelect label {
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748B;
    }

    /* ── Metric cards ── */
    [data-testid="metric-container"] {
        background: rgba(15, 23, 42, 0.85);
        border: 1px solid rgba(99,102,241,0.18);
        border-radius: 14px;
        padding: 16px 20px 12px;
        backdrop-filter: blur(12px);
    }
    [data-testid="metric-container"] [data-testid="stMetricLabel"] {
        font-size: 11px !important;
        font-weight: 600 !important;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: #64748B !important;
    }
    [data-testid="metric-container"] [data-testid="stMetricValue"] {
        font-size: 26px !important;
        font-weight: 700 !important;
        color: #F1F5F9 !important;
        font-family: 'DM Mono', monospace !important;
    }
    [data-testid="metric-container"] [data-testid="stMetricDelta"] {
        font-size: 12px !important;
    }

    /* ── Section headers ── */
    .section-header {
        display: flex;
        align-items: center;
        gap: 10px;
        margin: 32px 0 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .section-header h2 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #F1F5F9;
        letter-spacing: -0.01em;
    }
    .section-badge {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        color: #6366F1;
        background: rgba(99,102,241,0.12);
        border: 1px solid rgba(99,102,241,0.25);
        border-radius: 6px;
        padding: 2px 8px;
    }

    /* ── Chart cards ── */
    .chart-card {
        background: rgba(15,23,42,0.7);
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 16px;
        padding: 4px;
        backdrop-filter: blur(8px);
    }

    /* ── Form card ── */
    .form-card {
        background: linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(15,23,42,0.9) 100%);
        border: 1px solid rgba(99,102,241,0.2);
        border-radius: 16px;
        padding: 24px 20px;
    }

    /* ── Inputs ── */
    .stTextInput input, .stNumberInput input, .stDateInput input,
    .stSelectbox select, .stTextArea textarea {
        background: rgba(15,23,42,0.8) !important;
        border: 1px solid rgba(255,255,255,0.1) !important;
        border-radius: 10px !important;
        color: #E2E8F0 !important;
        font-family: 'DM Sans', sans-serif !important;
    }
    .stTextInput input:focus, .stNumberInput input:focus, .stDateInput input:focus {
        border-color: rgba(99,102,241,0.6) !important;
        box-shadow: 0 0 0 3px rgba(99,102,241,0.12) !important;
    }

    /* ── Primary button ── */
    .stButton > button[kind="primary"], .stFormSubmitButton > button {
        background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%) !important;
        border: none !important;
        border-radius: 10px !important;
        color: white !important;
        font-weight: 600 !important;
        font-size: 14px !important;
        letter-spacing: 0.01em !important;
        padding: 10px 24px !important;
        transition: all 0.2s ease !important;
        width: 100%;
    }
    .stButton > button[kind="primary"]:hover, .stFormSubmitButton > button:hover {
        transform: translateY(-1px) !important;
        box-shadow: 0 8px 25px rgba(99,102,241,0.35) !important;
    }

    /* ── Dataframe ── */
    [data-testid="stDataFrame"] {
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.06);
    }

    /* ── Toast / alerts ── */
    .stSuccess {
        background: rgba(16,185,129,0.1) !important;
        border: 1px solid rgba(16,185,129,0.25) !important;
        border-radius: 10px !important;
        color: #6EE7B7 !important;
    }
    .stError {
        background: rgba(239,68,68,0.1) !important;
        border: 1px solid rgba(239,68,68,0.25) !important;
        border-radius: 10px !important;
        color: #FCA5A5 !important;
    }

    /* ── Divider ── */
    hr { border-color: rgba(255,255,255,0.06) !important; }

    /* ── Hide streamlit branding ── */
    #MainMenu, footer, header { visibility: hidden; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.02); }
    ::-webkit-scrollbar-thumb {
        background: rgba(99,102,241,0.4);
        border-radius: 3px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


# ─── Helper ───────────────────────────────────────────────────────────────────

def formatar_brl(valor: float) -> str:
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def section(emoji: str, titulo: str, badge: str = "") -> None:
    badge_html = f'<span class="section-badge">{badge}</span>' if badge else ""
    st.markdown(
        f"""
        <div class="section-header">
            <span style="font-size:20px">{emoji}</span>
            <h2>{titulo}</h2>
            {badge_html}
        </div>
        """,
        unsafe_allow_html=True,
    )


# ─── Sidebar ──────────────────────────────────────────────────────────────────

def render_sidebar(df: pd.DataFrame):
    with st.sidebar:
        # Logo / título
        st.markdown(
            """
            <div style="text-align:center;padding:24px 0 20px;">
                <div style="font-size:40px;margin-bottom:8px;">💸</div>
                <div style="font-size:20px;font-weight:700;color:#F1F5F9;letter-spacing:-0.02em;">
                    Finance
                </div>
                <div style="font-size:11px;color:#475569;letter-spacing:0.12em;
                            text-transform:uppercase;margin-top:2px;">
                    Dashboard
                </div>
            </div>
            <hr style="margin-bottom:24px;">
            """,
            unsafe_allow_html=True,
        )

        # ── Adicionar gasto ──────────────────────────────
        st.markdown(
            '<p style="font-size:11px;font-weight:700;letter-spacing:0.08em;'
            'text-transform:uppercase;color:#64748B;margin-bottom:12px;">➕ Novo Gasto</p>',
            unsafe_allow_html=True,
        )

        with st.form("form_gasto", clear_on_submit=True):
            # Sempre inicia no dia 01 do mês atual
            data_gasto = st.date_input("Data", value=date.today().replace(day=1), max_value=date.today(), format="DD/MM/YYYY")
            valor_gasto = st.number_input(
                "Valor (R$)", min_value=00.01, max_value=99999.99,
                step=1.0, format="%.2f"
            )
            categoria_gasto = st.selectbox("Categoria", db.CATEGORIAS)
            descricao_gasto = st.text_input("Descrição", placeholder="")

            submitted = st.form_submit_button("Registrar Gasto", type="primary")

            if submitted:
                try:
                    db.salvar_gasto(
                        data=str(data_gasto),
                        valor=valor_gasto,
                        categoria=categoria_gasto,
                        descricao=descricao_gasto,
                    )
                    st.success("✅ Gasto registrado!")
                    st.rerun()
                except Exception as e:
                    st.error(f"Erro: {e}")

        st.markdown("<hr style='margin:24px 0;'>", unsafe_allow_html=True)

        # ── Filtros ──────────────────────────────────────
        st.markdown(
            '<p style="font-size:11px;font-weight:700;letter-spacing:0.08em;'
            'text-transform:uppercase;color:#64748B;margin-bottom:12px;">🔍 Filtros</p>',
            unsafe_allow_html=True,
        )

        # Filtro de período
        if not df.empty and df["data"].notna().any():
            data_min = df["data"].min().date()
            data_max = df["data"].max().date()
        else:
            data_min = date.today().replace(day=1)
            data_max = date.today()
 
        col1, col2 = st.columns(2)
        with col1:
            data_ini = st.date_input("De", value=data_min, min_value=data_min, max_value=data_max)
        with col2:
            data_fim = st.date_input("Até", value=data_max, min_value=data_min, max_value=data_max)
        # Filtro de categorias
        cats_disponiveis = sorted(df["categoria"].unique().tolist()) if not df.empty else db.CATEGORIAS
        cats_selecionadas = st.multiselect(
            "Categorias",
            options=cats_disponiveis,
            default=cats_disponiveis,
        )

        # Filtro por mês específico
        meses_disponiveis = ["Todos"] + (
            sorted(df["mes_nome"].unique().tolist()) if not df.empty else []
        )
        mes_selecionado = st.selectbox("Mês específico", meses_disponiveis,)

        return {
            "data_ini": data_ini,
            "data_fim": data_fim,
            "categorias": cats_selecionadas,
            "mes": mes_selecionado,
        }


# ─── Aplicar filtros ──────────────────────────────────────────────────────────

def aplicar_filtros(df: pd.DataFrame, filtros: dict) -> pd.DataFrame:
    if df.empty:
        return df

    mask = (
        (df["data"].dt.date >= filtros["data_ini"])
        & (df["data"].dt.date <= filtros["data_fim"])
    )

    if filtros["categorias"]:
        mask &= df["categoria"].isin(filtros["categorias"])

    if filtros["mes"] != "Todos":
        mask &= df["mes_nome"] == filtros["mes"]

    return df[mask].copy()


# ─── Seções principais ────────────────────────────────────────────────────────

def render_metricas(df: pd.DataFrame) -> None:
    m = an.calcular_metricas(df)

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            "💰 Total Gasto",
            formatar_brl(m["total"]),
            help="Soma de todos os gastos no período filtrado",
        )
    with col2:
        st.metric(
            "📊 Média por Transação",
            formatar_brl(m["media"]),
            help="Ticket médio no período",
        )
    with col3:
        st.metric(
            "🔢 Transações",
            f"{m['transacoes']:,}".replace(",", "."),
            help="Número de registros no período",
        )
    with col4:
        st.metric(
            "🏆 Maior Categoria",
            m["maior_categoria"],
            help="Categoria com maior volume de gastos",
        )


def render_visao_geral(df: pd.DataFrame) -> None:
    section("📊", "Visão Geral", "overview")

    col_pizza, col_linha = st.columns([1, 1.6])

    with col_pizza:
        with st.container():
            st.markdown('<div class="chart-card">', unsafe_allow_html=True)
            st.plotly_chart(an.grafico_pizza(df), use_container_width=True, config={"displayModeBar": False}, key="chart_pizza")
            st.markdown("</div>", unsafe_allow_html=True)

    with col_linha:
        with st.container():
            st.markdown('<div class="chart-card">', unsafe_allow_html=True)
            st.plotly_chart(an.grafico_linha_evolucao(df), use_container_width=True, config={"displayModeBar": False}, key="chart_linha")
            st.markdown("</div>", unsafe_allow_html=True)


def render_analise_categoria(df: pd.DataFrame) -> None:
    section("🗂️", "Análise por Categoria", "breakdown")

    col_bar, col_heat = st.columns(2)

    with col_bar:
        st.markdown('<div class="chart-card">', unsafe_allow_html=True)
        st.plotly_chart(
            an.grafico_barras_categoria(df),
            use_container_width=True,
            config={"displayModeBar": False},
            key="chart_barras_cat",
        )
        st.markdown("</div>", unsafe_allow_html=True)

    with col_heat:
        st.markdown('<div class="chart-card">', unsafe_allow_html=True)
        st.plotly_chart(
            an.grafico_heatmap_semanal(df),
            use_container_width=True,
            config={"displayModeBar": False},
            key="chart_heatmap",
        )
        st.markdown("</div>", unsafe_allow_html=True)


def render_evolucao_mensal(df: pd.DataFrame) -> None:
    section("📅", "Evolução Mensal", "monthly")

    st.markdown('<div class="chart-card">', unsafe_allow_html=True)
    st.plotly_chart(
        an.grafico_barras_mensais(df),
        use_container_width=True,
        config={"displayModeBar": False},
        key="chart_barras_mensais",
    )
    st.markdown("</div>", unsafe_allow_html=True)


def render_tabela(df: pd.DataFrame) -> None:
    section("📋", "Tabela de Dados", f"{len(df)} registros")

    if df.empty:
        st.info("Nenhum gasto registrado ainda. Use o formulário na barra lateral para adicionar.")
        return

    # Colunas exibidas (sem derivadas internas)
    cols_exibir = [c for c in ["id", "data", "categoria", "valor", "descricao"] if c in df.columns]
    df_exibir = df[cols_exibir].copy()
    df_exibir["data"] = df_exibir["data"].dt.strftime("%d/%m/%Y")
    df_exibir["valor"] = df_exibir["valor"].apply(formatar_brl)
    df_exibir.columns = [c.capitalize() for c in df_exibir.columns]

    # Barra de busca simples
    busca = st.text_input(
        "🔎 Buscar na tabela",
        placeholder="Digite para filtrar por descrição ou categoria…",
        label_visibility="collapsed",
    )

    if busca:
        mask = (
            df_exibir["Descricao"].str.contains(busca, case=False, na=False)
            | df_exibir["Categoria"].str.contains(busca, case=False, na=False)
        )
        df_exibir = df_exibir[mask]

    st.dataframe(
        df_exibir,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Id": st.column_config.NumberColumn("ID", width="small"),
            "Data": st.column_config.TextColumn("Data", width="small"),
            "Categoria": st.column_config.TextColumn("Categoria", width="medium"),
            "Valor": st.column_config.TextColumn("Valor", width="medium"),
            "Descricao": st.column_config.TextColumn("Descrição", width="large"),
        },
        height=min(400, 56 + len(df_exibir) * 35),
    )

    # Download CSV
    csv_bytes = df_exibir.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="⬇️  Exportar CSV",
        data=csv_bytes,
        file_name=f"gastos_{date.today()}.csv",
        mime="text/csv",
        use_container_width=False,
    )


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:

    # Inicializa armazenamento
    db.inicializar_csv()

    # Carrega dados
    try:
        df_completo = db.carregar_gastos()
    except Exception as e:
        st.error(f"Falha ao carregar dados: {e}")
        df_completo = pd.DataFrame(columns=db.COLUNAS)

    # ── Pré-processamento do DataFrame ──────────────────
    if not df_completo.empty and "data" in df_completo.columns:
        df_completo["data"] = pd.to_datetime(df_completo["data"], errors="coerce")
        df_completo.dropna(subset=["data"], inplace=True)

    if not df_completo.empty and "mes" not in df_completo.columns:
        df_completo["mes"] = df_completo["data"].dt.to_period("M").astype(str)

    # Sidebar: formulário + filtros
    filtros = render_sidebar(df_completo)

    # Aplica filtros
    df = aplicar_filtros(df_completo, filtros)

    # ── Header ──────────────────────────────────────────
    periodo = (
        f"{filtros['data_ini'].strftime('%d/%m/%Y')} → {filtros['data_fim'].strftime('%d/%m/%Y')}"
    )
    st.markdown(
        f"""
        <div style="padding: 28px 0 8px;">
            <h1 style="margin:0;font-size:32px;font-weight:700;
                       letter-spacing:-0.03em;color:#F1F5F9;">
                Gastos Pessoais
            </h1>
            <p style="margin:4px 0 0;font-size:14px;color:#475569;">
                Período: <span style="color:#6366F1;font-weight:500;">{periodo}</span>
                &nbsp;·&nbsp;
                <span style="color:#64748B;">{len(df)} transações</span>
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

    st.markdown("<hr style='margin:12px 0 24px;'>", unsafe_allow_html=True)

    # ── Métricas ─────────────────────────────────────────
    render_metricas(df)

    # ── Gráficos e tabela ────────────────────────────────
    render_visao_geral(df)
    render_analise_categoria(df)
    render_evolucao_mensal(df)
    render_tabela(df)

    # ── Footer ───────────────────────────────────────────
    st.markdown(
        """
        <div style="margin-top:48px;padding:20px 0;text-align:center;
                    border-top:1px solid rgba(255,255,255,0.05);">
            <p style="font-size:12px;color:#334155;margin:0;">
                Finance Dashboard · Feito com Streamlit, pandas e Plotly
            </p>
        </div>
        """,
        unsafe_allow_html=True,
    )


if __name__ == "__main__":
    main()