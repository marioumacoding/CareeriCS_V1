from sqlalchemy.orm import Session
from uuid import uuid4
from db.models import CareerQuestion


def create_question(db: Session, text: str, type: str, card_id: str):
    if type == "hobby":
        question = CareerQuestion(
            id=uuid4(),
            text=text,
            hobby_id=card_id,
            type=type
        )
    elif type == "technical":
        question = CareerQuestion(
            id=uuid4(),
            text=text,
            technical_skill_id=card_id,
            type=type
        )
    else:
        raise ValueError("type must be 'hobby' or 'technical'")

    db.add(question)
    db.commit()
    db.refresh(question)
    return question

def create_questions_for_card(db: Session, questions: list[str], type: str, card_id: str):
    created = []
    for q in questions:
        created.append(create_question(db, q, type, card_id))
    return created

def create_questions_multiple_cards(db: Session, cards_data: list[dict], type: str):
    all_created = []
    for card in cards_data:
        created = create_questions_for_card(
            db=db,
            questions=card["questions"],
            type=type,
            card_id=card["card_id"]
        )
        all_created.extend(created)
    return all_created
    

# Get Questions for Selected Card
def get_questions_for_cards(db: Session, card_id: str, card_type: str):
    if card_type == "hobby":
        return db.query(CareerQuestion).filter_by(hobby_id=card_id).all()
    elif card_type == "technical":
        return db.query(CareerQuestion).filter_by(technical_skill_id=card_id).all()
    else:
        raise ValueError("card_type must be 'hobby' or 'technical'")
