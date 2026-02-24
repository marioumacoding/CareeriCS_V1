import re
import json

def _safe_json_parse(text: str) -> dict:
    """
    Extract and safely parse JSON from model output.
    """

    # Remove markdown wrappers
    cleaned = re.sub(r"```json|```", "", text).strip()

    # Extract first JSON object
    match = re.search(r"\{.*\}", cleaned, re.DOTALL)
    if not match:
        raise ValueError("No JSON object found in model output")

    json_str = match.group(0)

    return json.loads(json_str)