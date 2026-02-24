import json
from sqlalchemy.orm import Session

from services.interview.session_service import export_session_fields
from utils.util import _safe_json_parse
from ai.completion import deepseek_response
from ai.prompts import interview_session_fields_prompt


def extract_session_data(db: Session, session_id: int):

    session_json = export_session_fields(db, session_id)

    if not session_json:
        return None

    prompt = interview_session_fields_prompt(session_json)

    report_text = deepseek_response(prompt)

    try:
        return _safe_json_parse(report_text)
    except json.JSONDecodeError:
        raise ValueError("AI returned invalid JSON")