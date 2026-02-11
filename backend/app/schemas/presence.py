from datetime import datetime

from pydantic import BaseModel, Field


class PresenceCreate(BaseModel):
    child_id: int
    guardian_name_day: str = Field(min_length=2, max_length=200)
    guardian_phone_day: str = Field(min_length=8, max_length=40)


class PresenceCheckout(BaseModel):
    pin_code: str = Field(min_length=4, max_length=4)


class PresenceOut(BaseModel):
    id: int
    child_id: int
    child_name: str
    guardian_name_day: str
    guardian_phone_day: str
    entry_at: datetime
    exit_at: datetime | None
    pin_code: str | None = None

    class Config:
        from_attributes = True
