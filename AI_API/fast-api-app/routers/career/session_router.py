from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from typing import List

import schemas
from dependencies import get_db
from services.career.session_service import (
    create_session,
    get_session,
    update_session_status,
    get_user_sessions
)

router = APIRouter(
    prefix="/career/sessions",
    tags=["career_sessions"]
)

@router.post("/", response_model=schemas.CareerSessionRead)
def create_career_session(
    payload: schemas.CareerSessionCreate,
    db: Session = Depends(get_db)
):
    return create_session(db, payload.user_id)

@router.get("/user/{user_id}", response_model=List[schemas.CareerSessionRead])
def get_career_sessions_by_user(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    return get_user_sessions(db, user_id)

@router.get("/{session_id}", response_model=schemas.CareerSessionRead)
def get_career_session(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    session = get_session(db, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session

@router.put("/{session_id}/status", response_model=schemas.CareerSessionRead)
def update_career_session_status(
    session_id: UUID,
    payload: schemas.CareerSessionStatusUpdate,
    db: Session = Depends(get_db)
):
    session = update_session_status(db, session_id, payload.status)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session