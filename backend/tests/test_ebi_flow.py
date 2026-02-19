import pytest
from datetime import date, datetime, timezone
from unittest.mock import patch
from fastapi import HTTPException

from app.models.user import User, UserRole
from app.models.child import Child
from app.models.guardian import ChildGuardian
from app.models.ebi import Ebi, EbiStatus
from app.schemas.ebi import EbiCreate
from app.schemas.presence import PresenceCreate
from app.services.ebi_service import (
    create_new_ebi,
    add_presence,
    checkout_presence,
    close_ebi,
    reopen_ebi,
)

# --- Helpers ---

def create_user(db, role=UserRole.COORDENADORA, email="test@ebi.local"):
    user = User(
        full_name="Test User",
        email=email,
        phone="11999999999",
        role=role,
        group_number=1,
        password_hash="hash",
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

def create_child_with_guardian(db):
    child = Child(
        name="Test Child",
        guardian_name="Guardian 1",
        guardian_phone="11988888888"
    )
    db.add(child)
    db.commit()
    
    guardian = ChildGuardian(
        child_id=child.id,
        name="Guardian 1",
        phone="11988888888"
    )
    db.add(guardian)
    db.commit()
    db.refresh(child)
    return child

@pytest.fixture
def mock_whatsapp():
    with patch("app.services.ebi_service.send_pin_whatsapp") as mock:
        yield mock

# --- Testes: Registro de Presença ---

def test_add_presence_success(db_session, mock_whatsapp):
    # Arrange
    user = create_user(db_session)
    child = create_child_with_guardian(db_session)
    
    ebi_in = EbiCreate(
        ebi_date=date.today(),
        group_number=1,
        coordinator_id=user.id,
        collaborator_ids=[]
    )
    ebi = create_new_ebi(db_session, ebi_in)
    
    presence_in = PresenceCreate(
        child_id=child.id,
        guardian_name_day="Grandma",
        guardian_phone_day="11977777777"
    )

    # Act
    presence = add_presence(db_session, ebi.id, presence_in)

    # Assert
    assert presence.id is not None
    assert presence.child_id == child.id
    assert len(presence.pin_code) == 4
    assert presence.entry_at is not None
    assert presence.exit_at is None
    mock_whatsapp.assert_called_once()

def test_add_presence_fail_ebi_closed(db_session):
    # Arrange
    user = create_user(db_session)
    child = create_child_with_guardian(db_session)
    
    ebi = Ebi(
        ebi_date=date.today(),
        group_number=1,
        coordinator_id=user.id,
        status=EbiStatus.ENCERRADO 
    )
    db_session.add(ebi)
    db_session.commit()
    
    presence_in = PresenceCreate(
        child_id=child.id,
        guardian_name_day="Grandma",
        guardian_phone_day="11977777777"
    )

    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        add_presence(db_session, ebi.id, presence_in)
    assert exc.value.status_code == 409
    assert "EBI closed" in exc.value.detail

def test_add_presence_fail_duplicate(db_session, mock_whatsapp):
    # Arrange
    user = create_user(db_session)
    child = create_child_with_guardian(db_session)
    
    ebi_in = EbiCreate(
        ebi_date=date.today(),
        group_number=1,
        coordinator_id=user.id,
        collaborator_ids=[]
    )
    ebi = create_new_ebi(db_session, ebi_in)
    
    presence_in = PresenceCreate(
        child_id=child.id,
        guardian_name_day="Grandma",
        guardian_phone_day="11977777777"
    )
    add_presence(db_session, ebi.id, presence_in)

    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        add_presence(db_session, ebi.id, presence_in)
    assert exc.value.status_code == 409
    assert "Presence already exists" in exc.value.detail

# --- Testes: Saída (Checkout) ---

def test_checkout_success(db_session, mock_whatsapp):
    # Arrange
    user = create_user(db_session)
    child = create_child_with_guardian(db_session)
    ebi = create_new_ebi(db_session, EbiCreate(
        ebi_date=date.today(), group_number=1, coordinator_id=user.id, collaborator_ids=[]
    ))
    presence = add_presence(db_session, ebi.id, PresenceCreate(
        child_id=child.id, guardian_name_day="Mom", guardian_phone_day="11999999999"
    ))
    
    # Act
    updated_presence = checkout_presence(db_session, presence.id, presence.pin_code)

    # Assert
    assert updated_presence.exit_at is not None

def test_checkout_fail_invalid_pin(db_session, mock_whatsapp):
    # Arrange
    user = create_user(db_session)
    child = create_child_with_guardian(db_session)
    ebi = create_new_ebi(db_session, EbiCreate(
        ebi_date=date.today(), group_number=1, coordinator_id=user.id, collaborator_ids=[]
    ))
    presence = add_presence(db_session, ebi.id, PresenceCreate(
        child_id=child.id, guardian_name_day="Mom", guardian_phone_day="11999999999"
    ))
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        checkout_presence(db_session, presence.id, "0000") # Wrong PIN
    assert exc.value.status_code == 403

# --- Testes: Encerramento ---

def test_close_ebi_success(db_session, mock_whatsapp):
    # Arrange
    user = create_user(db_session)
    child = create_child_with_guardian(db_session)
    ebi = create_new_ebi(db_session, EbiCreate(
        ebi_date=date.today(), group_number=1, coordinator_id=user.id, collaborator_ids=[]
    ))
    presence = add_presence(db_session, ebi.id, PresenceCreate(
        child_id=child.id, guardian_name_day="Mom", guardian_phone_day="11999999999"
    ))
    checkout_presence(db_session, presence.id, presence.pin_code)
    
    # Act
    closed_ebi = close_ebi(db_session, ebi.id)

    # Assert
    assert closed_ebi.status == EbiStatus.ENCERRADO
    assert closed_ebi.finished_at is not None

def test_close_ebi_fail_pending_checkout(db_session, mock_whatsapp):
    # Arrange
    user = create_user(db_session)
    child = create_child_with_guardian(db_session)
    ebi = create_new_ebi(db_session, EbiCreate(
        ebi_date=date.today(), group_number=1, coordinator_id=user.id, collaborator_ids=[]
    ))
    # Adiciona presença mas NÃO faz checkout
    add_presence(db_session, ebi.id, PresenceCreate(
        child_id=child.id, guardian_name_day="Mom", guardian_phone_day="11999999999"
    ))
    
    # Act & Assert
    with pytest.raises(HTTPException) as exc:
        close_ebi(db_session, ebi.id)
    assert exc.value.status_code == 409
    assert "All presences must be closed" in exc.value.detail

# --- Testes: Reabertura ---

def test_reopen_ebi_success(db_session):
    # Arrange
    user = create_user(db_session)
    ebi = create_new_ebi(db_session, EbiCreate(
        ebi_date=date.today(), group_number=1, coordinator_id=user.id, collaborator_ids=[]
    ))
    # Força encerramento direto no banco para simular estado
    ebi.status = EbiStatus.ENCERRADO
    ebi.finished_at = datetime.now(timezone.utc)
    db_session.add(ebi)
    db_session.commit()
    
    # Act
    reopened = reopen_ebi(db_session, ebi.id, performed_by=user.id)
    
    # Assert
    assert reopened.status == EbiStatus.ABERTO
    assert reopened.finished_at is None
    assert len(reopened.audits) == 1
    assert reopened.audits[0].action == "REOPEN"
