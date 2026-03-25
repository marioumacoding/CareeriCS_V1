from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
from typing import List

from db.models import AssessmentSession
from schemas import AssessmentSessionSummary, StartAssessmentResponse
from services.skill_assessment.questions import generate_and_save_questions, get_questions_response


def start_session(db: Session, user_id: str, skill_id: str, num_questions: int) -> StartAssessmentResponse:
    
    session_id = uuid4()
    session = AssessmentSession(
        id=session_id,
        user_id=user_id,
        skill_id=skill_id,
        total_questions=num_questions,
        started_at=datetime.utcnow(),
        status="in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generate and save questions in bulk
    generate_and_save_questions(db, session_id, skill_id, num_questions)

    # Prepare response for frontend
    questions_response = get_questions_response(db, session_id)
    return StartAssessmentResponse(session_id=session_id, questions=questions_response)


def list_user_sessions(db: Session, user_id: str, limit: int = 20) -> List[AssessmentSessionSummary]:
    sessions = (
        db.query(AssessmentSession)
        .filter(AssessmentSession.user_id == user_id)
        .order_by(AssessmentSession.started_at.desc())
        .limit(limit)
        .all()
    )
    return sessions