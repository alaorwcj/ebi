from pydantic import BaseModel, Field
from datetime import date


class GuardianBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    phone: str = Field(min_length=8, max_length=40)


class GuardianCreate(GuardianBase):
    pass


class GuardianOut(GuardianBase):
    id: int

    class Config:
        from_attributes = True


class ChildBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    birth_date: date | None = None


class ChildCreate(ChildBase):
    guardians: list[GuardianCreate]


class ChildUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    birth_date: date | None = None
    guardians: list[GuardianCreate] | None = None


class ChildOut(ChildBase):
    id: int
    guardians: list[GuardianOut]

    class Config:
        from_attributes = True


class ChildList(BaseModel):
    items: list[ChildOut]
    total: int
    page: int
    page_size: int
