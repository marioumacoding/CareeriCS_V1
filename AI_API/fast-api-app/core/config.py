import os
from urllib.parse import quote_plus
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT", "5432")
    DB_NAME = os.getenv("DB_NAME", "postgres")
    DB_USER = os.getenv("DB_USER", "postgres")
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    SUPABASE_DB_URL = os.getenv("SUPABASE_DB_URL")
    DATABASE_URL = os.getenv("DATABASE_URL")

    if not DATABASE_URL and SUPABASE_DB_URL:
        DATABASE_URL = SUPABASE_DB_URL

    if not DATABASE_URL and DB_HOST and DB_PASSWORD:
        encoded_password = quote_plus(DB_PASSWORD)
        DATABASE_URL = (
            f"postgresql://{DB_USER}:{encoded_password}@{DB_HOST}:{DB_PORT}/{DB_NAME}?sslmode=require"
        )

    AUDIO_BASE = "audio"

    AUDIO_PATHS = {
        "questions": "audio/questions",
        "answers": "audio/answers",
        "followups": "audio/followups",
    }


settings = Settings()
