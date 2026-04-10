from fastapi import APIRouter, Body, Depends, HTTPException
from uuid import UUID
from sqlalchemy.orm import Session
from typing import List
from services.skill_assessment.sessions import list_user_sessions, start_session
from schemas import AssessmentSessionSummary, StartAssessmentRequest, StartAssessmentResponse
from dependencies import get_db

router = APIRouter(prefix="/skill_assessment/session", tags=["Skill Assessment Session"])


@router.post("/start/{user_id}", response_model=StartAssessmentResponse)
async def start_session_endpoint(
    user_id: UUID,
    payload: StartAssessmentRequest = Body(...),
    db: Session = Depends(get_db)
):
    try:
        return start_session(db, str(user_id), payload.target_id, payload.num_questions, payload.session_type)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/user/{user_id}", response_model=List[AssessmentSessionSummary])
async def list_user_sessions_endpoint(
    user_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        return list_user_sessions(db, str(user_id))
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))