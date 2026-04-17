import sqlite3
from datetime import datetime
from typing import Optional

DB_PATH = "agendamentos.db"


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS agendamentos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            telefone TEXT,
            servico TEXT NOT NULL,
            data TEXT NOT NULL,
            hora TEXT NOT NULL,
            duracao_minutos INTEGER NOT NULL DEFAULT 60,
            google_event_id TEXT,
            google_event_link TEXT,
            criado_em TEXT DEFAULT (datetime('now','localtime'))
        )
    """)
    conn.commit()
    conn.close()


def inserir_agendamento(
    nome: str,
    telefone: Optional[str],
    servico: str,
    data: str,
    hora: str,
    duracao_minutos: int = 60,
    google_event_id: Optional[str] = None,
    google_event_link: Optional[str] = None,
) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        INSERT INTO agendamentos (nome, telefone, servico, data, hora, duracao_minutos, google_event_id, google_event_link)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (nome, telefone, servico, data, hora, duracao_minutos, google_event_id, google_event_link),
    )
    conn.commit()
    agendamento_id = cursor.lastrowid
    conn.close()

    if agendamento_id is None:
        raise ValueError("Erro ao obter o ID do novo agendamento.")

    return agendamento_id


def horario_disponivel(data: str, hora: str, duracao_minutos: int = 60) -> bool:
    conn = get_connection()
    cursor = conn.cursor()

    # Buscar todos agendamentos do mesmo dia
    cursor.execute(
        "SELECT hora, duracao_minutos FROM agendamentos WHERE data = ?", (data,)
    )
    agendamentos_do_dia = cursor.fetchall()
    conn.close()

    # Converter hora do novo agendamento para minutos
    h_novo, m_novo = map(int, hora.split(":"))
    inicio_novo = h_novo * 60 + m_novo
    fim_novo = inicio_novo + duracao_minutos

    for ag in agendamentos_do_dia:
        h_ex, m_ex = map(int, ag["hora"].split(":"))
        inicio_ex = h_ex * 60 + m_ex
        fim_ex = inicio_ex + ag["duracao_minutos"]

        # Verificar sobreposição
        if inicio_novo < fim_ex and fim_novo > inicio_ex:
            return False

    return True


def listar_agendamentos() -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, nome, telefone, servico, data, hora, duracao_minutos, google_event_link, criado_em
        FROM agendamentos
        ORDER BY data ASC, hora ASC
        """
    )
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]


def deletar_agendamento(agendamento_id: int) -> Optional[dict]:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM agendamentos WHERE id = ?", (agendamento_id,))
    row = cursor.fetchone()
    if row:
        ag = dict(row)
        cursor.execute("DELETE FROM agendamentos WHERE id = ?", (agendamento_id,))
        conn.commit()
        conn.close()
        return ag
    conn.close()
    return None
