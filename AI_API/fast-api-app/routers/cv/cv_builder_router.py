from uuid import UUID
from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session

from dependencies import get_db
from services.cv.cv_builder_service import generate_user_cv_response


router = APIRouter(prefix="/cv", tags=["CV"])


@router.post("/build/{user_id}")
def generate_cv(
    user_id: UUID,
    update_data: dict | None = Body(default=None),
    db: Session = Depends(get_db),
):
    return generate_user_cv_response(
        db=db,
        user_id=user_id,
        update_data=update_data,
    )