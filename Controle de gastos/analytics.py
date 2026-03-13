import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

# ─── Paleta de cores do design system ──────────────────────────────────────────
PALETTE = {
    "Alimentação":  "#F97316",
    "Transporte":   "#3B82F6",
    "Moradia":      "#8B5CF6",
    "Saúde":        "#10B981",
    "Educação":     "#F59E0B",
    "Lazer":        "#EC4899",
    "Vestuário":    "#14B8A6",
    "Tecnologia":   "#6366F1",
    "Outros":       "#94A3B8",
}

CORES_LISTA = list(PALETTE.values())

LAYOUT_BASE = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="'DM Sans', sans-serif", color="#E2E8F0"),
    margin=dict(l=16, r=16, t=40, b=16),
)

LEGEND_BASE = dict(
    bgcolor="rgba(15,23,42,0.6)",
    bordercolor="rgba(255,255,255,0.08)",
    borderwidth=1,
    font=dict(size=12),
)


# ─── Métricas resumidas ─────────────────────────────────────────────────────────

def calcular_metricas(df: pd.DataFrame) -> dict:
    if df.empty:
        return {
            "total": 0.0,
            "media": 0.0,
            "transacoes": 0,
            "maior_gasto": 0.0,
            "maior_categoria": "—",
            "ticket_max": 0.0,
            "ticket_max_desc": "—",
        }

    total = df["valor"].sum()
    media = df["valor"].mean()
    transacoes = len(df)
    maior_gasto = df["valor"].max()
    maior_categoria = df.groupby("categoria")["valor"].sum().idxmax()

    idx_max = df["valor"].idxmax()
    ticket_max_desc = df.loc[idx_max, "descricao"] if "descricao" in df.columns else "—"

    return {
        "total": round(total, 2),
        "media": round(media, 2),
        "transacoes": transacoes,
        "maior_gasto": round(maior_gasto, 2),
        "maior_categoria": maior_categoria,
        "ticket_max": round(maior_gasto, 2),
        "ticket_max_desc": ticket_max_desc or "—",
    }


