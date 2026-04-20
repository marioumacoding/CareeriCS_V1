from typing import Any
from sqlalchemy.orm import Session
from uuid import UUID, uuid4
from db.models import CareerHobby, CareerTechnicalSkill, CareerSelectedCard

# Add a new card (hobby or technical)
def add_card(db: Session, card_type: str, name: str, description: str = None):
    if card_type == "hobby":
        card = CareerHobby(id=uuid4(), name=name, description=description)
    elif card_type == "technical":
        card = CareerTechnicalSkill(id=uuid4(), name=name, description=description)
    else:
        raise ValueError("card_type must be 'hobby' or 'technical'")
    
    db.add(card)
    db.commit()
    db.refresh(card)
    return card


# Get all cards of a specific type (hobby or technical)
def get_cards_by_type(db: Session, card_type: str):
    if card_type == "hobby":
        return db.query(CareerHobby).all()
    elif card_type == "technical":
        return db.query(CareerTechnicalSkill).all()
    else:
        raise ValueError("card_type must be 'hobby' or 'technical'")


def _extract_card_field(card: Any, field_name: str):
    if isinstance(card, dict):
        return card.get(field_name)
    return getattr(card, field_name, None)


def select_cards(db: Session, session_id: str, cards: list[Any]):
    """
    cards: list of dicts like [{"id": "...", "type": "hobby"}, {"id": "...", "type": "technical"}]
    """
    session_uuid = UUID(str(session_id))

    # Remove previous selections
    db.query(CareerSelectedCard).filter_by(session_id=session_uuid).delete()

    for card in cards:
        card_id = _extract_card_field(card, "id")
        card_type = _extract_card_field(card, "type")

        if card_id is None or card_type is None:
            raise ValueError("Each selected card must include id and type")

        card_uuid = UUID(str(card_id))

        if card_type == "hobby":
            selected_card = CareerSelectedCard(
                id=uuid4(),
                session_id=session_uuid,
                card_type=card_type, 
                hobby_id=card_uuid
            )
        elif card_type == "technical":
            selected_card = CareerSelectedCard(
                id=uuid4(),
                session_id=session_uuid,
                card_type=card_type,  
                technical_skill_id=card_uuid
            )
        else:
            raise ValueError("card_type must be 'hobby' or 'technical'")

        db.add(selected_card)

    db.commit()
    return get_selected_cards(db, session_id)


# Get selected cards for a session
def get_selected_cards(db: Session, session_id: str):
    session_uuid = UUID(str(session_id))

    cards = (
        db.query(CareerSelectedCard)
        .filter(CareerSelectedCard.session_id == session_uuid)
        .all()
    )

    result = []

    for c in cards:

        if c.card_type == "technical" and c.technical_skill_id:
            result.append({
                "type": "technical",
                "id": c.technical_skill_id,
                "name": c.technical_skill.name if c.technical_skill else None
            })

        elif c.card_type == "hobby" and c.hobby_id:
            result.append({
                "type": "hobby",
                "id": c.hobby_id,
                "name": c.hobby.name if c.hobby else None
            })

    return result