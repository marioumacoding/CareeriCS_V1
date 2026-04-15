from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from dependencies import get_db
from schemas import CourseResponse, CourseSaveInteractionResponse, UserCoursesListResponse
from services.course_service import (
    bulk_insert_courses,
    fetch_courses_filtered,
    fetch_course_by_id,
    set_course_saved_state,
    fetch_user_saved_courses,
)

router = APIRouter(prefix="/courses", tags=["Courses"])


def _parse_user_uuid(user_id: str) -> UUID:
    try:
        return UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID format")


@router.post("/bulk-import", status_code=status.HTTP_201_CREATED)
def bulk_import_courses(
    courses: List[dict],
    db: Session = Depends(get_db)
):
    """
    Bulk import courses from scraped JSON data.
    """
    try:
        created_courses, updated_count, skipped_count, skipped_items = bulk_insert_courses(db, courses)
        return {
            "created": len(created_courses),
            "updated": updated_count,
            "skipped": skipped_count,
            "total_processed": len(courses),
            "courses": jsonable_encoder(created_courses),
            "skipped_items": skipped_items,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/", response_model=dict)
def list_courses(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    query: str | None = Query(None, min_length=1, description="Search in title, track, instructor"),
    track: str | None = Query(None, min_length=1),
    level: str | None = Query(None, min_length=1),
    language: str | None = Query(None, min_length=1),
    instructor: str | None = Query(None, min_length=1),
    source: str | None = Query(None, min_length=1),
    duration: str | None = Query(None, min_length=1),
    min_rating: float | None = Query(None, ge=0, le=5),
    max_rating: float | None = Query(None, ge=0, le=5),
    db: Session = Depends(get_db)
):
    """
    List courses with optional filters.
    """
    try:
        if min_rating is not None and max_rating is not None and min_rating > max_rating:
            raise HTTPException(status_code=400, detail="min_rating cannot be greater than max_rating")

        courses, total_count = fetch_courses_filtered(
            db,
            skip=skip,
            limit=limit,
            query=query,
            track=track,
            level=level,
            language=language,
            instructor=instructor,
            source=source,
            duration=duration,
            min_rating=min_rating,
            max_rating=max_rating,
        )

        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "courses": jsonable_encoder(courses),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/saved", response_model=UserCoursesListResponse)
def list_user_saved_courses(
    user_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """
    List saved courses for a user.
    """
    try:
        courses, total_count = fetch_user_saved_courses(db, user_id=user_id, skip=skip, limit=limit)
        return {
            "total": total_count,
            "skip": skip,
            "limit": limit,
            "courses": jsonable_encoder(courses),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{course_id}/save", response_model=CourseSaveInteractionResponse)
def save_course_endpoint(
    course_id: UUID,
    user_id: str = Query(..., description="User ID saving the course"),
    db: Session = Depends(get_db)
):
    """
    Save a course for the user.
    """
    try:
        user_uuid = _parse_user_uuid(user_id)
        interaction = set_course_saved_state(db, user_uuid, course_id, is_saved=True)
        return interaction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{course_id}/save", response_model=CourseSaveInteractionResponse)
def unsave_course_endpoint(
    course_id: UUID,
    user_id: str = Query(..., description="User ID unsaving the course"),
    db: Session = Depends(get_db)
):
    """
    Remove a saved course for the user.
    """
    try:
        user_uuid = _parse_user_uuid(user_id)
        interaction = set_course_saved_state(db, user_uuid, course_id, is_saved=False)
        return interaction
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{course_id}", response_model=CourseResponse)
def get_course_details(
    course_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get details of a specific course by ID.
    """
    try:
        course = fetch_course_by_id(db, course_id)
        if not course:
            raise HTTPException(status_code=404, detail=f"Course with ID {course_id} not found")
        return course
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
