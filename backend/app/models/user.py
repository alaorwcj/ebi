import enum

from datetime import date

from sqlalchemy import Date, Enum, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class UserRole(str, enum.Enum):
    ADMINISTRADOR = "ADMINISTRADOR"
    COORDENADORA = "COORDENADORA"
    COLABORADORA = "COLABORADORA"


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), unique=True, index=True, nullable=False)
    phone: Mapped[str] = mapped_column(String(40), nullable=False)
    role: Mapped[UserRole] = mapped_column(Enum(UserRole, name="user_role"), nullable=False)
    group_number: Mapped[int] = mapped_column(Integer, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)

    # Dados pessoais (legislação brasileira - ECA)
    cpf: Mapped[str | None] = mapped_column(String(14), unique=True, index=True)
    rg: Mapped[str | None] = mapped_column(String(20))
    birth_date: Mapped[date | None] = mapped_column(Date)
    address: Mapped[str | None] = mapped_column(String(300))
    city: Mapped[str | None] = mapped_column(String(100))
    state: Mapped[str | None] = mapped_column(String(2))
    zip_code: Mapped[str | None] = mapped_column(String(10))
    emergency_contact_name: Mapped[str | None] = mapped_column(String(200))
    emergency_contact_phone: Mapped[str | None] = mapped_column(String(40))

    coordinated_ebis = relationship("Ebi", back_populates="coordinator")
    presences = relationship("Ebi", secondary="ebi_colaboradoras", viewonly=True)
    documents = relationship("UserDocument", back_populates="user", cascade="all, delete-orphan")
