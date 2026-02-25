import uuid
from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    ForeignKey,
    Text,
    JSON,
    DateTime,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.sql import func

from db.base import Base


# =========================
# USER
# =========================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    professional_title = Column(String)
    email = Column(String)
    phone = Column(String)
    city = Column(String)
    country = Column(String)
    linkedin = Column(String)
    portfolio = Column(String)
    summary = Column(Text)

    password_hash = Column(Text, nullable=False)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    skills = relationship("Skill", back_populates="user", cascade="all, delete-orphan")
    experiences = relationship("Experience", back_populates="user", cascade="all, delete-orphan")
    education = relationship("Education", back_populates="user", cascade="all, delete-orphan")
    certifications = relationship("Certification", back_populates="user", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="user", cascade="all, delete-orphan")
    languages = relationship("Language", back_populates="user", cascade="all, delete-orphan")
    awards = relationship("Award", back_populates="user", cascade="all, delete-orphan")
    references = relationship("Reference", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")


# =========================
# QUESTION
# =========================
class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    question_text = Column(String, nullable=False)
    question_audio = Column(String, nullable=True)

    answers = relationship("Answer", back_populates="question")


# =========================
# SESSION
# =========================
class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    status = Column(String, nullable=False)

    emotion_evaluation = Column(JSON, nullable=True)
    tone_evaluation = Column(JSON, nullable=True)
    sentiment_evaluation = Column(JSON, nullable=True)

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="sessions")
    answers = relationship("Answer", back_populates="session", cascade="all, delete-orphan")


# =========================
# ANSWER
# =========================
class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)

    answer_text = Column(String, nullable=True)
    answer_audio = Column(String, nullable=True)
    answer_video = Column(String, nullable=True)

    feedback = Column(String, nullable=True)
    grade = Column(Integer, nullable=True)
    isfollowup = Column(Boolean, default=False)

    emotion_evaluation = Column(JSON, nullable=True)
    tone_evaluation = Column(JSON, nullable=True)
    sentiment_evaluation = Column(JSON, nullable=True)

    question_id = Column(Integer, ForeignKey("questions.id"), nullable=True)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)

    question = relationship("Question", back_populates="answers")
    session = relationship("Session", back_populates="answers")

    # ONE-TO-ONE
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
    __tablename__ = "followups"

    id = Column(Integer, primary_key=True, index=True)
    fquestion_text = Column(String, nullable=False)
    fquestion_audio = Column(String, nullable=True)

    answer_id = Column(
        Integer,
        ForeignKey("answers.id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    answer = relationship("Answer", back_populates="followup")



# =========================
# EMOTION
# =========================
class Emotion(Base):
    __tablename__ = "emotions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=False)

    answer = relationship("Answer", back_populates="emotions")


# =========================
# TONE
# =========================
class Tone(Base):
    __tablename__ = "tones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=False)

    answer = relationship("Answer", back_populates="tones")


# =========================
# SENTIMENT
# =========================
class Sentiment(Base):
    __tablename__ = "sentiments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    answer_id = Column(Integer, ForeignKey("answers.id"), nullable=False)

    answer = relationship("Answer", back_populates="sentiments")


# =========================
# Skills
# =========================
class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    skill_name = Column(String, nullable=False)
    proficiency = Column(String)

    user = relationship("User", back_populates="skills")


# =========================
# Experiences
# =========================
class Experience(Base):
    __tablename__ = "experiences"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String, nullable=False)
    organization = Column(String)
    period = Column(String)
    responsibilities = Column(JSON, nullable=True)
    achievements = Column(Text)

    user = relationship("User", back_populates="experiences")


# =========================
# Education
# =========================
class Education(Base):
    __tablename__ = "education"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    qualification = Column(String)
    institution = Column(String)
    period = Column(String)
    details = Column(Text)

    user = relationship("User", back_populates="education")


# =========================
# Certifications
# =========================
class Certification(Base):
    __tablename__ = "certifications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    organization = Column(String)
    period = Column(String)

    user = relationship("User", back_populates="certifications")


# =========================
# Projects
# =========================
class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    description = Column(Text)
    role = Column(String)
    technologies = Column(ARRAY(String))
    achievements = Column(Text)

    user = relationship("User", back_populates="projects")


# =========================
# Languages
# =========================
class Language(Base):
    __tablename__ = "languages"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    language = Column(String)
    proficiency = Column(String)

    user = relationship("User", back_populates="languages")


# =========================
# Awards
# =========================
class Award(Base):
    __tablename__ = "awards"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String)
    organization = Column(String)
    date = Column(String)
    description = Column(Text)

    user = relationship("User", back_populates="awards")


# =========================
# References
# =========================
class Reference(Base):
    __tablename__ = "references"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String)
    role = Column(String)
    organization = Column(String)
    contact_info = Column(String)

    user = relationship("User", back_populates="references")