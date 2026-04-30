from fastapi import APIRouter, Body, Depends, HTTPException, status, Query
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from uuid import UUID

from dependencies import get_db
from schemas import (
    JobBulkImportRequest,
    JobListResponse,
    JobPostResponse,
    JobApplicationResponse,
    JobApplicationUpsertRequest,
    JobInteractionResponse,
    UserJobsListResponse,
)
from services.job.job_service import (
    bulk_insert_jobs,
    fetch_jobs_paginated,
    fetch_job_post_by_id,
    search_jobs,
    mark_job_as_recently_viewed,
    set_job_saved_state,
    upsert_job_application,
    fetch_user_saved_jobs,
    fetch_user_recently_viewed_jobs,
    fetch_user_applied_jobs,
    enrich_job_posts,
    enrich_job_post_with_skills,
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _parse_user_uuid(user_id: str) -> UUID:
    try:
        return UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")


@router.post("/bulk-import", status_code=status.HTTP_201_CREATED)
def bulk_import_jobs(
    payload: JobBulkImportRequest = Body(...),
    db: Session = Depends(get_db)
):
    """
    Bulk import jobs from scraped JSON data.
    
    Accepts a list of job objects matching Wuzzuf or similar scrapers with fields:
    - job_title (required): Job title
    - company_name (required): Company name
    - job_url (required): Unique job URL (used for deduplication)
    - location: Job location
    - description: Job description
    - posted_date: When job was posted (ISO format datetime)
    - source: Source of the job listing (e.g., "wuzzuf")
    - requirements_raw: Raw requirements text
    - requirements_list: List of requirements
    - experience: Required experience level
    - career_level: Career level (entry, mid, senior, etc.)
    - education_level: Required education level
    - salary: Salary information
    - skills: List of required skills
    - categories: List of job categories
    - scraped_at: ISO format datetime when job was scraped
    """
    try:
        jobs = [job.model_dump(mode="python") for job in payload.jobs]
        created_jobs, updated_count, skipped_count, skipped_items, results = bulk_insert_jobs(db, jobs)
        
        return {
            "created": len(created_jobs),
            "updated": updated_count,
            "skipped": skipped_count,
            "total_processed": len(payload.jobs),
            "jobs": jsonable_encoder(created_jobs),
            "results": results,
            "skipped_items": skipped_items,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=JobListResponse)
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Query(None, description="Optional user ID for match scoring"),
    db: Session = Depends(get_db)
):
    """
    List all job posts with pagination.
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 20, max: 100)
    - user_id: Optional user ID to calculate skill match percentage
    """
    try:
        jobs, total_count = fetch_jobs_paginated(db, skip=skip, limit=limit)
        user_uuid = None
        if user_id:
            try:
                user_uuid = UUID(user_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        enriched_jobs = enrich_job_posts(db, jobs, user_uuid)
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "jobs": enriched_jobs
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/query", response_model=JobListResponse)
def search_jobs_endpoint(
    query: str | None = Query(None, min_length=1),
    title: str | None = Query(None, min_length=1, description="Alias for query when searching by title"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: str = Query(None, description="Optional user ID for match scoring"),
    db: Session = Depends(get_db)
):
    """
    Search jobs by title, company, or skills.
    
    Query Parameters:
    - query (required): Search term
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 20, max: 100)
    - user_id: Optional user ID to calculate skill match percentage
    """
    try:
        search_term = (query or title or "").strip()
        if not search_term:
            raise HTTPException(status_code=400, detail="Either 'query' or 'title' is required")

        jobs, total_count = search_jobs(db, query=search_term, skip=skip, limit=limit)
        user_uuid = None
        if user_id:
            try:
                user_uuid = UUID(user_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        enriched_jobs = enrich_job_posts(db, jobs, user_uuid)
        return {
            "query": search_term,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "jobs": enriched_jobs
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{job_id}/apply", response_model=JobApplicationResponse)
def apply_to_job_endpoint(
    job_id: UUID,
    payload: JobApplicationUpsertRequest = Body(...),
    user_id: str = Query(..., description="User ID applying to the job"),
    db: Session = Depends(get_db)
):
    """
    Create or update a job application for the user.
    """
    try:
        user_uuid = _parse_user_uuid(user_id)
        application = upsert_job_application(db, user_uuid, job_id, payload.status)
        return application
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{job_id}/view", response_model=JobInteractionResponse)
def mark_job_as_viewed_endpoint(
    job_id: UUID,
    user_id: str = Query(..., description="User ID who viewed the job"),
    db: Session = Depends(get_db)
):
    """
    Mark a job as recently viewed for the user.
    """
    try:
        user_uuid = _parse_user_uuid(user_id)
        interaction = mark_job_as_recently_viewed(db, user_uuid, job_id)
        return interaction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{job_id}/save", response_model=JobInteractionResponse)
def save_job_endpoint(
    job_id: UUID,
    user_id: str = Query(..., description="User ID saving the job"),
    db: Session = Depends(get_db)
):
    """
    Save a job for the user.
    """
    try:
        user_uuid = _parse_user_uuid(user_id)
        interaction = set_job_saved_state(db, user_uuid, job_id, is_saved=True)
        return interaction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{job_id}/save", response_model=JobInteractionResponse)
def unsave_job_endpoint(
    job_id: UUID,
    user_id: str = Query(..., description="User ID unsaving the job"),
    db: Session = Depends(get_db)
):
    """
    Remove a saved job for the user.
    """
    try:
        user_uuid = _parse_user_uuid(user_id)
        interaction = set_job_saved_state(db, user_uuid, job_id, is_saved=False)
        return interaction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/saved", response_model=UserJobsListResponse)
def list_user_saved_jobs(
    user_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List saved jobs for a user.
    """
    try:
        jobs, total_count = fetch_user_saved_jobs(db, user_id=user_id, skip=skip, limit=limit)
        enriched_jobs = enrich_job_posts(db, jobs, user_id)
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "jobs": enriched_jobs,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/recently-viewed", response_model=UserJobsListResponse)
def list_user_recently_viewed_jobs(
    user_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List recently viewed jobs for a user.
    """
    try:
        jobs, total_count = fetch_user_recently_viewed_jobs(db, user_id=user_id, skip=skip, limit=limit)
        enriched_jobs = enrich_job_posts(db, jobs, user_id)
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "jobs": enriched_jobs,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/applications", response_model=UserJobsListResponse)
def list_user_applied_jobs(
    user_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List jobs that the user has already applied to.
    """
    try:
        jobs, total_count = fetch_user_applied_jobs(db, user_id=user_id, skip=skip, limit=limit)
        enriched_jobs = enrich_job_posts(db, jobs, user_id)
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "jobs": enriched_jobs,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}", response_model=JobPostResponse)
def get_job_details(
    job_id: UUID,
    user_id: str = Query(None, description="Optional user ID for match scoring"),
    db: Session = Depends(get_db)
):
    """
    Get details of a specific job post by ID.
    
    Query Parameters:
    - user_id: Optional user ID to calculate skill match percentage
    """
    try:
        job = fetch_job_post_by_id(db, job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail=f"Job post with ID {job_id} not found"
            )
        user_uuid = None
        if user_id:
            try:
                user_uuid = UUID(user_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        return enrich_job_post_with_skills(db, job, user_uuid)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

