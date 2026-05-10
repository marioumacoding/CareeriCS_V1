from uuid import UUID
from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas
from dependencies import get_db
from services.interview.session_service import (
    complete_session_service,
    create_session_service,
    get_sessions_by_user_service,
    get_session_by_id_service,
    list_completed_session_archives_service,
    update_session_service,
    delete_session_service,
)
from utils.util import build_session_report_pdf


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
    user_id: UUID,
    db: Session = Depends(get_db),
):
    return get_sessions_by_user_service(db, user_id)


@router.get("/user/{user_id}/archive", response_model=List[schemas.InterviewArchiveItemRead])
def get_completed_session_archive(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    return list_completed_session_archives_service(db, user_id)


@router.get("/{session_id}", response_model=schemas.SessionRead)
def get_session(
    session_id: UUID,
    db: Session = Depends(get_db),
):
    return get_session_by_id_service(db, session_id)


@router.put("/{session_id}", response_model=schemas.SessionRead)
def update_session(
    session_id: UUID,
    payload: schemas.SessionUpdate,
    db: Session = Depends(get_db),
):
    return update_session_service(db, session_id, payload)


@router.post("/{session_id}/complete", response_model=schemas.CompleteInterviewSessionResponse)
def complete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
):
    session, report = complete_session_service(db, session_id)
    return {
        "session": session,
        "report": report,
    }


@router.delete("/{session_id}")
def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
):
    delete_session_service(db, session_id)
    return {"detail": "Session deleted"}


@router.get("/{session_id}/report")
def generate_session_report(
    session_id: UUID,
    user_id: Optional[UUID] = None,
    db: Session = Depends(get_db),
):
    return build_session_report_pdf(
        db=db, 
        session_id=session_id,
        user_id=user_id
    )
    
