from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from core.config import settings

if not settings.DATABASE_URL:
    raise ValueError(
        "DATABASE_URL is not configured. Set DATABASE_URL/SUPABASE_DB_URL or DB_HOST + DB_PASSWORD in environment variables."
    )

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False}
    if settings.DATABASE_URL.startswith("sqlite")
    else {"sslmode": "require"} if "supabase.co" in settings.DATABASE_URL else {},
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)