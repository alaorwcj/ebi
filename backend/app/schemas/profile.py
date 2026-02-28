from datetime import date, datetime

from pydantic import BaseModel, Field, field_validator

from app.models.user_document import DocumentType


class ProfilePersonalData(BaseModel):
    cpf: str | None = Field(default=None, max_length=14)
    rg: str | None = Field(default=None, max_length=20)
    birth_date: date | None = None
    address: str | None = Field(default=None, max_length=300)
    city: str | None = Field(default=None, max_length=100)
    state: str | None = Field(default=None, max_length=2)
    zip_code: str | None = Field(default=None, max_length=10)
    emergency_contact_name: str | None = Field(default=None, max_length=200)
    emergency_contact_phone: str | None = Field(default=None, max_length=40)


class ProfileUpdate(ProfilePersonalData):
    full_name: str | None = Field(default=None, min_length=2, max_length=200)
    phone: str | None = Field(default=None, min_length=8, max_length=40)
    password: str | None = Field(default=None, min_length=8)


class DocumentOut(BaseModel):
    id: int
    document_type: DocumentType
    filename: str
    mime_type: str
    file_size: int
    created_at: str

    @field_validator("created_at", mode="before")
    @classmethod
    def parse_created_at(cls, v):
        if isinstance(v, datetime):
            return v.isoformat()
        return v

    class Config:
        from_attributes = True


class ProfileOut(BaseModel):
    id: int
    full_name: str
    email: str
    phone: str
    role: str
    group_number: int
    cpf: str | None = None
    rg: str | None = None
    birth_date: date | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    zip_code: str | None = None
    emergency_contact_name: str | None = None
    emergency_contact_phone: str | None = None
    documents: list[DocumentOut] = []

    class Config:
        from_attributes = True
