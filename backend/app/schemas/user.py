from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserBase(BaseModel):
    full_name: str = Field(min_length=2, max_length=200)
    email: EmailStr
    phone: str = Field(min_length=8, max_length=40)
    role: UserRole
    group_number: int = Field(ge=1, le=4)


class UserCreate(UserBase):
    password: str = Field(min_length=8)


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=200)
    email: EmailStr | None = None
    phone: str | None = Field(default=None, min_length=8, max_length=40)
    role: UserRole | None = None
    group_number: int | None = Field(default=None, ge=1, le=4)
    password: str | None = Field(default=None, min_length=8)


class UserOut(UserBase):
    id: int

    class Config:
        from_attributes = True


class UserList(BaseModel):
    items: list[UserOut]
    total: int
    page: int
    page_size: int
