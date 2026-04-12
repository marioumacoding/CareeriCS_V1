from uuid import UUID

from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from schemas import (
    RoadmapProgressSummarySchema,
    StepProgressUpsertRequestSchema,
    UserRoadmapProgressListSchema,
)
from services.roadmaps.progress_service import (
    get_roadmap_progress_service,
    get_user_roadmaps_progress_service,
    upsert_step_progress_service,
)


router = APIRouter(prefix="/roadmaps", tags=["Roadmaps Progress"])


@router.put("/{roadmap_id}/progress/{user_id}/steps/{step_id}", response_model=RoadmapProgressSummarySchema)
async def upsert_step_progress_endpoint(
    roadmap_id: UUID,
    user_id: UUID,
    step_id: UUID,
    payload: StepProgressUpsertRequestSchema = Body(...),
    db: Session = Depends(get_db),
):
    try:
        return upsert_step_progress_service(db, roadmap_id, user_id, step_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/{roadmap_id}/progress/{user_id}", response_model=RoadmapProgressSummarySchema)
async def get_roadmap_progress_endpoint(
    roadmap_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
):
    try:
        return get_roadmap_progress_service(db, roadmap_id, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/progress/{user_id}", response_model=UserRoadmapProgressListSchema)
async def get_user_roadmaps_progress_endpoint(user_id: UUID, db: Session = Depends(get_db)):
    try:
        return get_user_roadmaps_progress_service(db, user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
