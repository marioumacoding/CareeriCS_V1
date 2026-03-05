from sqlalchemy.orm import Session

from uuid import UUID
from typing import List, Dict

from db.models import (
    SAAnswer,
    SAQuestion,
    UserSkill
)

from ai.prompts import skill_assessment_evaluation_prompt
from ai.completion import deepseek_response

import json
import re
from typing import Any

def _safe_json_parse(raw_text: str) -> Any:
    raw_text = raw_text.strip()

    match = re.search(r"\{.*\}", raw_text, re.DOTALL)
    if not match:
        raise ValueError("No valid JSON object found in AI output")

    return json.loads(match.group())


def evaluate_skill_assessment(
    db: Session,
    user_id: UUID,
    skill_id: UUID
):

    results = (
        db.query(SAAnswer, SAQuestion)
        .join(SAQuestion, SAAnswer.question_id == SAQuestion.id)
        .filter(SAAnswer.user_id == user_id)
        .filter(SAQuestion.skill_id == skill_id)
        .all()
    )

    payload = []

    for answer, question in results:
        payload.append({
            "question_id": str(question.id),
            "question_text": question.question_text,
            "answer_text": answer.answer_text
        })

    prompt = skill_assessment_evaluation_prompt(payload)

    ai_response = deepseek_response(prompt)


    evaluated = _safe_json_parse(ai_response)

    if isinstance(evaluated, list):
        evaluated = {
            "answers": evaluated,
            "proficiency": "Beginner"  
        }

    for item in evaluated["answers"]:
        db.query(SAAnswer).filter(
            SAAnswer.user_id == user_id,
            SAAnswer.question_id == item["question_id"]
        ).update({
            "score": item["score"],
            "feedback": item["feedback"]
        })

    db.query(UserSkill).filter(
        UserSkill.user_id == user_id,
        UserSkill.skill_id == skill_id
    ).update({
        "proficiency": evaluated["proficiency"]
    })

    db.commit()

    return {
        "message": "Skill assessment evaluated successfully",
        "answers_evaluated": len(evaluated["answers"]),
        "proficiency": evaluated["proficiency"]
    }