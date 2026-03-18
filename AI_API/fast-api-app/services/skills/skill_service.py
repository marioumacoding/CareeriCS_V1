from sqlalchemy.orm import Session
from sqlalchemy import delete, update
from typing import List

from db.models import Skill, UserSkill
from schemas import SkillCreate

from utils.util import (
    map_skills_to_global,
)


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


# ============================================================
# Skill Mapping 
# ============================================================
def save_mapped_skills_to_db(
    db: Session,
    user_id: str,
    extracted_skills: List[str]
) -> None:

    matched_skills = map_skills_to_global(db, extracted_skills)

    existing_skill_ids = {
        str(skill.skill_id)
        for skill in db.query(UserSkill)
        .filter(UserSkill.user_id == user_id)
        .all()
    }

    for skill in matched_skills:

        if str(skill.id) in existing_skill_ids:
            db.query(UserSkill).filter(
                UserSkill.user_id == user_id,
                UserSkill.skill_id == skill.id
            ).update({"isCV": True})
            continue

        db.add(
            UserSkill(
                user_id=user_id,
                skill_id=skill.id,
                isCV=True
            )
        )


# ============================================================
# Reset CV Skills
# ============================================================
def reset_user_cv_skills(db: Session, user_id):
    db.execute(
        delete(UserSkill)
        .where(UserSkill.user_id == user_id)
        .where(UserSkill.proficiency == None)
    )

    db.execute(
        update(UserSkill)
        .where(UserSkill.user_id == user_id)
        .values(isCV=False)
    )

    db.commit()
