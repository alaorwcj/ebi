from datetime import date, datetime

from pydantic import BaseModel, Field

from app.models.ebi import EbiStatus
from app.schemas.presence import PresenceOut


class EbiBase(BaseModel):
    ebi_date: date
    group_number: int = Field(ge=1, le=4)
    coordinator_id: int
    collaborator_ids: list[int] = []


class EbiCreate(EbiBase):
    pass


class EbiUpdate(BaseModel):
    ebi_date: date | None = None
    group_number: int | None = Field(default=None, ge=1, le=4)
    coordinator_id: int | None = None
    collaborator_ids: list[int] | None = None


class EbiOut(BaseModel):
    id: int
    ebi_date: date
    group_number: int
    coordinator_id: int
    status: EbiStatus
    finished_at: datetime | None
    collaborator_ids: list[int]

    class Config:
        from_attributes = True


class EbiDetail(EbiOut):
    presences: list[PresenceOut]


class EbiList(BaseModel):
    items: list[EbiOut]
    total: int
    page: int
    page_size: int
