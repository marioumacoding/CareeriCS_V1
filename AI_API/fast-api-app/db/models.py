import datetime
import uuid
from sqlalchemy import (
    Column,
    Enum,
    String,
    Boolean,
    ForeignKey,
    Text,
    JSON,
    DateTime,
    UniqueConstraint,
    Float
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY, BYTEA, UUID
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
    reports = relationship("Report", back_populates="user")


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

    emotions = relationship("Emotion", back_populates="answer", cascade="all, delete-orphan")
    tones = relationship("Tone", back_populates="answer", cascade="all, delete-orphan")
    sentiments = relationship("Sentiment", back_populates="answer", cascade="all, delete-orphan")


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


# =========================
# EMOTION
# =========================
class Emotion(Base):
    __tablename__ = "interview_emotions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)

    answer_id = Column(UUID(as_uuid=True), ForeignKey("interview_answers.id"), nullable=False)

    answer = relationship("Answer", back_populates="emotions")


# =========================
# TONE
# =========================
class Tone(Base):
    __tablename__ = "interview_tones"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)

    answer_id = Column(UUID(as_uuid=True), ForeignKey("interview_answers.id"), nullable=False)

    answer = relationship("Answer", back_populates="tones")


# =========================
# SENTIMENT
# =========================
class Sentiment(Base):
    __tablename__ = "interview_sentiments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)

    answer_id = Column(UUID(as_uuid=True), ForeignKey("interview_answers.id"), nullable=False)

    answer = relationship("Answer", back_populates="sentiments")


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
# SKILL ASSESSMENT QUESTION
# =========================
class SAQuestion(Base):
    __tablename__ = "skill_assessment_questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    question_text = Column(String, nullable=False)

    skill_id = Column(UUID(as_uuid=True), ForeignKey("skills.id"), nullable=False)

    skill = relationship("Skill")
    answers = relationship("SAAnswer", back_populates="question", cascade="all, delete-orphan")


# =========================
# SKILL ASSESSMENT ANSWER
# =========================
class SAAnswer(Base):
    __tablename__ = "skill_assessment_answers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    answer_text = Column(String, nullable=True)
    feedback = Column(String, nullable=True)

    score = Column(Float, nullable=False)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    question_id = Column(UUID(as_uuid=True), ForeignKey("skill_assessment_questions.id"), nullable=False)

    question = relationship("SAQuestion", back_populates="answers")
    user = relationship("User")


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


