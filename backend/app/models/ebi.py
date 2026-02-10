import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Index, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class EbiStatus(str, enum.Enum):
    ABERTO = "ABERTO"
    ENCERRADO = "ENCERRADO"


class Ebi(Base, TimestampMixin):
    __tablename__ = "ebi"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ebi_date: Mapped[date] = mapped_column(Date, nullable=False)
    group_number: Mapped[int] = mapped_column(Integer, nullable=False)
    coordinator_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    status: Mapped[EbiStatus] = mapped_column(Enum(EbiStatus, name="ebi_status"), nullable=False)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    coordinator = relationship("User", back_populates="coordinated_ebis")
    collaborators = relationship("User", secondary="ebi_colaboradoras")
    presences = relationship("EbiPresence", back_populates="ebi", cascade="all, delete-orphan")


Index("ix_ebi_date_group", Ebi.ebi_date, Ebi.group_number)
