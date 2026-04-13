from sqlalchemy.orm import Session
from uuid import uuid4
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


from uuid import uuid4

def select_cards(db: Session, session_id: str, cards: list[dict]):
    """
    cards: list of dicts like [{"id": "...", "type": "hobby"}, {"id": "...", "type": "technical"}]
    """
    # Remove previous selections
    db.query(CareerSelectedCard).filter_by(session_id=session_id).delete()

    for card in cards:
        card_id = card.id
        card_type = card.type

        if card_type == "hobby":
            selected_card = CareerSelectedCard(
                id=uuid4(),
                session_id=session_id,
                card_type=card_type, 
                hobby_id=card_id
            )
        elif card_type == "technical":
            selected_card = CareerSelectedCard(
                id=uuid4(),
                session_id=session_id,
                card_type=card_type,  
                technical_skill_id=card_id
            )
        else:
            raise ValueError("card_type must be 'hobby' or 'technical'")

        db.add(selected_card)

    db.commit()
    return get_selected_cards(db, session_id)


# Get selected cards for a session
def get_selected_cards(db: Session, session_id: str):
    cards = (
        db.query(CareerSelectedCard)
        .filter(CareerSelectedCard.session_id == session_id)
        .all()
    )

    result = []

    for c in cards:

        if c.card_type == "technical":
            result.append({
                "type": "technical",
                "name": c.technical_skill.name if c.technical_skill else None
            })

        elif c.card_type == "hobby":
            result.append({
                "type": "hobby",
                "name": c.hobby.name if c.hobby else None
            })

    return result