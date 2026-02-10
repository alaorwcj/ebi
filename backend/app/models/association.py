from sqlalchemy import Column, ForeignKey, Integer, Table

from app.models.base import Base


ebi_colaboradoras = Table(
    "ebi_colaboradoras",
    Base.metadata,
    Column("ebi_id", ForeignKey("ebi.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
)
