from typing import Dict, List, Optional
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.orm import Session

from db.models import JobPostSkill, JobSkill


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
        # Case-insensitive lookup to avoid duplicates with different casing.
        skill_id = db.execute(
            select(JobSkill.id).where(func.lower(JobSkill.name) == skill)
        ).scalar_one_or_none()

        if skill_id is None:
            created_result = db.execute(
                pg_insert(JobSkill)
                .values(name=skill)
                .on_conflict_do_nothing(index_elements=[JobSkill.name])
            )
            if (created_result.rowcount or 0) > 0:
                skills_created += 1

            skill_id = db.execute(
                select(JobSkill.id).where(func.lower(JobSkill.name) == skill)
            ).scalar_one_or_none()

        if skill_id is None:
            continue

        link_result = db.execute(
            pg_insert(JobPostSkill)
            .values(job_post_id=job_post_id, skill_id=skill_id)
            .on_conflict_do_nothing(index_elements=[JobPostSkill.job_post_id, JobPostSkill.skill_id])
        )
        if (link_result.rowcount or 0) > 0:
            skills_linked += 1

    return {
        "skills_created": skills_created,
        "skills_linked": skills_linked,
    }