def gastos_por_categoria(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame(columns=["categoria", "total", "percentual"])

    grp = (
        df.groupby("categoria")["valor"]
        .sum()
        .reset_index()
        .rename(columns={"valor": "total"})
        .sort_values("total", ascending=False)
    )
    grp["percentual"] = (grp["total"] / grp["total"].sum() * 100).round(1)
    return grp


def gastos_por_mes(df: pd.DataFrame) -> pd.DataFrame:
    if df.empty:
        return pd.DataFrame(columns=["mes", "mes_nome", "total"])

    grp = (
        df.groupby(["mes", "mes_nome"])["valor"]
        .sum()
        .reset_index()
        .rename(columns={"valor": "total"})
        .sort_values("mes")
    )
    return grp


# ─── Gráficos ───────────────────────────────────────────────────────────────────

def grafico_pizza(df: pd.DataFrame) -> go.Figure:
    cat_df = gastos_por_categoria(df)

    if cat_df.empty:
        return _grafico_vazio("Sem dados para exibir")

    cores = [PALETTE.get(c, "#94A3B8") for c in cat_df["categoria"]]

    fig = go.Figure(
        go.Pie(
            labels=cat_df["categoria"],
            values=cat_df["total"],
            hole=0.52,
            marker=dict(colors=cores, line=dict(color="#0F172A", width=2)),
            textinfo="label+percent",
            textfont=dict(size=12),
            hovertemplate="<b>%{label}</b><br>R$ %{value:,.2f}<br>%{percent}<extra></extra>",
        )
    )

    fig.update_layout(
        **LAYOUT_BASE,
        title=dict(text="Distribuição por Categoria", x=0.5, font=dict(size=15)),
        showlegend=False,
        annotations=[
            dict(
                text=f"R$ {cat_df['total'].sum():,.0f}",
                x=0.5, y=0.5,
                font=dict(size=18, color="#F1F5F9"),
                showarrow=False,
            )
        ],
    )
    return fig


def grafico_barras_categoria(df: pd.DataFrame) -> go.Figure:
    cat_df = gastos_por_categoria(df)

    if cat_df.empty:
        return _grafico_vazio("Sem dados para exibir")

    cores = [PALETTE.get(c, "#94A3B8") for c in cat_df["categoria"]]

    fig = go.Figure(
        go.Bar(
            x=cat_df["total"],
            y=cat_df["categoria"],
            orientation="h",
            marker=dict(color=cores, line=dict(width=0)),
            text=[f"R$ {v:,.2f}" for v in cat_df["total"]],
            textposition="outside",
            textfont=dict(size=11, color="#94A3B8"),
            hovertemplate="<b>%{y}</b><br>R$ %{x:,.2f}<extra></extra>",
        )
    )

    fig.update_layout(
        **LAYOUT_BASE,
        title=dict(text="Gastos por Categoria", x=0.5, font=dict(size=15)),
        xaxis=dict(
            showgrid=True,
            gridcolor="rgba(255,255,255,0.06)",
            tickprefix="R$ ",
            zeroline=False,
        ),
        yaxis=dict(showgrid=False, autorange="reversed"),
        bargap=0.35,
    )
    return fig


def grafico_linha_evolucao(df: pd.DataFrame) -> go.Figure:
    if df.empty:
        return _grafico_vazio("Sem dados para exibir")

    diario = (
        df.groupby(df["data"].dt.date)["valor"]
        .sum()
        .reset_index()
        .rename(columns={"data": "dia", "valor": "total"})
        .sort_values("dia")
    )
    diario["acumulado"] = diario["total"].cumsum()

    fig = go.Figure()

    # Área preenchida
    fig.add_trace(
        go.Scatter(
            x=diario["dia"],
            y=diario["acumulado"],
            mode="lines",
            fill="tozeroy",
            fillcolor="rgba(99,102,241,0.15)",
            line=dict(color="#6366F1", width=2.5),
            name="Acumulado",
            hovertemplate="<b>%{x}</b><br>Acumulado: R$ %{y:,.2f}<extra></extra>",
        )
    )

    # Gasto diário como barras finas
    fig.add_trace(
        go.Bar(
            x=diario["dia"],
            y=diario["total"],
            marker=dict(color="rgba(99,102,241,0.45)", line=dict(width=0)),
            name="Diário",
            yaxis="y2",
            hovertemplate="<b>%{x}</b><br>Diário: R$ %{y:,.2f}<extra></extra>",
        )
    )

    fig.update_layout(
        **LAYOUT_BASE,
        title=dict(text="Evolução dos Gastos no Tempo", x=0.5, font=dict(size=15)),
        xaxis=dict(showgrid=False, zeroline=False),
        yaxis=dict(
            showgrid=True,
            gridcolor="rgba(255,255,255,0.06)",
            tickprefix="R$ ",
            title="Acumulado",
            zeroline=False,
        ),
        yaxis2=dict(
            overlaying="y",
            side="right",
            showgrid=False,
            title="Gasto diário",
            tickprefix="R$ ",
            zeroline=False,
        ),
        legend=dict(**LEGEND_BASE, orientation="h", y=-0.15, x=0.5, xanchor="center"),
        hovermode="x unified",
    )
    return fig


def grafico_barras_mensais(df: pd.DataFrame) -> go.Figure:
    if df.empty:
        return _grafico_vazio("Sem dados para exibir")

    # Top 5 categorias por volume total
    top_cats = (
        df.groupby("categoria")["valor"].sum()
        .nlargest(5)
        .index.tolist()
    )

    df_top = df[df["categoria"].isin(top_cats)].copy()

    grp = (
        df_top.groupby(["mes_nome", "mes", "categoria"])["valor"]
        .sum()
        .reset_index()
        .rename(columns={"valor": "total"})
        .sort_values("mes")
    )

    fig = px.bar(
        grp,
        x="mes_nome",
        y="total",
        color="categoria",
        color_discrete_map=PALETTE,
        barmode="group",
        text_auto=False,
        hover_data={"mes": False, "total": ":.2f"},
        labels={"mes_nome": "Mês", "total": "Valor (R$)", "categoria": "Categoria"},
    )

    fig.update_traces(
        marker_line_width=0,
        hovertemplate="<b>%{x}</b><br>%{fullData.name}: R$ %{y:,.2f}<extra></extra>",
    )

    fig.update_layout(
        **LAYOUT_BASE,
        title=dict(text="Gastos Mensais por Categoria (Top 5)", x=0.5, font=dict(size=15)),
        xaxis=dict(showgrid=False, title=""),
        yaxis=dict(
            showgrid=True,
            gridcolor="rgba(255,255,255,0.06)",
            tickprefix="R$ ",
            title="",
            zeroline=False,
        ),
        bargap=0.2,
        bargroupgap=0.05,
        legend=dict(**LEGEND_BASE, orientation="h", y=-0.18, x=0.5, xanchor="center"),
    )
    return fig


def grafico_heatmap_semanal(df: pd.DataFrame) -> go.Figure:
    if df.empty or len(df) < 3:
        return _grafico_vazio("Dados insuficientes para o heatmap")

    ordem = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    nomes_pt = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"]

    df_h = df.copy()
    df_h["dia_semana_en"] = df_h["data"].dt.day_name()
    df_h = df_h[df_h["dia_semana_en"].isin(ordem)]

    pivot = (
        df_h.groupby(["mes_nome", "dia_semana_en"])["valor"]
        .sum()
        .unstack(fill_value=0)
        .reindex(columns=ordem, fill_value=0)
    )
    pivot.columns = nomes_pt[: len(pivot.columns)]

    fig = go.Figure(
        go.Heatmap(
            z=pivot.values,
            x=list(pivot.columns),
            y=list(pivot.index),
            colorscale=[[0, "#0F172A"], [0.5, "#6366F1"], [1.0, "#F97316"]],
            hoverongaps=False,
            hovertemplate="<b>%{y} — %{x}</b><br>R$ %{z:,.2f}<extra></extra>",
            colorbar=dict(tickprefix="R$ ", title=""),
        )
    )

    fig.update_layout(
        **LAYOUT_BASE,
        title=dict(text="Mapa de Calor: Gastos por Dia da Semana", x=0.5, font=dict(size=15)),
        xaxis=dict(side="top"),
    )
    return fig


# ─── Helper ────────────────────────────────────────────────────────────────────

def _grafico_vazio(mensagem: str) -> go.Figure:
    fig = go.Figure()
    fig.add_annotation(
        text=mensagem,
        xref="paper", yref="paper",
        x=0.5, y=0.5,
        showarrow=False,
        font=dict(size=16, color="#475569"),
    )
    fig.update_layout(**LAYOUT_BASE, xaxis_visible=False, yaxis_visible=False)
    return fig