from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from schemas import RoadmapCoursesReadSchema, RoadmapListItemSchema, RoadmapReadSchema
from services.roadmaps.query_service import (
    get_roadmap_courses_by_id_service,
    get_roadmap_by_id_service,
    get_roadmap_by_title_service,
    list_roadmaps_service,
)


router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])


@router.get("", response_model=list[RoadmapListItemSchema])
async def list_roadmaps_endpoint(db: Session = Depends(get_db)):
    return list_roadmaps_service(db)


@router.get("/by-title/{title}", response_model=RoadmapReadSchema)
async def get_roadmap_by_title_endpoint(title: str, db: Session = Depends(get_db)):
    roadmap = get_roadmap_by_title_service(db, title)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.get("/{roadmap_id}/courses", response_model=RoadmapCoursesReadSchema)
async def get_roadmap_courses_by_id_endpoint(roadmap_id: UUID, db: Session = Depends(get_db)):
    roadmap = get_roadmap_courses_by_id_service(db, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap


@router.get("/{roadmap_id}", response_model=RoadmapReadSchema)
async def get_roadmap_by_id_endpoint(roadmap_id: UUID, db: Session = Depends(get_db)):
    roadmap = get_roadmap_by_id_service(db, roadmap_id)
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found")
    return roadmap
