from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class EbiPresence(Base, TimestampMixin):
    __tablename__ = "ebi_presence"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ebi_id: Mapped[int] = mapped_column(ForeignKey("ebi.id", ondelete="CASCADE"), nullable=False)
    child_id: Mapped[int] = mapped_column(ForeignKey("children.id"), nullable=False)
    guardian_name_day: Mapped[str] = mapped_column(String(200), nullable=False)
    guardian_phone_day: Mapped[str] = mapped_column(String(40), nullable=False)
    entry_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    exit_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    pin_code: Mapped[str] = mapped_column(String(4), nullable=False)

    ebi = relationship("Ebi", back_populates="presences")
    child = relationship("Child")


Index("ix_presence_ebi", EbiPresence.ebi_id)
Index("ix_presence_child", EbiPresence.child_id)
UniqueConstraint("ebi_id", "child_id", name="uq_presence_ebi_child")
