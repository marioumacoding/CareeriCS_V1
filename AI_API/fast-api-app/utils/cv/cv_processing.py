import os
import json
import pdfplumber
from docx import Document
from ai.prompts import extract_cv_prompt, enhance_cv_prompt
from utils.util import _safe_json_parse
from ai.completion import deepseek_response

# =========================
# File Text Extraction
# =========================
def pdf_to_text(file_path: str) -> str:
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
            text += "\n"
    return text.strip()


def docx_to_text(file_path: str) -> str:
    doc = Document(file_path)
    return "\n".join([p.text for p in doc.paragraphs]).strip()


def extract_text(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return pdf_to_text(file_path)
    elif ext == ".docx":
        return docx_to_text(file_path)
    else:
        raise ValueError("Unsupported file type. Only PDF and DOCX allowed.")


# =========================
# CV Parsing + AI Enhancement
# =========================
def parse_and_enhance_cv(cv_text: str, type: str) -> dict:
    if type == "extractor":
        prompt = extract_cv_prompt(cv_text)
    elif type == "enhancer":
        prompt = enhance_cv_prompt(cv_text)
    else:
        raise ValueError("Invalid type. Must be 'extractor' or 'enhancer'.")

    raw_output = deepseek_response(prompt)
    return safe_parse_json(raw_output)


# =========================
# Helpers
# =========================
from typing import Any, List, Union

def safe_list(data: Union[dict, list, None], key: str = None) -> List[Any]:
    """
    Safely retrieve a list from a dict or handle a list/other input gracefully.
    
    - If `data` is a dict and `key` is provided, returns data[key] if it's a list, else [].
    - If `data` is a list, returns it directly.
    - Any other input returns [].
    """
    if isinstance(data, dict):
        if key is None:
            # no key provided, return empty
            return []
        value = data.get(key)
        return value if isinstance(value, list) else []
    if isinstance(data, list):
        return data
    return []

def clean_str(value: Any) -> str:
    """
    Safely strip strings. Returns empty string for non-string values.
    """
    if isinstance(value, str):
        return value.strip()
    return ""  # return empty string instead of None for safety

def ensure_list(value: Any) -> List[Any]:
    """
    Ensure the input is always returned as a list.
    
    - If input is a list, return it.
    - If input is a non-empty string, wrap it in a list.
    - Anything else returns an empty list.
    """
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value:
        return [value]
    return []




import json
import re

def safe_parse_json(raw_text: str, default=None):
    """
    Safely parse JSON text from a string that may contain code fences, extra text, or be malformed.
    Returns a dictionary or the provided default value.
    """
    if default is None:
        default = {}

    try:
        # Remove ```json or ``` markers if present
        cleaned = re.sub(r"^```json\s*|```$", "", raw_text.strip(), flags=re.IGNORECASE)
        # Sometimes the string is truncated or malformed, try a first simple parse
        return json.loads(cleaned)
    except (json.JSONDecodeError, TypeError):
        # Attempt to extract JSON-looking content between first { and last }
        try:
            start = cleaned.index("{")
            end = cleaned.rindex("}") + 1
            partial_json = cleaned[start:end]
            return json.loads(partial_json)
        except (ValueError, json.JSONDecodeError):
            # Fallback: return default if parsing fails completely
            return default