from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from dependencies import get_db
from services.cv.cv_enhancer_service import enhance_cv_wrapper


router = APIRouter(prefix="/cv", tags=["CV"])


@router.post("/enhance/{user_id}")
async def enhance_cv(
    user_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await enhance_cv_wrapper(
        db=db, 
        user_id=user_id, 
        file=file
    )