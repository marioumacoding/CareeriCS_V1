from typing import List
from uuid import UUID

from sqlalchemy import distinct, func
from sqlalchemy.orm import Session

from db.models import Roadmap, RoadmapCourse, RoadmapSection, RoadmapStep
from schemas import (
    RoadmapCourseReadSchema,
    RoadmapCoursesReadSchema,
    RoadmapListItemSchema,
    RoadmapReadSchema,
    RoadmapSectionCoursesReadSchema,
    RoadmapSectionReadSchema,
    RoadmapStepReadSchema,
)


def list_roadmaps_service(db: Session) -> List[RoadmapListItemSchema]:
    rows = (
        db.query(
            Roadmap.id.label("id"),
            Roadmap.title.label("title"),
            Roadmap.description.label("description"),
            func.count(distinct(RoadmapSection.id)).label("sections_count"),
            func.count(distinct(RoadmapStep.id)).label("steps_count"),
        )
        .outerjoin(RoadmapSection, RoadmapSection.roadmap_id == Roadmap.id)
        .outerjoin(RoadmapStep, RoadmapStep.section_id == RoadmapSection.id)
        .group_by(Roadmap.id, Roadmap.title, Roadmap.description)
        .order_by(Roadmap.title.asc())
        .all()
    )

    return [
        RoadmapListItemSchema(
            id=row.id,
            title=row.title,
            description=row.description or "",
            sections_count=int(row.sections_count or 0),
            steps_count=int(row.steps_count or 0),
        )
        for row in rows
    ]


def _build_roadmap_read(
    roadmap: Roadmap,
    sections: List[RoadmapSection],
    steps_by_section: dict,
    courses_count_by_section: dict,
) -> RoadmapReadSchema:
    sorted_sections = sorted(sections, key=lambda item: (item.order, str(item.id)))

    section_payload = []
    for section in sorted_sections:
        raw_steps = steps_by_section.get(section.id, [])
        sorted_steps = sorted(raw_steps, key=lambda item: (item.order, str(item.id)))

        section_payload.append(
            RoadmapSectionReadSchema(
                id=section.id,
                title=section.title,
                description=section.description or "",
                order=section.order,
                courses_count=int(courses_count_by_section.get(section.id, 0)),
                steps=[
                    RoadmapStepReadSchema(
                        id=step.id,
                        title=step.title,
                        description=step.description or "",
                        order=step.order,
                        resources=step.resources or [],
                    )
                    for step in sorted_steps
                ],
            )
        )

    return RoadmapReadSchema(
        id=roadmap.id,
        title=roadmap.title,
        description=roadmap.description or "",
        sections=section_payload,
    )


def get_roadmap_by_id_service(db: Session, roadmap_id: UUID) -> RoadmapReadSchema | None:
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        return None

    sections = (
        db.query(RoadmapSection)
        .filter(RoadmapSection.roadmap_id == roadmap.id)
        .order_by(RoadmapSection.order.asc(), RoadmapSection.id.asc())
        .all()
    )

    section_ids = [section.id for section in sections]
    steps = []
    if section_ids:
        steps = (
            db.query(RoadmapStep)
            .filter(RoadmapStep.section_id.in_(section_ids))
            .order_by(RoadmapStep.order.asc(), RoadmapStep.id.asc())
            .all()
        )

    steps_by_section = {}
    for step in steps:
        steps_by_section.setdefault(step.section_id, []).append(step)

    courses_count_by_section = {}
    if section_ids:
        course_counts = (
            db.query(
                RoadmapCourse.section_id.label("section_id"),
                func.count(RoadmapCourse.id).label("courses_count"),
            )
            .filter(RoadmapCourse.section_id.in_(section_ids))
            .group_by(RoadmapCourse.section_id)
            .all()
        )
        courses_count_by_section = {
            row.section_id: int(row.courses_count or 0)
            for row in course_counts
        }

    return _build_roadmap_read(roadmap, sections, steps_by_section, courses_count_by_section)


def get_roadmap_by_title_service(db: Session, title: str) -> RoadmapReadSchema | None:
    roadmap = db.query(Roadmap).filter(Roadmap.title.ilike(title)).first()
    if not roadmap:
        return None
    return get_roadmap_by_id_service(db, roadmap.id)


def get_roadmap_courses_by_id_service(db: Session, roadmap_id: UUID) -> RoadmapCoursesReadSchema | None:
    roadmap = db.query(Roadmap).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        return None

    sections = (
        db.query(RoadmapSection)
        .filter(RoadmapSection.roadmap_id == roadmap.id)
        .order_by(RoadmapSection.order.asc(), RoadmapSection.id.asc())
        .all()
    )

    section_ids = [section.id for section in sections]
    courses = []
    if section_ids:
        courses = (
            db.query(RoadmapCourse)
            .filter(RoadmapCourse.section_id.in_(section_ids))
            .order_by(
                RoadmapCourse.section_id.asc(),
                RoadmapCourse.provider.asc(),
                RoadmapCourse.rank_in_provider.asc().nullslast(),
                RoadmapCourse.title.asc(),
            )
            .all()
        )

    courses_by_section: dict = {}
    for course in courses:
        courses_by_section.setdefault(course.section_id, []).append(course)

    section_payload = []
    for section in sections:
        section_payload.append(
            RoadmapSectionCoursesReadSchema(
                section_id=section.id,
                section_title=section.title,
                order=section.order,
                courses=[
                    RoadmapCourseReadSchema(
                        id=course.id,
                        provider=course.provider,
                        title=course.title,
                        url=course.url,
                        description=course.description,
                        language=course.language,
                        is_free=course.is_free,
                        rating=course.rating,
                        provider_course_id=course.provider_course_id,
                        rank_in_provider=course.rank_in_provider,
                    )
                    for course in courses_by_section.get(section.id, [])
                ],
            )
        )

    return RoadmapCoursesReadSchema(
        roadmap_id=roadmap.id,
        roadmap_title=roadmap.title,
        sections=section_payload,
    )
