from sqlalchemy import func, select
from sqlalchemy.orm import selectinload
from sqlalchemy.orm import Session

from app.models.child import Child


def get_child_by_id(db: Session, child_id: int) -> Child | None:
    return db.get(Child, child_id)


def list_children(db: Session, search: str | None, page: int, page_size: int) -> tuple[list[Child], int]:
    stmt = select(Child).options(selectinload(Child.guardians))
    count_stmt = select(func.count()).select_from(Child)

    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(func.lower(Child.name).like(like))
        count_stmt = count_stmt.where(func.lower(Child.name).like(like))

    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    items = db.execute(stmt).scalars().all()
    total = db.execute(count_stmt).scalar_one()
    return items, total


def create_child(db: Session, child: Child) -> Child:
    db.add(child)
    db.commit()
    db.refresh(child)
    return child


def update_child(db: Session, child: Child) -> Child:
    db.add(child)
    db.commit()
    db.refresh(child)
    return child
