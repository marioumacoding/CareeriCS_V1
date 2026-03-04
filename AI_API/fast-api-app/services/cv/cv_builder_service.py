from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload
from uuid import UUID
import schemas

from db.models import User, UserSkill
from utils.util import build_cv_pdf


def generate_user_cv_response(
    db: Session,
    user_id: UUID,
):

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

    user_schema = schemas.UserSchema.from_orm(user)

    cv_skills = [
        us for us in user.skills
        if us.isCV and us.skill is not None
    ]

    def serialize(items, schema):
        return [schema.from_orm(i).model_dump() for i in items]

    skills_data = [
        {
            "id": us.skill.id,
            "skill_name": us.skill.skill_name,
            "proficiency": us.proficiency,
        }
        for us in cv_skills
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

    safe_name = "".join(
        c for c in user.full_name if c.isalnum() or c in ("_", "-")
    ).replace(" ", "_")

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename={safe_name}_CV.pdf"
        },
    )