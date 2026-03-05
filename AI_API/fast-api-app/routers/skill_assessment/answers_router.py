from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from dependencies import get_db
from schemas import SAAnswerSubmitRequest
from services.skill_assessment.answers_service import submit_skill_assessment_answers

router = APIRouter(prefix="/skill-assessment", tags=["Skill Assessment"])


@router.post("/submit")
def submit_skill_assessment(
    payload: SAAnswerSubmitRequest,
    db: Session = Depends(get_db)
):
    return submit_skill_assessment_answers(
        db=db,
        user_id=payload.user_id,
        skill_id=payload.skill_id,
        answers=payload.answers
    )