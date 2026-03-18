from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from services.skill_assessment.answers import submit_answers, get_results
from schemas import SubmitAssessmentRequest, SubmitAssessmentResponse
from dependencies import get_db

router = APIRouter(prefix="/skill_assessment/answers", tags=["Skill Assessment Answers"])


@router.post("/submit/{user_id}", response_model=SubmitAssessmentResponse)
async def submit_answers_endpoint(
    user_id: UUID,
    payload: SubmitAssessmentRequest = Body(...),
    db: Session = Depends(get_db)
):
    try:
        user_answers = [a.dict() for a in payload.answers]
        return submit_answers(db, payload.session_id, str(user_id), user_answers)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/results/{user_id}/{session_id}", response_model=SubmitAssessmentResponse)
async def get_results_endpoint(
    user_id: UUID,
    session_id: UUID,
    db: Session = Depends(get_db)
):
    try:
        return get_results(db, str(session_id), str(user_id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))