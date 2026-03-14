# api/followup.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from dependencies import get_db  # your DB session dependency
from services.interview.followup_service import get_followup_by_answer_id
from schemas import FollowupRead
from uuid import UUID

router = APIRouter(prefix="/followups", tags=["Followups"])

@router.get("/{answer_id}", response_model=FollowupRead | None)
def fetch_followup(answer_id: UUID, db: Session = Depends(get_db)):
    
    followup = get_followup_by_answer_id(db, answer_id)
    if not followup:
        return None
    return followup