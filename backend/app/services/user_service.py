from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User
from app.repositories.user_repo import create_user, get_user_by_email, get_user_by_id, update_user


def create_new_user(db: Session, user_in) -> User:
    existing = get_user_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    user = User(
        full_name=user_in.full_name,
        email=user_in.email,
        phone=user_in.phone,
        role=user_in.role,
        group_number=user_in.group_number,
        password_hash=get_password_hash(user_in.password),
    )
    return create_user(db, user)


def update_existing_user(db: Session, user_id: int, user_in) -> User:
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_in.email and user_in.email != user.email:
        existing = get_user_by_email(db, user_in.email)
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    for field in ["full_name", "email", "phone", "role", "group_number"]:
        value = getattr(user_in, field, None)
        if value is not None:
            setattr(user, field, value)

    if user_in.password:
        user.password_hash = get_password_hash(user_in.password)

    return update_user(db, user)
