from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List

from db.models import Skill, SkillMapping, UserSkill
from schemas import SkillCreate
from utils.util import _safe_json_parse
from ai.completion import deepseek_response
from ai.prompts import skill_mapping_prompt


def create_skill(db: Session, skill_data: SkillCreate) -> Skill:
    existing = db.query(Skill).filter(
        Skill.skill_name == skill_data.skill_name
    ).first()

    if existing:
        raise ValueError("Skill already exists")

    new_skill = Skill(skill_name=skill_data.skill_name)
    db.add(new_skill)
    db.commit()
    db.refresh(new_skill)

    return new_skill



def create_skills_bulk(db: Session, skills_data: List[SkillCreate]) -> List[Skill]:
    created_skills = []

    for skill_data in skills_data:
        existing = db.query(Skill).filter(
            Skill.skill_name == skill_data.skill_name
        ).first()

        if existing:
            continue

        new_skill = Skill(skill_name=skill_data.skill_name)
        db.add(new_skill)
        created_skills.append(new_skill)

    db.commit()

    for skill in created_skills:
        db.refresh(skill)

    return created_skills



def get_global_skills_as_dict(db: Session) -> dict:
    skills = db.query(Skill).all()

    return {
        "global_skills": [
            {
                "id": str(skill.id),
                "skill_name": skill.skill_name
            }
            for skill in skills
        ]
    }



def get_extracted_skills_as_dict(db: Session, user_id: str) -> dict:
    mappings = db.query(SkillMapping).filter(
        SkillMapping.user_id == user_id
    ).all()

    return {
        "extracted_skills": [
            {
                "id": str(mapping.id),
                "skill_name": mapping.skill_name
            }
            for mapping in mappings
        ]
    }



def map_skills(db: Session, user_id: str) -> dict:
    extracted_skills_json = get_extracted_skills_as_dict(db, user_id)
    global_skills_json = get_global_skills_as_dict(db)

    prompt = skill_mapping_prompt(extracted_skills_json, global_skills_json)
    raw_output = deepseek_response(prompt)

    mapped_skills_json = _safe_json_parse(raw_output)

    if not isinstance(mapped_skills_json, dict):
        raise ValueError("Model returned invalid JSON format.")

    return mapped_skills_json



def save_mapped_skills_to_db(db: Session, user_id: str) -> None:
    mapped_skills_json = map_skills(db, user_id)
    mappings = mapped_skills_json.get("mappings", [])

    existing_skill_ids = {
        str(skill.skill_id)
        for skill in db.query(UserSkill)
        .filter(UserSkill.user_id == user_id)
        .all()
    }

    for item in mappings:
        matched_skill_id = item.get("matched_skill_id")

        if not matched_skill_id:
            continue

        if matched_skill_id in existing_skill_ids:
            continue

        db.add(
            UserSkill(
                user_id=user_id,
                skill_id=matched_skill_id,
                isCV=True
            )
        )

    db.commit()