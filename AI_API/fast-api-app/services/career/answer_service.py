from typing import Any
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from db.models import CareerAnswer


def _extract_answer_field(answer: Any, field_name: str):
    if isinstance(answer, dict):
        return answer.get(field_name)
    return getattr(answer, field_name, None)


# Submit answers for a session
def submitAnswers(db: Session, session_id: str, answers: list[Any]):
    session_uuid = UUID(str(session_id))

    # Keep one answer set per session to support resubmission safely.
    db.query(CareerAnswer).filter(CareerAnswer.session_id == session_uuid).delete()

    submitted_answers = []
    for ans in answers:
        question_id = _extract_answer_field(ans, "question_id")
        answer_value = _extract_answer_field(ans, "answer")

        if question_id is None or answer_value is None:
            raise ValueError("Each answer must include question_id and answer")

        answer_int = int(answer_value)
        if answer_int < 1 or answer_int > 5:
            raise ValueError("Answer must be an integer between 1 and 5")

        answer = CareerAnswer(
            id=uuid4(),
            session_id=session_uuid,
            question_id=UUID(str(question_id)),
            answer=str(answer_int)
        )
        db.add(answer)
        submitted_answers.append(answer)
    db.commit()
    for ans in submitted_answers:
        db.refresh(ans)

    return submitted_answers


# Get questions and answers for a session
def get_questions_and_answers_for_session(db: Session, session_id: str):
    session_uuid = UUID(str(session_id))
    answers = db.query(CareerAnswer).filter_by(session_id=session_uuid).all()
    result = []
    for ans in answers:
        question = ans.question

        card_name = None
        if question:
            if question.hobby and question.hobby.name:
                card_name = question.hobby.name
            elif question.technical_skill and question.technical_skill.name:
                card_name = question.technical_skill.name

        try:
            parsed_answer = int(ans.answer)
        except (TypeError, ValueError):
            parsed_answer = ans.answer

        result.append({
            "card_name": card_name,
            "question_text": question.text if question else "Unknown Question",
            "question": question.text if question else "Unknown Question",
            "answer": parsed_answer
        })
    return result