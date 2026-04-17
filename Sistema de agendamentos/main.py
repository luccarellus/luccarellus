import logging
from typing import Optional
from fastapi import FastAPI, HTTPException, Path # type: ignore # pyre-ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore # pyre-ignore
from fastapi.staticfiles import StaticFiles # type: ignore # pyre-ignore
from fastapi.responses import FileResponse # type: ignore # pyre-ignore
from pydantic import BaseModel, Field # type: ignore # pyre-ignore

import database # type: ignore # pyre-ignore
import google_calendar # type: ignore # pyre-ignore

# ─── Logging ────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ─── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Sistema de Agendamentos",
    description="API para gerenciamento de agendamentos com integração Google Calendar.",
    version="1.0.0",
)

# Permitir requisições do frontend local
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Servir arquivos estáticos do frontend da raiz
app.mount("/static", StaticFiles(directory="."), name="static")

# ─── Startup ─────────────────────────────────────────────────────────────────
@app.on_event("startup")
def startup():
    database.init_db()
    logger.info("Banco de dados inicializado.")
    if google_calendar.google_calendar_disponivel():
        logger.info("Integração Google Calendar: configurada.")
    else:
        logger.warning(
            "Google Calendar NÃO configurado. "
            "Adicione credentials.json para habilitar a integração."
        )


# ─── Schemas ─────────────────────────────────────────────────────────────────

# Serviços disponíveis e suas durações em minutos
SERVICOS: dict[str, int] = {
    "Manicure": 60,
    "Pedicure": 60,
    "Hidratação": 90,
    "Sobrancelha": 30,
    "Maquiagem": 90,
    "Design de Sobrancelha": 60,
    "Depilação": 60,
    "Limpeza de Pele": 60,
}


class AgendarRequest(BaseModel):
    nome: str = Field(..., min_length=2, max_length=100, description="Nome do cliente")
    telefone: Optional[str] = Field(None, max_length=20, description="Telefone (opcional)")
    servico: str = Field(..., description="Nome do serviço")
    data: str = Field(..., pattern=r"^\d{2}/\d{2}/\d{4}$", description="Data no formato DD/MM/AAAA")
    hora: str = Field(..., pattern=r"^\d{2}:\d{2}$", description="Hora no formato HH:MM")


class AgendarResponse(BaseModel):
    id: int
    mensagem: str
    google_event_link: Optional[str] = None
    google_integrado: bool = False


class AgendamentoOut(BaseModel):
    id: int
    nome: str
    telefone: Optional[str]
    servico: str
    data: str
    hora: str
    duracao_minutos: int
    google_event_link: Optional[str]
    criado_em: str


# ─── Rotas ───────────────────────────────────────────────────────────────────

@app.get("/", include_in_schema=False)
def root():
    return FileResponse("index.html")


@app.get("/servicos", summary="Lista os serviços disponíveis")
def listar_servicos():
    return [
        {"nome": nome, "duracao_minutos": duracao}
        for nome, duracao in SERVICOS.items()
    ]


@app.post("/agendar", response_model=AgendarResponse, summary="Cria um novo agendamento")
def agendar(req: AgendarRequest):
    # Validar serviço
    if req.servico not in SERVICOS:
        raise HTTPException(
            status_code=400,
            detail=f"Serviço inválido. Opções: {list(SERVICOS.keys())}",
        )

    duracao = SERVICOS[req.servico]

    # Verificar disponibilidade
    if not database.horario_disponivel(req.data, req.hora, duracao):
        raise HTTPException(
            status_code=409,
            detail="Horário indisponível no momento. Por favor, escolha outro horário para o seu atendimento.",
        )

    # Criar evento no Google Calendar
    event_id, event_link = None, None
    google_integrado = False

    if google_calendar.google_calendar_disponivel():
        event_id, event_link = google_calendar.criar_evento(
            nome=req.nome,
            servico=req.servico,
            data=req.data,
            hora=req.hora,
            duracao_minutos=duracao,
        )
        google_integrado = event_link is not None

    # Salvar no banco
    agendamento_id = database.inserir_agendamento(
        nome=req.nome,
        telefone=req.telefone,
        servico=req.servico,
        data=req.data,
        hora=req.hora,
        duracao_minutos=duracao,
        google_event_id=event_id,
        google_event_link=event_link,
    )

    logger.info(f"Agendamento #{agendamento_id} criado: {req.nome} | {req.servico} | {req.data} {req.hora}")

    response_data = {
        "id": agendamento_id,
        "mensagem": "Seu atendimento foi confirmado com sucesso!",
        "google_event_link": event_link,
        "google_integrado": google_integrado,
    }
    return AgendarResponse(**response_data) # pyre-ignore


@app.get("/agendamentos", summary="Lista todos os agendamentos")
def listar_agendamentos(): # type: ignore
    return database.listar_agendamentos()


@app.delete("/agendamento/{id}", summary="Cancela um agendamento")
def cancelar_agendamento(id: int = Path(..., description="ID do agendamento")):
    agendamento = database.deletar_agendamento(id)

    if not agendamento:
        raise HTTPException(status_code=404, detail="Agendamento não encontrado.")

    # Remover evento do Google Calendar
    if agendamento.get("google_event_id"):
        google_calendar.deletar_evento(agendamento["google_event_id"])

    logger.info(f"Agendamento #{id} cancelado: {agendamento['nome']}")

    return {"mensagem": f"Agendamento de {agendamento['nome']} cancelado com sucesso."}


@app.get("/status", summary="Status da API e integrações")
def status(): # type: ignore
    return {
        "api": "online",
        "banco_de_dados": "SQLite",
        "google_calendar": "configurado" if google_calendar.google_calendar_disponivel() else "não configurado",
        "servicos_disponiveis": len(SERVICOS),
    }
