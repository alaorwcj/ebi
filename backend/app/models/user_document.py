import enum

from sqlalchemy import Enum, ForeignKey, Integer, LargeBinary, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class DocumentType(str, enum.Enum):
    # Documentos obrigatórios pela legislação brasileira (ECA)
    ANTECEDENTES_CRIMINAIS = "ANTECEDENTES_CRIMINAIS"  # Certidão Federal
    CERTIDAO_NEGATIVA_ESTADUAL = "CERTIDAO_NEGATIVA_ESTADUAL"  # Justiça Estadual
    RG = "RG"  # Registro Geral
    CPF = "CPF"  # Cadastro de Pessoa Física
    COMPROVANTE_RESIDENCIA = "COMPROVANTE_RESIDENCIA"
    ATESTADO_SAUDE = "ATESTADO_SAUDE"
    OUTROS = "OUTROS"


class UserDocument(Base, TimestampMixin):
    __tablename__ = "user_documents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    document_type: Mapped[DocumentType] = mapped_column(
        Enum(DocumentType, name="document_type"), nullable=False
    )
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_data: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size: Mapped[int] = mapped_column(Integer, nullable=False)

    user = relationship("User", back_populates="documents")
