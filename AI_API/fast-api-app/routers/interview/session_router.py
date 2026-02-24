from typing import List

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

import schemas
from dependencies import get_db
from services.interview.session_service import (
    create_session_service,
    get_sessions_by_user_service,
    get_session_by_id_service,
    delete_session_service,
)
from services.interview.session_summary_service import build_session_report_pdf


router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"],
)


@router.post("/", response_model=schemas.SessionRead)
def create_session(
    payload: schemas.SessionCreate,
    db: Session = Depends(get_db),
):
    return create_session_service(db, payload)


@router.get("/user/{user_id}", response_model=List[schemas.SessionRead])
def get_sessions_by_user(
    user_id: int,
    db: Session = Depends(get_db),
):
    return get_sessions_by_user_service(db, user_id)


@router.get("/{session_id}", response_model=schemas.SessionRead)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    return get_session_by_id_service(db, session_id)


@router.delete("/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    delete_session_service(db, session_id)
    return {"detail": "Session deleted"}


@router.get("/{session_id}/report")
def generate_session_report(
    session_id: int,
    db: Session = Depends(get_db),
):
    try:
        pdf_buffer, session_name = build_session_report_pdf(db, session_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={session_name}_report.pdf"
        },
    )