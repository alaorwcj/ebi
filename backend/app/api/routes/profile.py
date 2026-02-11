from fastapi import APIRouter, Depends, File, Form, HTTPException, Response, UploadFile, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.security import get_password_hash
from app.models.user import User
from app.models.user_document import DocumentType, UserDocument
from app.schemas.profile import ProfileOut, ProfileUpdate

router = APIRouter()

# Limite de 10MB por arquivo
MAX_FILE_SIZE = 10 * 1024 * 1024

ALLOWED_MIME_TYPES = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
]


@router.get("/me", response_model=ProfileOut)
def get_my_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retorna perfil do usuário autenticado com documentos."""
    return current_user


@router.put("/me", response_model=ProfileOut)
def update_my_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Atualiza dados pessoais do usuário autenticado."""
    # Atualiza campos básicos
    if payload.full_name:
        current_user.full_name = payload.full_name
    if payload.phone:
        current_user.phone = payload.phone
    if payload.password:
        current_user.password_hash = get_password_hash(payload.password)

    # Atualiza dados pessoais
    if payload.cpf:
        current_user.cpf = payload.cpf
    if payload.rg:
        current_user.rg = payload.rg
    if payload.birth_date:
        current_user.birth_date = payload.birth_date
    if payload.address:
        current_user.address = payload.address
    if payload.city:
        current_user.city = payload.city
    if payload.state:
        current_user.state = payload.state
    if payload.zip_code:
        current_user.zip_code = payload.zip_code
    if payload.emergency_contact_name:
        current_user.emergency_contact_name = payload.emergency_contact_name
    if payload.emergency_contact_phone:
        current_user.emergency_contact_phone = payload.emergency_contact_phone

    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/documents", status_code=status.HTTP_201_CREATED)
def upload_document(
    document_type: DocumentType = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Upload de documento para o perfil."""
    if not file.content_type or file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tipo de arquivo não permitido. Use: {', '.join(ALLOWED_MIME_TYPES)}",
        )

    file_data = file.file.read()
    file_size = len(file_data)

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="Arquivo muito grande. Máximo 10MB.",
        )

    if file_size == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Arquivo vazio.",
        )

    # Remove documento anterior do mesmo tipo (se existir)
    existing = (
        db.query(UserDocument)
        .filter(
            UserDocument.user_id == current_user.id,
            UserDocument.document_type == document_type,
        )
        .first()
    )
    if existing:
        db.delete(existing)

    # Cria novo documento
    document = UserDocument(
        user_id=current_user.id,
        document_type=document_type,
        filename=file.filename or "documento.pdf",
        file_data=file_data,
        mime_type=file.content_type,
        file_size=file_size,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    return {"id": document.id, "message": "Documento enviado com sucesso."}


@router.get("/me/documents/{document_id}")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Download de documento do perfil."""
    document = (
        db.query(UserDocument)
        .filter(
            UserDocument.id == document_id,
            UserDocument.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado.",
        )

    return Response(
        content=document.file_data,
        media_type=document.mime_type,
        headers={
            "Content-Disposition": f'attachment; filename="{document.filename}"',
        },
    )


@router.delete("/me/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Remove documento do perfil."""
    document = (
        db.query(UserDocument)
        .filter(
            UserDocument.id == document_id,
            UserDocument.user_id == current_user.id,
        )
        .first()
    )

    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Documento não encontrado.",
        )

    db.delete(document)
    db.commit()
