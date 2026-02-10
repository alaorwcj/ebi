from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.child import Child
from app.repositories.child_repo import create_child, get_child_by_id, update_child


def create_new_child(db: Session, child_in) -> Child:
    child = Child(
        name=child_in.name,
        guardian_name=child_in.guardian_name,
        guardian_phone=child_in.guardian_phone,
    )
    return create_child(db, child)


def update_existing_child(db: Session, child_id: int, child_in) -> Child:
    child = get_child_by_id(db, child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    for field in ["name", "guardian_name", "guardian_phone"]:
        value = getattr(child_in, field, None)
        if value is not None:
            setattr(child, field, value)

    return update_child(db, child)
