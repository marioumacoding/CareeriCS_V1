from sqlalchemy.orm import Session
from uuid import uuid4
from db.models import CareerSession


def create_session(db: Session, user_id: str, status: str | None = None) -> CareerSession:
    session = CareerSession(
        id=uuid4(),
        user_id=user_id,
        status=status or "in_progress"
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

def get_session(db: Session, session_id: str) -> CareerSession | None:
    return db.query(CareerSession).filter_by(id=session_id).first()

def update_session_status(db: Session, session_id: str, status: str) -> CareerSession | None:
    session = db.query(CareerSession).filter_by(id=session_id).first()
    if not session:
        return None
    session.status = status
    db.commit()
    db.refresh(session)
    return session

def get_user_sessions(db: Session, user_id: str) -> list[CareerSession]:
    return db.query(CareerSession).filter_by(user_id=user_id).all()