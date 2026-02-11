import logging
from typing import Any

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)


def _format_phone_e164(phone: str) -> str | None:
    digits = "".join(ch for ch in phone if ch.isdigit())
    if not digits:
        return None

    if phone.strip().startswith("+"):
        return f"+{digits}"

    # Assume default country code when missing
    if len(digits) <= 11:
        return f"+{settings.whatsapp_default_country_code}{digits}"

    return f"+{digits}"


def _build_template_payload(to_number: str, pin_code: str, child_name: str) -> dict[str, Any]:
    return {
        "messaging_product": "whatsapp",
        "to": to_number,
        "type": "template",
        "template": {
            "name": settings.whatsapp_template_name,
            "language": {"code": settings.whatsapp_template_language},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": child_name},
                        {"type": "text", "text": pin_code},
                    ],
                }
            ],
        },
    }


def send_pin_whatsapp(guardian_phone: str, child_name: str, pin_code: str) -> None:
    if not settings.whatsapp_enabled:
        return

    if not settings.whatsapp_phone_number_id or not settings.whatsapp_access_token:
        logger.warning("WhatsApp config missing, skipping send")
        return

    if not settings.whatsapp_template_name:
        logger.warning("WhatsApp template name missing, skipping send")
        return

    to_number = _format_phone_e164(guardian_phone)
    if not to_number:
        logger.warning("Invalid phone for WhatsApp: %s", guardian_phone)
        return

    url = (
        f"https://graph.facebook.com/{settings.whatsapp_api_version}/"
        f"{settings.whatsapp_phone_number_id}/messages"
    )
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_access_token}",
        "Content-Type": "application/json",
    }

    payload = _build_template_payload(to_number, pin_code, child_name)

    try:
        with httpx.Client(timeout=10.0) as client:
            response = client.post(url, headers=headers, json=payload)
        if response.status_code >= 400:
            logger.warning("WhatsApp send failed: %s", response.text)
    except Exception:
        logger.exception("WhatsApp send error")
