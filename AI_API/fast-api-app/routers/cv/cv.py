from .cv_builder_router import router as cv_builder_router
from .cv_extractor_router import router as cv_extractor_router

routers = [
    cv_builder_router,
    cv_extractor_router
]