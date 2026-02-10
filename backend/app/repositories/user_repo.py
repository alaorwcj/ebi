from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.user import User


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(User.email == email)
    return db.execute(stmt).scalar_one_or_none()


def list_users(db: Session, search: str | None, page: int, page_size: int) -> tuple[list[User], int]:
    stmt = select(User)
    count_stmt = select(func.count()).select_from(User)

    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(func.lower(User.full_name).like(like) | func.lower(User.email).like(like))
        count_stmt = count_stmt.where(
            func.lower(User.full_name).like(like) | func.lower(User.email).like(like)
        )

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    items = db.execute(stmt).scalars().all()
    total = db.execute(count_stmt).scalar_one()
    return items, total


def create_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User) -> User:
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
