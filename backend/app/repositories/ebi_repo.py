from sqlalchemy import String, func, select
from sqlalchemy.orm import Session

from app.models.ebi import Ebi


def get_ebi_by_id(db: Session, ebi_id: int) -> Ebi | None:
    return db.get(Ebi, ebi_id)


def list_ebis(
    db: Session, search: str | None, page: int, page_size: int
) -> tuple[list[Ebi], int]:
    stmt = select(Ebi).order_by(Ebi.ebi_date.desc())
    count_stmt = select(func.count()).select_from(Ebi)

    if search:
        like = f"%{search.lower()}%"
        stmt = stmt.where(func.lower(func.cast(Ebi.ebi_date, String)).like(like))
        count_stmt = count_stmt.where(func.lower(func.cast(Ebi.ebi_date, String)).like(like))
        if search.isdigit():
            stmt = stmt.where(Ebi.group_number == int(search))
            count_stmt = count_stmt.where(Ebi.group_number == int(search))
    stmt = stmt.offset((page - 1) * page_size).limit(page_size)
    items = db.execute(stmt).scalars().all()
    total = db.execute(count_stmt).scalar_one()
    return items, total


def create_ebi(db: Session, ebi: Ebi) -> Ebi:
    db.add(ebi)
    db.commit()
    db.refresh(ebi)
    return ebi


def update_ebi(db: Session, ebi: Ebi) -> Ebi:
    db.add(ebi)
    db.commit()
    db.refresh(ebi)
    return ebi
