from fastapi import APIRouter, Depends
from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from schemas import SAQuestionOut
from services.skill_assessment.questions_service import ai_generate_questions
from dependencies import get_db

router = APIRouter(prefix="/skill-assessment", tags=["Skill Assessment"])


@router.post("/generate")
def generate_questions(
    skill_id: UUID,
    db: Session = Depends(get_db),
):
    return ai_generate_questions(db=db, skill_id=skill_id)