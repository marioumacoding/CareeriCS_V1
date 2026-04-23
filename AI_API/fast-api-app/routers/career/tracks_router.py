from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

import schemas
from dependencies import get_db
from services.career.track_service import list_tracks

router = APIRouter(
    prefix="/career/tracks",
    tags=["career_tracks"]
)


@router.get("/", response_model=List[schemas.CareerTrackRead])
def get_career_tracks(
    db: Session = Depends(get_db)
):
    return list_tracks(db)
