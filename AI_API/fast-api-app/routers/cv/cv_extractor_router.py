from uuid import UUID
from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from dependencies import get_db
from services.cv.cv_extractor_service import handle_cv


router = APIRouter(prefix="/cv", tags=["CV"])


@router.post("/extract/{user_id}")
async def extract_cv(
    user_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await handle_cv(file, user_id, db, type="extractor")