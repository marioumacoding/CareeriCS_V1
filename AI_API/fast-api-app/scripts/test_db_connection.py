import sys
from dotenv import load_dotenv

load_dotenv()

from core.config import settings
from sqlalchemy import text
from db.session import engine


def main():
    print("DATABASE_URL present:", bool(settings.DATABASE_URL))
    try:
        with engine.connect() as conn:
            res = conn.execute(text("SELECT 1"))
            val = res.scalar()
            print("Connection OK — SELECT 1 returned:", val)
            return 0
    except Exception as e:
        print("Connection FAILED:", e)
        return 2


if __name__ == "__main__":
    sys.exit(main())
