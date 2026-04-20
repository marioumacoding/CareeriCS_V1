from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from typing import List

import schemas
from dependencies import get_db
from services.career.question_service import (
    get_questions_for_cards,
    get_questions_for_session,
    create_questions_multiple_cards
)

router = APIRouter(
    prefix="/career/questions",
    tags=["career_questions"]
)



@router.get("/{session_id}", response_model=List[schemas.CareerQuestionResponse])
def get_career_questions_for_session(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    return get_questions_for_session(db, str(session_id))


@router.get("/{session_id}/card/{card_id}", response_model=List[schemas.CareerQuestionResponse])
def get_career_questions_for_card(
    session_id: UUID,
    card_id: UUID,
    card_type: str,
    db: Session = Depends(get_db)
):
    _ = session_id
    return get_questions_for_cards(db, str(card_id), card_type)


@router.post("/{type}", response_model=list[schemas.CareerQuestionResponse])
def create_questions_multiple(
    type: str,
    payload: schemas.CareerQuestionsCreateMultiple,
    db: Session = Depends(get_db)
):
    return create_questions_multiple_cards(
        db=db,
        cards_data=[card.dict() for card in payload.cards],
        type=type
    )
