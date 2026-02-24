from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
import schemas
from dependencies import get_db
from services.interview.question_service import *

router = APIRouter(
    prefix="/questions",
    tags=["Questions"]
)


@router.post("/", response_model=schemas.QuestionRead)
def create_question(payload: schemas.QuestionCreate, db: Session = Depends(get_db)):
    return create_question_service(db, payload)


@router.get("/", response_model=List[schemas.QuestionRead])
def get_questions(db: Session = Depends(get_db)):
    return get_questions_service(db)


@router.get("/type/{question_type}", response_model=List[schemas.QuestionRead])
def get_questions_by_type(question_type: str, db: Session = Depends(get_db)):
    return get_questions_by_type_service(db, question_type)


@router.get("/{question_id}", response_model=schemas.QuestionRead)
def get_question(question_id: int, db: Session = Depends(get_db)):
    return get_question_service(db, question_id)


@router.post("/mass_create/", response_model=List[schemas.QuestionRead])
def create_mass_questions(
    payload: List[schemas.QuestionCreate],
    db: Session = Depends(get_db)
):
    return create_mass_questions_service(db, payload)