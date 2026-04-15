from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from typing import List, Literal

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
# ASSESSMENT SCHEMAS
# =====================================================

# =====================================================
# START ASSESSMENT
# =====================================================
class StartAssessmentRequest(BaseModel):
    target_id: UUID
    num_questions: int = Field(gt=4, le=20)  # max 20 questions
    session_type: str


class AssessmentQuestionResponse(BaseModel):
    id: UUID
    question_text: str
    options: List[str]

    class Config:
        from_attributes = True


class StartAssessmentResponse(BaseModel):
    session_id: UUID
    questions: List[AssessmentQuestionResponse]


class AssessmentSessionSummary(BaseModel):
    id: UUID
    user_id: UUID
    skill_id: UUID
    total_questions: int
    score: int
    status: str
    started_at: datetime
    submitted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# =====================================================
# SUBMIT ASSESSMENT
# =====================================================
class AssessmentAnswerInput(BaseModel):
    question_id: UUID
    selected_answer: str


class SubmitAssessmentRequest(BaseModel):
    session_id: UUID
    answers: List[AssessmentAnswerInput]


# =====================================================
# RESULT / FEEDBACK
# =====================================================
class AssessmentQuestionResult(BaseModel):
    question_id: UUID
    selected_answer: str
    correct_answer: str
    explanation: str
    is_correct: bool


class SubmitAssessmentResponse(BaseModel):
    session_id: UUID
    score: int  # percentage
    total_questions: int
    results: List[AssessmentQuestionResult]


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


# =====================================================
# CV BUILD REQUEST SCHEMA
# =====================================================
class CVBuildRequest(BaseModel):
    cv_text: str


# =====================================================
# ROADMAP IMPORT/READ/PROGRESS SCHEMAS
# =====================================================

class RoadmapResourceSchema(BaseModel):
    resourceType: str
    title: str
    url: str


class RoadmapStepImportSchema(BaseModel):
    title: str
    description: Optional[str] = ""
    resources: List[RoadmapResourceSchema] = Field(default_factory=list)


class RoadmapSectionImportSchema(BaseModel):
    title: str
    description: Optional[str] = ""
    steps: List[RoadmapStepImportSchema] = Field(default_factory=list)


class RoadmapImportPayloadSchema(BaseModel):
    title: str
    description: Optional[str] = ""
    sections: List[RoadmapSectionImportSchema] = Field(default_factory=list)


class RoadmapImportRequestSchema(BaseModel):
    roadmap: Optional[RoadmapImportPayloadSchema] = None
    roadmaps: Optional[List[RoadmapImportPayloadSchema]] = None


class RoadmapImportFromPathRequestSchema(BaseModel):
    path: str
    recursive: bool = False


class RoadmapImportItemResultSchema(BaseModel):
    title: str
    status: str
    sections_count: int = 0
    steps_count: int = 0
    message: Optional[str] = None


class BulkRoadmapImportResponseSchema(BaseModel):
    imported: int
    updated: int
    failed: int
    results: List[RoadmapImportItemResultSchema]


