from sqlalchemy.orm import Session
from db.models import Report, ReportTypeEnum
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
import io

# -----------------------------
# Get Reports by User and Type
# -----------------------------
def get_user_reports_by_type(db: Session, user_id: str, report_type: ReportTypeEnum):
    reports = (
        db.query(Report)
        .filter(Report.user_id == user_id, Report.type == report_type)
        .order_by(Report.created_at.desc())
        .all()
    )
    return reports


# -----------------------------
# Download Report by ID
# -----------------------------
def get_report_by_id(db: Session, report_id: str):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    return StreamingResponse(
        io.BytesIO(report.file_data),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={report.filename}"}
    )


# -----------------------------
# Save Report
# -----------------------------
def save_report(db: Session, user_id: str, file_bytes: bytes, filename: str, report_type: ReportTypeEnum):
    report = Report(
        user_id=user_id,
        type=report_type,
        filename=filename,
        file_data=file_bytes
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report

