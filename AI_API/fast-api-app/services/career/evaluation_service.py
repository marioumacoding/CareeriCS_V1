import json
from typing import Any, List, Dict
from sqlalchemy.orm import Session
from uuid import UUID, uuid4

from db.models import CareerTrackResult, CareerTrack
from .answer_service import get_questions_and_answers_for_session
from .card_service import get_selected_cards

from ai.prompts import career_quiz_evaluation_prompt
from ai.completion import deepseek_response


def _serialize_track_scores(scores: List[Dict[str, Any]], track_map: Dict[str, CareerTrack]):
    serialized = []

    for item in scores:
        track_id = str(item["track_id"])
        track = track_map.get(track_id)

        serialized.append({
            "track_id": track_id,
            "track_name": track.name if track else "Unknown Track",
            "track_description": track.description if track else None,
            "score": int(item["score"]),
        })

    serialized.sort(key=lambda s: s["score"], reverse=True)
    return serialized


# =========================
# MAIN EVALUATION SERVICE
# =========================
def evaluate_career_track(db: Session, session_id: str) -> Dict[str, Any]:
    session_uuid = UUID(str(session_id))

    # -------------------------
    # 1. FETCH DATA
    # -------------------------
    raw_answers = get_questions_and_answers_for_session(db, session_id)
    selected_cards = get_selected_cards(db, session_id)
    tracks = db.query(CareerTrack).all()
    track_map = {str(track.id): track for track in tracks}

    # -------------------------
    # 2. STRUCTURE ANSWERS
    # -------------------------
    answers = normalize_answers(raw_answers)

    # -------------------------
    # 3. BUILD PROMPT
    # -------------------------
    prompt = career_quiz_evaluation_prompt(
        selected_cards=selected_cards,
        answers=answers,
        tracks=tracks
    )

    # -------------------------
    # 4. AI CALL
    # -------------------------
    raw_result = deepseek_response(prompt)
    print(f"[AI RAW RESULT]: {raw_result}")

    # -------------------------
    # 5. SAFE PARSE
    # -------------------------
    result = safe_json_parse(raw_result)
    print(f"[PARSED RESULT]: {result}")

    # -------------------------
    # 6. VALIDATION
    # -------------------------
    validate_result(result)

    normalized_results = [
        {
            "track_id": UUID(str(item["track_id"])),
            "score": int(item["score"]),
        }
        for item in result
    ]

    # -------------------------
    # 7. CLEAN PREVIOUS RESULTS (IMPORTANT)
    # -------------------------
    db.query(CareerTrackResult)\
        .filter(CareerTrackResult.session_id == session_uuid)\
        .delete()

    # -------------------------
    # 8. SAVE RESULTS
    # -------------------------
    track_results = [
        CareerTrackResult(
            id=uuid4(),
            session_id=session_uuid,
            track_id=r["track_id"],
            score=int(r["score"])
        )
        for r in normalized_results
    ]

    db.bulk_save_objects(track_results)

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise e

    return {
        "track_scores": _serialize_track_scores(normalized_results, track_map)
    }


def get_career_track_results(db: Session, session_id: str) -> Dict[str, Any]:
    session_uuid = UUID(str(session_id))

    track_results = (
        db.query(CareerTrackResult)
        .filter(CareerTrackResult.session_id == session_uuid)
        .all()
    )

    if not track_results:
        return {"track_scores": []}

    track_ids = [result.track_id for result in track_results]
    tracks = db.query(CareerTrack).filter(CareerTrack.id.in_(track_ids)).all()
    track_map = {str(track.id): track for track in tracks}

    serialized_results = [
        {
            "track_id": result.track_id,
            "score": int(result.score),
        }
        for result in track_results
    ]

    return {
        "track_scores": _serialize_track_scores(serialized_results, track_map)
    }


# =========================
# NORMALIZE ANSWERS
# =========================
def normalize_answers(raw_answers: List[Dict]) -> List[Dict]:
    """
    Ensures answers are structured consistently for AI prompt.
    """
    normalized = []

    for item in raw_answers:
        normalized.append({
            "card_name": item.get("card_name") or item.get("card") or "unknown",
            "question_text": item.get("question_text") or item.get("question") or "",
            "answer": int(item.get("answer", 0))
        })

    return normalized


# =========================
# VALIDATION
# =========================
def validate_result(result: Any):
    if not isinstance(result, list):
        raise ValueError("AI output must be a list")

    if len(result) != 3:
        raise ValueError(f"Expected 3 recommendations, got {len(result)}")

    for r in result:
        if "track_id" not in r or "score" not in r:
            raise ValueError(f"Invalid item: {r}")

        if not (0 <= int(r["score"]) <= 100):
            raise ValueError(f"Score out of range: {r['score']}")


# =========================
# SAFE JSON PARSER (IMPROVED)
# =========================
def safe_json_parse(raw: str) -> List[Dict]:
    if not raw or not isinstance(raw, str):
        return []

    cleaned = raw.strip()

    # Remove markdown
    cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    # Extract JSON block
    start = cleaned.find("[")
    end = cleaned.rfind("]")

    if start != -1 and end != -1:
        cleaned = cleaned[start:end + 1]

    try:
        data = json.loads(cleaned)

        if isinstance(data, list):
            return [
                {
                    "track_id": item["track_id"],
                    "score": item["score"]
                }
                for item in data
                if isinstance(item, dict)
                and "track_id" in item
                and "score" in item
            ]

        return []

    except Exception as e:
        print(f"[JSON PARSE ERROR]: {e}")
        return []