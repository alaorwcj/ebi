from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class EbiAudit(Base, TimestampMixin):
    __tablename__ = "ebi_audit"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    ebi_id: Mapped[int] = mapped_column(ForeignKey("ebi.id", ondelete="CASCADE"), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    performed_by: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)

    ebi = relationship("Ebi", back_populates="audits")
