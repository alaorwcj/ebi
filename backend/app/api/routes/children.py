from fastapi import APIRouter, Depends, Query
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user
from app.repositories.child_repo import get_child_by_id, list_children
from app.schemas.child import ChildCreate, ChildList, ChildOut, ChildUpdate
from app.services.child_service import create_new_child, update_existing_child

router = APIRouter()


@router.get("", response_model=ChildList)
def list_children_api(
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = list_children(db, search, page, page_size)
    return ChildList(items=items, total=total, page=page, page_size=page_size)


@router.post("", response_model=ChildOut)
def create_child_api(
    payload: ChildCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return create_new_child(db, payload)


@router.get("/{child_id}", response_model=ChildOut)
def get_child_api(
    child_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    child = get_child_by_id(db, child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")
    return child


@router.put("/{child_id}", response_model=ChildOut)
def update_child_api(
    child_id: int,
    payload: ChildUpdate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    return update_existing_child(db, child_id, payload)
