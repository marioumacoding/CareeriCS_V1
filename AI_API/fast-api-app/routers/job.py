from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from dependencies import get_db
from schemas import JobPostResponse, JobApplicationCreate, JobApplicationResponse
from services.job_service import (
    bulk_insert_jobs,
    fetch_jobs_paginated,
    fetch_job_post_by_id,
    search_jobs,
    apply_to_job,
)

router = APIRouter(prefix="/jobs", tags=["Jobs"])


@router.post("/bulk-import", status_code=status.HTTP_201_CREATED)
def bulk_import_jobs(
    jobs: List[dict],
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
        created_jobs, updated_count, skipped_count, skipped_items = bulk_insert_jobs(db, jobs)
        
        return {
            "created": len(created_jobs),
            "updated": updated_count,
            "skipped": skipped_count,
            "total_processed": len(jobs),
            "jobs": jsonable_encoder(created_jobs),
            "skipped_items": skipped_items,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=dict)
def list_jobs(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List all job posts with pagination.
    
    Query Parameters:
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 20, max: 100)
    """
    try:
        jobs, total_count = fetch_jobs_paginated(db, skip=skip, limit=limit)
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "jobs": jsonable_encoder(jobs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{job_id}", response_model=JobPostResponse)
def get_job_details(
    job_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get details of a specific job post by ID.
    """
    try:
        job = fetch_job_post_by_id(db, job_id)
        if not job:
            raise HTTPException(
                status_code=404,
                detail=f"Job post with ID {job_id} not found"
            )
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/search/query", response_model=dict)
def search_jobs_endpoint(
    query: str = Query(..., min_length=1),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    Search jobs by title, company, or skills.
    
    Query Parameters:
    - query (required): Search term
    - skip: Number of records to skip (default: 0)
    - limit: Number of records to return (default: 20, max: 100)
    """
    try:
        jobs, total_count = search_jobs(db, query=query, skip=skip, limit=limit)
        return {
            "query": query,
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "jobs": jsonable_encoder(jobs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/apply/{job_id}", response_model=JobApplicationResponse, status_code=status.HTTP_201_CREATED)
def apply_to_job_endpoint(
    job_id: UUID,
    user_id: str = Query(..., description="User ID applying to the job"),
    db: Session = Depends(get_db)
):
    """
    Apply to a job posting.
    
    Query Parameters:
    - user_id (required): UUID of the user applying to the job
    
    Path Parameters:
    - job_id: UUID of the job post to apply to
    """
    try:
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user ID format")
        
        application = apply_to_job(db, user_uuid, job_id)
        return application
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

