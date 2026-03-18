from uuid import UUID
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
import json

from dependencies import get_db
from services.cv.cv_builder_service import build_user_cv

router = APIRouter(prefix="/cv", tags=["CV"])


@router.post("/build/{user_id}")
async def generate_cv(
    user_id: UUID,
    cv_text: dict = Body(...),
    db: Session = Depends(get_db),
):
    return await build_user_cv(
        db=db,
        user_id=user_id,
        cv_text=json.dumps(cv_text)
    )