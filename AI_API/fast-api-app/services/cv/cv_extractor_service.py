import os
import json
from uuid import UUID
import tempfile
from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from db.models import (
    User,
    Skill,
    Experience,
    Education,
    Certification,
    Project,
    Language,
    Award,
    Reference,
)

from utils.util import (
    extract_text,
    parse_and_enhance_cv,
    safe_list,
    clean_str,
    ensure_list,
)

# =========================
# Upload CV to DB
# =========================

def upload_cv_to_db(db: Session, user_id: UUID, cv_data: dict):

    try:
        with db.begin():

            user = db.query(User).filter(User.id == user_id).first()

            if not user:
                raise HTTPException(status_code=404, detail="User not found")

            # =========================
            # Update User Fields
            # =========================
            user.full_name = clean_str(cv_data.get("full_name"))
            user.professional_title = clean_str(cv_data.get("professional_title"))
            user.email = clean_str(cv_data.get("contact", {}).get("email"))
            user.phone = clean_str(cv_data.get("contact", {}).get("phone"))
            user.city = clean_str(cv_data.get("contact", {}).get("city"))
            user.country = clean_str(cv_data.get("contact", {}).get("country"))
            user.linkedin = clean_str(cv_data.get("contact", {}).get("linkedin"))
            user.portfolio = clean_str(cv_data.get("contact", {}).get("portfolio"))
            user.summary = clean_str(cv_data.get("summary"))

            # =========================
            # Clear Existing Relations
            # =========================
            user.skills.clear()
            user.experiences.clear()
            user.education.clear()
            user.certifications.clear()
            user.projects.clear()
            user.languages.clear()
            user.awards.clear()
            user.references.clear()

            db.flush()

            # =========================
            # Skills
            # =========================
            for skill in safe_list(cv_data, "skills"):
                db.add(Skill(
                    user_id=user.id,
                    skill_name=clean_str(
                        skill.get("skill_name") if isinstance(skill, dict) else skill
                    ),
                    proficiency=clean_str(
                        skill.get("proficiency") if isinstance(skill, dict) else None
                    ),
                ))

            # =========================
            # Experiences
            # =========================
            for exp in safe_list(cv_data, "experiences"):
                db.add(Experience(
                    user_id=user.id,
                    role=clean_str(exp.get("role")),
                    organization=clean_str(exp.get("organization")),
                    period=clean_str(exp.get("period")),
                    responsibilities=ensure_list(exp.get("responsibilities")),
                    achievements=clean_str(exp.get("achievements")),
                ))

            # =========================
            # Education
            # =========================
            for edu in safe_list(cv_data, "education"):
                db.add(Education(
                    user_id=user.id,
                    qualification=clean_str(edu.get("qualification")),
                    institution=clean_str(edu.get("institution")),
                    period=clean_str(edu.get("period")),
                    details=clean_str(edu.get("details")),
                ))

            # =========================
            # Certifications
            # =========================
            for cert in safe_list(cv_data, "certifications"):
                db.add(Certification(
                    user_id=user.id,
                    title=clean_str(cert.get("title")),
                    organization=clean_str(cert.get("organization")),
                    period=clean_str(cert.get("period")),
                ))

            # =========================
            # Projects
            # =========================
            for proj in safe_list(cv_data, "projects"):
                db.add(Project(
                    user_id=user.id,
                    title=clean_str(proj.get("title")),
                    description=clean_str(proj.get("description")),
                    role=clean_str(proj.get("role")),
                    technologies=ensure_list(proj.get("technologies")),
                    achievements=clean_str(proj.get("achievements")),
                ))

            # =========================
            # Languages
            # =========================
            for lang in safe_list(cv_data, "languages"):
                db.add(Language(
                    user_id=user.id,
                    language=clean_str(lang.get("language")),
                    proficiency=clean_str(lang.get("proficiency")),
                ))

            # =========================
            # Awards
            # =========================
            for award in safe_list(cv_data, "awards"):
                db.add(Award(
                    user_id=user.id,
                    title=clean_str(award.get("title")),
                    organization=clean_str(award.get("organization")),
                    date=clean_str(award.get("date")),
                    description=clean_str(award.get("description")),
                ))

            # =========================
            # References
            # =========================
            for ref in safe_list(cv_data, "references"):
                db.add(Reference(
                    user_id=user.id,
                    name=clean_str(ref.get("name")),
                    role=clean_str(ref.get("role")),
                    organization=clean_str(ref.get("organization")),
                    contact_info=clean_str(ref.get("contact_info")),
                ))

        return {"status": "success", "user_id": user.id}

    except SQLAlchemyError as e:
        db.rollback()
        raise e


# =========================
# Process CV File and Upload
# =========================

def process_and_generate_cv(file_path: str, db: Session):

    text = extract_text(file_path)
    if not text:
        raise ValueError("No text extracted from file.")

    cv_data = parse_and_enhance_cv(text)

    return upload_cv_to_db(db, user_id=None, cv_data=cv_data)


# =========================
# Handle Upload Endpoint
# =========================

async def handle_cv_upload(
    file: UploadFile,
    user_id: UUID,
    db: Session
):

    suffix = os.path.splitext(file.filename)[1].lower()

    if suffix not in [".pdf", ".docx"]:
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        file_path = tmp.name

    try:
        cv_text = extract_text(file_path)

        if not cv_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Text extraction failed."
            )

        cv_data = parse_and_enhance_cv(cv_text)

        if isinstance(cv_data, str):
            cv_data = json.loads(cv_data)

        return upload_cv_to_db(db, user_id, cv_data)

    finally:
        if os.path.exists(file_path):
            os.remove(file_path)