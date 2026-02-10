from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class Child(Base, TimestampMixin):
    __tablename__ = "children"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    guardian_name: Mapped[str] = mapped_column(String(200), nullable=False)
    guardian_phone: Mapped[str] = mapped_column(String(40), nullable=False)
