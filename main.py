from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


_BACKEND_DIR = Path(__file__).resolve().parent / "AI_API" / "fast-api-app"
_BACKEND_MAIN = _BACKEND_DIR / "main.py"

if str(_BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(_BACKEND_DIR))

_SPEC = importlib.util.spec_from_file_location("careerics_backend_main", _BACKEND_MAIN)
if _SPEC is None or _SPEC.loader is None:
    raise ImportError(f"Unable to load FastAPI app from {_BACKEND_MAIN}")

_MODULE = importlib.util.module_from_spec(_SPEC)
_SPEC.loader.exec_module(_MODULE)

app = _MODULE.app
