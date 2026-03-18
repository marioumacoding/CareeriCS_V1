from sqlalchemy.orm import Session
from db.models import Followup
from uuid import UUID

def get_followup_by_answer_id(db: Session, answer_id: UUID) -> Followup | None:
   
    return db.query(Followup).filter(Followup.answer_id == answer_id).first()