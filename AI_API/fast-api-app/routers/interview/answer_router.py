from uuid import UUID
from fastapi import APIRouter, Depends, Form, File, UploadFile
from sqlalchemy.orm import Session
from dependencies import get_db
from services.interview.answer_service import (
    submit_answer_service,
    evaluate_answer_service_wrapper,
)

router = APIRouter(
    prefix="/answers",
    tags=["Answers"]
)


# ============================================================
# SUBMIT ANSWER
# ============================================================
@router.post("/")
async def submit_answer(
    session_id: UUID = Form(...),
    question_id: UUID = Form(...),
    audio: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return await submit_answer_service(
        db,
        session_id,
        question_id,
        audio,
    )


# ============================================================
# EVALUATE ANSWER
# ============================================================
@router.post("/evaluate/")
async def evaluate_answer(
    session_id: UUID = Form(...),
    question_id: UUID = Form(...),
    db: Session = Depends(get_db),
):
    return await evaluate_answer_service_wrapper(
        db,
        session_id,
        question_id,
    )