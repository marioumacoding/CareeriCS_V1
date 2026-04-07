import json
from typing import Any, List, Dict
from sqlalchemy.orm import Session
from uuid import uuid4
from db.models import CareerTrackResult, CareerTrack
from .answer_service import get_questions_and_answers_for_session
from .card_service import get_selected_cards
from ai.prompts import career_quiz_evaluation_prompt
from ai.completion import deepseek_response


def evaluate_career_track(db: Session, session_id: str) -> Dict[str, Any]:
    # Fetch session data
    q_and_a = get_questions_and_answers_for_session(db, session_id)
    selected_cards = get_selected_cards(db, session_id)
    tracks = db.query(CareerTrack).all()

    # Build prompt and call AI
    prompt = career_quiz_evaluation_prompt(q_and_a, selected_cards, tracks)
    raw_result = deepseek_response(prompt)
    print(f"Raw result from Deepseek: {raw_result}")

    # Safe parse the AI response
    result = safe_json_parse(raw_result)
    print(f"Parsed result: {result}")

    # Validate result format
    if not isinstance(result, list) or not all("track_id" in r and "score" in r for r in result):
        raise ValueError(f"Unexpected response format from Deepseek: {raw_result}")

    # Save to DB
    track_results = [
        CareerTrackResult(
            id=uuid4(),
            session_id=session_id,
            track_id=r["track_id"],
            score=r["score"]
        )
        for r in result
    ]

    db.bulk_save_objects(track_results)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {
        "track_scores": result
    }  


import json
import re
from typing import Any, List, Dict

def safe_json_parse(raw: str) -> List[Dict]:
    """
    Safely parse a JSON string from Deepseek.
    Returns a list of recommendation dicts with 'track_id' and 'score'.
    Handles:
    - Markdown code blocks (```json ... ```)
    - Extraneous text before/after JSON
    - Missing 'recommendations' wrapper
    - Invalid JSON
    """
    if not raw or not isinstance(raw, str):
        return []
    
    # Clean the string - remove markdown code blocks
    cleaned = raw.strip()
    
    # Remove ```json and ``` markers
    cleaned = re.sub(r'^```json\s*', '', cleaned)
    cleaned = re.sub(r'^```\s*', '', cleaned)
    cleaned = re.sub(r'\s*```$', '', cleaned)
    
    # Try to find JSON-like structure if cleaning didn't work
    json_match = re.search(r'\{.*\}|\[.*\]', cleaned, re.DOTALL)
    if json_match:
        cleaned = json_match.group(0)
    
    try:
        data = json.loads(cleaned)
        
        # Case 1: Top-level is a list with the expected structure
        if isinstance(data, list):
            # Validate each item has required fields
            validated = []
            for item in data:
                if isinstance(item, dict) and "track_id" in item and "score" in item:
                    validated.append(item)
            return validated
        
        # Case 2: Top-level dict with 'recommendations' key
        elif isinstance(data, dict) and "recommendations" in data:
            recs = data["recommendations"]
            if isinstance(recs, list):
                validated = []
                for item in recs:
                    if isinstance(item, dict) and "track_id" in item and "score" in item:
                        validated.append(item)
                return validated
            return []
        
        # Case 3: Single dict with track_id and score
        elif isinstance(data, dict) and "track_id" in data and "score" in data:
            return [data]
        
        # Case 4: Dict with something else - try to extract
        elif isinstance(data, dict):
            # Look for any list that might contain recommendations
            for key, value in data.items():
                if isinstance(value, list) and value:
                    validated = []
                    for item in value:
                        if isinstance(item, dict) and "track_id" in item and "score" in item:
                            validated.append(item)
                    if validated:
                        return validated
            return []
        
        return []
        
    except json.JSONDecodeError as e:
        print(f"JSON decode error: {e}")
        print(f"Raw input (first 500 chars): {raw[:500]}")
        return []