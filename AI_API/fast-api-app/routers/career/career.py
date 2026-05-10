from .answers_router import router as answers_router
from .session_router import router as session_router
from .cards_router import router as card_router
from .questions_router import router as question_router
from .tracks_router import router as tracks_router
from .blog_router import router as blog_router

routers = [
    session_router,
    card_router,
    tracks_router,
    question_router,
    answers_router,
    blog_router,
]
