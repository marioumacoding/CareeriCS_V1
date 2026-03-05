from .questions_router import router as question_router
from .answers_router import router as answer_router

routers = [
    question_router,
    answer_router
]