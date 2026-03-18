from sqlalchemy.orm import Session
from uuid import uuid4
from ai.completion import deepseek_response
from ai.prompts import skill_assessment_questions_prompt
from db.models import AssessmentQuestion, Skill
from schemas import AssessmentQuestionResponse
from utils.util import _safe_json_parse

# -------------------------
# Generate and Save Questions
# -------------------------
def generate_and_save_questions(db: Session, session_id: str, skill_id: str, num_questions: int):
    
    skill_name = db.query(Skill).filter_by(id=skill_id).first().skill_name
    prompt = skill_assessment_questions_prompt(skill_name, num_questions)
    raw_output = deepseek_response(prompt)
    ai_questions = _safe_json_parse(raw_output)
    question_objects = [
        AssessmentQuestion(
            id=uuid4(),
            session_id=session_id,
            question_text=q["question"],
            options=q["options"],
            correct_answer=q["correct_answer"],
            explanation=q.get("explanation"),
            difficulty=q.get("difficulty")
        )
        for q in ai_questions
    ]
    db.bulk_save_objects(question_objects)
    db.commit()


# -------------------------
# Fetch Questions for Response
# -------------------------
def get_questions_response(db: Session, session_id: str) -> list[AssessmentQuestionResponse]:
    questions = db.query(AssessmentQuestion).filter_by(session_id=session_id).all()
    return [
        AssessmentQuestionResponse(
            id=q.id,
            question_text=q.question_text,
            options=q.options
        )
        for q in questions
    ]