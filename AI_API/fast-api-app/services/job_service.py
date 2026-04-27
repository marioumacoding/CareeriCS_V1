import logging
from datetime import UTC, date, datetime
from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.dialects.postgresql import insert as pg_insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.models import JobApplication, JobPost, JobPostSkill, Skill, JobUserInteraction, User, UserSkill
from services.job_ingestion_helpers import clean_text, normalize_and_attach_skills, normalize_skill_name

logger = logging.getLogger(__name__)


def get_job_skills(db: Session, job_post_id: UUID) -> List[str]:
    """Fetch skill names for a job post."""
    skills = db.query(Skill.skill_name).join(
        JobPostSkill, JobPostSkill.skill_id == Skill.id
    ).filter(JobPostSkill.job_post_id == job_post_id).all()
    return [skill[0] for skill in skills]


def get_user_skills(db: Session, user_id: UUID) -> List[str]:
    """Fetch skill names for a user."""
    skills = db.query(Skill.skill_name).join(
        UserSkill, UserSkill.skill_id == Skill.id
    ).filter(UserSkill.user_id == user_id).all()
    return [skill[0] for skill in skills]


def calculate_job_match_percentage(db: Session, user_id: UUID, job_post_id: UUID) -> float:
    """
    Calculate percentage match between user skills and job skills.
    Returns 0.0 to 100.0
    """
    job_skills = set(get_job_skills(db, job_post_id))
    user_skills = set(get_user_skills(db, user_id))
    
    if not job_skills:
        return 0.0
    
    matched_skills = job_skills & user_skills
    match_percentage = (len(matched_skills) / len(job_skills)) * 100
    return round(match_percentage, 2)


def enrich_job_post_with_skills(db: Session, job_post: JobPost, user_id: Optional[UUID] = None) -> Dict[str, Any]:
    """
    Convert JobPost object to a dict with skills array and optional match_percentage.
    """
    job_dict = {
        "id": job_post.id,
        "job_title": job_post.job_title,
        "company_name": job_post.company_name,
        "job_url": job_post.job_url,
        "source": job_post.source,
        "location": job_post.location,
        "posted_date": job_post.posted_date,
        "career_level": job_post.career_level,
        "work_type": job_post.work_type,
        "employment_type": job_post.employment_type,
        "description_about_role": job_post.description_about_role,
        "description_key_responsibilities": job_post.description_key_responsibilities,
        "description_requirements": job_post.description_requirements,
        "description_nice_to_have": job_post.description_nice_to_have,
        "created_at": job_post.created_at,
        "updated_at": job_post.updated_at,
        "skills": get_job_skills(db, job_post.id),
        "match_percentage": None,
    }
    
    if user_id:
        job_dict["match_percentage"] = calculate_job_match_percentage(db, user_id, job_post.id)
    
    return job_dict


