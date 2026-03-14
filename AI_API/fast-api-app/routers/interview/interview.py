from .session_router import router as session_router
from .question_router import router as question_router
from .answer_router import router as answer_router
from .followup_router import router as followup_router

routers = [
    session_router,
    question_router,
    answer_router,
    followup_router,
]