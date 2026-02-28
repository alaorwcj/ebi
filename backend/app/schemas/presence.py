from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class PresenceCreate(BaseModel):
    child_id: int
    guardian_name_day: str = Field(min_length=2, max_length=200)
    guardian_phone_day: str = Field(min_length=8, max_length=40)


class PresenceCheckout(BaseModel):
    pin_code: Optional[str] = Field(default=None, min_length=4, max_length=4)
    checkout_justification: Optional[str] = Field(default=None, min_length=10, max_length=500)

    @model_validator(mode="after")
    def validate_pin_or_justification(self):
        if not self.pin_code and not self.checkout_justification:
            raise ValueError("Informe o PIN ou uma justificativa para saída sem PIN.")
        if not self.pin_code and self.checkout_justification and len(self.checkout_justification.strip()) < 10:
            raise ValueError("A justificativa deve ter pelo menos 10 caracteres.")
        return self


class PresenceOut(BaseModel):
    id: int
    child_id: int
    child_name: str
    guardian_name_day: str
    guardian_phone_day: str
    entry_at: datetime
    exit_at: datetime | None
    pin_code: str | None = None
    checkout_justification: str | None = None

    class Config:
        from_attributes = True

