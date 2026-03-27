from sqlalchemy.orm import Session as DBSession
from sqlalchemy import func
from typing import List
from fastapi import HTTPException
import db.models as models
import schemas
from utils.util import _generate_tts
from core.config import settings
from uuid import UUID


# -----------------------------
# Create Single Question
# -----------------------------
def create_question_service(
    db: DBSession,
    payload: schemas.QuestionCreate
) -> models.Question:

    audio_filename = (
        payload.question_audio
        or _generate_tts(payload.question_text, settings.AUDIO_PATHS["questions"])
    )

    question = models.Question(
        type=payload.type,
        question_text=payload.question_text,
        question_audio=audio_filename,
    )

    db.add(question)
    db.commit()
    db.refresh(question)

    return question


# -----------------------------
# Get All Questions
# -----------------------------
def get_questions_service(db: DBSession) -> List[models.Question]:
    return db.query(models.Question).all()


# -----------------------------
# Get Questions By Type
# -----------------------------
def get_questions_by_type_service(
    db: DBSession,
    question_type: str
) -> List[models.Question]:

    questions = (
        db.query(models.Question)
        .filter(func.lower(models.Question.type) == question_type.lower())
        .all()
    )

    if not questions:
        raise HTTPException(
            status_code=404,
            detail="No questions found for this type"
        )

    return questions


# -----------------------------
# Get Question By ID
# -----------------------------
def get_question_service(
    db: DBSession,
    question_id: UUID
) -> models.Question:
    question = db.get(models.Question, question_id)

    if not question:
        raise HTTPException(
            status_code=404, 
            detail="Question not found"
        )

    return question


# -----------------------------
# Mass Create Questions
# -----------------------------
def create_mass_questions_service(
    db: DBSession,
    payload: List[schemas.QuestionCreate]
) -> List[models.Question]:

    created_questions = []

    for q in payload:
        audio_filename = (
            q.question_audio
            or _generate_tts(q.question_text, settings.AUDIO_PATHS["questions"])
        )

        question = models.Question(
            type=q.type,
            question_text=q.question_text,
            question_audio=audio_filename
        )

        db.add(question)
        created_questions.append(question)

    db.commit()

    for q in created_questions:
        db.refresh(q)

    return created_questions