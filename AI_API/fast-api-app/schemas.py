from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional, List, Dict
from uuid import UUID


# ======================================================
# USER
# ======================================================

class UserBase(BaseModel):
    job_title: str
    username: str


class UserCreate(UserBase):
    pass


class UserRead(UserBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# QUESTION
# ======================================================

class QuestionBase(BaseModel):
    type: str
    question_text: str
    question_audio: Optional[str] = None


class QuestionCreate(QuestionBase):
    pass


class QuestionRead(QuestionBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# SESSION
# ======================================================

class SessionBase(BaseModel):
    name: str
    type: str
    status: str


class SessionCreate(SessionBase):
    user_id: UUID


class SessionUpdate(BaseModel):
    status: Optional[str] = None
    emotion_evaluation: Optional[Dict] = None
    tone_evaluation: Optional[Dict] = None
    sentiment_evaluation: Optional[Dict] = None


class SessionRead(SessionBase):
    id: UUID
    user_id: UUID
    emotion_evaluation: Optional[Dict] = None
    tone_evaluation: Optional[Dict] = None
    sentiment_evaluation: Optional[Dict] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# FOLLOWUP
# ======================================================

class FollowupBase(BaseModel):
    fquestion_text: str
    fquestion_audio: Optional[str] = None


class FollowupCreate(FollowupBase):
    answer_id: UUID


class FollowupRead(FollowupBase):
    id: UUID
    answer_id: UUID
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# ANSWER
# ======================================================

class AnswerBase(BaseModel):
    answer_text: Optional[str] = None
    answer_audio: Optional[str] = None
    answer_video: Optional[str] = None
    feedback: Optional[str] = None
    grade: Optional[str] = None
    isfollowup: bool = False
    emotion_evaluation: Optional[Dict] = None
    tone_evaluation: Optional[Dict] = None
    sentiment_evaluation: Optional[Dict] = None


class AnswerCreate(AnswerBase):
    session_id: UUID
    question_id: Optional[UUID] = None
    followup_id: Optional[UUID] = None


class AnswerRead(AnswerBase):
    id: UUID
    session_id: UUID
    question_id: Optional[UUID] = None
    followup_id: Optional[UUID] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# SKILLS SCHEMAS
# ======================================================

class SkillBase(BaseModel):
    skill_name: str


class SkillCreate(SkillBase):
    pass


class SkillRead(SkillBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)


class UserSkillWithSkillRead(BaseModel):
    id: UUID
    isCV: bool
    proficiency: Optional[str] = None
    skill: SkillRead
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# EXPERIENCE
# ======================================================

class ExperienceSchema(BaseModel):
    id: Optional[UUID] = None
    role: str
    organization: Optional[str] = None
    period: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    achievements: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# EDUCATION
# ======================================================

class EducationSchema(BaseModel):
    id: Optional[UUID] = None
    qualification: Optional[str] = None
    institution: Optional[str] = None
    period: Optional[str] = None
    details: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# CERTIFICATION
# ======================================================

class CertificationSchema(BaseModel):
    id: Optional[UUID] = None
    title: Optional[str] = None
    organization: Optional[str] = None
    period: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# PROJECT
# ======================================================

class ProjectSchema(BaseModel):
    id: Optional[UUID] = None
    title: Optional[str] = None
    description: Optional[str] = None
    role: Optional[str] = None
    technologies: Optional[List[str]] = None
    achievements: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# LANGUAGE
# ======================================================

class LanguageSchema(BaseModel):
    id: Optional[UUID] = None
    language: str
    proficiency: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# AWARD
# ======================================================

class AwardSchema(BaseModel):
    id: Optional[UUID] = None
    title: str
    organization: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# REFERENCE
# ======================================================

class ReferenceSchema(BaseModel):
    id: Optional[UUID] = None
    name: str
    role: Optional[str] = None
    organization: Optional[str] = None
    contact_info: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# USER SCHEMA
# ======================================================

class UserSchema(BaseModel):
    id: Optional[UUID] = None
    full_name: str
    professional_title: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    linkedin: Optional[str] = None
    portfolio: Optional[str] = None
    summary: Optional[str] = None

    skills: List[UserSkillWithSkillRead] = Field(default_factory=list)
    experiences: List[ExperienceSchema] = Field(default_factory=list)
    education: List[EducationSchema] = Field(default_factory=list)
    certifications: List[CertificationSchema] = Field(default_factory=list)
    projects: List[ProjectSchema] = Field(default_factory=list)
    languages: List[LanguageSchema] = Field(default_factory=list)
    awards: List[AwardSchema] = Field(default_factory=list)
    references: List[ReferenceSchema] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# =====================================================
# SKILL ASSESSMENT QUESTION SCHEMAS
# =====================================================

class SAQuestionBase(BaseModel):
    question_text: str
    skill_id: UUID


class SAQuestionCreate(SAQuestionBase):
    pass


class SAQuestionUpdate(BaseModel):
    question_text: Optional[str] = None
    skill_id: Optional[UUID] = None


class SAAnswerOutShort(BaseModel):
    id: UUID
    answer_text: Optional[str]
    score: float
    feedback: Optional[str]

    class Config:
        from_attributes = True


class SAQuestionOut(SAQuestionBase):
    id: UUID
    answers: Optional[List[SAAnswerOutShort]] = []

    class Config:
        from_attributes = True


# =====================================================
# SKILL ASSESSMENT ANSWER SCHEMAS
# =====================================================

# =========================
# ANSWER OUTPUT
# =========================

class SAAnswerOut(BaseModel):
    id: UUID
    answer_text: Optional[str] = None
    feedback: Optional[str] = None
    score: float
    question_id: UUID

    class Config:
        from_attributes = True


# =========================
# ANSWER UPDATE
# =========================

class SAAnswerUpdate(BaseModel):
    answer_text: Optional[str] = None
    feedback: Optional[str] = None
    score: Optional[float] = None


# =========================
# SUBMIT ANSWERS (FORM INPUT)
# =========================

class SAAnswerSubmit(BaseModel):
    question_id: UUID
    answer_text: str


class SAAnswerSubmitRequest(BaseModel):
    user_id: UUID
    skill_id: UUID
    answers: List[SAAnswerSubmit]


# =====================================================
# REPORT SCHEMAS
# =====================================================
class ReportSchema(BaseModel):
    id: UUID
    filename: str
    created_at: datetime
    type: str

    class Config:
        from_attributes = True