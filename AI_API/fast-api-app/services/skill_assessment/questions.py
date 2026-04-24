from sqlalchemy.orm import Session
from uuid import uuid4
from ai.completion import deepseek_response
from ai.prompts import skill_assessment_questions_prompt
from db.models import AssessmentQuestion, AssessmentSession, Roadmap, RoadmapSection, RoadmapStep, Skill
from schemas import AssessmentQuestionResponse
from utils.util import _safe_json_parse

# -------------------------
# Generate and Save Questions
# -------------------------
def generate_and_save_questions(db: Session, session_id: str, id: str, num_questions: int):
    session = db.query(AssessmentSession).filter_by(id=session_id).first()
    if not session:
        raise ValueError("Assessment session not found")

    session_type = (session.type or "").strip().lower()
    if session_type == "skill":
        session_type = "skills"

    if session_type == "skills":
        skill = db.query(Skill).filter_by(id=id).first()
        if not skill:
            raise ValueError("Skill not found for assessment question generation")
        name = skill.skill_name

    elif session_type == "roadmap":
        roadmap = db.query(Roadmap).filter_by(id=id).first()
        if not roadmap:
            raise ValueError("Roadmap not found for assessment question generation")
        name = roadmap.title

    elif session_type == "section":
        section = db.query(RoadmapSection).filter_by(id=id).first()
        if not section:
            raise ValueError("Roadmap section not found for assessment question generation")

        roadmap = db.query(Roadmap).filter_by(id=section.roadmap_id).first()
        if not roadmap:
            raise ValueError("Roadmap not found for selected section")

        name = f"{roadmap.title}: {section.title}"

    elif session_type == "step":
        step = db.query(RoadmapStep).filter_by(id=id).first()
        if not step:
            raise ValueError("Roadmap step not found for assessment question generation")

        section = db.query(RoadmapSection).filter_by(id=step.section_id).first()
        if not section:
            raise ValueError("Roadmap section not found for selected step")

        roadmap = db.query(Roadmap).filter_by(id=section.roadmap_id).first()
        if not roadmap:
            raise ValueError("Roadmap not found for selected step")

        name = f"{roadmap.title}: {section.title} ({step.title})"

    else:
        raise ValueError("Invalid type. Must be one of: skills, roadmap, section, step.")
        
    prompt = skill_assessment_questions_prompt(name, num_questions)
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