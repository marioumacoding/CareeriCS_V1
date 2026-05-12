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
    browse_job_posts,
    fetch_jobs_paginated,
    fetch_job_post_by_id,
    search_jobs,
    mark_job_as_recently_viewed,
    set_job_saved_state,
    upsert_job_application,
    fetch_user_saved_jobs,
    fetch_user_recently_viewed_jobs,
    enrich_job_posts,
    enrich_job_post_with_skills,
)
from services.job.normalization import compute_page_number, compute_total_pages

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _parse_user_uuid(user_id: str) -> UUID:
    try:
        return UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")


def _parse_csv_query_param(value: str | None) -> list[str]:
    if not value:
        return []

    return [
        item.strip()
        for item in value.split(",")
        if item and item.strip()
    ]


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
    query: str | None = Query(None, min_length=1),
    countries: str | None = Query(None, description="Comma-separated normalized country filters"),
    cities: str | None = Query(None, description="Comma-separated normalized city filters"),
    job_types: str | None = Query(None, description="Comma-separated job type filters"),
    work_types: str | None = Query(None, description="Comma-separated work type filters"),
    career_levels: str | None = Query(None, description="Comma-separated career level filters"),
    sort: str = Query("relevance", description="Sort mode: relevance, date, or match"),
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
        user_uuid = None
        if user_id:
            try:
                user_uuid = UUID(user_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid user ID format")

        jobs, total_count, filter_options = fetch_jobs_paginated(
            db,
            skip=skip,
            limit=limit,
            user_id=user_uuid,
            query=query,
            countries=_parse_csv_query_param(countries),
            cities=_parse_csv_query_param(cities),
            job_types=_parse_csv_query_param(job_types),
            work_types=_parse_csv_query_param(work_types),
            career_levels=_parse_csv_query_param(career_levels),
            sort=sort,
        )

        enriched_jobs = enrich_job_posts(db, jobs, user_uuid)
        return {
            "query": query,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "page": compute_page_number(skip, limit),
            "total_pages": compute_total_pages(total_count, limit),
            "filters": filter_options,
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
    countries: str | None = Query(None, description="Comma-separated normalized country filters"),
    cities: str | None = Query(None, description="Comma-separated normalized city filters"),
    job_types: str | None = Query(None, description="Comma-separated job type filters"),
    work_types: str | None = Query(None, description="Comma-separated work type filters"),
    career_levels: str | None = Query(None, description="Comma-separated career level filters"),
    sort: str = Query("relevance", description="Sort mode: relevance, date, or match"),
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

        user_uuid = None
        if user_id:
            try:
                user_uuid = UUID(user_id)
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid user ID format")

        jobs, total_count, filter_options = search_jobs(
            db,
            query=search_term,
            skip=skip,
            limit=limit,
            user_id=user_uuid,
            countries=_parse_csv_query_param(countries),
            cities=_parse_csv_query_param(cities),
            job_types=_parse_csv_query_param(job_types),
            work_types=_parse_csv_query_param(work_types),
            career_levels=_parse_csv_query_param(career_levels),
            sort=sort,
        )

        enriched_jobs = enrich_job_posts(db, jobs, user_uuid)
        return {
            "query": search_term,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "page": compute_page_number(skip, limit),
            "total_pages": compute_total_pages(total_count, limit),
            "filters": filter_options,
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
            "page": compute_page_number(skip, limit),
            "total_pages": compute_total_pages(total_count, limit),
            "filters": {
                "countries": [],
                "cities": [],
                "job_types": [],
                "work_types": [],
                "career_levels": [],
            },
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
            "page": compute_page_number(skip, limit),
            "total_pages": compute_total_pages(total_count, limit),
            "filters": {
                "countries": [],
                "cities": [],
                "job_types": [],
                "work_types": [],
                "career_levels": [],
            },
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
    query: str | None = Query(None, min_length=1),
    countries: str | None = Query(None, description="Comma-separated normalized country filters"),
    cities: str | None = Query(None, description="Comma-separated normalized city filters"),
    job_types: str | None = Query(None, description="Comma-separated job type filters"),
    work_types: str | None = Query(None, description="Comma-separated work type filters"),
    career_levels: str | None = Query(None, description="Comma-separated career level filters"),
    sort: str = Query("relevance", description="Sort mode: relevance, date, or match"),
    db: Session = Depends(get_db)
):
    """
    List jobs that the user has already applied to.
    """
    try:
        jobs, total_count, filter_options = browse_job_posts(
            db,
            scope="applications",
            skip=skip,
            limit=limit,
            user_id=user_id,
            query=query,
            countries=_parse_csv_query_param(countries),
            cities=_parse_csv_query_param(cities),
            job_types=_parse_csv_query_param(job_types),
            work_types=_parse_csv_query_param(work_types),
            career_levels=_parse_csv_query_param(career_levels),
            sort=sort,
        )

        enriched_jobs = enrich_job_posts(db, jobs, user_id)
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "page": compute_page_number(skip, limit),
            "total_pages": compute_total_pages(total_count, limit),
            "filters": filter_options,
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

