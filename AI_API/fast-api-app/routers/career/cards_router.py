from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from typing import List

import schemas
from dependencies import get_db
from services.career.card_service import (
    get_cards_by_type,
    add_card,
    get_selected_cards,
    select_cards
)

router = APIRouter(
    prefix="/career/cards",
    tags=["career_cards"]
)

@router.get("/{card_type}", response_model=List[schemas.CareerCardRead])
def get_cards(
    card_type: str,
    db: Session = Depends(get_db)
):
    try:
        return get_cards_by_type(db, card_type)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/{card_type}", response_model=schemas.CareerCardRead)
def create_card(
    card_type: str,
    payload: schemas.CareerCardCreate,
    db: Session = Depends(get_db)
):
    try:
        return add_card(db, card_type, payload.name, payload.description)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.get("/selected/{session_id}", response_model=List[schemas.CareerSelectedCardRead])
def get_selected_cards_for_session(
    session_id: UUID,
    db: Session = Depends(get_db)
):
    return get_selected_cards(db, str(session_id))

@router.post("/select/{session_id}", response_model=List[schemas.CareerSelectedCardRead])
def select_cards_for_session(
    session_id: UUID,
    payload: schemas.CareerCardSelectionMultiple,  
    db: Session = Depends(get_db)
):

    try:
        return select_cards(db, str(session_id), payload.cards)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))