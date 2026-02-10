from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import get_db
from app.repositories.user_repo import list_users
from app.schemas.auth import BootstrapRequest, TokenResponse
from app.services.auth_service import bootstrap_coordinator, login

router = APIRouter()


@router.post("/login", response_model=TokenResponse)
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    token, user = login(db, form_data.username, form_data.password)
    return TokenResponse(access_token=token, role=user.role.value, user_id=user.id)


@router.post("/bootstrap", response_model=dict)
def bootstrap(request: BootstrapRequest, db: Session = Depends(get_db)):
    if not settings.allow_bootstrap:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Bootstrap disabled")

    users, total = list_users(db, None, 1, 1)
    if total > 0:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Users already exist")

    user = bootstrap_coordinator(
        db,
        full_name=request.full_name,
        email=request.email,
        phone=request.phone,
        group_number=request.group_number,
        password=request.password,
    )
    return {"id": user.id, "email": user.email}