def parse_linkedin_date(value: Optional[str]) -> Optional[date]:
    if not value:
        return None

    cleaned = value.strip()
    if not cleaned:
        return None

    for date_format in ("%b %d, %Y", "%B %d, %Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(cleaned, date_format).date()
        except ValueError:
            continue
    return None


def parseLinkedInDate(value: Optional[str]) -> Optional[date]:
    return parse_linkedin_date(value)


def infer_work_type(job_data: dict) -> str:
    explicit_work_type = (job_data.get("work_type") or "").strip().lower()
    if "hybrid" in explicit_work_type:
        return "Hybrid"
    if "remote" in explicit_work_type:
        return "Remote"
    if "on-site" in explicit_work_type or "onsite" in explicit_work_type or "on site" in explicit_work_type:
        return "On-Site"

    text_sources = [
        job_data.get("job_title"),
        job_data.get("title"),
        job_data.get("location"),
        job_data.get("description_about_role"),
        job_data.get("about_role"),
        job_data.get("description_key_responsibilities"),
        job_data.get("key_responsibilities"),
        job_data.get("description_requirements"),
        job_data.get("requirements"),
        job_data.get("description_nice_to_have"),
        job_data.get("nice_to_have"),
    ]
    combined_text = " ".join(str(value).lower() for value in text_sources if value)

    if "hybrid" in combined_text:
        return "Hybrid"
    if "remote" in combined_text:
        return "Remote"
    if "on-site" in combined_text or "onsite" in combined_text or "on site" in combined_text:
        return "On-Site"

    # Business default requested by product behavior.
    return "On-Site"


def normalize_job_data(job_data: dict) -> dict:
    job_title = (job_data.get("job_title") or job_data.get("title") or "").strip()
    company_name = (job_data.get("company_name") or job_data.get("company") or "").strip() or None
    job_url = (job_data.get("job_url") or job_data.get("link") or "").strip()

    skills_raw = job_data.get("skills") or []
    if not isinstance(skills_raw, list):
        skills_raw = []

    normalized_skills = sorted({
        normalized for normalized in (normalize_skill_name(skill) for skill in skills_raw) if normalized
    })

    posted_date_raw = (
        job_data.get("posted_date")
        or job_data.get("date")
        or job_data.get("postedAt")
    )

    description_about_role = clean_text(
        job_data.get("description_about_role") or job_data.get("about_role")
    )
    description_key_responsibilities = clean_text(
        job_data.get("description_key_responsibilities") or job_data.get("key_responsibilities")
    )
    description_requirements = clean_text(
        job_data.get("description_requirements") or job_data.get("requirements")
    )
    description_nice_to_have = clean_text(
        job_data.get("description_nice_to_have") or job_data.get("nice_to_have")
    )

    return {
        "job_title": job_title,
        "company_name": company_name,
        "job_url": job_url,
        "source": (job_data.get("source") or "").strip() or None,
        "location": (job_data.get("location") or "").strip() or None,
        "posted_date": parse_linkedin_date(posted_date_raw),
        "description_about_role": description_about_role,
        "description_key_responsibilities": description_key_responsibilities,
        "description_requirements": description_requirements,
        "description_nice_to_have": description_nice_to_have,
        "career_level": (job_data.get("career_level") or job_data.get("experience_level") or "").strip() or None,
        "work_type": infer_work_type(job_data),
        "employment_type": (job_data.get("employment_type") or job_data.get("job_type") or "").strip() or None,
        "skills": normalized_skills,
    }


def insert_job(db: Session, job_data: dict, *, commit: bool = True) -> Tuple[Optional[JobPost], bool, Optional[str], Dict[str, Any]]:
    if not isinstance(job_data, dict):
        return None, False, "Job item must be a JSON object", {
            "job_url": None,
            "created": False,
            "skills_created": 0,
            "skills_linked": 0,
            "status": "skipped",
        }

    normalized = normalize_job_data(job_data)
    job_url = normalized["job_url"]
    if not normalized["job_title"] or not job_url:
        return None, False, "Missing required fields: job_title/job_url", {
            "job_url": job_url,
            "created": False,
            "skills_created": 0,
            "skills_linked": 0,
            "status": "skipped",
        }

    if db.query(JobPost.id).filter(JobPost.job_url == job_url).first():
        return None, False, "Duplicate job_url", {
            "job_url": job_url,
            "created": False,
            "skills_created": 0,
            "skills_linked": 0,
            "status": "skipped",
        }

    try:
        if commit:
            with db.begin():
                job_post = JobPost(
                    job_title=normalized["job_title"],
                    company_name=normalized["company_name"],
                    job_url=job_url,
                    source=normalized["source"],
                    location=normalized["location"],
                    posted_date=normalized["posted_date"],
                    description_about_role=normalized["description_about_role"],
                    description_key_responsibilities=normalized["description_key_responsibilities"],
                    description_requirements=normalized["description_requirements"],
                    description_nice_to_have=normalized["description_nice_to_have"],
                    career_level=normalized["career_level"],
                    work_type=normalized["work_type"],
                    employment_type=normalized["employment_type"],
                )
                db.add(job_post)
                db.flush()
                skill_stats = normalize_and_attach_skills(db, job_post.id, normalized["skills"])
        else:
            job_post = JobPost(
                job_title=normalized["job_title"],
                company_name=normalized["company_name"],
                job_url=job_url,
                source=normalized["source"],
                location=normalized["location"],
                posted_date=normalized["posted_date"],
                description_about_role=normalized["description_about_role"],
                description_key_responsibilities=normalized["description_key_responsibilities"],
                description_requirements=normalized["description_requirements"],
                description_nice_to_have=normalized["description_nice_to_have"],
                career_level=normalized["career_level"],
                work_type=normalized["work_type"],
                employment_type=normalized["employment_type"],
            )
            db.add(job_post)
            db.flush()
            skill_stats = normalize_and_attach_skills(db, job_post.id, normalized["skills"])

        if commit:
            db.refresh(job_post)

        insert_result = {
            "job_url": job_url,
            "created": True,
            "skills_created": skill_stats["skills_created"],
            "skills_linked": skill_stats["skills_linked"],
            "status": "created",
        }
        logger.info(
            "Job inserted: job_url=%s skills_created=%s skills_linked=%s",
            job_url,
            skill_stats["skills_created"],
            skill_stats["skills_linked"],
        )
        return job_post, True, None, insert_result
    except IntegrityError as exc:
        if commit:
            db.rollback()
        return None, False, f"Integrity error while inserting job: {str(exc.orig) if exc.orig else str(exc)}", {
            "job_url": job_url,
            "created": False,
            "skills_created": 0,
            "skills_linked": 0,
            "status": "skipped",
        }


def insertJob(db: Session, job_data: dict, *, commit: bool = True) -> Tuple[Optional[JobPost], bool, Optional[str], Dict[str, Any]]:
    return insert_job(db, job_data, commit=commit)


def bulk_insert_jobs(db: Session, jobs_data: List[dict]) -> Tuple[List[JobPost], int, int, List[Dict[str, Any]], List[Dict[str, Any]]]:
    """
    Bulk insert jobs while skipping duplicates by job_url.
    Uses one transaction for the whole batch and savepoints per item.
    """
    created_jobs: List[JobPost] = []
    updated_count = 0
    skipped_count = 0
    skipped_items: List[Dict[str, Any]] = []
    results: List[Dict[str, Any]] = []

    try:
        for index, job_data in enumerate(jobs_data):
            try:
                with db.begin_nested():
                    job, inserted, reason, job_result = insert_job(db, job_data, commit=False)
                    if inserted and job:
                        created_jobs.append(job)
                        results.append(job_result)
                    else:
                        skipped_count += 1
                        results.append(job_result)
                        skipped_items.append(
                            {
                                "index": index,
                                "title": (job_data.get("job_title") if isinstance(job_data, dict) else None),
                                "reason": reason or "Skipped",
                            }
                        )
            except Exception as exc:
                skipped_count += 1
                results.append(
                    {
                        "job_url": (job_data.get("job_url") if isinstance(job_data, dict) else None),
                        "created": False,
                        "skills_created": 0,
                        "skills_linked": 0,
                        "status": "skipped",
                    }
                )
                skipped_items.append(
                    {
                        "index": index,
                        "title": (job_data.get("job_title") if isinstance(job_data, dict) else None),
                        "reason": f"Unexpected error while processing job: {str(exc)}",
                    }
                )

        db.commit()
        for job in created_jobs:
            db.refresh(job)
    except Exception:
        db.rollback()
        raise

    return created_jobs, updated_count, skipped_count, skipped_items, results


def fetch_jobs_paginated(
    db: Session,
    skip: int = 0,
    limit: int = 20
) -> Tuple[List[JobPost], int]:
    limit = min(limit, 100)

    total_count = db.query(func.count(JobPost.id)).scalar() or 0
    jobs = db.query(JobPost).order_by(JobPost.created_at.desc()).offset(skip).limit(limit).all()
    return jobs, total_count


def fetch_job_post_by_id(db: Session, job_id: UUID) -> Optional[JobPost]:
    return db.query(JobPost).filter(JobPost.id == job_id).first()


def search_jobs(
    db: Session,
    query: str,
    skip: int = 0,
    limit: int = 20
) -> Tuple[List[JobPost], int]:
    limit = min(limit, 100)
    search_pattern = f"%{query}%"

    query_obj = (
        db.query(JobPost)
        .outerjoin(JobPostSkill, JobPostSkill.job_post_id == JobPost.id)
        .outerjoin(Skill, Skill.id == JobPostSkill.skill_id)
        .filter(
            or_(
                JobPost.job_title.ilike(search_pattern),
                JobPost.company_name.ilike(search_pattern),
                JobPost.location.ilike(search_pattern),
                JobPost.description_about_role.ilike(search_pattern),
                JobPost.description_key_responsibilities.ilike(search_pattern),
                JobPost.description_requirements.ilike(search_pattern),
                JobPost.description_nice_to_have.ilike(search_pattern),
                Skill.skill_name.ilike(search_pattern),
            )
        )
        .distinct()
    )

    total_count = query_obj.count()
    jobs = query_obj.order_by(JobPost.created_at.desc()).offset(skip).limit(limit).all()
    return jobs, total_count


def _validate_user_and_job(db: Session, user_id: UUID, job_post_id: UUID) -> None:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User with ID {user_id} not found")

    job_post = db.query(JobPost).filter(JobPost.id == job_post_id).first()
    if not job_post:
        raise ValueError(f"Job post with ID {job_post_id} not found")


def mark_job_as_recently_viewed(db: Session, user_id: UUID, job_post_id: UUID) -> JobUserInteraction:
    _validate_user_and_job(db, user_id, job_post_id)
    now = datetime.now(UTC)

    interaction = (
        db.query(JobUserInteraction)
        .filter(
            JobUserInteraction.user_id == user_id,
            JobUserInteraction.job_post_id == job_post_id,
        )
        .order_by(JobUserInteraction.created_at.desc())
        .first()
    )

    try:
        if interaction:
            interaction.viewed_at = now
            interaction.view_count = (interaction.view_count or 0) + 1
            interaction.last_interaction_at = now
            interaction.updated_at = now
        else:
            interaction = JobUserInteraction(
                user_id=user_id,
                job_post_id=job_post_id,
                viewed_at=now,
                view_count=1,
                last_interaction_at=now,
                updated_at=now,
            )
            db.add(interaction)

        db.commit()
        db.refresh(interaction)
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid job or user reference for interaction")

    return interaction


def set_job_saved_state(db: Session, user_id: UUID, job_post_id: UUID, is_saved: bool) -> JobUserInteraction:
    _validate_user_and_job(db, user_id, job_post_id)
    now = datetime.now(UTC)

    interaction = (
        db.query(JobUserInteraction)
        .filter(
            JobUserInteraction.user_id == user_id,
            JobUserInteraction.job_post_id == job_post_id,
        )
        .order_by(JobUserInteraction.created_at.desc())
        .first()
    )

    try:
        if interaction:
            interaction.is_saved = is_saved
            interaction.saved_at = now if is_saved else None
            interaction.last_interaction_at = now
            interaction.updated_at = now
        else:
            interaction = JobUserInteraction(
                user_id=user_id,
                job_post_id=job_post_id,
                is_saved=is_saved,
                saved_at=now if is_saved else None,
                last_interaction_at=now,
                updated_at=now,
            )
            db.add(interaction)

        db.commit()
        db.refresh(interaction)
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid job or user reference for interaction")

    return interaction


JOB_APPLICATION_STATUSES = {"applied", "interviewed", "rejected", "accepted", "withdrawn"}


def upsert_job_application(
    db: Session,
    user_id: UUID,
    job_post_id: UUID,
    status: str,
) -> JobApplication:
    _validate_user_and_job(db, user_id, job_post_id)

    normalized_status = (status or "").strip().lower()
    if normalized_status not in JOB_APPLICATION_STATUSES:
        raise ValueError(f"Invalid application status: {status}")

    now = datetime.now(UTC)
    application = (
        db.query(JobApplication)
        .filter(
            JobApplication.user_id == user_id,
            JobApplication.job_post_id == job_post_id,
        )
        .order_by(JobApplication.applied_at.desc().nullslast(), JobApplication.updated_at.desc())
        .first()
    )

    try:
        if application:
            application.status = normalized_status
            application.updated_at = now
        else:
            application = JobApplication(
                user_id=user_id,
                job_post_id=job_post_id,
                status=normalized_status,
                updated_at=now,
            )
            db.add(application)

        db.commit()
        db.refresh(application)
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid job or user reference for application")

    return application


def fetch_user_saved_jobs(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[JobPost], int]:
    limit = min(limit, 100)

    user_exists = db.query(User.id).filter(User.id == user_id).first()
    if not user_exists:
        raise ValueError(f"User with ID {user_id} not found")

    query_obj = db.query(JobPost).join(
        JobUserInteraction,
        JobUserInteraction.job_post_id == JobPost.id,
    ).filter(
        JobUserInteraction.user_id == user_id,
        JobUserInteraction.is_saved.is_(True),
    )

    total_count = query_obj.count()
    jobs = query_obj.order_by(JobUserInteraction.saved_at.desc().nullslast()).offset(skip).limit(limit).all()

    return jobs, total_count


def fetch_user_recently_viewed_jobs(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[JobPost], int]:
    limit = min(limit, 100)

    user_exists = db.query(User.id).filter(User.id == user_id).first()
    if not user_exists:
        raise ValueError(f"User with ID {user_id} not found")

    query_obj = db.query(JobPost).join(
        JobUserInteraction,
        JobUserInteraction.job_post_id == JobPost.id,
    ).filter(
        JobUserInteraction.user_id == user_id,
        JobUserInteraction.viewed_at.is_not(None),
    )

    total_count = query_obj.count()
    jobs = query_obj.order_by(JobUserInteraction.viewed_at.desc()).offset(skip).limit(limit).all()

    return jobs, total_count

