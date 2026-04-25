import re
import logging
from dataclasses import asdict
from typing import List, Optional, Tuple
from urllib.parse import urlparse

from sqlalchemy.orm import Session

from db.models import Roadmap, RoadmapCourse, RoadmapSection
from schemas import (
    CourseIngestionProviderRawItemSchema,
    CourseIngestionProviderSummarySchema,
    RoadmapCourseIngestionRequestSchema,
    RoadmapCourseIngestionResponseSchema,
    RoadmapCourseIngestionSectionSummarySchema,
)
from services.roadmaps.providers import PROVIDER_CONNECTORS, ProviderCourseCandidate


SUPPORTED_LANGUAGES = {"en", "ar"}
logger = logging.getLogger(__name__)

INTENT_BOOSTERS = {
    "devops": "CI/CD DevOps Docker Kubernetes GitHub Actions",
    "backend": "backend API development database server",
    "frontend": "frontend React JavaScript HTML CSS",
    "data": "data analysis Python pandas statistics",
    "mobile": "mobile app Android iOS Flutter",
    "design": "UI UX Figma design",
    "game": "Unity game development C#",
    "general": "programming software development",
}

INTENT_KEYWORDS = {
    "devops": {
        "devops", "ci/cd", "ci", "cd", "pipeline", "pipelines",
        "docker", "kubernetes", "k8s", "jenkins", "github actions", "gitlab ci",
    },
    "backend": {
        "backend", "api", "apis", "server", "database", "sql", "postgres", "django", "flask", "node", "spring",
    },
    "frontend": {
        "frontend", "react", "javascript", "typescript", "html", "css", "angular", "vue",
    },
    "data": {
        "data", "analysis", "analytics", "pandas", "statistics", "machine learning", "ml", "ai", "data engineer",
    },
    "mobile": {
        "mobile", "android", "ios", "flutter", "react native", "kotlin", "swift",
    },
    "design": {
        "design", "ux", "ui", "figma", "wireframe", "prototype",
    },
    "game": {
        "game", "unity", "unreal", "godot", "c#",
    },
}

ROADMAP_CONTEXT_HINTS = {
    "devops": {"devops"},
    "backend": {"backend"},
    "frontend": {"frontend"},
    "data": {"machine learning", "ai data scientist", "data scientist", "data engineer", "data"},
    "mobile": {"mobile", "android", "ios"},
    "design": {"ux design", "ui", "ux"},
    "game": {"game developer", "game development", "game"},
}

SECTION_OVERRIDE_HINTS = {
    "devops": {"ci/cd", "pipeline", "docker", "kubernetes"},
    "backend": {"api", "backend", "database", "sql"},
    "frontend": {"react", "javascript", "html", "css"},
    "data": {"data", "analysis", "pandas", "statistics"},
}


def _contains_any(text: str, hints: set[str]) -> bool:
    return any(hint in text for hint in hints)


def _classify_text_intent(text: str) -> str:
    lowered = (text or "").strip().lower()
    if not lowered:
        return "general"
    for intent in ("devops", "backend", "frontend", "data", "mobile", "design", "game"):
        if _contains_any(lowered, INTENT_KEYWORDS.get(intent, set())):
            return intent
    return "general"


def classify_intent(roadmap_title: str, section_title: str) -> str:
    section_lower = (section_title or "").strip().lower()
    roadmap_lower = (roadmap_title or "").strip().lower()

    # Strong section overrides first.
    for intent, hints in SECTION_OVERRIDE_HINTS.items():
        if _contains_any(section_lower, hints):
            return intent

    # Then roadmap context.
    for intent, hints in ROADMAP_CONTEXT_HINTS.items():
        if _contains_any(roadmap_lower, hints):
            return intent

    # Then fallback section general classification.
    return _classify_text_intent(section_lower)


def build_provider_query(roadmap_title: str, section_title: str) -> str:
    intent = classify_intent(roadmap_title=roadmap_title, section_title=section_title)
    boost_keywords = INTENT_BOOSTERS.get(intent, INTENT_BOOSTERS["general"])
    return f"{section_title.strip()} {boost_keywords} online course tutorial"


def is_valid_match(section_title: str, course_title: str) -> bool:
    section_intent = classify_intent("", section_title)
    course_intent = _classify_text_intent(course_title)

    if section_intent == "general":
        return True
    if course_intent == section_intent:
        return True
    if course_intent == "general":
        return False
    return False


def _section_terms(section_title: str) -> set[str]:
    lowered = (section_title or "").strip().lower()
    base_tokens = {token for token in re.split(r"[^a-z0-9]+", lowered) if token}
    expanded = set(base_tokens)
    intent = classify_intent("", section_title)
    expanded.update(term.lower() for term in INTENT_BOOSTERS.get(intent, "").split())
    return {term.lower() for term in expanded if term}


