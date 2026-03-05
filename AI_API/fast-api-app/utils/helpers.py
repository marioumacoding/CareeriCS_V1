import json
import re
from typing import Any


def _safe_json_parse(raw_text: str) -> Any:
    raw_text = raw_text.strip()

    try:
        return json.loads(raw_text)
    except json.JSONDecodeError:
        pass

    json_objects = re.findall(r'\{.*?\}', raw_text, re.DOTALL)

    results = []
    for obj_str in json_objects:
        try:
            results.append(json.loads(obj_str))
        except json.JSONDecodeError:
            continue

    if len(results) == 0:
        raise ValueError("No valid JSON found in AI output")
    elif len(results) == 1:
        return results[0]
    else:
        return results