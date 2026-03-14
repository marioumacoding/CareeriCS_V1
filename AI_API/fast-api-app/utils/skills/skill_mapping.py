from typing import List, Optional
from sqlalchemy.orm import Session
from rapidfuzz import process, fuzz
from db.models import Skill


def normalize_skill(text: str) -> str:
    if not text:
        return ""
    text = text.lower().strip()
    import re
    text = re.sub(r"\s+", " ", text)
    return text


def build_global_skill_index(db: Session):
    global_skills = db.query(Skill).all()
    exact_map = {normalize_skill(gs.skill_name): gs for gs in global_skills}
    skill_names = [normalize_skill(gs.skill_name) for gs in global_skills]
    return global_skills, exact_map, skill_names


def find_exact_match(extracted_skill: str, exact_map: dict) -> Optional[Skill]:
    normalized = normalize_skill(extracted_skill)
    return exact_map.get(normalized)


def find_fuzzy_match(
    extracted_skill: str,
    global_skills: List[Skill],
    skill_names: List[str],
    threshold: int = 85
) -> Optional[Skill]:
    normalized_input = normalize_skill(extracted_skill)

    # Only consider global skills >=3 characters
    filtered_names = [name for name in skill_names if len(name) >= 3]
    if not filtered_names:
        return None

    match = process.extractOne(normalized_input, filtered_names, scorer=fuzz.WRatio)
    if not match:
        return None

    best_name, score, index_in_filtered = match
    index_in_global = skill_names.index(best_name)
    if score >= threshold:
        return global_skills[index_in_global]

    return None


def map_skills_to_global(
    db: Session,
    extracted_skills: List[str],
    threshold: int = 85
) -> List[Skill]:
    global_skills, exact_map, skill_names = build_global_skill_index(db)
    mapped_results: List[Skill] = []

    # Track IDs added in this batch to prevent duplicates
    added_global_ids = set()

    for extracted_skill in extracted_skills:
        normalized = normalize_skill(extracted_skill)

        # Exact match
        global_skill = find_exact_match(normalized, exact_map)
        if global_skill:
            if global_skill.id not in added_global_ids:
                mapped_results.append(global_skill)
                added_global_ids.add(global_skill.id)
            continue

        # Fuzzy match
        global_skill = find_fuzzy_match(normalized, global_skills, skill_names, threshold)
        if global_skill:
            if global_skill.id not in added_global_ids:
                mapped_results.append(global_skill)
                added_global_ids.add(global_skill.id)
            continue

        # Create new global skill
        new_global_skill = Skill(skill_name=extracted_skill)
        db.add(new_global_skill)
        db.flush()
        db.refresh(new_global_skill)

        mapped_results.append(new_global_skill)
        added_global_ids.add(new_global_skill.id)

        # Update local indexes
        global_skills.append(new_global_skill)
        skill_names.append(normalized)
        exact_map[normalized] = new_global_skill

    db.commit()
    return mapped_results