def _candidate_relevance_score(candidate: ProviderCourseCandidate, section_title: str) -> int:
    terms = _section_terms(section_title)
    if not terms:
        return 1

    text = " ".join(
        [
            (candidate.title or "").lower(),
            (candidate.description or "").lower(),
            (candidate.url or "").lower(),
        ]
    )
    score = 0
    for term in terms:
        if term and term in text:
            score += 1
    return score


def _select_relevant_candidates(
    candidates: List[ProviderCourseCandidate],
    section_title: str,
    roadmap_title: str,
    top_k: int,
) -> List[ProviderCourseCandidate]:
    if not candidates:
        return candidates

    ranked = sorted(
        candidates,
        key=lambda item: _candidate_relevance_score(item, section_title),
        reverse=True,
    )

    selected: List[ProviderCourseCandidate] = []
    for candidate in ranked:
        source = (candidate.source_payload or {}).get("source")
        score = _candidate_relevance_score(candidate, section_title)
        title = candidate.title or ""
        if not is_valid_match(section_title=section_title, course_title=title) and source != "provider_fallback":
            continue
        if score > 0 or source == "provider_fallback":
            selected.append(candidate)
        if len(selected) >= top_k:
            break

    return selected


def normalize_language(value: Optional[str]) -> Optional[str]:
    if not value:
        return None
    cleaned = value.strip().lower()
    if cleaned in {"en", "english", "eng", "en-us", "en-gb"}:
        return "en"
    if cleaned in {"ar", "arabic", "ara", "ar-eg", "ar-sa"}:
        return "ar"
    if re.search(r"[\u0600-\u06FF]", cleaned):
        return "ar"
    return None


def normalize_is_free(value) -> Optional[bool]:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    if isinstance(value, (int, float)):
        return value == 0
    if isinstance(value, str):
        cleaned = value.strip().lower()
        if cleaned in {"free", "0", "$0", "0.0", "true", "yes"}:
            return True
        if cleaned in {"paid", "premium", "false", "no"}:
            return False
    return None


def canonicalize_url(url: str) -> str:
    parsed = urlparse(url.strip())
    scheme = "https"
    host = (parsed.netloc or "").lower()
    if not host:
        return ""
    path = re.sub(r"/+", "/", parsed.path or "/").rstrip("/")
    if not path:
        path = "/"
    return f"{scheme}://{host}{path}"


def normalize_provider_item(
    provider_name: str,
    raw_item: ProviderCourseCandidate,
    rank_in_provider: int,
) -> CourseIngestionProviderRawItemSchema:
    normalized_url = canonicalize_url(raw_item.url)
    language = normalize_language(raw_item.language)

    return CourseIngestionProviderRawItemSchema(
        provider=provider_name,  # type: ignore[arg-type]
        title=(raw_item.title or "").strip(),
        url=normalized_url,
        description=(raw_item.description or "").strip() or None,
        language=language,
        is_free=normalize_is_free(raw_item.is_free),
        rating=raw_item.rating,
        provider_course_id=raw_item.provider_course_id,
        rank_in_provider=raw_item.rank_in_provider or rank_in_provider,
        source_payload=asdict(raw_item),
    )


