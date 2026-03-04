import re
from typing import List, Optional
from sqlalchemy.orm import Session
from rapidfuzz import process, fuzz
from db.models import Skill


# ------------------------------------------------------------
# Build Global Skill Index
# ------------------------------------------------------------
def build_global_skill_index(db: Session):
    skills = db.query(Skill).all()

    exact_map = {
        normalize_skill(skill.skill_name): skill
        for skill in skills
    }

    skill_names = [normalize_skill(skill.skill_name) for skill in skills]

    return skills, exact_map, skill_names


# ------------------------------------------------------------
# Text Normalization
# ------------------------------------------------------------
def normalize_skill(text: str) -> str:
    if not text:
        return ""

    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)
    return text


# ------------------------------------------------------------
# Find Exact Match
# ------------------------------------------------------------
def find_exact_match(skill_name: str, exact_map: dict):
    normalized = normalize_skill(skill_name)
    return exact_map.get(normalized)


# ------------------------------------------------------------
# Find Fuzzy Match
# ------------------------------------------------------------
def find_fuzzy_match(
    skill_name: str,
    skills: List[Skill],
    skill_names: List[str],
    threshold: int = 85
) -> Optional[Skill]:

    normalized_input = normalize_skill(skill_name)

    if len(normalized_input) > 3:
        return None

    match = process.extractOne(
        normalized_input,
        skill_names,
        scorer=fuzz.WRatio
    )

    if not match:
        return None

    best_name, score, index = match

    if score >= threshold:
        return skills[index]

    return None


# ------------------------------------------------------------
# Main Mapping Function
# ------------------------------------------------------------
def map_skills_to_global(
    db: Session,
    extracted_skills: List[str],
    threshold: int = 85
) -> List[Skill]:

    skills, exact_map, skill_names = build_global_skill_index(db)

    mapped_results = []

    for skill_name in extracted_skills:

        exact = find_exact_match(skill_name, exact_map)
        if exact:
            mapped_results.append(exact)
            continue

        
        fuzzy = find_fuzzy_match(
            skill_name,
            skills,
            skill_names,
            threshold
        )

        if fuzzy:
            mapped_results.append(fuzzy)

    return mapped_results