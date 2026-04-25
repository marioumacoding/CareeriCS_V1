from fastapi import APIRouter, Body, Depends, Header, HTTPException
from sqlalchemy.orm import Session

from core.config import settings
from dependencies import get_db
from schemas import (
    BulkRoadmapImportResponseSchema,
    RoadmapCourseIngestionRequestSchema,
    RoadmapCourseIngestionResponseSchema,
    RoadmapImportFromPathRequestSchema,
    RoadmapImportRequestSchema,
)
from services.roadmaps.course_ingestion_service import ingest_roadmap_courses
from services.roadmaps.import_service import (
    import_default_bulk,
    import_roadmaps_from_path,
    import_roadmaps_from_request,
)


router = APIRouter(prefix="/roadmaps/import", tags=["Roadmaps Import"])


def _validate_admin_token(admin_token: str | None) -> None:
    expected = settings.ROADMAP_IMPORT_ADMIN_TOKEN
    if not expected:
        raise HTTPException(
            status_code=500,
            detail="ROADMAP_IMPORT_ADMIN_TOKEN is not configured",
        )
    if admin_token != expected:
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("", response_model=BulkRoadmapImportResponseSchema)
async def import_roadmaps_endpoint(
    payload: RoadmapImportRequestSchema = Body(...),
    db: Session = Depends(get_db),
):
    try:
        return import_roadmaps_from_request(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/from-path", response_model=BulkRoadmapImportResponseSchema)
async def import_roadmaps_from_path_endpoint(
    payload: RoadmapImportFromPathRequestSchema = Body(...),
    db: Session = Depends(get_db),
):
    try:
        return import_roadmaps_from_path(db, payload.path, recursive=payload.recursive)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/default-bulk", response_model=BulkRoadmapImportResponseSchema)
async def import_default_bulk_endpoint(db: Session = Depends(get_db)):
    try:
        return import_default_bulk(db)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/courses/one-time", response_model=RoadmapCourseIngestionResponseSchema)
async def ingest_roadmap_courses_endpoint(
    payload: RoadmapCourseIngestionRequestSchema | None = Body(default=None),
    x_admin_token: str | None = Header(default=None, alias="X-Admin-Token"),
    db: Session = Depends(get_db),
):
    _validate_admin_token(x_admin_token)
    payload = payload or RoadmapCourseIngestionRequestSchema()
    try:
        return ingest_roadmap_courses(db, payload)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
