from datetime import UTC, datetime
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlparse
from uuid import UUID
import re

from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from db.models import Course, CourseUserInteraction, User


def _parse_rating(value: Any) -> Optional[float]:
    if value is None:
        return None

    if isinstance(value, (int, float)):
        return float(value)

    text = str(value).strip()
    if not text:
        return None

    match = re.search(r"\d+(\.\d+)?", text)
    if not match:
        return None

    try:
        return float(match.group(0))
    except ValueError:
        return None


def _infer_source(url: str) -> Optional[str]:
    if not url:
        return None

    parsed = urlparse(url)
    host = (parsed.netloc or "").lower()

    if "coursera" in host:
        return "coursera"
    if "udemy" in host:
        return "udemy"
    if host:
        return host.replace("www.", "")

    return None


def normalize_course_data(course_data: dict) -> dict:
    course_url = (course_data.get("course_url") or course_data.get("link") or "").strip()
    source = (course_data.get("source") or "").strip() or _infer_source(course_url)

    normalized = {
        "track": (course_data.get("track") or "").strip(),
        "title": (course_data.get("title") or "").strip(),
        "instructor": (course_data.get("instructor") or "").strip() or None,
        "rating": _parse_rating(course_data.get("rating")),
        "reviews": (course_data.get("reviews") or "").strip() or None,
        "duration": (course_data.get("duration") or "").strip() or None,
        "level": (course_data.get("level") or "").strip() or None,
        "language": (course_data.get("language") or "").strip() or None,
        "price": (course_data.get("price") or "").strip() or None,
        "original_price": (course_data.get("original_price") or "").strip() or None,
        "course_url": course_url,
        "source": source,
    }

    return normalized


def bulk_insert_courses(db: Session, courses_data: List[dict]) -> Tuple[List[Course], int, int, List[Dict[str, Any]]]:
    created_courses: List[Course] = []
    updated_count = 0
    skipped_count = 0
    skipped_items: List[Dict[str, Any]] = []

    try:
        for index, course_data in enumerate(courses_data):
            try:
                if not isinstance(course_data, dict):
                    skipped_count += 1
                    skipped_items.append({
                        "index": index,
                        "reason": "Course item must be a JSON object",
                    })
                    continue

                normalized = normalize_course_data(course_data)

                if not normalized["track"] or not normalized["title"] or not normalized["course_url"]:
                    skipped_count += 1
                    skipped_items.append({
                        "index": index,
                        "title": normalized.get("title") or None,
                        "reason": "Missing required fields: track/title/course_url",
                    })
                    continue

                existing_course = db.query(Course).filter(Course.course_url == normalized["course_url"]).first()

                if existing_course:
                    for key, value in normalized.items():
                        if hasattr(existing_course, key):
                            setattr(existing_course, key, value)
                    db.add(existing_course)
                    updated_count += 1
                    continue

                course = Course(**normalized)
                db.add(course)
                created_courses.append(course)

            except IntegrityError:
                db.rollback()
                skipped_count += 1
                skipped_items.append({
                    "index": index,
                    "title": (course_data.get("title") if isinstance(course_data, dict) else None),
                    "reason": "IntegrityError while inserting/updating course",
                })
            except Exception as exc:
                skipped_count += 1
                skipped_items.append({
                    "index": index,
                    "title": (course_data.get("title") if isinstance(course_data, dict) else None),
                    "reason": f"Unexpected error while processing course: {str(exc)}",
                })

        db.commit()

        for course in created_courses:
            db.refresh(course)

    except Exception:
        db.rollback()
        raise

    return created_courses, updated_count, skipped_count, skipped_items


def fetch_courses_filtered(
    db: Session,
    skip: int = 0,
    limit: int = 20,
    query: Optional[str] = None,
    track: Optional[str] = None,
    level: Optional[str] = None,
    language: Optional[str] = None,
    instructor: Optional[str] = None,
    source: Optional[str] = None,
    duration: Optional[str] = None,
    min_rating: Optional[float] = None,
    max_rating: Optional[float] = None,
) -> Tuple[List[Course], int]:
    limit = min(limit, 100)

    query_obj = db.query(Course)

    if query:
        search_pattern = f"%{query.strip()}%"
        query_obj = query_obj.filter(
            or_(
                Course.title.ilike(search_pattern),
                Course.track.ilike(search_pattern),
                Course.instructor.ilike(search_pattern),
            )
        )

    if track:
        query_obj = query_obj.filter(Course.track.ilike(f"%{track.strip()}%"))
    if level:
        query_obj = query_obj.filter(Course.level.ilike(f"%{level.strip()}%"))
    if language:
        query_obj = query_obj.filter(Course.language.ilike(f"%{language.strip()}%"))
    if instructor:
        query_obj = query_obj.filter(Course.instructor.ilike(f"%{instructor.strip()}%"))
    if source:
        query_obj = query_obj.filter(Course.source.ilike(f"%{source.strip()}%"))
    if duration:
        query_obj = query_obj.filter(Course.duration.ilike(f"%{duration.strip()}%"))

    if min_rating is not None:
        query_obj = query_obj.filter(Course.rating >= min_rating)
    if max_rating is not None:
        query_obj = query_obj.filter(Course.rating <= max_rating)

    total_count = query_obj.with_entities(func.count(Course.id)).scalar() or 0
    courses = query_obj.order_by(Course.created_at.desc()).offset(skip).limit(limit).all()

    return courses, total_count


def fetch_course_by_id(db: Session, course_id: UUID) -> Optional[Course]:
    return db.query(Course).filter(Course.id == course_id).first()


def _validate_user_and_course(db: Session, user_id: UUID, course_id: UUID) -> None:
    user_exists = db.query(User.id).filter(User.id == user_id).first()
    if not user_exists:
        raise ValueError(f"User with ID {user_id} not found")

    course_exists = db.query(Course.id).filter(Course.id == course_id).first()
    if not course_exists:
        raise ValueError(f"Course with ID {course_id} not found")


def set_course_saved_state(db: Session, user_id: UUID, course_id: UUID, is_saved: bool) -> CourseUserInteraction:
    _validate_user_and_course(db, user_id, course_id)

    interaction = db.query(CourseUserInteraction).filter(
        CourseUserInteraction.user_id == user_id,
        CourseUserInteraction.course_id == course_id,
    ).first()

    now = datetime.now(UTC)

    if not interaction:
        interaction = CourseUserInteraction(
            user_id=user_id,
            course_id=course_id,
            is_saved=is_saved,
            saved_at=now if is_saved else None,
        )
        db.add(interaction)
    else:
        interaction.is_saved = is_saved
        interaction.saved_at = now if is_saved else None
        db.add(interaction)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise ValueError("Invalid course or user reference for interaction")

    db.refresh(interaction)
    return interaction


def fetch_user_saved_courses(
    db: Session,
    user_id: UUID,
    skip: int = 0,
    limit: int = 20,
) -> Tuple[List[Course], int]:
    limit = min(limit, 100)

    user_exists = db.query(User.id).filter(User.id == user_id).first()
    if not user_exists:
        raise ValueError(f"User with ID {user_id} not found")

    query_obj = db.query(Course).join(
        CourseUserInteraction,
        CourseUserInteraction.course_id == Course.id,
    ).filter(
        CourseUserInteraction.user_id == user_id,
        CourseUserInteraction.is_saved.is_(True),
    )

    total_count = query_obj.count()
    courses = query_obj.order_by(CourseUserInteraction.saved_at.desc().nullslast()).offset(skip).limit(limit).all()

    return courses, total_count
