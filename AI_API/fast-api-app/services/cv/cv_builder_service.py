from uuid import UUID

from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

import schemas
from db.models import Report, ReportTypeEnum, User, UserSkill
from services.reports.report_service import save_report
from utils.util import build_cv_pdf

from .cv_extractor_service import handle_cv_for_builder


def _load_user_with_cv_relations(db: Session, user_id: UUID) -> User:
    user = (
        db.query(User)
        .options(
            joinedload(User.skills).joinedload(UserSkill.skill),
            joinedload(User.experiences),
            joinedload(User.education),
            joinedload(User.certifications),
            joinedload(User.projects),
            joinedload(User.languages),
            joinedload(User.awards),
            joinedload(User.references),
        )
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


def get_user_cv_profile(db: Session, user_id: UUID) -> schemas.UserSchema:
    user = _load_user_with_cv_relations(db, user_id)
    return schemas.UserSchema.from_orm(user)


def generate_user_cv_response(
    db: Session,
    user_id: UUID,
):
    user = _load_user_with_cv_relations(db, user_id)
    user_schema = schemas.UserSchema.from_orm(user)

    cv_skills = [
        user_skill
        for user_skill in user.skills
        if user_skill.isCV and user_skill.skill is not None
    ]

    def serialize(items, schema):
        return [schema.from_orm(item).model_dump() for item in items]

    skills_data = [
        {
            "id": user_skill.skill.id,
            "skill_name": user_skill.skill.skill_name,
            "proficiency": user_skill.proficiency,
        }
        for user_skill in cv_skills
    ]

    pdf_buffer = build_cv_pdf(
        user_data=user_schema.model_dump(),
        skills=skills_data,
        experiences=serialize(user.experiences, schemas.ExperienceSchema),
        education=serialize(user.education, schemas.EducationSchema),
        certifications=serialize(user.certifications, schemas.CertificationSchema),
        projects=serialize(user.projects, schemas.ProjectSchema),
        languages=serialize(user.languages, schemas.LanguageSchema),
        awards=serialize(user.awards, schemas.AwardSchema),
        references=serialize(user.references, schemas.ReferenceSchema),
        enhance_ai=True,
    )

    base_name = user.full_name or "careerics"
    safe_name = "".join(
        character for character in base_name if character.isalnum() or character in ("_", "-", " ")
    ).strip().replace(" ", "_") or "careerics"

    pdf_bytes = pdf_buffer.getvalue()
    version = (
        db.query(func.count(Report.id))
        .filter(
            Report.user_id == str(user.id),
            Report.type == ReportTypeEnum.CV,
        )
        .scalar()
    ) + 1

    save_report(
        db=db,
        user_id=str(user.id),
        file_bytes=pdf_bytes,
        filename=f"{safe_name}_CV_V{version}.pdf",
        report_type=ReportTypeEnum.CV,
    )

    pdf_buffer.seek(0)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={safe_name}_CV.pdf"
        },
    )


async def build_user_cv(user_id: UUID, db: Session, cv_text: str):
    await handle_cv_for_builder(cv_text, user_id, db, type="extractor")
    return generate_user_cv_response(db=db, user_id=user_id)
