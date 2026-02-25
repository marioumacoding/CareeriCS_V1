from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session

from dependencies import get_db
from services.cv.cv_extractor_service import handle_cv_upload


router = APIRouter(prefix="/cv", tags=["CV"])


@router.post("/upload/{user_id}")
async def upload_cv(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await handle_cv_upload(file, user_id, db)