from fastapi import APIRouter, Depends, Query
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import get_current_user, require_role
from app.models.user import UserRole
from app.repositories.ebi_repo import get_ebi_by_id, list_ebis
from app.schemas.ebi import EbiCreate, EbiDetail, EbiList, EbiOut, EbiUpdate
from app.schemas.presence import PresenceCheckout, PresenceCreate, PresenceOut
from app.services.ebi_service import add_presence, checkout_presence, close_ebi, create_new_ebi, reopen_ebi, update_existing_ebi

router = APIRouter()


def _ebi_to_out(ebi) -> EbiOut:
    collaborator_ids = [user.id for user in ebi.collaborators]
    return EbiOut(
        id=ebi.id,
        ebi_date=ebi.ebi_date,
        group_number=ebi.group_number,
        coordinator_id=ebi.coordinator_id,
        status=ebi.status,
        finished_at=ebi.finished_at,
        collaborator_ids=collaborator_ids,
    )


def _presence_to_out(presence, include_pin: bool = False) -> PresenceOut:
    return PresenceOut(
        id=presence.id,
        child_id=presence.child_id,
        child_name=presence.child.name,
        guardian_name_day=presence.guardian_name_day,
        guardian_phone_day=presence.guardian_phone_day,
        entry_at=presence.entry_at,
        exit_at=presence.exit_at,
        pin_code=presence.pin_code if include_pin else None,
    )


@router.get("", response_model=EbiList)
def list_ebi_api(
    search: str | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    items, total = list_ebis(db, search, page, page_size)
    return EbiList(
        items=[_ebi_to_out(item) for item in items], total=total, page=page, page_size=page_size
    )


@router.post("", response_model=EbiOut)
def create_ebi_api(
    payload: EbiCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    ebi = create_new_ebi(db, payload)
    return _ebi_to_out(ebi)


@router.get("/{ebi_id}", response_model=EbiDetail)
def get_ebi_api(
    ebi_id: int,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    ebi = get_ebi_by_id(db, ebi_id)
    if not ebi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="EBI not found")
    return EbiDetail(
        **_ebi_to_out(ebi).model_dump(),
        presences=[_presence_to_out(p) for p in ebi.presences],
    )


@router.put("/{ebi_id}", response_model=EbiOut)
def update_ebi_api(
    ebi_id: int,
    payload: EbiUpdate,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    ebi = update_existing_ebi(db, ebi_id, payload)
    return _ebi_to_out(ebi)


@router.post("/{ebi_id}/presence", response_model=PresenceOut)
def add_presence_api(
    ebi_id: int,
    payload: PresenceCreate,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    presence = add_presence(db, ebi_id, payload)
    return _presence_to_out(presence, include_pin=True)


@router.post("/presence/{presence_id}/checkout", response_model=PresenceOut)
def checkout_presence_api(
    presence_id: int,
    payload: PresenceCheckout,
    db: Session = Depends(get_db),
    _=Depends(get_current_user),
):
    presence = checkout_presence(db, presence_id, payload.pin_code)
    return _presence_to_out(presence)


@router.post("/{ebi_id}/close", response_model=EbiOut)
def close_ebi_api(
    ebi_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    ebi = close_ebi(db, ebi_id)
    return _ebi_to_out(ebi)


@router.post("/{ebi_id}/reopen", response_model=EbiOut)
def reopen_ebi_api(
    ebi_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    ebi = reopen_ebi(db, ebi_id, current_user.id)
    return _ebi_to_out(ebi)
