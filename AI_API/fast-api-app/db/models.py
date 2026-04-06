import datetime
import uuid
from sqlalchemy import (
    TIMESTAMP,
    Column,
    Enum,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Text,
    JSON,
    DateTime,
    UniqueConstraint,
    Float,
    Index
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY, BYTEA, JSONB, UUID
from sqlalchemy.sql import func

from db.base import Base

from enum import Enum as enum


# =========================
# USER
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    full_name = Column(String, nullable=False)
    professional_title = Column(String)
    email = Column(String)
    phone = Column(String)
    city = Column(String)
    country = Column(String)
    linkedin = Column(String)
    portfolio = Column(String)
    summary = Column(Text)
    username = Column(String)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")
    education = relationship("Education", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    languages = relationship("Language", back_populates="user", cascade="all, delete-orphan")
    awards = relationship("Award", back_populates="user", cascade="all, delete-orphan")
    references = relationship("Reference", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user",cascade="all, delete-orphan")
    assessment = relationship("RoadmapAssessmentResult", back_populates="user", cascade="all, delete-orphan")
    bookmarks = relationship("UserRoadmapBookmark", back_populates="user", cascade="all, delete-orphan")


# ###########################################################################################################################
# INTERVIEW
# ###########################################################################################################################

# =========================
# QUESTION
# =========================
class Question(Base):
    __tablename__ = "interview_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    type = Column(String, nullable=False)
    question_text = Column(String, nullable=False)
    question_audio = Column(String, nullable=True)

    answers = relationship("Answer", back_populates="question")


# =========================
# SESSION
# =========================
class Session(Base):
    __tablename__ = "interview_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    emotion_evaluation = Column(JSON, nullable=True)
    tone_evaluation = Column(JSON, nullable=True)
    sentiment_evaluation = Column(JSON, nullable=True)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="sessions")
    answers = relationship("Answer", back_populates="session", cascade="all, delete-orphan")


# =========================
# ANSWER
# =========================
class Answer(Base):
    __tablename__ = "interview_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    answer_text = Column(String, nullable=True)
    answer_audio = Column(String, nullable=True)
    answer_video = Column(String, nullable=True)

    feedback = Column(String, nullable=True)
    grade = Column(String, nullable=True)
    isfollowup = Column(Boolean, default=False)

    emotion_evaluation = Column(JSON, nullable=True)
    tone_evaluation = Column(JSON, nullable=True)
    sentiment_evaluation = Column(JSON, nullable=True)

    question_id = Column(UUID(as_uuid=True), ForeignKey("interview_questions.id"), nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("interview_sessions.id"), nullable=False)

    question = relationship("Question", back_populates="answers")
    session = relationship("Session", back_populates="answers")

    followup = relationship(
        "Followup",
        back_populates="answer",
        uselist=False,
        cascade="all, delete-orphan"
    )


# =========================
# FOLLOWUP
# =========================
class Followup(Base):
    __tablename__ = "interview_followups"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    fquestion_text = Column(String, nullable=False)
    fquestion_audio = Column(String, nullable=True)

    answer_id = Column(
        UUID(as_uuid=True),
        ForeignKey("interview_answers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    answer = relationship("Answer", back_populates="followup")



# ###########################################################################################################################
# CV
# ###########################################################################################################################

# =========================
# SKILL
# =========================
class Skill(Base):
    __tablename__ = "skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    skill_name = Column(String, nullable=False, unique=True)
    

# =========================
# USER SKILLS
# =========================
class UserSkill(Base):
    __tablename__ = "user_skills"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)

    isCV = Column(Boolean, nullable=False, default=False)
    proficiency = Column(String)
    score = Column(Integer, nullable=True)

    user = relationship("User", back_populates="skills")
    skill = relationship("Skill")

    __table_args__ = (
        UniqueConstraint("user_id", "skill_id", name="uq_user_skill"),
    )


# =========================
# EXPERIENCE
# =========================
class Experience(Base):
    __tablename__ = "user_experiences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    organization = Column(String)
    period = Column(String)
    responsibilities = Column(JSON, nullable=True)
    achievements = Column(Text)

    user = relationship("User", back_populates="experiences")


# =========================
# EDUCATION
# =========================
class Education(Base):
    __tablename__ = "user_education"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    qualification = Column(String)
    institution = Column(String)
    period = Column(String)
    details = Column(Text)

    user = relationship("User", back_populates="education")


# =========================
# CERTIFICATION
# =========================
class Certification(Base):
    __tablename__ = "user_certifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String)
    organization = Column(String)
    period = Column(String)

    user = relationship("User", back_populates="certifications")


# =========================
# PROJECT
# =========================
class Project(Base):
    __tablename__ = "user_projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String)
    description = Column(Text)
    role = Column(String)
    technologies = Column(ARRAY(String))
    achievements = Column(Text)

    user = relationship("User", back_populates="projects")


# =========================
# LANGUAGE
# =========================
class Language(Base):
    __tablename__ = "user_languages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    language = Column(String)
    proficiency = Column(String)

    user = relationship("User", back_populates="languages")


# =========================
# AWARD
# =========================
class Award(Base):
    __tablename__ = "user_awards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String)
    organization = Column(String)
    date = Column(String)
    description = Column(Text)

    user = relationship("User", back_populates="awards")


# =========================
# REFERENCE
# =========================
class Reference(Base):
    __tablename__ = "user_references"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String)
    role = Column(String)
    organization = Column(String)
    contact_info = Column(String)

    user = relationship("User", back_populates="references")


# ###########################################################################################################################
# SKILL_ASSESSMENT
# ###########################################################################################################################

# =========================
# SKILL ASSESSMENT SESSION
# =========================
class AssessmentSession(Base):
    __tablename__ = "assessment_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=True)
    section_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_sections.id"), nullable=True)
    step_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_steps.id"), nullable=True)

    total_questions = Column(Integer, nullable=False)
    score = Column(Integer, default=0)
    status = Column(String, default="in_progress")  # in_progress, submitted
    type = Column(String, nullable=False)  # skill, roadmap, section, step

    started_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    assessment_questions = relationship(
        "AssessmentQuestion", back_populates="session", cascade="all, delete"
    )
    assessment_answers = relationship(
        "AssessmentAnswer", back_populates="session", cascade="all, delete"
    )

    # Optional relationships to roadmap entities (read-only)
    roadmap = relationship("Roadmap", foreign_keys=[roadmap_id])
    section = relationship("RoadmapSection", foreign_keys=[section_id])
    step = relationship("RoadmapStep", foreign_keys=[step_id])


# =========================
# SKILL ASSESSMENT QUESTION
# =========================
class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("assessment_sessions.id"), nullable=False)

    question_text = Column(Text, nullable=False)
    options = Column(JSONB, nullable=False)
    correct_answer = Column(String, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("AssessmentSession", back_populates="assessment_questions")
    assessment_answers = relationship("AssessmentAnswer", back_populates="question")


# =========================
# SKILL ASSESSMENT ANSWER
# =========================
class AssessmentAnswer(Base):
    __tablename__ = "assessment_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("assessment_sessions.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("assessment_questions.id"), nullable=False)

    selected_answer = Column(String, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    answered_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    session = relationship("AssessmentSession", back_populates="assessment_answers")
    question = relationship("AssessmentQuestion", back_populates="assessment_answers")


# =========================
# Reports
# =========================
class ReportTypeEnum(str, enum):
    CV = "cv"
    INTERVIEW_SESSION = "interview_session"
    SKILL_ASSESSMENT = "skill_assessment"
    OTHER = "other"


class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(Enum(ReportTypeEnum), nullable=False)
    filename = Column(String, nullable=False)
    file_data = Column(BYTEA, nullable=False)  
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    user = relationship("User", back_populates="reports")  


# =========================
# ROADMAP
# =========================
class Roadmap(Base):
    __tablename__ = "roadmaps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False, unique=True)
    description = Column(String, nullable=True)

    section = relationship("RoadmapSection", back_populates="roadmap", cascade="all, delete-orphan")
    assessment = relationship("RoadmapAssessmentResult", back_populates="roadmap")
    bookmarks = relationship("UserRoadmapBookmark", back_populates="roadmap", cascade="all, delete-orphan")


# =========================
# ROADMAP BOOKMARK
# =========================
class UserRoadmapBookmark(Base):
    __tablename__ = "user_roadmap_bookmarks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user = relationship("User", back_populates="bookmarks")
    roadmap = relationship("Roadmap", back_populates="bookmarks")

    __table_args__ = (
        UniqueConstraint("user_id", "roadmap_id", name="uq_user_roadmap_bookmarks_user_roadmap"),
        Index("ix_user_roadmap_bookmarks_user_id", "user_id"),
        Index("ix_user_roadmap_bookmarks_roadmap_id", "roadmap_id"),
    )


# =========================
# ROADMAP SECTION
# =========================
class RoadmapSection(Base):
    __tablename__ = "roadmap_sections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    order = Column(Integer, nullable=False)

    roadmap = relationship("Roadmap", back_populates="section")
    steps = relationship("RoadmapStep", back_populates="section", cascade="all, delete-orphan")
    assessment = relationship("RoadmapAssessmentResult", back_populates="section")

    __table_args__ = (
        UniqueConstraint("roadmap_id", "order", name="uq_roadmap_sections_roadmap_order"),
    )


# =========================
# ROADMAP STEP
# =========================
class RoadmapStep(Base):
    __tablename__ = "roadmap_steps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    section_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_sections.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    resources = Column(JSONB, nullable=True)
    order = Column(Integer, nullable=False)

    section = relationship("RoadmapSection", back_populates="steps")
    assessment = relationship("RoadmapAssessmentResult", back_populates="step")

    __table_args__ = (
        UniqueConstraint("section_id", "order", name="uq_roadmap_steps_section_order"),
    )


# =========================
# ROADMAP ASSESSMENT RESULT
# =========================
class RoadmapAssessmentResult(Base):
    __tablename__ = "roadmap_assessment_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    roadmap_id = Column(UUID(as_uuid=True), ForeignKey("roadmaps.id"), nullable=True)
    section_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_sections.id"), nullable=True)
    step_id = Column(UUID(as_uuid=True), ForeignKey("roadmap_steps.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    type = Column(String, nullable=False)
    proficiency = Column(String, nullable=True)
    score = Column(Integer, nullable=True)
    completion_status = Column(String, nullable=False, default="not_started")
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    roadmap = relationship("Roadmap", back_populates="assessment")
    section = relationship("RoadmapSection", back_populates="assessment")
    step = relationship("RoadmapStep", back_populates="assessment")
    user = relationship("User", back_populates="assessment")

    __table_args__ = (
        Index(
            "uq_roadmap_assessment_results_target",
            "user_id",
            "type",
            "roadmap_id",
            "section_id",
            "step_id",
            unique=True,
        ),
    )