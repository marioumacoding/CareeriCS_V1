from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session, joinedload

from uuid import UUID
import schemas
from db.models import User
from utils.util import build_cv_pdf


ALLOWED_UPDATE_FIELDS = {
    "full_name",
    "phone",
    "city",
    "country",
    "summary",
}


def generate_user_cv_response(
    db: Session,
    user_id: UUID,
    update_data: dict | None = None,
):

    user = (
        db.query(User)
        .options(
            joinedload(User.skills),
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

    if update_data:
        for field, value in update_data.items():
            if field in ALLOWED_UPDATE_FIELDS:
                setattr(user, field, value)

        db.commit()
        db.refresh(user)

    user_schema = schemas.UserSchema.from_orm(user)

    def serialize(items, schema):
        return [schema.from_orm(i).model_dump() for i in items]

    pdf_buffer = build_cv_pdf(
        user_data=user_schema.model_dump(),
        skills=serialize(user.skills, schemas.SkillSchema),
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