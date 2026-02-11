from datetime import datetime, timezone

from app.core.db import SessionLocal
from app.core.security import get_password_hash
from app.models.child import Child
from app.models.guardian import ChildGuardian
from app.models.ebi import Ebi, EbiStatus
from app.models.presence import EbiPresence
from app.models.user import User, UserRole
from app.repositories.user_repo import get_user_by_email


def run_seed() -> None:
    db = SessionLocal()
    try:
        admin = get_user_by_email(db, "admin@ebi.local")
        if not admin:
            admin = User(
                full_name="Administrador Seed",
                email="admin@ebi.local",
                phone="(11) 99999-0000",
                role=UserRole.ADMINISTRADOR,
                group_number=1,
                password_hash=get_password_hash("admin123"),
            )
            db.add(admin)

        coordinator = get_user_by_email(db, "coord@ebi.local")
        if not coordinator:
            coordinator = User(
                full_name="Coordenadora Seed",
                email="coord@ebi.local",
                phone="(11) 99999-0001",
                role=UserRole.COORDENADORA,
                group_number=1,
                password_hash=get_password_hash("coord123"),
            )
            db.add(coordinator)

        collaborator = get_user_by_email(db, "colab@ebi.local")
        if not collaborator:
            collaborator = User(
                full_name="Colaboradora Seed",
                email="colab@ebi.local",
                phone="(11) 99999-0002",
                role=UserRole.COLABORADORA,
                group_number=1,
                password_hash=get_password_hash("colab123"),
            )
            db.add(collaborator)

        db.commit()

        child = db.query(Child).first()
        if not child:
            child = Child(
                name="Crianca Seed",
                guardian_name="Responsavel Seed",
                guardian_phone="(11) 98888-0000",
            )
            child.guardians = [
                ChildGuardian(name="Responsavel Seed", phone="(11) 98888-0000"),
                ChildGuardian(name="Responsavel 2", phone="(11) 97777-0000"),
            ]
            db.add(child)
            db.commit()

        ebi = db.query(Ebi).first()
        if not ebi:
            ebi = Ebi(
                ebi_date=datetime.now(timezone.utc).date(),
                group_number=1,
                coordinator_id=coordinator.id,
                status=EbiStatus.ABERTO,
            )
            ebi.collaborators = [collaborator]
            db.add(ebi)
            db.commit()

        presence = db.query(EbiPresence).filter(EbiPresence.ebi_id == ebi.id).first()
        if not presence:
            presence = EbiPresence(
                ebi_id=ebi.id,
                child_id=child.id,
                guardian_name_day=child.guardian_name,
                guardian_phone_day=child.guardian_phone,
                entry_at=datetime.now(timezone.utc),
            )
            db.add(presence)
            db.commit()

        print("Seed concluido")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
