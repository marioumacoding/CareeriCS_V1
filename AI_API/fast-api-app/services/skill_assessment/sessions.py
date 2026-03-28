from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
from typing import List

from db.models import AssessmentSession
from schemas import AssessmentSessionSummary, StartAssessmentResponse
from services.skill_assessment.questions import generate_and_save_questions, get_questions_response


def start_session(
    db: Session,
    user_id: str,
    target_id: str,  # could be skill_id, roadmap_id, section_id, or step_id
    num_questions: int,
    session_type: str
) -> StartAssessmentResponse:
    
    # Validate session_type
    if session_type not in ("skills", "roadmap", "section", "step"):
        raise ValueError("Invalid session type")

    session_id = uuid4()

    # Assign appropriate foreign keys
    session_data = {
        "id": session_id,
        "user_id": user_id,
        "total_questions": num_questions,
        "status": "in_progress",
        "type": session_type
    }

    if session_type == "skills":
        session_data["skill_id"] = target_id
    elif session_type == "roadmap":
        session_data["roadmap_id"] = target_id
    elif session_type == "section":
        session_data["section_id"] = target_id
    elif session_type == "step":
        session_data["step_id"] = target_id

    session = AssessmentSession(**session_data)
    db.add(session)
    db.commit()
    db.refresh(session)

    # Generate questions via AI or DB
    generate_and_save_questions(db, session_id, target_id, num_questions)

    # Prepare frontend response
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