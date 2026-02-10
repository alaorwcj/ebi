from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.presence import EbiPresence


def get_presence_by_id(db: Session, presence_id: int) -> EbiPresence | None:
    return db.get(EbiPresence, presence_id)


def get_presence_by_ebi_child(db: Session, ebi_id: int, child_id: int) -> EbiPresence | None:
    stmt = select(EbiPresence).where(
        EbiPresence.ebi_id == ebi_id, EbiPresence.child_id == child_id
    )
    return db.execute(stmt).scalar_one_or_none()


def create_presence(db: Session, presence: EbiPresence) -> EbiPresence:
    db.add(presence)
    db.commit()
    db.refresh(presence)
    return presence


def update_presence(db: Session, presence: EbiPresence) -> EbiPresence:
    db.add(presence)
    db.commit()
    db.refresh(presence)
    return presence
