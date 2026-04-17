
import streamlit as st # type: ignore
import sqlite3
import pickle
import os
import typing
from datetime import date, datetime, timedelta

# ──────────────────────────────────────────────
# CONFIGURAÇÃO DA PÁGINA
# ──────────────────────────────────────────────
st.set_page_config(
    page_title="AgendaFácil",
    page_icon="📅",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ──────────────────────────────────────────────
# CSS PERSONALIZADO — TEMA PROFISSIONAL
# ──────────────────────────────────────────────
st.markdown("""
<style>
/* ── Fontes ── */
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

/* ── Variáveis de cor ── */
:root {
    --primary:      #2563EB;
    --primary-dark: #1D4ED8;
    --primary-light:#EFF6FF;
    --success:      #059669;
    --success-light:#ECFDF5;
    --danger:       #DC2626;
    --danger-light: #FEF2F2;
    --warning:      #D97706;
    --bg:           #F8FAFC;
    --surface:      #FFFFFF;
    --border:       #E2E8F0;
    --text:         #0F172A;
    --text-muted:   #64748B;
    --shadow:       0 1px 3px rgba(0,0,0,.08), 0 1px 2px rgba(0,0,0,.04);
    --shadow-md:    0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06);
    --radius:       12px;
}

/* ── Base ── */
html, body, [class*="css"] {
    font-family: 'DM Sans', sans-serif !important;
    color: var(--text) !important;
}
.main { background: var(--bg) !important; }
.block-container { padding: 2rem 2.5rem !important; max-width: 900px !important; }

/* ── Sidebar ── */
[data-testid="stSidebar"] {
    background: var(--surface) !important;
    border-right: 1px solid var(--border) !important;
    box-shadow: var(--shadow-md) !important;
}
[data-testid="stSidebar"] .sidebar-content { padding: 1.5rem 1rem !important; }

/* ── Inputs ── */
[data-testid="stTextInput"] input,
[data-testid="stSelectbox"] select,
[data-baseweb="select"] {
    border-radius: 8px !important;
    border: 1px solid var(--border) !important;
    font-family: 'DM Sans', sans-serif !important;
    font-size: 0.95rem !important;
    transition: border-color .15s !important;
}
[data-testid="stTextInput"] input:focus {
    border-color: var(--primary) !important;
    box-shadow: 0 0 0 3px rgba(37,99,235,.1) !important;
}

/* ── Botão primário ── */
[data-testid="stButton"] > button[kind="primary"],
[data-testid="stFormSubmitButton"] > button {
    background: var(--primary) !important;
    color: #fff !important;
    border: none !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    font-size: 0.95rem !important;
    padding: .6rem 1.4rem !important;
    transition: background .15s, transform .1s !important;
    font-family: 'DM Sans', sans-serif !important;
}
[data-testid="stButton"] > button[kind="primary"]:hover,
[data-testid="stFormSubmitButton"] > button:hover {
    background: var(--primary-dark) !important;
    transform: translateY(-1px) !important;
}

/* ── Botão secundário (vermelho para cancelar) ── */
[data-testid="stButton"] > button[kind="secondary"] {
    border: 1px solid var(--border) !important;
    border-radius: 8px !important;
    font-weight: 500 !important;
    font-family: 'DM Sans', sans-serif !important;
    transition: all .15s !important;
}

/* ── Cards customizados ── */
.agenda-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.25rem 1.5rem;
    margin-bottom: .75rem;
    box-shadow: var(--shadow);
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: box-shadow .15s;
}
.agenda-card:hover { box-shadow: var(--shadow-md); }
.agenda-card .info { flex: 1; }
.agenda-card .badge {
    background: var(--primary-light);
    color: var(--primary);
    border-radius: 6px;
    padding: .25rem .7rem;
    font-size: .78rem;
    font-weight: 600;
    letter-spacing: .02em;
    white-space: nowrap;
}
.agenda-card .badge.canceled {
    background: var(--danger-light);
    color: var(--danger);
}
.card-name { font-weight: 600; font-size: 1.05rem; margin: 0 0 .2rem; }
.card-service { color: var(--text-muted); font-size: .88rem; margin: 0 0 .2rem; }
.card-datetime { color: var(--primary); font-size: .88rem; font-weight: 500; font-family: 'DM Mono', monospace; }
.card-phone { color: var(--text-muted); font-size: .83rem; }

/* ── Hero header ── */
.hero {
    background: linear-gradient(135deg, var(--primary) 0%, #1E40AF 100%);
    border-radius: var(--radius);
    padding: 2rem 2.5rem;
    color: #fff;
    margin-bottom: 2rem;
    position: relative;
    overflow: hidden;
}
.hero::after {
    content: '';
    position: absolute;
    right: -60px; top: -60px;
    width: 220px; height: 220px;
    border-radius: 50%;
    background: rgba(255,255,255,.06);
}
.hero h1 { font-size: 1.8rem; font-weight: 700; margin: 0 0 .3rem; }
.hero p  { opacity: .85; font-size: 1rem; margin: 0; }

/* ── Stats row ── */
.stat-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.1rem 1.3rem;
    text-align: center;
    box-shadow: var(--shadow);
}
.stat-num  { font-size: 2rem; font-weight: 700; color: var(--primary); line-height: 1; }
.stat-label{ font-size: .8rem; color: var(--text-muted); margin-top: .2rem; font-weight: 500; letter-spacing: .03em; text-transform: uppercase; }

/* ── Section title ── */
.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text);
    margin: 1.5rem 0 1rem;
    padding-bottom: .5rem;
    border-bottom: 2px solid var(--border);
}

/* ── Alert boxes ── */
.alert-success {
    background: var(--success-light);
    border: 1px solid #6EE7B7;
    border-radius: 8px;
    padding: 1rem 1.2rem;
    color: var(--success);
    font-weight: 500;
    margin-bottom: 1rem;
}
.alert-error {
    background: var(--danger-light);
    border: 1px solid #FCA5A5;
    border-radius: 8px;
    padding: 1rem 1.2rem;
    color: var(--danger);
    font-weight: 500;
    margin-bottom: 1rem;
}
.alert-info {
    background: var(--primary-light);
    border: 1px solid #BFDBFE;
    border-radius: 8px;
    padding: 1rem 1.2rem;
    color: var(--primary);
    font-weight: 500;
    margin-bottom: 1rem;
}

/* ── Sidebar nav items ── */
.nav-label {
    font-size: .7rem;
    font-weight: 600;
    letter-spacing: .1em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin: 1.2rem 0 .5rem .2rem;
}

/* ── Divider ── */
hr.custom { border: none; border-top: 1px solid var(--border); margin: 1.5rem 0; }

/* ── Link externo ── */
a.gcal-link {
    display: inline-flex;
    align-items: center;
    gap: .4rem;
    color: var(--primary);
    text-decoration: none;
    font-weight: 500;
    font-size: .9rem;
}
a.gcal-link:hover { text-decoration: underline; }

/* ── Empty state ── */
.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-muted);
}
.empty-state .icon { font-size: 3rem; margin-bottom: .5rem; }
.empty-state p { font-size: 1rem; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--bg); }
::-webkit-scrollbar-thumb { background: var(--border); border-radius: 3px; }
</style>
""", unsafe_allow_html=True)


# ══════════════════════════════════════════════
# CONFIGURAÇÕES DO NEGÓCIO  (edite aqui!)
# ══════════════════════════════════════════════
NOME_NEGOCIO = "AgendaFácil"
DB_PATH      = "database.db"
TIMEZONE     = "America/Sao_Paulo"

# Serviços disponíveis: nome → duração em minutos
SERVICOS: dict[str, int] = {
    "✂️  Corte de cabelo":       30,
    "💈 Barba":                  20,
    "✂️💈 Corte + Barba":        50,
    "💆 Hidratação":             45,
    "🎨 Coloração":              90,
    "🩺 Consulta":               60,
    "🔧 Manutenção":             60,
    "🧹 Limpeza":                45,
    "📦 Outro serviço":          30,
}

# Horários disponíveis (formato HH:MM)
HORARIOS_DISPONIVEIS = [
    "08:00","08:30","09:00","09:30","10:00","10:30",
    "11:00","11:30","13:00","13:30","14:00","14:30",
    "15:00","15:30","16:00","16:30","17:00","17:30","18:00",
]


# ══════════════════════════════════════════════
# BANCO DE DADOS — SQLITE
# ══════════════════════════════════════════════
def get_conn():
    return sqlite3.connect(DB_PATH, check_same_thread=False)


def criar_tabelas():
    with get_conn() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS agendamentos (
                id            INTEGER PRIMARY KEY AUTOINCREMENT,
                nome          TEXT    NOT NULL,
                telefone      TEXT,
                email         TEXT,
                servico       TEXT    NOT NULL,
                duracao_min   INTEGER NOT NULL,
                data          TEXT    NOT NULL,   -- DD-MM-YYYY
                horario       TEXT    NOT NULL,   -- HH:MM
                horario_fim   TEXT    NOT NULL,   -- HH:MM
                status        TEXT    DEFAULT 'ativo',
                gcal_link     TEXT,
                gcal_event_id TEXT,
                criado_em     TEXT    DEFAULT (datetime('now','localtime'))
            );

            CREATE TABLE IF NOT EXISTS config (
                chave TEXT PRIMARY KEY,
                valor TEXT
            );
        """)


def salvar_agendamento(nome: str, telefone: str, email: str,
                       servico: str, duracao: int,
                       data: str, horario: str,
                       gcal_link: str = "", gcal_event_id: str = "") -> int:

    inicio  = datetime.strptime(f"{data} {horario}", "%Y-%m-%d %H:%M")
    fim     = inicio + timedelta(minutes=duracao)
    h_fim   = fim.strftime("%H:%M")

    with get_conn() as conn:
        cur = conn.execute(
            """INSERT INTO agendamentos
               (nome, telefone, email, servico, duracao_min,
                data, horario, horario_fim, gcal_link, gcal_event_id)
               VALUES (?,?,?,?,?,?,?,?,?,?)""",
            (nome, telefone, email, servico, duracao,
             data, horario, h_fim, gcal_link, gcal_event_id)
        )
        return cur.lastrowid or 0


def verificar_conflito(data: str, horario: str, duracao: int,
                       excluir_id: int | None = None) -> bool:
    inicio_novo = datetime.strptime(f"{data} {horario}", "%Y-%m-%d %H:%M")
    fim_novo    = inicio_novo + timedelta(minutes=duracao)

    with get_conn() as conn:
        query = """
            SELECT horario, horario_fim FROM agendamentos
            WHERE data = ? AND status = 'ativo'
        """
        params: list[typing.Any] = [data]
        if excluir_id:
            query  += " AND id != ?"
            params.append(excluir_id)

        for row in conn.execute(query, params):
            h_ini = datetime.strptime(f"{data} {row[0]}", "%Y-%m-%d %H:%M")
            h_fim = datetime.strptime(f"{data} {row[1]}", "%Y-%m-%d %H:%M")
            # Verifica sobreposição de intervalos
            if inicio_novo < h_fim and fim_novo > h_ini:
                return True
    return False


def listar_agendamentos(apenas_ativos: bool = False,
                        data_filtro: str | None = None) -> list[typing.Dict[str, typing.Any]]:
    with get_conn() as conn:
        conn.row_factory = sqlite3.Row
        query = "SELECT * FROM agendamentos"
        conds, params = [], []

        if apenas_ativos:
            conds.append("status = 'ativo'")
        if data_filtro:
            conds.append("data = ?")
            params.append(data_filtro)

        if conds:
            query += " WHERE " + " AND ".join(conds)
        query += " ORDER BY data ASC, horario ASC"

        return [dict(r) for r in conn.execute(query, params)]


def cancelar_agendamento(agendamento_id: int) -> bool:
    with get_conn() as conn:
        conn.execute(
            "UPDATE agendamentos SET status='cancelado' WHERE id=?",
            (agendamento_id,)
        )
        return True


def contar_stats() -> dict:
    hoje = date.today().isoformat()
    with get_conn() as conn:
        total    = conn.execute("SELECT COUNT(*) FROM agendamentos WHERE status='ativo'").fetchone()[0]
        hoje_n   = conn.execute("SELECT COUNT(*) FROM agendamentos WHERE data=? AND status='ativo'", (hoje,)).fetchone()[0]
        semana_n = conn.execute(
            "SELECT COUNT(*) FROM agendamentos WHERE data BETWEEN ? AND ? AND status='ativo'",
            (hoje, (date.today() + timedelta(days=7)).isoformat())
        ).fetchone()[0]
    return {"total": total, "hoje": hoje_n, "semana": semana_n}


def horarios_livres(data: str, duracao: int) -> list[str]:
    livres = []
    for h in HORARIOS_DISPONIVEIS:
        if not verificar_conflito(data, h, duracao):
            livres.append(h)
    return livres


# ══════════════════════════════════════════════
# GOOGLE CALENDAR — INTEGRAÇÃO
# ══════════════════════════════════════════════
SCOPES        = ["https://www.googleapis.com/auth/calendar"]
CRED_FILE     = "credentials.json"
TOKEN_FILE    = "token.pickle"


def _google_service():
    try:
        from google_auth_oauthlib.flow import InstalledAppFlow # type: ignore
        from googleapiclient.discovery import build # type: ignore
    except ImportError:
        return None, "⚠️ Bibliotecas Google não instaladas. Execute: pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib"

    if not os.path.exists(CRED_FILE):
        return None, f"⚠️ Arquivo **{CRED_FILE}** não encontrado. Siga o README para configurar o Google Calendar."

    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as f:
            creds = pickle.load(f)

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            from google.auth.transport.requests import Request as GRequest # type: ignore
            creds.refresh(GRequest())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CRED_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "wb") as f:
            pickle.dump(creds, f)

    service = build("calendar", "v3", credentials=creds)
    return service, None


def criar_evento_google(nome: str, email: str, servico: str,
                        data: str, horario: str, duracao: int) -> tuple[str, str, str]:
    service, erro = _google_service()
    if erro or not service:
        return "", "", erro or "Service indisponível"
    assert service is not None

    try:
        inicio_dt = datetime.strptime(f"{data} {horario}", "%Y-%m-%d %H:%M")
        fim_dt    = inicio_dt + timedelta(minutes=duracao)

        evento: typing.Dict[str, typing.Any] = {
            "summary": f"📅 {servico} — {nome}",
            "description": (
                f"Agendamento criado pelo AgendaFácil\n\n"
                f"Cliente: {nome}\n"
                f"Serviço: {servico}\n"
                f"Duração: {duracao} minutos"
            ),
            "start": {
                "dateTime": inicio_dt.isoformat(),
                "timeZone": TIMEZONE,
            },
            "end": {
                "dateTime": fim_dt.isoformat(),
                "timeZone": TIMEZONE,
            },
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 60},
                    {"method": "popup", "minutes": 15},
                ],
            },
        }

        # Adiciona e-mail do cliente como convidado (opcional)
        if email and "@" in email:
            evento["attendees"] = [{"email": email}]

        resultado  = service.events().insert(calendarId="primary", body=evento).execute()
        link       = resultado.get("htmlLink", "")
        event_id   = resultado.get("id", "")
        return link, event_id, ""

    except Exception as ex:
        return "", "", f"Erro ao criar evento: {ex}"


def cancelar_evento_google(event_id: str) -> bool:
    service, erro = _google_service()
    if erro or not service or not event_id:
        return False
    assert service is not None
    try:
        service.events().delete(calendarId="primary", eventId=event_id).execute()
        return True
    except Exception:
        return False


# ══════════════════════════════════════════════
# INICIALIZAÇÃO
# ══════════════════════════════════════════════
criar_tabelas()


# ══════════════════════════════════════════════
# SIDEBAR — NAVEGAÇÃO
# ══════════════════════════════════════════════
with st.sidebar:
    st.markdown(f"""
    <div style="text-align:center;padding:1rem 0 .5rem">
        <div style="font-size:2.5rem">📅</div>
        <div style="font-size:1.2rem;font-weight:700;color:#0F172A">{NOME_NEGOCIO}</div>
        <div style="font-size:.78rem;color:#64748B;margin-top:.15rem">Sistema de Agendamentos</div>
    </div>
    <hr style="border:none;border-top:1px solid #E2E8F0;margin:.8rem 0"/>
    """, unsafe_allow_html=True)

    st.markdown('<div class="nav-label">Navegação</div>', unsafe_allow_html=True)

    pagina = st.radio(
        label="",
        options=["🗓️  Agendar", "📋  Ver Agenda", "📊  Dashboard"],
        label_visibility="collapsed"
    )

    st.markdown("<hr style='border:none;border-top:1px solid #E2E8F0;margin:1rem 0'/>", unsafe_allow_html=True)

    # Status Google Calendar
    gcal_ok = os.path.exists(CRED_FILE)
    status_cor  = "#059669" if gcal_ok else "#D97706"
    status_ico  = "🟢" if gcal_ok else "🟡"
    status_txt  = "Conectado" if gcal_ok else "Sem credencial"
    st.markdown(f"""
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;padding:.8rem 1rem;font-size:.82rem">
        <div style="font-weight:600;color:#64748B;margin-bottom:.4rem;font-size:.7rem;text-transform:uppercase;letter-spacing:.05em">Google Calendar</div>
        <div style="color:{status_cor};font-weight:500">{status_ico} {status_txt}</div>
        {"<div style='color:#94A3B8;font-size:.75rem;margin-top:.2rem'>Adicione credentials.json para ativar</div>" if not gcal_ok else ""}
    </div>
    """, unsafe_allow_html=True)


# ══════════════════════════════════════════════
# PÁGINA: AGENDAR
# ══════════════════════════════════════════════
if pagina == "🗓️  Agendar":

    st.markdown("""
    <div class="hero">
        <h1>🗓️ Novo Agendamento</h1>
        <p>Preencha os dados abaixo para marcar seu horário</p>
    </div>
    """, unsafe_allow_html=True)

    with st.form("form_agendamento", clear_on_submit=True):
        st.markdown('<div class="section-title">👤 Dados do Cliente</div>', unsafe_allow_html=True)

        col1, col2 = st.columns(2)
        with col1:
            nome = st.text_input("Nome completo *", placeholder="Ex: João Silva")
        with col2:
            telefone = st.text_input("Telefone", placeholder="Ex: (99) 99999-9999")

        email = st.text_input("E-mail (para convite no Google Calendar)", placeholder="cliente@email.com")

        st.markdown('<div class="section-title">🛠️ Serviço</div>', unsafe_allow_html=True)

        servico_nome = st.selectbox("Serviço *", list(SERVICOS.keys()))
        duracao      = SERVICOS[servico_nome]

        st.markdown(
            f'<div class="alert-info" style="margin-top:-.5rem">⏱️ Duração estimada: <strong>{duracao} minutos</strong></div>',
            unsafe_allow_html=True
        )

        st.markdown('<div class="section-title">📅 Data e Horário</div>', unsafe_allow_html=True)

        col3, col4 = st.columns(2)
        with col3:
            data_sel = st.date_input(
                "Data *",
                min_value=date.today(),
                value=date.today()
            )
        with col4:
            data_str    = data_sel.isoformat()
            livres      = horarios_livres(data_str, duracao)
            if livres:
                horario = st.selectbox("Horário *", livres)
            else:
                st.warning("😕 Nenhum horário disponível nesta data para o serviço selecionado.")
                horario = None

        st.markdown("<br/>", unsafe_allow_html=True)
        submitted = st.form_submit_button("✅ Confirmar Agendamento", type="primary", use_container_width=True)

    if submitted:
        # Validações
        erros = []
        if not nome.strip():
            erros.append("Nome do cliente é obrigatório.")
        if not horario:
            erros.append("Selecione um horário disponível.")

        if erros:
            for e in erros:
                st.markdown(f'<div class="alert-error">❌ {e}</div>', unsafe_allow_html=True)
        else:
            if horario is not None:
                # Verifica conflito de última hora (race condition)
                if verificar_conflito(data_str, horario, duracao):
                    st.markdown(
                        '<div class="alert-error">❌ Horário indisponível! Alguém acabou de ocupar este horário. Por favor, escolha outro.</div>',
                        unsafe_allow_html=True
                    )
                else:
                    # Tenta criar evento no Google Calendar
                    gcal_link    = ""
                    gcal_event_id= ""
                    gcal_msg     = ""

                    if os.path.exists(CRED_FILE):
                        resultado_gcal = criar_evento_google(
                            nome, email, servico_nome, data_str, horario, duracao
                        )
                        gcal_link, gcal_event_id, gcal_erro = resultado_gcal
                        if gcal_erro:
                            gcal_msg = gcal_erro

                    # Salva no banco
                    novo_id = salvar_agendamento(
                        nome.strip(), telefone.strip(), email.strip(),
                        servico_nome, duracao,
                        data_str, horario,
                        gcal_link, gcal_event_id
                    )

                    # Calcula horário de fim
                    fim = (datetime.strptime(f"{data_str} {horario}", "%Y-%m-%d %H:%M")
                           + timedelta(minutes=duracao)).strftime("%H:%M")

                    st.markdown(f"""
                    <div class="alert-success">
                        ✅ <strong>Agendamento #{novo_id} confirmado!</strong><br/>
                        <span style="font-weight:400">
                            👤 {nome} &nbsp;|&nbsp;
                            🛠️ {servico_nome} &nbsp;|&nbsp;
                            📅 {data_sel.strftime("%d/%m/%Y")} &nbsp;|&nbsp;
                            ⏰ {horario} – {fim}
                        </span>
                    </div>
                    """, unsafe_allow_html=True)

                    if gcal_link:
                        st.markdown(
                            f'<a class="gcal-link" href="{gcal_link}" target="_blank">🗓️ Abrir evento no Google Calendar →</a>',
                            unsafe_allow_html=True
                        )
                    elif gcal_msg:
                        st.markdown(f'<div class="alert-info">ℹ️ Google Calendar: {gcal_msg}</div>', unsafe_allow_html=True)


# ══════════════════════════════════════════════
# PÁGINA: VER AGENDA
# ══════════════════════════════════════════════
elif pagina == "📋  Ver Agenda":

    st.markdown("""
    <div class="hero">
        <h1>📋 Agenda de Horários</h1>
        <p>Visualize, filtre e gerencie todos os agendamentos</p>
    </div>
    """, unsafe_allow_html=True)

    # Filtros
    col_f1, col_f2, col_f3 = st.columns([2, 2, 1])
    with col_f1:
        filtro_data = st.date_input("📅 Filtrar por data", value=None, key="filtro_data")
    with col_f2:
        filtro_status = st.selectbox("Status", ["Todos", "Apenas ativos", "Apenas cancelados"])
    with col_f3:
        st.markdown("<br/>", unsafe_allow_html=True)
        limpar = st.button("🔄 Limpar filtros", use_container_width=True)

    if limpar:
        st.rerun()

    # Busca
    data_filtro_str = filtro_data.isoformat() if filtro_data else None
    agendamentos    = listar_agendamentos(data_filtro=data_filtro_str)

    if filtro_status == "Apenas ativos":
        agendamentos = [a for a in agendamentos if a["status"] == "ativo"]
    elif filtro_status == "Apenas cancelados":
        agendamentos = [a for a in agendamentos if a["status"] == "cancelado"]

    st.markdown(f"<div style='color:#64748B;font-size:.85rem;margin-bottom:1rem'>📌 {len(agendamentos)} agendamento(s) encontrado(s)</div>", unsafe_allow_html=True)

    if not agendamentos:
        st.markdown("""
        <div class="empty-state">
            <div class="icon">🗓️</div>
            <p>Nenhum agendamento encontrado.</p>
        </div>
        """, unsafe_allow_html=True)
    else:
        for ag in agendamentos:
            is_canceled  = ag["status"] == "cancelado"
            badge_class  = "badge canceled" if is_canceled else "badge"
            badge_text   = "Cancelado" if is_canceled else "Ativo"
            data_fmt     = datetime.strptime(ag["data"], "%Y-%m-%d").strftime("%d/%m/%Y")
            telefone_txt = f"📞 {ag['telefone']}" if ag.get("telefone") else ""
            email_txt    = f"&nbsp;·&nbsp;✉️ {ag['email']}" if ag.get("email") else ""
            gcal_btn     = (
                f'<a class="gcal-link" href="{ag["gcal_link"]}" target="_blank" style="font-size:.8rem">📅 Ver no Google Calendar</a>'
                if ag.get("gcal_link") else ""
            )

            st.markdown(f"""
            <div class="agenda-card">
                <div class="info">
                    <p class="card-name">#{ag['id']} &nbsp; {ag['nome']}</p>
                    <p class="card-service">{ag['servico']} &nbsp;·&nbsp; {ag['duracao_min']} min</p>
                    <p class="card-datetime">📅 {data_fmt} &nbsp; ⏰ {ag['horario']} – {ag['horario_fim']}</p>
                    <p class="card-phone">{telefone_txt}{email_txt}</p>
                    {gcal_btn}
                </div>
                <div><span class="{badge_class}">{badge_text}</span></div>
            </div>
            """, unsafe_allow_html=True)

            # Botão de cancelar (apenas para ativos)
            if not is_canceled:
                col_btn, _ = st.columns([1, 4])
                with col_btn:
                    if st.button(f"🚫 Cancelar #{ag['id']}", key=f"cancel_{ag['id']}", use_container_width=True):
                        cancelar_agendamento(ag["id"])
                        # Tenta remover do Google Calendar também
                        if ag.get("gcal_event_id"):
                            cancelar_evento_google(ag["gcal_event_id"])
                        st.success(f"Agendamento #{ag['id']} cancelado.")
                        st.rerun()


# ══════════════════════════════════════════════
# PÁGINA: DASHBOARD
# ══════════════════════════════════════════════
elif pagina == "📊  Dashboard":

    st.markdown("""
    <div class="hero">
        <h1>📊 Dashboard</h1>
        <p>Visão geral da agenda e estatísticas</p>
    </div>
    """, unsafe_allow_html=True)

    stats = contar_stats()

    c1, c2, c3 = st.columns(3)
    with c1:
        st.markdown(f"""
        <div class="stat-box">
            <div class="stat-num">{stats['hoje']}</div>
            <div class="stat-label">Hoje</div>
        </div>
        """, unsafe_allow_html=True)
    with c2:
        st.markdown(f"""
        <div class="stat-box">
            <div class="stat-num">{stats['semana']}</div>
            <div class="stat-label">Próximos 7 dias</div>
        </div>
        """, unsafe_allow_html=True)
    with c3:
        st.markdown(f"""
        <div class="stat-box">
            <div class="stat-num">{stats['total']}</div>
            <div class="stat-label">Total ativos</div>
        </div>
        """, unsafe_allow_html=True)

    st.markdown('<div class="section-title">📅 Próximos Agendamentos</div>', unsafe_allow_html=True)

    hoje_str    = date.today().isoformat()
    proximos = [
        a for a in listar_agendamentos(apenas_ativos=True)
        if a["data"] >= hoje_str
    ]
    proximos = proximos[:10] # type: ignore

    if not proximos:
        st.markdown("""
        <div class="empty-state">
            <div class="icon">✨</div>
            <p>Nenhum agendamento futuro no momento.</p>
        </div>
        """, unsafe_allow_html=True)
    else:
        for ag in proximos:
            data_fmt = datetime.strptime(ag["data"], "%Y-%m-%d").strftime("%d/%m/%Y")
            st.markdown(f"""
            <div class="agenda-card">
                <div class="info">
                    <p class="card-name">{ag['nome']}</p>
                    <p class="card-service">{ag['servico']}</p>
                    <p class="card-datetime">📅 {data_fmt} &nbsp; ⏰ {ag['horario']} – {ag['horario_fim']}</p>
                </div>
                <div><span class="badge">Ativo</span></div>
            </div>
            """, unsafe_allow_html=True)

    st.markdown('<div class="section-title">🛠️ Serviços Disponíveis</div>', unsafe_allow_html=True)

    col_s1, col_s2 = st.columns(2)
    items = list(SERVICOS.items())
    for i, (nome_srv, dur) in enumerate(items):
        col = col_s1 if i % 2 == 0 else col_s2
        with col:
            st.markdown(f"""
            <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:8px;
                        padding:.7rem 1rem;margin-bottom:.5rem;display:flex;
                        justify-content:space-between;align-items:center">
                <span style="font-size:.9rem">{nome_srv}</span>
                <span style="background:#EFF6FF;color:#2563EB;border-radius:5px;
                             padding:.15rem .6rem;font-size:.78rem;font-weight:600;
                             font-family:'DM Mono',monospace">{dur} min</span>
            </div>
            """, unsafe_allow_html=True)

    st.markdown("""
    <hr class="custom"/>
    <div style="text-align:center;color:#94A3B8;font-size:.8rem;padding:.5rem 0">
        AgendaFácil &nbsp;·&nbsp; Python + Streamlit + SQLite &nbsp;·&nbsp; 
        <a href="https://github.com" target="_blank" style="color:#94A3B8">Código aberto</a>
    </div>
    """, unsafe_allow_html=True)
