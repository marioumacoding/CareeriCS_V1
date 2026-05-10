import json
from uuid import UUID

from fastapi import APIRouter, Body, Depends
from sqlalchemy.orm import Session

import schemas
from dependencies import get_db
from services.cv.cv_builder_service import build_user_cv, get_user_cv_profile

router = APIRouter(prefix="/cv", tags=["CV"])


@router.get("/profile/{user_id}", response_model=schemas.UserSchema)
async def get_cv_profile(
    user_id: UUID,
    db: Session = Depends(get_db),
):
    return get_user_cv_profile(db=db, user_id=user_id)


@router.post("/build/{user_id}")
async def generate_cv(
    user_id: UUID,
    cv_text: dict = Body(...),
    db: Session = Depends(get_db),
):
    return await build_user_cv(
        db=db,
        user_id=user_id,
        cv_text=json.dumps(cv_text),
    )
