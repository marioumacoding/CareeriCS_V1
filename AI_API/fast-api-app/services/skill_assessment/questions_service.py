from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from db.models import SAQuestion
from ai.prompts import skill_assessment_questions_prompt
from ai.completion import minimax_response
from utils.util import _safe_json_parse


def ai_generate_questions(
    db: Session,
    skill_id: UUID,
    num_questions: int = 10,
) -> List[SAQuestion]:

    prompt = skill_assessment_questions_prompt(str(skill_id))

    raw_response = minimax_response(prompt)

    generated_questions = _safe_json_parse(raw_response)

    if not isinstance(generated_questions, list):
        raise ValueError("AI output must be a list of questions")

    generated_questions = generated_questions[:num_questions]

    created_questions = []

    for question_data in generated_questions:
        question = SAQuestion(
            question_text=question_data["question_text"],
            skill_id=skill_id,
        )

        db.add(question)
        created_questions.append(question)

    db.commit()

    for question in created_questions:
        db.refresh(question)

    return created_questions