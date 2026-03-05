from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import delete
from uuid import UUID

from db.models import SAAnswer
from schemas import SAAnswerSubmit
from .evaluate_service import evaluate_skill_assessment


def submit_skill_assessment_answers(
    db: Session,
    user_id: UUID,
    skill_id: UUID,
    answers: List[SAAnswerSubmit]
):
    question_ids = [a.question_id for a in answers]

    db.execute(
        delete(SAAnswer).where(
            SAAnswer.user_id == user_id,
            SAAnswer.question_id.in_(question_ids)
        )
    )

    saved_answers = []

    for ans in answers:
        db_answer = SAAnswer(
            user_id=user_id,
            question_id=ans.question_id,
            answer_text=ans.answer_text,
            score=0.0
        )

        db.add(db_answer)
        saved_answers.append(db_answer)

    db.commit()

    for a in saved_answers:
        db.refresh(a)

    evaluate_skill_assessment(db, user_id, skill_id)

    return {
        "message": "Answers submitted successfully",
        "answers_saved": len(saved_answers)
    }