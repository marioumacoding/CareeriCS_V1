import json
from typing import List
from ai.schemas import *


# ============================================================
# Extract CV
# ============================================================
def extract_cv_prompt(cv_text: str) -> str:
    return (
        "You are an advanced CV Extractor engine.\n\n"
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
# Enhance CV
# ============================================================
def enhance_cv_prompt(cv_text: str) -> str:
    return (
        "You are an advanced CV Enhancer engine.\n\n"
        "Directly improve the CV text below by:\n"
        "- Rewriting descriptions for clarity, impact, and professionalism.\n"
        "- Highlighting skills and achievements.\n"
        "- Normalizing formatting, dates, and titles.\n"
        "- Completing missing fields when possible.\n\n"
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
        "If the answer, is clear enough but could be improved, or is missing key details, set followup_required to true and provide a specific improvement suggestion in the improvement field.\n"
        "If the answer is clear and complete, set followup_required to false and leave improvement field empty."
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
def skill_assessment_questions_prompt(skill_name: str, num_questions: int) -> str:
    return (
        "You are a Computer Science expert Skill Assessment Question Generator.\n\n"
        f"Generate {num_questions} multiple-choice questions to assess {skill_name} skill.\n\n"
        "Each question should have:\n"
        "- A clear and concise question text\n"
        "- 4 answer options\n"
        "- One correct answer\n"
        "- A brief explanation of the correct answer\n\n"
        "Return ONLY valid JSON in this format:\n"
        f"{json.dumps(skill_assessment_questions_schema, indent=2)}\n\n"
        "IMPORTANT:\n"
        "- No markdown\n"
        "- No extra text\n"
        "- Output must be valid JSON"
    )


# ============================================================
# Career Quiz Evaluation
# ============================================================
def career_quiz_evaluation_prompt(q_and_a: list[dict], selected_cards: list[dict], tracks: list[dict]):
    return (
        "You are a career counselor \n"
        "Based on the following questions and answers from a career quiz, and the selected cards representing hobbies and technical skills, recommend three career tracks that would be a good fit for the user. \n\n"
        "Questions and Answers:\n"        + "\n".join([f"Q: {item['question']} A: {item['answer']}" for item in q_and_a]) + "\n\n"
        "Selected Cards:\n" + "\n".join([f"{card['type']}: {card['name']}" for card in selected_cards]) + "\n\n"
        "Available Career Tracks:\n" + "\n".join([f"{track.name} id: {track.id}" for track in tracks]) + "\n\n"
        "Based on the above information, recommend three career tracks that would be a good fit for the user and explain why for each recommendation."
        "follow this exact schema for the output: \n"
        f"{json.dumps(career_quiz_evaluation_schema, indent=2)}\n\n"
        "IMPORTANT:\n"
        "- No markdown\n"
        "- No extra text\n"
        "- Output must be valid JSON"
    )