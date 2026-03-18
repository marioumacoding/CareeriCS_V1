from fastapi import APIRouter, Body, Depends, HTTPException
from uuid import UUID
from sqlalchemy.orm import Session
from services.skill_assessment.sessions import start_session
from schemas import StartAssessmentRequest, StartAssessmentResponse
from dependencies import get_db

router = APIRouter(prefix="/skill_assessment/session", tags=["Skill Assessment Session"])


@router.post("/start/{user_id}", response_model=StartAssessmentResponse)
async def start_session_endpoint(
    user_id: UUID,
    payload: StartAssessmentRequest = Body(...),
    db: Session = Depends(get_db)
):
    try:
        return start_session(db, str(user_id), payload.skill_id, payload.num_questions)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))