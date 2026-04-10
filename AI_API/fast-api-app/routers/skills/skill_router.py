from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from dependencies import get_db
from schemas import SkillCreate, SkillRead
from services.skills.skill_service import (
    create_skill,
    create_skills_bulk,
    list_skills,
)

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("/", response_model=List[SkillRead])
def list_skills_endpoint(db: Session = Depends(get_db)):
    return list_skills(db)


@router.post("/", response_model=SkillRead, status_code=status.HTTP_201_CREATED)
def create_skill_endpoint(
    skill: SkillCreate,
    db: Session = Depends(get_db)
):
    try:
        return create_skill(db, skill)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/bulk", response_model=List[SkillRead], status_code=status.HTTP_201_CREATED)
def create_skills_bulk_endpoint(
    skills: List[SkillCreate],
    db: Session = Depends(get_db)
):
    return create_skills_bulk(db, skills)