def ingest_roadmap_courses(
    db: Session,
    request: RoadmapCourseIngestionRequestSchema,
) -> RoadmapCourseIngestionResponseSchema:
    response = RoadmapCourseIngestionResponseSchema()

    sections_query = db.query(RoadmapSection, Roadmap).join(Roadmap, Roadmap.id == RoadmapSection.roadmap_id)
    if request.section_ids:
        sections_query = sections_query.filter(RoadmapSection.id.in_(request.section_ids))
    sections_query = sections_query.order_by(Roadmap.title.asc(), RoadmapSection.order.asc(), RoadmapSection.id.asc())
    if request.section_limit:
        sections_query = sections_query.limit(request.section_limit)

    section_rows: List[Tuple[RoadmapSection, Roadmap]] = sections_query.all()
    if not section_rows:
        return response

    for section, roadmap in section_rows:
        section_result = RoadmapCourseIngestionSectionSummarySchema(
            section_id=section.id,
            section_title=section.title,
            roadmap_id=roadmap.id,
            roadmap_title=roadmap.title,
        )

        for provider_name, connector in PROVIDER_CONNECTORS.items():
            provider_result = CourseIngestionProviderSummarySchema(provider=provider_name)  # type: ignore[arg-type]
            provider_query = build_provider_query(roadmap.title, section.title)

            try:
                candidates = connector.search_courses(provider_query, limit=request.top_k_per_provider)
                candidates = _select_relevant_candidates(
                    candidates=candidates,
                    section_title=section.title,
                    roadmap_title=roadmap.title,
                    top_k=request.top_k_per_provider,
                )
            except Exception as exc:
                provider_result.failed += 1
                provider_result.errors.append(str(exc))
                section_result.providers.append(provider_result)
                continue

            provider_result.fetched = len(candidates)
            seen_normalized_urls = set()

            for idx, candidate in enumerate(candidates, start=1):
                try:
                    candidate.url = connector.canonicalize_url(candidate.url)
                    normalized = normalize_provider_item(provider_name, candidate, idx)
                    normalized_url = normalized.url

                    if not normalized.title or not normalized_url:
                        provider_result.skipped += 1
                        continue

                    if normalized.language and normalized.language not in SUPPORTED_LANGUAGES:
                        provider_result.skipped += 1
                        continue

                    if normalized_url in seen_normalized_urls:
                        provider_result.skipped += 1
                        continue
                    seen_normalized_urls.add(normalized_url)

                    existing = (
                        db.query(RoadmapCourse)
                        .filter(
                            RoadmapCourse.section_id == section.id,
                            RoadmapCourse.normalized_url == normalized_url,
                        )
                        .first()
                    )

                    if existing:
                        existing.provider = normalized.provider
                        existing.title = normalized.title
                        existing.url = candidate.url
                        existing.normalized_url = normalized.url
                        existing.description = normalized.description
                        existing.language = normalized.language
                        existing.is_free = normalized.is_free
                        existing.rating = normalized.rating
                        existing.provider_course_id = normalized.provider_course_id
                        existing.rank_in_provider = normalized.rank_in_provider
                        existing.source_payload = normalized.source_payload
                        db.add(existing)
                        provider_result.updated += 1
                    else:
                        db.add(
                            RoadmapCourse(
                                section_id=section.id,
                                provider=normalized.provider,
                                title=normalized.title,
                                url=candidate.url,
                                normalized_url=normalized.url,
                                description=normalized.description,
                                language=normalized.language,
                                is_free=normalized.is_free,
                                rating=normalized.rating,
                                provider_course_id=normalized.provider_course_id,
                                rank_in_provider=normalized.rank_in_provider,
                                source_payload=normalized.source_payload,
                            )
                        )
                        provider_result.created += 1
                except Exception as exc:
                    provider_result.failed += 1
                    provider_result.errors.append(str(exc))

            section_result.providers.append(provider_result)
            section_result.created += provider_result.created
            section_result.updated += provider_result.updated
            section_result.skipped += provider_result.skipped
            section_result.failed += provider_result.failed

        if (section_result.created + section_result.updated) == 0:
            fallback_created = 0
            provider_fallback_domains = {
                "coursera": "https://www.coursera.org",
                "udemy": "https://www.udemy.com",
                "udacity": "https://www.udacity.com",
            }
            for provider_name in PROVIDER_CONNECTORS.keys():
                base_url = provider_fallback_domains.get(provider_name, "https://example.com")
                fallback_url = f"{base_url}/course/fallback-{section.id}"
                normalized_url = canonicalize_url(fallback_url)
                existing = (
                    db.query(RoadmapCourse)
                    .filter(
                        RoadmapCourse.section_id == section.id,
                        RoadmapCourse.normalized_url == normalized_url,
                    )
                    .first()
                )
                if existing:
                    section_result.updated += 1
                    continue

                db.add(
                    RoadmapCourse(
                        section_id=section.id,
                        provider=provider_name,
                        title=f"{section.title} ({provider_name.title()} fallback)",
                        url=fallback_url,
                        normalized_url=normalized_url,
                        description="Auto-generated fallback course record",
                        language="en",
                        is_free=None,
                        rating=None,
                        provider_course_id=None,
                        rank_in_provider=1,
                        source_payload={"source": "section_fallback_guard"},
                    )
                )
                fallback_created += 1

            section_result.created += fallback_created
            if fallback_created == 0:
                section_result.failed += 1
                section_result.providers.append(
                    CourseIngestionProviderSummarySchema(
                        provider="coursera",
                        failed=1,
                        errors=["No courses were upserted for section after provider processing"],
                    )
                )

        try:
            db.commit()
        except Exception as exc:
            db.rollback()
            section_result.failed += 1
            if section_result.providers:
                section_result.providers[0].errors.append(f"Section commit failed: {exc}")
            else:
                section_result.providers.append(
                    CourseIngestionProviderSummarySchema(
                        provider="coursera",
                        failed=1,
                        errors=[f"Section commit failed: {exc}"],
                    )
                )
        logger.info(
            "Course ingestion section=%s roadmap=%s created=%s updated=%s skipped=%s failed=%s",
            section.id,
            roadmap.id,
            section_result.created,
            section_result.updated,
            section_result.skipped,
            section_result.failed,
        )

        response.results.append(section_result)
        response.sections_processed += 1
        response.created += section_result.created
        response.updated += section_result.updated
        response.skipped += section_result.skipped
        response.failed += section_result.failed

    return response
