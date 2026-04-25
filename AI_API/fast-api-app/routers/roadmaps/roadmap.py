from .bookmark_router import router as bookmark_router
from .import_router import router as import_router
from .progress_router import router as progress_router
from .query_router import router as query_router

routers = [
    import_router,
    progress_router,
    bookmark_router,
    query_router,
]
