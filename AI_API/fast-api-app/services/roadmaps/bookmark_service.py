from uuid import UUID, uuid4

from sqlalchemy.orm import Session

from db.models import Roadmap, UserRoadmapBookmark
from schemas import (
    UserRoadmapBookmarkListSchema,
    UserRoadmapBookmarkReadSchema,
    UserRoadmapBookmarkToggleSchema,
)


def get_user_roadmap_bookmarks_service(db: Session, user_id: UUID) -> UserRoadmapBookmarkListSchema:
    rows = (
        db.query(UserRoadmapBookmark)
        .filter(UserRoadmapBookmark.user_id == user_id)
        .order_by(UserRoadmapBookmark.created_at.desc())
        .all()
    )

    return UserRoadmapBookmarkListSchema(
        user_id=user_id,
        bookmarks=[
            UserRoadmapBookmarkReadSchema(roadmap_id=row.roadmap_id, created_at=row.created_at)
            for row in rows
        ],
    )


def toggle_user_roadmap_bookmark_service(
    db: Session,
    roadmap_id: UUID,
    user_id: UUID,
) -> UserRoadmapBookmarkToggleSchema:
    roadmap = db.query(Roadmap.id).filter(Roadmap.id == roadmap_id).first()
    if not roadmap:
        raise ValueError("Roadmap not found")

    bookmark = (
        db.query(UserRoadmapBookmark)
        .filter(
            UserRoadmapBookmark.user_id == user_id,
            UserRoadmapBookmark.roadmap_id == roadmap_id,
        )
        .first()
    )

    if bookmark:
        db.delete(bookmark)
        db.commit()
        return UserRoadmapBookmarkToggleSchema(roadmap_id=roadmap_id, bookmarked=False)

    db.add(UserRoadmapBookmark(id=uuid4(), user_id=user_id, roadmap_id=roadmap_id))
    db.commit()
    return UserRoadmapBookmarkToggleSchema(roadmap_id=roadmap_id, bookmarked=True)
