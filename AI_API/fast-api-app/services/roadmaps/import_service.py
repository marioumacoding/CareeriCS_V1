import json
from pathlib import Path
from typing import Iterable, List, Tuple
from uuid import uuid4

from sqlalchemy import func, or_
from sqlalchemy.orm import Session

from core.config import settings
from db.models import Roadmap, RoadmapAssessmentResult, RoadmapSection, RoadmapStep
from schemas import (
    BulkRoadmapImportResponseSchema,
    RoadmapImportItemResultSchema,
    RoadmapImportPayloadSchema,
    RoadmapImportRequestSchema,
)


PROJECT_ROOT = Path(__file__).resolve().parents[2]
from pathlib import Path

BASE_DIR = Path(__file__).resolve()

DEFAULT_IMPORT_BASE = BASE_DIR.parents[2] / "developer-roadmap" / "roadmaps-structuerd"


def _import_base_dir() -> Path:
    if settings.ROADMAP_IMPORT_BASE:
        return Path(settings.ROADMAP_IMPORT_BASE).resolve()
    return DEFAULT_IMPORT_BASE.resolve()


def _validate_non_empty(value: str, field_name: str) -> None:
    if not value or not value.strip():
        raise ValueError(f"{field_name} must not be empty")


def _normalize_payload(raw: dict) -> RoadmapImportPayloadSchema:
    payload = RoadmapImportPayloadSchema(**raw)
    _validate_non_empty(payload.title, "roadmap title")

    for section in payload.sections:
        _validate_non_empty(section.title, "section title")
        for step in section.steps:
            _validate_non_empty(step.title, "step title")

    return payload


def _iter_json_files(base_path: Path, recursive: bool) -> Iterable[Path]:
    pattern = "**/*.json" if recursive else "*.json"
    return sorted(base_path.glob(pattern))


def _safe_resolve_path(raw_path: str) -> Path:
    import_base = _import_base_dir()
    candidate = Path(raw_path)
    if not candidate.is_absolute():
        candidate = import_base / candidate

    resolved = candidate.resolve()
    base_resolved = import_base.resolve()

    if base_resolved not in resolved.parents and resolved != base_resolved:
        raise ValueError("Path is outside allowed roadmap import directory")

    if not resolved.exists():
        raise ValueError("Path does not exist")

    return resolved


def _delete_existing_roadmap_tree(db: Session, roadmap: Roadmap) -> None:
    existing_sections = db.query(RoadmapSection).filter(RoadmapSection.roadmap_id == roadmap.id).all()
    section_ids = [section.id for section in existing_sections]

    step_ids: List = []
    if section_ids:
        existing_steps = db.query(RoadmapStep).filter(RoadmapStep.section_id.in_(section_ids)).all()
        step_ids = [step.id for step in existing_steps]

    filters = [RoadmapAssessmentResult.roadmap_id == roadmap.id]
    if section_ids:
        filters.append(RoadmapAssessmentResult.section_id.in_(section_ids))
    if step_ids:
        filters.append(RoadmapAssessmentResult.step_id.in_(step_ids))

    db.query(RoadmapAssessmentResult).filter(or_(*filters)).delete(synchronize_session=False)

    if section_ids:
        db.query(RoadmapStep).filter(RoadmapStep.section_id.in_(section_ids)).delete(synchronize_session=False)

    db.query(RoadmapSection).filter(RoadmapSection.roadmap_id == roadmap.id).delete(synchronize_session=False)


def _upsert_roadmap(db: Session, payload: RoadmapImportPayloadSchema) -> Tuple[str, int, int]:
    existing = (
        db.query(Roadmap)
        .filter(func.lower(Roadmap.title) == payload.title.strip().lower())
        .first()
    )

    if existing:
        status = "updated"
        existing.title = payload.title.strip()
        existing.description = (payload.description or "").strip() or None
        _delete_existing_roadmap_tree(db, existing)
        roadmap = existing
    else:
        status = "imported"
        roadmap = Roadmap(
            id=uuid4(),
            title=payload.title.strip(),
            description=(payload.description or "").strip() or None,
        )
        db.add(roadmap)

    db.flush()

    sections_count = 0
    steps_count = 0

    for section_idx, section_payload in enumerate(payload.sections, start=1):
        section = RoadmapSection(
            id=uuid4(),
            roadmap_id=roadmap.id,
            title=section_payload.title.strip(),
            description=(section_payload.description or "").strip() or None,
            order=section_idx,
        )
        db.add(section)
        db.flush()
        sections_count += 1

        for step_idx, step_payload in enumerate(section_payload.steps, start=1):
            step = RoadmapStep(
                id=uuid4(),
                section_id=section.id,
                title=step_payload.title.strip(),
                description=(step_payload.description or "").strip() or None,
                resources=[resource.model_dump() for resource in step_payload.resources],
                order=step_idx,
            )
            db.add(step)
            steps_count += 1

    return status, sections_count, steps_count


def import_roadmaps_from_request(
    db: Session,
    request_payload: RoadmapImportRequestSchema,
) -> BulkRoadmapImportResponseSchema:
    payloads: List[RoadmapImportPayloadSchema] = []

    if request_payload.roadmap:
        payloads.append(request_payload.roadmap)
    if request_payload.roadmaps:
        payloads.extend(request_payload.roadmaps)

    if not payloads:
        raise ValueError("Provide roadmap or roadmaps in request payload")

    return _import_payloads(db, payloads)


def import_roadmaps_from_path(
    db: Session,
    raw_path: str,
    recursive: bool = False,
) -> BulkRoadmapImportResponseSchema:
    path = _safe_resolve_path(raw_path)
    payloads: List[RoadmapImportPayloadSchema] = []

    files: List[Path] = []
    if path.is_file():
        files = [path]
    elif path.is_dir():
        files = list(_iter_json_files(path, recursive))

    for json_file in files:
        try:
            raw = json.loads(json_file.read_text(encoding="utf-8"))
        except json.JSONDecodeError as exc:
            raise ValueError(f"Invalid JSON file {json_file.name}: {exc}") from exc

        if isinstance(raw, list):
            for item in raw:
                payloads.append(_normalize_payload(item))
        elif isinstance(raw, dict):
            payloads.append(_normalize_payload(raw))
        else:
            raise ValueError(f"Unsupported JSON shape in file {json_file.name}")

    if not payloads:
        raise ValueError("No roadmap payloads found")

    return _import_payloads(db, payloads)


def import_default_bulk(db: Session) -> BulkRoadmapImportResponseSchema:
    return import_roadmaps_from_path(db, str(_import_base_dir()), recursive=False)


def _import_payloads(db: Session, payloads: List[RoadmapImportPayloadSchema]) -> BulkRoadmapImportResponseSchema:
    imported = 0
    updated = 0
    failed = 0
    results: List[RoadmapImportItemResultSchema] = []

    for payload in payloads:
        try:
            _normalize_payload(payload.model_dump())
            status, sections_count, steps_count = _upsert_roadmap(db, payload)
            db.commit()

            if status == "updated":
                updated += 1
            else:
                imported += 1

            results.append(
                RoadmapImportItemResultSchema(
                    title=payload.title,
                    status=status,
                    sections_count=sections_count,
                    steps_count=steps_count,
                )
            )
        except Exception as exc:
            db.rollback()
            failed += 1
            results.append(
                RoadmapImportItemResultSchema(
                    title=payload.title,
                    status="failed",
                    message=str(exc),
                )
            )

    return BulkRoadmapImportResponseSchema(
        imported=imported,
        updated=updated,
        failed=failed,
        results=results,
    )
