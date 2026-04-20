from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from typing import List

import schemas
from dependencies import get_db
from services.career.answer_service import (
    submitAnswers
)
from services.career.evaluation_service import (
    evaluate_career_track,
    get_career_track_results,
)

router = APIRouter(
    prefix="/career/answers",
    tags=["career_answers"]
)


@router.post("/{session_id}", response_model=list[schemas.CareerAnswerRead])
def submit_career_answer(
    session_id: UUID,
    payload: schemas.CareerAnswerCreate,
    db: Session = Depends(get_db)
):
    try:
        return submitAnswers(db, str(session_id), payload.answers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/{session_id}/evaluate", response_model=schemas.CareerEvaluationRead)
def evaluate_career_quiz_for_session(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        return evaluate_career_track(db, str(session_id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{session_id}/results", response_model=schemas.CareerEvaluationRead)
def get_career_quiz_results_for_session(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        return get_career_track_results(db, str(session_id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))