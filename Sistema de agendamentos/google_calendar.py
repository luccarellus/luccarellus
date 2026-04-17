import os
import pickle
import logging
from datetime import datetime, timedelta
from typing import Optional, Tuple

logger = logging.getLogger(__name__)

SCOPES = ["https://www.googleapis.com/auth/calendar"]
CREDENTIALS_FILE = "credentials.json"
TOKEN_FILE = "token.pickle"
TIMEZONE = "America/Sao_Paulo"


def _get_credentials():
    creds = None

    # Carrega token salvo, se existir
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE, "rb") as token:
            creds = pickle.load(token)

    # Se não há credenciais válidas, faz o fluxo OAuth
    if not creds or not creds.valid:
        try:
            from google.auth.transport.requests import Request # type: ignore
            from google.oauth2.credentials import Credentials # type: ignore
            from google_auth_oauthlib.flow import InstalledAppFlow # type: ignore

            if creds and creds.expired and creds.refresh_token:
                creds.refresh(Request())
            else:
                if not os.path.exists(CREDENTIALS_FILE):
                    raise FileNotFoundError(
                        f"Arquivo '{CREDENTIALS_FILE}' não encontrado. "
                        "Consulte as instruções em google_calendar.py para configurar a API."
                    )
                flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
                creds = flow.run_local_server(port=0)

            # Salva o token para próximas execuções
            with open(TOKEN_FILE, "wb") as token:
                pickle.dump(creds, token)

        except ImportError:
            raise ImportError(
                "Bibliotecas do Google não instaladas. Execute:\n"
                "pip install google-auth google-auth-oauthlib google-api-python-client"
            )

    return creds


def get_calendar_service():
    from googleapiclient.discovery import build # type: ignore
    creds = _get_credentials()
    return build("calendar", "v3", credentials=creds)


def criar_evento(
    nome: str,
    servico: str,
    data: str,
    hora: str,
    duracao_minutos: int = 60,
    descricao: Optional[str] = None,
) -> Tuple[Optional[str], Optional[str]]:
    try:
        service = get_calendar_service()

        # Monta datetime de início e fim
        inicio_str = f"{data}T{hora}:00"
        inicio_dt = datetime.strptime(inicio_str, "%Y-%m-%dT%H:%M:%S")
        fim_dt = inicio_dt + timedelta(minutes=duracao_minutos)

        event_body = {
            "summary": f"{servico} - {nome}",
            "description": descricao or f"Agendamento: {servico}\nCliente: {nome}",
            "start": {
                "dateTime": inicio_dt.strftime("%Y-%m-%dT%H:%M:%S"),
                "timeZone": TIMEZONE,
            },
            "end": {
                "dateTime": fim_dt.strftime("%Y-%m-%dT%H:%M:%S"),
                "timeZone": TIMEZONE,
            },
            "reminders": {
                "useDefault": False,
                "overrides": [
                    {"method": "email", "minutes": 24 * 60},
                    {"method": "popup", "minutes": 30},
                ],
            },
        }

        event = service.events().insert(calendarId="primary", body=event_body).execute()
        event_id = event.get("id")
        event_link = event.get("htmlLink")

        logger.info(f"Evento criado no Google Calendar: {event_link}")
        return event_id, event_link

    except FileNotFoundError as e:
        logger.warning(f"Google Calendar não configurado: {e}")
        return None, None
    except Exception as e:
        logger.error(f"Erro ao criar evento no Google Calendar: {e}")
        return None, None


def deletar_evento(event_id: str) -> bool:
    try:
        service = get_calendar_service()
        service.events().delete(calendarId="primary", eventId=event_id).execute()
        logger.info(f"Evento {event_id} removido do Google Calendar.")
        return True
    except Exception as e:
        logger.error(f"Erro ao remover evento {event_id}: {e}")
        return False


def google_calendar_disponivel() -> bool:
    return os.path.exists(CREDENTIALS_FILE) or os.path.exists(TOKEN_FILE)
