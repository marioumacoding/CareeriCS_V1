from .import_router import router as import_router
from .progress_router import router as progress_router
from .query_router import router as query_router

routers = [
    import_router,
    progress_router,
    query_router,
]
