from sqlalchemy.orm import Session

from db.models import CareerTrack


def list_tracks(db: Session):
    return db.query(CareerTrack).order_by(CareerTrack.name.asc()).all()
