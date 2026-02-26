from pydantic import BaseModel, ConfigDict, EmailStr
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
# EMOTION
# ======================================================

class EmotionBase(BaseModel):
    name: str


class EmotionCreate(EmotionBase):
    answer_id: UUID


class EmotionRead(EmotionBase):
    id: UUID
    answer_id: UUID
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# TONE
# ======================================================

class ToneBase(BaseModel):
    name: str


class ToneCreate(ToneBase):
    answer_id: UUID


class ToneRead(ToneBase):
    id: UUID
    answer_id: UUID
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# SENTIMENT
# ======================================================

class SentimentBase(BaseModel):
    name: str


class SentimentCreate(SentimentBase):
    answer_id: UUID


class SentimentRead(SentimentBase):
    id: UUID
    answer_id: UUID
    model_config = ConfigDict(from_attributes=True)


# ======================================================
# NESTED RESPONSE MODELS
# ======================================================

class AnswerWithFollowupRead(AnswerRead):
    followup: Optional[FollowupRead] = None


class SessionWithAnswersRead(SessionRead):
    answers: List[AnswerWithFollowupRead] = []


# ======================================================
# USER RELATED SCHEMAS
# ======================================================

class SkillSchema(BaseModel):
    id: Optional[UUID] = None
    skill_name: str
    proficiency: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class ExperienceSchema(BaseModel):
    id: Optional[UUID] = None
    role: str
    organization: Optional[str]
    period: Optional[str]
    responsibilities: Optional[List[str]]
    achievements: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class EducationSchema(BaseModel):
    id: Optional[UUID] = None
    qualification: Optional[str]
    institution: Optional[str]
    period: Optional[str]
    details: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class CertificationSchema(BaseModel):
    id: Optional[UUID] = None
    title: Optional[str]
    organization: Optional[str]
    period: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class ProjectSchema(BaseModel):
    id: Optional[UUID] = None
    title: Optional[str]
    description: Optional[str]
    role: Optional[str]
    technologies: Optional[List[str]]
    achievements: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class LanguageSchema(BaseModel):
    id: Optional[UUID] = None
    language: str
    proficiency: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class AwardSchema(BaseModel):
    id: Optional[UUID] = None
    title: str
    organization: Optional[str]
    date: Optional[str]
    description: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class ReferenceSchema(BaseModel):
    id: Optional[UUID] = None
    name: str
    role: Optional[str]
    organization: Optional[str]
    contact_info: Optional[str]
    model_config = ConfigDict(from_attributes=True)


class UserSchema(BaseModel):
    id: Optional[UUID] = None
    full_name: str
    professional_title: Optional[str]
    email: Optional[EmailStr]
    phone: Optional[str]
    city: Optional[str]
    country: Optional[str]
    linkedin: Optional[str]
    portfolio: Optional[str]
    summary: Optional[str]
    skills: Optional[List[SkillSchema]] = []
    experiences: Optional[List[ExperienceSchema]] = []
    education: Optional[List[EducationSchema]] = []
    certifications: Optional[List[CertificationSchema]] = []
    projects: Optional[List[ProjectSchema]] = []
    languages: Optional[List[LanguageSchema]] = []
    awards: Optional[List[AwardSchema]] = []
    references: Optional[List[ReferenceSchema]] = []
    model_config = ConfigDict(from_attributes=True)