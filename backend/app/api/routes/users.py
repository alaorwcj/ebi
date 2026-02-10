from fastapi import APIRouter, Depends, Query
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_role
from app.models.user import UserRole
from app.repositories.user_repo import get_user_by_id, list_users
from app.schemas.user import UserCreate, UserList, UserOut, UserUpdate
from app.services.user_service import create_new_user, update_existing_user

router = APIRouter()


@router.get("", response_model=UserList)
def list_users_api(
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    items, total = list_users(db, search, page, page_size)
    return UserList(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=UserOut)
def create_user_api(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    return create_new_user(db, payload)


@router.get("/{user_id}", response_model=UserOut)
def get_user_api(
    user_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user_api(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    return update_existing_user(db, user_id, payload)
