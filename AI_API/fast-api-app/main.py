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

Base.metadata.create_all(bind=engine)

app = FastAPI()

for path in settings.AUDIO_PATHS.values():
    os.makedirs(path, exist_ok=True)

app.mount("/audio", StaticFiles(directory=settings.AUDIO_BASE), name="audio")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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