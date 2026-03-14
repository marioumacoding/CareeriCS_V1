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
    return _safe_json_parse(raw_output)


# =========================
# Helpers
# =========================
def safe_list(data: dict, key: str):
    value = data.get(key)
    return value if isinstance(value, list) else []


def clean_str(value):
    return value.strip() if isinstance(value, str) else value


def ensure_list(value):
    """Ensure JSON/ARRAY fields are always lists."""
    if isinstance(value, list):
        return value
    if isinstance(value, str) and value:
        return [value]
    return []