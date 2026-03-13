import json
from typing import List
from ai.schemas import *


# ============================================================
# Extract CV
# ============================================================
def extract_cv_prompt(cv_text: str) -> str:
    return (
        "You are an advanced CV parsing engine.\n\n"
        "Extract structured information from the CV text below.\n\n"
        "IMPORTANT RULES:\n"
        "- Return ONLY valid JSON.\n"
        "- Do NOT include explanations or markdown.\n"
        "- Do NOT omit fields.\n"
        "- If a section does not exist, return an empty array [].\n"
        "- If a field does not exist, return empty string \"\".\n"
        "- Follow the schema EXACTLY.\n\n"
        f"SCHEMA:\n{json.dumps(cv_schema, indent=2)}\n\n"
        f"CV TEXT:\n{cv_text}"
    )


# ============================================================
# Evaluate Answer
# ============================================================
def evaluate_answer_prompt(
    question_text: str,
    user_answer: str,
    interview_type: str,
    is_followup: bool
) -> str:

    followup_instruction = (
        "If the answer is incomplete or unclear, Only if necessary set followup_required to true.\n"
        if is_followup
        else ""
    )

    return (
        f"Question:\n{question_text}\n\n"
        f"User Answer:\n{user_answer}\n\n"
        "Role:\n"
        f"You are a friendly, professional {interview_type} interviewer.\n\n"
        "Objective:\n"
        "Evaluate the user's answer naturally and professionally.\n\n"
        "Instructions:\n"
        "- Score from 0 to 5 (integer only)\n"
        "- Provide constructive feedback\n"
        "- Provide clear improvement suggestions\n"
        f"- {followup_instruction}\n"
        "Return ONLY valid JSON following this exact schema:\n"
        f"{json.dumps(evaluate_answer_schema, indent=2)}\n\n"
        "IMPORTANT:\n"
        "- No markdown\n"
        "- No extra text\n"
        "- No additional keys\n"
        "- Output must be valid JSON"
    )


# ============================================================
# Interview Session
# ============================================================
def interview_session_fields_prompt(session_json: dict) -> str:
    return (
        f"You are an advanced interview report generator.\n\n"
        f"You are given a JSON of an interview session summary:\n{json.dumps(session_json, indent=2)}\n\n"
        f"Your task is to read it concisely and generate a report filling the following schema exactly:\n{json.dumps(interview_session_schema, indent=2)}\n\n"
        f"IMPORTANT RULES:\n"
        "- Return ONLY valid JSON.\n"
        "- Auto enumerate questions.\n"
        "- The score of each question is out of 5. \n"
        "- Overall score is out of (number of questions * 5).\n"
        "- Do NOT include explanations, markdown, or extra text.\n"
        "- If a section does not exist, return an empty array [].\n"
        "- If a field does not exist, return an empty string \"\".\n"
        "- Follow the schema EXACTLY."
    )


# ============================================================
# Skill Assessment
# ============================================================
def skill_assessment_questions_prompt(skill_name: str) -> str:
    return (
        "You are an expert Skill Assessment Question Generator.\n\n"
        "Your task is to generate exactly 10 high-quality assessment questions "
        "to evaluate the given skill.\n\n"
        f"Skill Name: {skill_name}\n\n"
        "The output MUST strictly follow this JSON schema:\n"
        f"{json.dumps(skill_assessment_questions_schema, indent=2)}\n\n"
        "CRITICAL INSTRUCTIONS:\n"
        "1. Return ONLY valid JSON.\n"
        "2. Do NOT include markdown.\n"
        "3. Do NOT include explanations.\n"
        "4. Do NOT include additional keys.\n"
        "5. Generate exactly 10 questions.\n"
        "6. Questions must be clear, unambiguous, and suitable for skill evaluation.\n"
        "7. Difficulty should vary (basic, intermediate, advanced).\n"
    )

def skill_assessment_evaluation_prompt(answers: List[dict]) -> str:
    return (
        "You are an expert technical interviewer.\n\n"
        "Evaluate each answer and score it from 0 to 10.\n"
        "Then determine the overall proficiency level.\n\n"
        "Proficiency Levels:\n"
        "- Beginner\n"
        "- Intermediate\n"
        "- Advanced\n\n"
        f"Answers:\n{json.dumps(answers, indent=2)}\n\n"
        "Return ONLY valid JSON following this schema exactly:\n"
        f"{json.dumps(skill_assessment_evaluation_schema, indent=2)}"
    )