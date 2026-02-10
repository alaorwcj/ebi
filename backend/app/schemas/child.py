from pydantic import BaseModel, Field


class ChildBase(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    guardian_name: str = Field(min_length=2, max_length=200)
    guardian_phone: str = Field(min_length=8, max_length=40)


class ChildCreate(ChildBase):
    pass


class ChildUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=2, max_length=200)
    guardian_name: str | None = Field(default=None, min_length=2, max_length=200)
    guardian_phone: str | None = Field(default=None, min_length=8, max_length=40)


class ChildOut(ChildBase):
    id: int

    class Config:
        from_attributes = True


class ChildList(BaseModel):
    items: list[ChildOut]
    total: int
    page: int
    page_size: int
