from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User, UserRole
from app.repositories.user_repo import create_user, get_user_by_email


def login(db: Session, email: str, password: str) -> tuple[str, User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id), user.role.value)
    return token, user


def bootstrap_coordinator(
    db: Session,
    full_name: str,
    email: str,
    phone: str,
    group_number: int,
    password: str,
) -> User:
    existing = get_user_by_email(db, email)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already in use")

    user = User(
        full_name=full_name,
        email=email,
        phone=phone,
        role=UserRole.COORDENADORA,
        group_number=group_number,
        password_hash=get_password_hash(password),
    )
    return create_user(db, user)
