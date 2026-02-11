from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.child import Child
from app.models.guardian import ChildGuardian
from app.repositories.child_repo import create_child, get_child_by_id, update_child


def create_new_child(db: Session, child_in) -> Child:
    if not child_in.guardians:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guardians required")

    primary = child_in.guardians[0]
    child = Child(
        name=child_in.name,
        guardian_name=primary.name,
        guardian_phone=primary.phone,
    )
    child.guardians = [ChildGuardian(name=item.name, phone=item.phone) for item in child_in.guardians]
    return create_child(db, child)


def update_existing_child(db: Session, child_id: int, child_in) -> Child:
    child = get_child_by_id(db, child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    if child_in.name is not None:
        child.name = child_in.name

    if child_in.guardians is not None:
        if not child_in.guardians:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Guardians required")
        child.guardians = [
            ChildGuardian(name=item.name, phone=item.phone) for item in child_in.guardians
        ]
        primary = child_in.guardians[0]
        child.guardian_name = primary.name
        child.guardian_phone = primary.phone

    return update_child(db, child)
