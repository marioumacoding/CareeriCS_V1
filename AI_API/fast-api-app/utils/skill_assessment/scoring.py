from typing import List

def calculate_score(user_answers: List[dict]) -> int:
    """
    Calculates percentage score from user answers.
    Each dict in user_answers: {'is_correct': True/False}
    """
    if not user_answers:
        return 0
    total = len(user_answers)
    correct = sum(1 for ans in user_answers if ans.get("is_correct"))
    return round((correct / total) * 100)


def score_to_proficiency(score: int) -> str:
    """
    Converts a numeric score into a proficiency level.
    """
    if score >= 80:
        return "advanced"
    elif score >= 50:
        return "intermediate"
    else:
        return "beginner"