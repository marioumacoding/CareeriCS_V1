from sqlalchemy.orm import Session
from uuid import uuid4
from db.models import CareerAnswer, CareerQuestion


# Submit answers for a session
def submitAnswers(db: Session, session_id: str, answers: list[dict]):
    submitted_answers = []
    for ans in answers:
        answer = CareerAnswer(
            id=uuid4(),
            session_id=session_id,
            question_id=ans.question_id,
            answer=ans.answer
        )
        db.add(answer)
        submitted_answers.append(answer)
    db.commit()
    for ans in submitted_answers:
        db.refresh(ans)

    return submitted_answers


# Get questions and answers for a session
def get_questions_and_answers_for_session(db: Session, session_id: str):
    answers = db.query(CareerAnswer).filter_by(session_id=session_id).all()
    result = []
    for ans in answers:
        question = db.query(CareerQuestion).filter_by(id=ans.question_id).first()
        result.append({
            "question": question.text if question else "Unknown Question",
            "answer": ans.answer
        })
    return result