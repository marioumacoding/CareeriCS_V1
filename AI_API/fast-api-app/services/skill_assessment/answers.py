from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime
from db.models import AssessmentAnswer, AssessmentQuestion, AssessmentSession, UserSkill
from schemas import SubmitAssessmentResponse, AssessmentQuestionResult
from utils.util import calculate_score, score_to_proficiency


def submit_answers(db: Session, session_id: str, user_id: str, user_answers: list) -> SubmitAssessmentResponse:
    
    session = db.query(AssessmentSession).filter_by(id=session_id, user_id=user_id).first()
    if not session:
        raise ValueError("Assessment session not found")
    if session.status == "submitted":
        raise ValueError("Assessment already submitted")

    questions = db.query(AssessmentQuestion).filter_by(session_id=session_id).all()
    questions_map = {q.id: q for q in questions}

    answer_objects = []
    results = []
    for ans in user_answers:
        q = questions_map.get(ans["question_id"])
        if not q:
            continue  
        is_correct = ans["selected_answer"] == q.correct_answer
        answer_objects.append(
            AssessmentAnswer(
                id=uuid4(),
                session_id=session_id,
                question_id=q.id,
                selected_answer=ans["selected_answer"],
                is_correct=is_correct,
                answered_at=datetime.utcnow()
            )
        )
        results.append(
            AssessmentQuestionResult(
                question_id=q.id,
                selected_answer=ans["selected_answer"],
                correct_answer=q.correct_answer,
                explanation=q.explanation,
                is_correct=is_correct
            )
        )

    db.bulk_save_objects(answer_objects)

    score = calculate_score([{"is_correct": r.is_correct} for r in results])
    session.score = score
    session.status = "submitted"
    session.submitted_at = datetime.utcnow()
    db.commit()

    user_skill = db.query(UserSkill).filter_by(user_id=user_id, skill_id=session.skill_id).first()
    if user_skill:
        user_skill.score = score
        user_skill.proficiency = score_to_proficiency(score)
        db.commit()

    return SubmitAssessmentResponse(
        session_id=session_id,
        score=score,
        total_questions=len(results),
        results=results
    )


def get_results(db: Session, session_id: str, user_id: str) -> SubmitAssessmentResponse:
    session = db.query(AssessmentSession).filter_by(id=session_id, user_id=user_id).first()
    if not session or session.status != "submitted":
        raise ValueError("Results not available")

    answers = db.query(AssessmentAnswer).filter_by(session_id=session_id).all()
    questions = db.query(AssessmentQuestion).filter_by(session_id=session_id).all()
    questions_map = {q.id: q for q in questions}

    results = [
        AssessmentQuestionResult(
            question_id=a.question_id,
            selected_answer=a.selected_answer,
            correct_answer=questions_map[a.question_id].correct_answer,
            explanation=questions_map[a.question_id].explanation,
            is_correct=a.is_correct
        )
        for a in answers
    ]

    return SubmitAssessmentResponse(
        session_id=session_id,
        score=session.score,
        total_questions=session.total_questions,
        results=results
    )