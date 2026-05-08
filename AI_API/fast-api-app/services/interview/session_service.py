from typing import List

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

import db.models as models
import schemas
from uuid import UUID

# ---------------------
# Create Session
# ---------------------
def create_session_service(
    db: Session, payload: schemas.SessionCreate
) -> models.Session:
    session = models.Session(**payload.dict())
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


# ---------------------
# Get Sessions by User
# ---------------------
def get_sessions_by_user_service(
    db: Session, user_id: UUID
) -> List[models.Session]:

    sessions = (
        db.query(models.Session)
        .filter(models.Session.user_id == user_id)
        .all()
    )

    if not sessions:
        raise HTTPException(
            status_code=404,
            detail="No sessions found for this user",
        )

    return sessions


# ---------------------
# Get Session by ID
# ---------------------
def get_session_by_id_service(
    db: Session, session_id: UUID
) -> models.Session:

    session = db.get(models.Session, session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return session


def update_session_service(
    db: Session,
    session_id: UUID,
    payload: schemas.SessionUpdate,
) -> models.Session:
    session = db.get(models.Session, session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    updates = payload.model_dump(exclude_unset=True)
    for field_name, value in updates.items():
        setattr(session, field_name, value)

    db.commit()
    db.refresh(session)
    return session


# ---------------------
# Delete Session
# ---------------------
def delete_session_service(
    db: Session, session_id: UUID
) -> None:

    session = db.get(models.Session, session_id)

    if not session:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    db.delete(session)
    db.commit()


# ---------------------
# Export Session Fields
# ---------------------
def export_session_fields(
    db: Session, session_id: UUID
):

    session_obj = (
        db.query(models.Session)
        .options(
            joinedload(models.Session.user),
            joinedload(models.Session.answers)
            .joinedload(models.Answer.question),
        )
        .filter(models.Session.id == session_id)
        .first()
    )

    if not session_obj:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    return {
        "full_name": session_obj.user.full_name
        if session_obj.user
        else None,
        "session_name": session_obj.name,
        "session_type": session_obj.type,
        "questions": [
            {
                "question_text": ans.question.question_text
                if ans.question
                else "",
                "answer_text": ans.answer_text or "",
                "feedback": ans.feedback or "",
                "grade": ans.grade,
                "emotion_evaluation": ans.emotion_evaluation or {},
                "tone_evaluation": ans.tone_evaluation or {},
                "sentiment_evaluation": ans.sentiment_evaluation or {},
            }
            for ans in session_obj.answers
        ],
    }
