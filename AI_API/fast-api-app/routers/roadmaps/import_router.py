from fastapi import APIRouter, Body, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from schemas import (
    BulkRoadmapImportResponseSchema,
    RoadmapImportFromPathRequestSchema,
    RoadmapImportRequestSchema,
)
from services.roadmaps.import_service import (
    import_default_bulk,
    import_roadmaps_from_path,
    import_roadmaps_from_request,
)


router = APIRouter(prefix="/roadmaps/import", tags=["Roadmaps Import"])


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