class RoadmapStepReadSchema(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = ""
    order: int
    resources: List[Dict[str, Any]] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class RoadmapSectionReadSchema(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = ""
    order: int
    steps: List[RoadmapStepReadSchema] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class RoadmapReadSchema(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = ""
    sections: List[RoadmapSectionReadSchema] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)


class RoadmapListItemSchema(BaseModel):
    id: UUID
    title: str
    description: Optional[str] = ""
    sections_count: int
    steps_count: int


class StepProgressUpsertRequestSchema(BaseModel):
    completion_status: str = Field(pattern="^(not_started|in_progress|completed)$")
    score: Optional[int] = None
    proficiency: Optional[str] = None


class StepProgressReadSchema(BaseModel):
    step_id: UUID
    completion_status: str
    completed_at: Optional[datetime] = None
    score: Optional[int] = None
    proficiency: Optional[str] = None


class SectionProgressSummarySchema(BaseModel):
    section_id: UUID
    title: str
    completion_status: str
    completed_steps: int
    total_steps: int
    completion_percent: int
    steps: List[StepProgressReadSchema] = Field(default_factory=list)


class RoadmapProgressSummarySchema(BaseModel):
    roadmap_id: UUID
    title: str
    completion_status: str
    completed_sections: int
    total_sections: int
    completed_steps: int
    total_steps: int
    completion_percent: int
    sections: List[SectionProgressSummarySchema] = Field(default_factory=list)


class UserRoadmapProgressItemSchema(BaseModel):
    roadmap_id: UUID
    title: str
    completion_status: str
    completion_percent: int


class UserRoadmapProgressListSchema(BaseModel):
    user_id: UUID
    roadmaps: List[UserRoadmapProgressItemSchema] = Field(default_factory=list)


# =====================================================
# CAREER QUIZ SCHEMAS
# =====================================================
class CareerSessionBase(BaseModel):
    user_id: UUID
    status: str

class CareerSessionCreate(CareerSessionBase):
    pass

class CareerSessionRead(CareerSessionBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class CareerSessionStatusUpdate(BaseModel):
    status: str

class CareerAnswerBase(BaseModel):
    question_id: UUID
    answer: str

class CareerAnswerCreate(BaseModel):
    answers: List[CareerAnswerBase]

class CareerAnswerRead(BaseModel):
    id: UUID
    session_id: UUID
    question_id: UUID
    answer: str

    class Config:
        from_attributes = True

# Single question response
class CareerQuestionResponse(BaseModel):
    id: UUID
    hobby_id: Optional[UUID]
    technical_skill_id: Optional[UUID]
    text: str
    type: str

    class Config:
        from_attributes = True

# Questions for a single card
class CardQuestions(BaseModel):
    card_id: str
    questions: List[str]

# Payload for multiple cards
class CareerQuestionsCreateMultiple(BaseModel):
    cards: List[CardQuestions]

class CareerCardBase(BaseModel):
    name: str
    description: Optional[str] = None

class CareerCardCreate(CareerCardBase):
    pass

class CareerCardRead(CareerCardBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class CareerCardSelectionItem(BaseModel):
    id: str
    type: Literal["hobby", "technical"]

class CareerCardSelectionMultiple(BaseModel):
    cards: List[CareerCardSelectionItem]

class CareerSelectedCardRead(BaseModel):
    type: str
    id: UUID
    name: str
    model_config = ConfigDict(from_attributes=True)

class CareerEvaluationRead(BaseModel):
    track_scores: List[Dict[str, Any]]


# =====================================================
# JOB SCHEMAS
# =====================================================

class JobPostBase(BaseModel):
    job_title: str
    company_name: str
    location: Optional[str] = None
    job_url: str
    source: Optional[str] = None
    posted_date: Optional[datetime] = None
    description: Optional[str] = None
    requirements_raw: Optional[str] = None
    requirements_list: Optional[List[str]] = Field(default_factory=list)
    experience: Optional[str] = None
    career_level: Optional[str] = None
    education_level: Optional[str] = None
    salary: Optional[str] = None
    categories: Optional[List[str]] = Field(default_factory=list)
    skills: Optional[List[str]] = Field(default_factory=list)


class JobPostCreate(JobPostBase):
    scraped_at: Optional[datetime] = None


class JobPostResponse(JobPostBase):
    id: UUID
    scraped_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    model_config = ConfigDict(from_attributes=True)


class JobInteractionResponse(BaseModel):
    id: UUID
    job_post_id: UUID
    user_id: UUID
    viewed_at: Optional[datetime] = None
    is_saved: bool
    saved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)


class UserJobsListResponse(BaseModel):
    total: int
    skip: int
    limit: int
    jobs: List[JobPostResponse]

