from typing import List
from uuid import UUID

from sqlalchemy.orm import Session

from db.models import Roadmap, RoadmapSection, RoadmapStep
from schemas import (
    RoadmapListItemSchema,
    RoadmapReadSchema,
    RoadmapSectionReadSchema,
    RoadmapStepReadSchema,
)


def list_roadmaps_service(db: Session) -> List[RoadmapListItemSchema]:
    roadmaps = db.query(Roadmap).order_by(Roadmap.title.asc()).all()
    response: List[RoadmapListItemSchema] = []

    for roadmap in roadmaps:
        sections_count = db.query(RoadmapSection).filter(RoadmapSection.roadmap_id == roadmap.id).count()
        steps_count = (
            db.query(RoadmapStep)
            .join(RoadmapSection, RoadmapStep.section_id == RoadmapSection.id)
            .filter(RoadmapSection.roadmap_id == roadmap.id)
            .count()
        )
        response.append(
            RoadmapListItemSchema(
                id=roadmap.id,
                title=roadmap.title,
                description=roadmap.description or "",
                sections_count=sections_count,
                steps_count=steps_count,
            )
        )

    return response


def _build_roadmap_read(roadmap: Roadmap, sections: List[RoadmapSection], steps_by_section: dict) -> RoadmapReadSchema:
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

    return _build_roadmap_read(roadmap, sections, steps_by_section)


def get_roadmap_by_title_service(db: Session, title: str) -> RoadmapReadSchema | None:
    roadmap = db.query(Roadmap).filter(Roadmap.title.ilike(title)).first()
    if not roadmap:
        return None
    return get_roadmap_by_id_service(db, roadmap.id)
