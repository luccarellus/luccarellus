import os
import pandas as pd
from datetime import datetime

# Caminho padrão do arquivo de dados
CSV_PATH = os.path.join(os.path.dirname(__file__), "gastos.csv")

# Colunas obrigatórias do dataset
COLUNAS = ["id", "data", "valor", "categoria", "descricao"]

# Categorias disponíveis para classificação dos gastos
CATEGORIAS = [
    "Alimentação",
    "Transporte",
    "Moradia",
    "Saúde",
    "Educação",
    "Lazer",
    "Vestuário",
    "Tecnologia",
    "Outros",
]


def inicializar_csv() -> None:
    if not os.path.exists(CSV_PATH):
        df_vazio = pd.DataFrame(columns=COLUNAS)
        df_vazio.to_csv(CSV_PATH, index=False)


def carregar_gastos() -> pd.DataFrame:
    inicializar_csv()

    try:
        df = pd.read_csv(CSV_PATH)

        if df.empty:
            return pd.DataFrame(columns=COLUNAS + ["mes", "mes_nome", "ano", "dia_semana"])

        # Garante tipos corretos nas colunas críticas
        df["data"] = pd.to_datetime(df["data"], errors="coerce")
        df["valor"] = pd.to_numeric(df["valor"], errors="coerce").fillna(0.0)
        df["id"] = pd.to_numeric(df["id"], errors="coerce").fillna(0).astype(int)
        df["categoria"] = df["categoria"].fillna("Outros")
        df["descricao"] = df["descricao"].fillna("")

        # Remove linhas com data inválida
        df = df.dropna(subset=["data"])

        # Derivadas úteis para análise
        df["mes"] = df["data"].dt.to_period("M").astype(str)
        df["mes_nome"] = df["data"].dt.strftime("%b/%Y")
        df["ano"] = df["data"].dt.year
        df["dia_semana"] = df["data"].dt.day_name()

        return df.sort_values("data", ascending=False).reset_index(drop=True)

    except Exception as e:
        raise RuntimeError(f"Erro ao carregar gastos.csv: {e}")


def salvar_gasto(data: str, valor: float, categoria: str, descricao: str) -> bool:
    if valor <= 0:
        raise ValueError("O valor do gasto deve ser maior que zero.")
    if not data:
        raise ValueError("A data é obrigatória.")
    if categoria not in CATEGORIAS:
        raise ValueError(f"Categoria inválida: {categoria}")

    inicializar_csv()

    try:
        df = pd.read_csv(CSV_PATH)

        # Gera ID sequencial
        novo_id = int(df["id"].max()) + 1 if not df.empty and "id" in df.columns else 1

        novo = pd.DataFrame(
            [
                {
                    "id": novo_id,
                    "data": data,
                    "valor": round(float(valor), 2),
                    "categoria": categoria,
                    "descricao": descricao.strip(),
                }
            ]
        )

        df_atualizado = pd.concat([df, novo], ignore_index=True)
        df_atualizado.to_csv(CSV_PATH, index=False)
        return True

    except Exception as e:
        raise RuntimeError(f"Erro ao salvar gasto: {e}")


def excluir_gasto(gasto_id: int) -> bool:
    inicializar_csv()

    try:
        df = pd.read_csv(CSV_PATH)
        df_filtrado = df[df["id"] != gasto_id]

        if len(df_filtrado) == len(df):
            raise ValueError(f"ID {gasto_id} não encontrado.")

        df_filtrado.to_csv(CSV_PATH, index=False)
        return True

    except Exception as e:
        raise RuntimeError(f"Erro ao excluir gasto: {e}")