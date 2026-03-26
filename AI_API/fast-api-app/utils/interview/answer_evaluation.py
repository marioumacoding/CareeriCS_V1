import json
from ai.prompts import evaluate_answer_prompt
from ai.completion import qwen_response


def evaluate_answer_service(
    question_text: str,
    user_answer: str,
    interview_type: str,
    is_followup: bool,
):
    prompt = evaluate_answer_prompt(
        question_text=question_text,
        user_answer=user_answer,
        interview_type=interview_type,
        is_followup=is_followup
    )

    raw_response = qwen_response(prompt)

    try:
        parsed = json.loads(raw_response)
    except json.JSONDecodeError:
        raise ValueError("Invalid JSON returned from model")

    required_keys = {"score", "feedback", "improvement", "followup_required"}
    if not required_keys.issubset(parsed.keys()):
        raise ValueError("Model output missing required keys")

    return parsed