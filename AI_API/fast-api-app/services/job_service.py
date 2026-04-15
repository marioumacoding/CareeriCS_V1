from sqlalchemy.orm import Session
from sqlalchemy import or_, func, text
from sqlalchemy.exc import IntegrityError
from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime, UTC
from uuid import UUID

from db.models import JobPost, JobApplication, User
from schemas import JobPostResponse, JobApplicationResponse


def _ensure_job_applications_updated_at_column(db: Session) -> None:
    """
    Backward-compatible safety check for environments where job_applications
    was created before the updated_at column existed.
    """
    exists = db.execute(
        text(
            """
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'job_applications'
              AND column_name = 'updated_at'
            LIMIT 1
            """
        )
    ).first()

    if exists:
        return

    db.execute(
        text(
            """
            ALTER TABLE job_applications
            ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            """
        )
    )
    db.commit()


def normalize_job_data(job_data: dict) -> dict:
    normalized = {}

    # MAP YOUR INPUT FORMAT TO DB FORMAT
    normalized["job_title"] = (job_data.get("job_title") or job_data.get("title") or "").strip()
    normalized["company_name"] = (job_data.get("company_name") or job_data.get("company") or "").strip()
    normalized["job_url"] = (job_data.get("job_url") or job_data.get("link") or "").strip()

    normalized["location"] = job_data.get("location")
    normalized["description"] = job_data.get("description")
    normalized["source"] = job_data.get("source")

    req = job_data.get("requirements")
    if not isinstance(req, dict):
        req = {}

    normalized["requirements_raw"] = req.get("raw") or job_data.get("requirements_raw")
    normalized["requirements_list"] = req.get("list") or job_data.get("requirements_list") or []

    details = job_data.get("details")
    if not isinstance(details, dict):
        details = {}

    normalized["skills"] = details.get("skills") or job_data.get("skills") or []
    normalized["categories"] = details.get("categories") or job_data.get("categories") or []

    normalized["experience"] = details.get("experience") or job_data.get("experience")
    normalized["career_level"] = details.get("career_level") or job_data.get("career_level")
    normalized["education_level"] = details.get("education_level") or job_data.get("education_level")
    normalized["salary"] = details.get("salary") or job_data.get("salary")

    normalized["posted_date"] = None
    normalized["scraped_at"] = datetime.now(UTC)

    return normalized


def bulk_insert_jobs(db: Session, jobs_data: List[dict]) -> Tuple[List[JobPost], int, int, List[Dict[str, Any]]]:
    """
    Bulk insert or update jobs using job_url for duplicate detection (UPSERT pattern).
    
    Returns a tuple of (created_jobs, updated_count, skipped_count, skipped_items).
    Updates existing jobs by job_url, creates new ones, and skips invalid entries.
    """
    created_jobs = []
    updated_count = 0
    skipped_count = 0
    skipped_items: List[Dict[str, Any]] = []
    
    try:
        for index, job_data in enumerate(jobs_data):
            try:
                if not isinstance(job_data, dict):
                    skipped_count += 1
                    skipped_items.append({
                        "index": index,
                        "reason": "Job item must be a JSON object",
                    })
                    continue

                normalized = normalize_job_data(job_data)
                
                # Validate required fields
                if not normalized.get('job_title') or not normalized.get('company_name') or not normalized.get('job_url'):
                    skipped_count += 1
                    skipped_items.append({
                        "index": index,
                        "title": normalized.get('job_title') or job_data.get('title') or None,
                        "reason": "Missing required fields: job_title/company_name/job_url",
                    })
                    continue
                
                # Check if job already exists by job_url
                existing_job = db.query(JobPost).filter(
                    JobPost.job_url == normalized['job_url']
                ).first()
                
                if existing_job:
                    # Update existing job with new data
                    for key, value in normalized.items():
                        if hasattr(existing_job, key):
                            setattr(existing_job, key, value)
                    db.add(existing_job)
                    updated_count += 1
                    continue
                
                # Create new JobPost instance
                job_post = JobPost(
                    job_title=normalized['job_title'],
                    company_name=normalized['company_name'],
                    location=normalized.get('location'),
                    job_url=normalized['job_url'],
                    source=normalized.get('source'),
                    posted_date=normalized.get('posted_date'),
                    description=normalized.get('description'),
                    requirements_raw=normalized.get('requirements_raw'),
                    requirements_list=normalized.get('requirements_list') or [],
                    experience=normalized.get('experience'),
                    career_level=normalized.get('career_level'),
                    education_level=normalized.get('education_level'),
                    salary=normalized.get('salary'),
                    categories=normalized.get('categories') or [],
                    skills=normalized.get('skills') or [],
                    scraped_at=normalized.get('scraped_at'),
                )
                
                db.add(job_post)
                created_jobs.append(job_post)
                
            except IntegrityError:
                # Handle unique constraint violations (job_url or other)
                db.rollback()
                skipped_count += 1
                skipped_items.append({
                    "index": index,
                    "title": (job_data.get('title') if isinstance(job_data, dict) else None),
                    "reason": "IntegrityError while inserting/updating job",
                })
            except Exception as exc:
                # Skip individual jobs that fail
                skipped_count += 1
                skipped_items.append({
                    "index": index,
                    "title": (job_data.get('title') if isinstance(job_data, dict) else None),
                    "reason": f"Unexpected error while processing job: {str(exc)}",
                })
                continue
        
        # Atomic transaction: commit all changes at once
        db.commit()
        
        # Refresh all objects after commit
        for job in created_jobs:
            db.refresh(job)
        
    except Exception as e:
        # Rollback entire transaction on any critical error
        db.rollback()
        raise
    
    return created_jobs, updated_count, skipped_count, skipped_items


