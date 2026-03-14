from sqlalchemy.orm import Session
from uuid import UUID
from fastapi import UploadFile
from .cv_extractor_service import handle_cv
from .cv_builder_service import generate_user_cv_response  

async def enhance_cv_wrapper(db: Session, user_id: UUID, file: UploadFile):
   
    await handle_cv(file, user_id, db, type="enhancer")

    return generate_user_cv_response(db=db, user_id=user_id)