from sqlalchemy import Integer, String, Date
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import date

from app.models.base import Base, TimestampMixin


class Child(Base, TimestampMixin):
    __tablename__ = "children"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    birth_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    guardian_name: Mapped[str] = mapped_column(String(200), nullable=False)
    guardian_phone: Mapped[str] = mapped_column(String(40), nullable=False)

    guardians = relationship(
        "ChildGuardian",
        back_populates="child",
        cascade="all, delete-orphan",
    )
