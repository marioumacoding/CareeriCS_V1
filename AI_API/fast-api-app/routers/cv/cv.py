from .cv_builder_router import router as cv_builder_router
from .cv_extractor_router import router as cv_extractor_router
from .cv_enhancer_router import router as cv_enhancer_router

routers = [
    cv_builder_router,
    cv_extractor_router,
    cv_enhancer_router,
]