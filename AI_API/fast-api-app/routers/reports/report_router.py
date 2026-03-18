from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from dependencies import get_db
from db.models import ReportTypeEnum
from typing import List
import schemas 
from services.reports.report_service import (
    get_user_reports_by_type,
    get_report_by_id
) 

router = APIRouter(prefix="/reports", tags=["Reports"])


# -----------------------------
# Get Reports by Type
# -----------------------------
@router.get("/user/{user_id}", response_model=List[schemas.ReportSchema])
def list_reports_by_type(
    user_id: str,
    report_type: ReportTypeEnum,
    db: Session = Depends(get_db)
):
    reports = get_user_reports_by_type(db, user_id, report_type)
    return reports


# -----------------------------
# Download Report
# -----------------------------
@router.get("/{report_id}/download")
def download_report(report_id: str, db: Session = Depends(get_db)):
    return get_report_by_id(db, report_id)