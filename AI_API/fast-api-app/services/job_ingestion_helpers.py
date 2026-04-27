from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from db.models import JobPostSkill, Skill


def clean_text(text: Optional[str]) -> Optional[str]:
    if not text:
        return None

    cleaned = " ".join(
        text.replace("Show more", "").replace("Show less", "").split()
    ).strip()
    return cleaned or None


def normalize_skill_name(skill: Optional[str]) -> Optional[str]:
    if not skill:
        return None
    normalized = " ".join(skill.strip().lower().split())
    return normalized or None


def normalize_and_attach_skills(
    db: Session,
    job_post_id: UUID,
    skills: Optional[List[str]],
) -> Dict[str, int]:
    """
    Attach skills from unified Skill table to a job post.
    Creates new skills if they don't exist (case-insensitive).
    """
    skills_created = 0
    skills_linked = 0

    normalized_skills = sorted(
        {
            normalized
            for normalized in (normalize_skill_name(skill) for skill in (skills or []))
            if normalized
        }
    )

    for skill in normalized_skills:
        # Case-insensitive lookup in unified Skill table to avoid duplicates
        skill_id = db.execute(
            select(Skill.id).where(func.lower(Skill.skill_name) == skill)
        ).scalar_one_or_none()

        if skill_id is None:
            # Create new skill if it doesn't exist
            created_result = db.execute(
                pg_insert(Skill)
                .values(skill_name=skill)
                .on_conflict_do_nothing(index_elements=['skill_name'])
            )
            if (created_result.rowcount or 0) > 0:
                skills_created += 1

            # Fetch the skill_id (either just created or already existing)
            skill_id = db.execute(
                select(Skill.id).where(func.lower(Skill.skill_name) == skill)
            ).scalar_one_or_none()

        if skill_id is None:
            continue

        # Link skill to job post
        link_result = db.execute(
            pg_insert(JobPostSkill)
            .values(job_post_id=job_post_id, skill_id=skill_id)
            .on_conflict_do_nothing()
        )
        if (link_result.rowcount or 0) > 0:
            skills_linked += 1

    return {
        "skills_created": skills_created,
        "skills_linked": skills_linked,
    }
