from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.ebi import Ebi, EbiStatus
from app.models.presence import EbiPresence
from app.repositories.child_repo import get_child_by_id
from app.repositories.ebi_repo import create_ebi, get_ebi_by_id, update_ebi
from app.repositories.presence_repo import create_presence, get_presence_by_ebi_child, get_presence_by_id, update_presence
from app.repositories.user_repo import get_user_by_id


def create_new_ebi(db: Session, ebi_in) -> Ebi:
    coordinator = get_user_by_id(db, ebi_in.coordinator_id)
    if not coordinator:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Coordinator not found")

    ebi = Ebi(
        ebi_date=ebi_in.ebi_date,
        group_number=ebi_in.group_number,
        coordinator_id=ebi_in.coordinator_id,
        status=EbiStatus.ABERTO,
    )
    if ebi_in.collaborator_ids:
        collaborators = [get_user_by_id(db, uid) for uid in ebi_in.collaborator_ids]
        if any(item is None for item in collaborators):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid collaborator")
        ebi.collaborators = [item for item in collaborators if item is not None]

    return create_ebi(db, ebi)


def update_existing_ebi(db: Session, ebi_id: int, ebi_in) -> Ebi:
    ebi = get_ebi_by_id(db, ebi_id)
    if not ebi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="EBI not found")
    if ebi.status == EbiStatus.ENCERRADO:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="EBI closed")

    for field in ["ebi_date", "group_number", "coordinator_id"]:
        value = getattr(ebi_in, field, None)
        if value is not None:
            setattr(ebi, field, value)

    if ebi_in.collaborator_ids is not None:
        collaborators = [get_user_by_id(db, uid) for uid in ebi_in.collaborator_ids]
        if any(item is None for item in collaborators):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid collaborator")
        ebi.collaborators = [item for item in collaborators if item is not None]

    return update_ebi(db, ebi)


def add_presence(db: Session, ebi_id: int, presence_in) -> EbiPresence:
    ebi = get_ebi_by_id(db, ebi_id)
    if not ebi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="EBI not found")
    if ebi.status == EbiStatus.ENCERRADO:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="EBI closed")

    child = get_child_by_id(db, presence_in.child_id)
    if not child:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Child not found")

    existing = get_presence_by_ebi_child(db, ebi_id, presence_in.child_id)
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Presence already exists")

    presence = EbiPresence(
        ebi_id=ebi_id,
        child_id=presence_in.child_id,
        guardian_name_day=presence_in.guardian_name_day,
        guardian_phone_day=presence_in.guardian_phone_day,
        entry_at=datetime.now(timezone.utc),
    )
    return create_presence(db, presence)


def checkout_presence(db: Session, presence_id: int) -> EbiPresence:
    presence = get_presence_by_id(db, presence_id)
    if not presence:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Presence not found")

    ebi = get_ebi_by_id(db, presence.ebi_id)
    if not ebi or ebi.status == EbiStatus.ENCERRADO:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="EBI closed")

    if presence.exit_at:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Already checked out")

    presence.exit_at = datetime.now(timezone.utc)
    return update_presence(db, presence)


def close_ebi(db: Session, ebi_id: int) -> Ebi:
    ebi = get_ebi_by_id(db, ebi_id)
    if not ebi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="EBI not found")

    if ebi.status == EbiStatus.ENCERRADO:
        return ebi

    if any(p.exit_at is None for p in ebi.presences):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="All presences must be closed")

    ebi.status = EbiStatus.ENCERRADO
    ebi.finished_at = datetime.now(timezone.utc)
    return update_ebi(db, ebi)
