from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.deps import require_role
from app.models.user import UserRole
from app.schemas.report import EbiReport, ReportGeneral
from app.services.report_service import get_ebi_report, get_general_report

router = APIRouter()


@router.get("/general", response_model=ReportGeneral)
def general_report_api(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    return get_general_report(db)


@router.get("/ebi/{ebi_id}", response_model=EbiReport)
def ebi_report_api(
    ebi_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.COORDENADORA)),
):
    return get_ebi_report(db, ebi_id)
