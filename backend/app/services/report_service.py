from datetime import date

from fastapi import HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.ebi import Ebi
from app.models.presence import EbiPresence
from app.models.user import User, UserRole


def get_general_report(db: Session) -> dict:
    total_coordenadoras = db.execute(
        select(func.count()).select_from(User).where(User.role == UserRole.COORDENADORA)
    ).scalar_one()
    total_colaboradoras = db.execute(
        select(func.count()).select_from(User).where(User.role == UserRole.COLABORADORA)
    ).scalar_one()

    people_rows = db.execute(select(User.full_name, User.role).order_by(User.full_name.asc())).all()
    people = [
        {"full_name": full_name, "role": role.value if hasattr(role, "value") else str(role)}
        for full_name, role in people_rows
    ]

    by_group = {}
    for group_number in range(1, 5):
        count = db.execute(
            select(func.count()).select_from(User).where(User.group_number == group_number)
        ).scalar_one()
        by_group[str(group_number)] = count

    today = date.today()
    month_start = date(today.year, today.month, 1)
    year_start = date(today.year, 1, 1)

    month_ebi_ids = db.execute(
        select(Ebi.id).where(Ebi.ebi_date >= month_start)
    ).scalars().all()
    year_ebi_ids = db.execute(select(Ebi.id).where(Ebi.ebi_date >= year_start)).scalars().all()

    month_ebi_count = len(month_ebi_ids)
    year_ebi_count = len(year_ebi_ids)

    month_presence_count = 0
    year_presence_count = 0
    if month_ebi_ids:
        month_presence_count = db.execute(
            select(func.count()).select_from(EbiPresence).where(EbiPresence.ebi_id.in_(month_ebi_ids))
        ).scalar_one()
    if year_ebi_ids:
        year_presence_count = db.execute(
            select(func.count()).select_from(EbiPresence).where(EbiPresence.ebi_id.in_(year_ebi_ids))
        ).scalar_one()

    average_presence_month = (
        month_presence_count / month_ebi_count if month_ebi_count > 0 else 0
    )
    average_presence_year = year_presence_count / year_ebi_count if year_ebi_count > 0 else 0

    last_3_months_counts = []
    last_12_months_avg = []
    month_cursor = today
    for _ in range(3):
        start = date(month_cursor.year, month_cursor.month, 1)
        if month_cursor.month == 12:
            end = date(month_cursor.year + 1, 1, 1)
        else:
            end = date(month_cursor.year, month_cursor.month + 1, 1)

        ebi_ids = db.execute(
            select(Ebi.id).where(Ebi.ebi_date >= start, Ebi.ebi_date < end)
        ).scalars().all()
        count = 0
        if ebi_ids:
            count = db.execute(
                select(func.count()).select_from(EbiPresence).where(EbiPresence.ebi_id.in_(ebi_ids))
            ).scalar_one()
        last_3_months_counts.append(count)
        month_cursor = date(start.year, start.month, 1)
        if month_cursor.month == 1:
            month_cursor = date(month_cursor.year - 1, 12, 1)
        else:
            month_cursor = date(month_cursor.year, month_cursor.month - 1, 1)

    month_cursor = today
    for _ in range(12):
        start = date(month_cursor.year, month_cursor.month, 1)
        if month_cursor.month == 12:
            end = date(month_cursor.year + 1, 1, 1)
        else:
            end = date(month_cursor.year, month_cursor.month + 1, 1)

        ebi_ids = db.execute(
            select(Ebi.id).where(Ebi.ebi_date >= start, Ebi.ebi_date < end)
        ).scalars().all()
        count = 0
        if ebi_ids:
            count = db.execute(
                select(func.count()).select_from(EbiPresence).where(EbiPresence.ebi_id.in_(ebi_ids))
            ).scalar_one()
        avg = count / len(ebi_ids) if ebi_ids else 0
        last_12_months_avg.append(avg)
        month_cursor = date(start.year, start.month, 1)
        if month_cursor.month == 1:
            month_cursor = date(month_cursor.year - 1, 12, 1)
        else:
            month_cursor = date(month_cursor.year, month_cursor.month - 1, 1)

    return {
        "people": people,
        "total_coordenadoras": total_coordenadoras,
        "total_colaboradoras": total_colaboradoras,
        "by_group": by_group,
        "average_presence_month": average_presence_month,
        "average_presence_year": average_presence_year,
        "last_3_months_counts": list(reversed(last_3_months_counts)),
        "last_12_months_avg": list(reversed(last_12_months_avg)),
    }


def get_ebi_report(db: Session, ebi_id: int) -> dict:
    ebi = db.get(Ebi, ebi_id)
    if not ebi:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="EBI not found")

    coordinator = db.get(User, ebi.coordinator_id)
    collaborators = [user.full_name for user in ebi.collaborators]

    presences = []
    for presence in ebi.presences:
        presences.append(
            {
                "child_name": presence.child.name,
                "guardian_name_day": presence.guardian_name_day,
                "guardian_phone_day": presence.guardian_phone_day,
                "entry_at": presence.entry_at,
                "exit_at": presence.exit_at,
            }
        )

    return {
        "ebi_id": ebi.id,
        "ebi_date": str(ebi.ebi_date),
        "group_number": ebi.group_number,
        "coordinator_name": coordinator.full_name if coordinator else "",
        "collaborators": collaborators,
        "presences": presences,
    }
