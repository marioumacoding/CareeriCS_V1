from .sessions_router import router as session_router
from .answers_router import router as answer_router

routers = [
    session_router,
    answer_router
]