def fetch_jobs_paginated(
    db: Session,
    skip: int = 0,
    limit: int = 20
) -> Tuple[List[JobPost], int]:
    """
    Fetch jobs with pagination support.
    
    Returns a tuple of (jobs_list, total_count).
    """
    # Limit max records per page
    limit = min(limit, 100)
    
    total_count = db.query(func.count(JobPost.id)).scalar() or 0
    
    jobs = db.query(JobPost).order_by(JobPost.scraped_at.desc()).offset(skip).limit(limit).all()
    
    return jobs, total_count


def fetch_job_post_by_id(db: Session, job_id: UUID) -> Optional[JobPost]:
    """
    Fetch a single job post by ID.
    """
    return db.query(JobPost).filter(JobPost.id == job_id).first()


def search_jobs(
    db: Session,
    query: str,
    skip: int = 0,
    limit: int = 20
) -> Tuple[List[JobPost], int]:
    """
    Search jobs by title, company, or skills.
    
    Performs case-insensitive partial matching.
    Returns a tuple of (jobs_list, total_count).
    """
    limit = min(limit, 100)
    
    # Build search pattern for ILIKE (case-insensitive LIKE in PostgreSQL)
    search_pattern = f"%{query}%"
    
    # Filter jobs by title, company, or skills array contains
    query_obj = db.query(JobPost).filter(
        or_(
            JobPost.job_title.ilike(search_pattern),
            JobPost.company_name.ilike(search_pattern),
            JobPost.description.ilike(search_pattern)
        )
    )
    
    total_count = query_obj.count()
    
    jobs = query_obj.order_by(JobPost.scraped_at.desc()).offset(skip).limit(limit).all()
    
    return jobs, total_count


def apply_to_job(db: Session, user_id: UUID, job_post_id: UUID) -> JobApplication:
    """
    Apply to a job posting.
    
    Creates a new job application record for the user.
    Raises ValueError if user is already applied to this job.
    """
    # Keep endpoint functional even if the DB schema is slightly behind model definitions.
    _ensure_job_applications_updated_at_column(db)

    # Validate user exists to avoid foreign key errors turning into 500 responses.
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise ValueError(f"User with ID {user_id} not found")

    # Check if user already applied to this job
    existing_application = db.query(JobApplication).filter(
        JobApplication.job_post_id == job_post_id,
        JobApplication.user_id == user_id
    ).first()
    
    if existing_application:
        raise ValueError("User has already applied to this job")
    
    # Check if job post exists
    job_post = db.query(JobPost).filter(JobPost.id == job_post_id).first()
    if not job_post:
        raise ValueError(f"Job post with ID {job_post_id} not found")
    
    # Create new application
    application = JobApplication(
        job_post_id=job_post_id,
        user_id=user_id,
        application_status="pending"
    )
    
    db.add(application)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid job or user reference for application")

    db.refresh(application)
    
    return application

