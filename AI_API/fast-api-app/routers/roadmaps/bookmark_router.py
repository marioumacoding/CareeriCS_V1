from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from dependencies import get_db
from schemas import UserRoadmapBookmarkListSchema, UserRoadmapBookmarkToggleSchema
from services.roadmaps.bookmark_service import (
    get_user_roadmap_bookmarks_service,
    toggle_user_roadmap_bookmark_service,
)


router = APIRouter(prefix="/roadmaps", tags=["Roadmaps Bookmarks"])


@router.get("/bookmarks/{user_id}", response_model=UserRoadmapBookmarkListSchema)
async def get_user_roadmap_bookmarks_endpoint(user_id: UUID, db: Session = Depends(get_db)):
    try:
        return get_user_roadmap_bookmarks_service(db, user_id)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/{roadmap_id}/bookmarks/{user_id}", response_model=UserRoadmapBookmarkToggleSchema)
async def toggle_user_roadmap_bookmark_endpoint(
    roadmap_id: UUID,
    user_id: UUID,
    db: Session = Depends(get_db),
):
    try:
        return toggle_user_roadmap_bookmark_service(db, roadmap_id, user_id)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
