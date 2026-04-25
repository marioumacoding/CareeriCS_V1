import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from db.session import engine
from db.base import Base
from core.config import settings
from routers.interview.interview import routers as interview_routers
from routers.cv.cv import routers as cv_routers
from routers.skills.skill import routers as skill_routers
from routers.skill_assessment.sa import routers as skill_assessment_routers
from routers.reports.report_router import router as report_router
from routers.roadmaps.roadmap import routers as roadmap_routers
from routers.career.career import routers as career_quiz_routers
from routers.job import router as job_router
from routers.course import router as course_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

for path in settings.AUDIO_PATHS.values():
    os.makedirs(path, exist_ok=True)

app.mount("/audio", StaticFiles(directory=settings.AUDIO_BASE), name="audio")

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

for router in interview_routers:
    app.include_router(router)

for router in cv_routers:
    app.include_router(router)

for router in skill_routers:
    app.include_router(router)

for router in skill_assessment_routers:
    app.include_router(router)

for router in roadmap_routers:
    app.include_router(router)

app.include_router(report_router)

for router in career_quiz_routers:
    app.include_router(router)

app.include_router(job_router)
app.include_router(course_router)