from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
import math
import re
from typing import Iterable, Optional


INVALID_FILTER_VALUES = {
    "",
    "n/a",
    "na",
    "none",
    "null",
    "unknown",
    "unspecified",
    "location",
    "job type",
    "job_type",
    "work type",
    "work_type",
    "career level",
    "career_level",
    "city",
    "country",
}

REGION_BUCKET_KEYS = {
    "apj",
    "emea",
    "eu",
    "european union",
    "latam",
    "latin america",
    "middle east",
    "north america",
}

COUNTRY_ALIASES = {
    "egypt": "Egypt",
    "usa": "United States",
    "u.s.a": "United States",
    "us": "United States",
    "u.s": "United States",
    "uk": "United Kingdom",
    "u.k": "United Kingdom",
    "uae": "United Arab Emirates",
}

US_STATE_CODES = {
    "al", "ak", "az", "ar", "ca", "co", "ct", "de", "fl", "ga", "hi", "ia",
    "id", "il", "in", "ks", "ky", "la", "ma", "md", "me", "mi", "mn", "mo",
    "ms", "mt", "nc", "nd", "ne", "nh", "nj", "nm", "nv", "ny", "oh", "ok",
    "or", "pa", "ri", "sc", "sd", "tn", "tx", "ut", "va", "vt", "wa", "wi",
    "wv", "wy", "dc",
}

EGYPT_TOKEN_ALIASES = {
    "alexandria": "Alexandria",
    "al jizah": "Giza",
    "as suways": "Suez",
    "cairo": "Cairo",
    "el sheikh zaid": "Sheikh Zayed City",
    "giza": "Giza",
    "heliopolis": "Heliopolis",
    "maadi": "Maadi",
    "nasr city": "Nasr City",
    "new cairo": "New Cairo",
    "new heliopolis": "New Heliopolis",
    "qesm 2nd new cairo": "New Cairo",
    "qesm el maadi": "Maadi",
    "qesm el sheikh zaid": "Sheikh Zayed City",
    "sheikh zayed city": "Sheikh Zayed City",
    "6th of october": "6th of October",
    "10th of ramadan": "10th of Ramadan",
}

WORK_TYPE_ALIASES = {
    "remote": "Remote",
    "hybrid": "Hybrid",
    "onsite": "Onsite",
    "on site": "Onsite",
    "on-site": "Onsite",
}

EMPLOYMENT_TYPE_ALIASES = {
    "contract": "Contract",
    "full time": "Full-time",
    "full-time": "Full-time",
    "intern": "Intern",
    "internship": "Intern",
    "other": "Other",
    "part time": "Part-time",
    "part-time": "Part-time",
    "temporary": "Temporary",
    "volunteer": "Volunteer",
}


@dataclass(frozen=True)
class NormalizedLocation:
    country: Optional[str]
    city: Optional[str]
    tokens: tuple[str, ...]


@dataclass(frozen=True)
class NormalizedJobMetadata:
    country: Optional[str]
    city: Optional[str]
    work_type: Optional[str]
    employment_type: Optional[str]
    career_level: Optional[str]


def normalize_lookup_key(value: Optional[str]) -> str:
    if not value:
        return ""

    lowered = value.strip().lower()
    lowered = lowered.replace("_", " ")
    lowered = lowered.replace("/", " ")
    lowered = lowered.replace("\\", " ")
    lowered = re.sub(r"\s+", " ", lowered)
    return lowered.strip(" .,-")


INVALID_FILTER_LOOKUP_KEYS = {
    normalize_lookup_key(value)
    for value in INVALID_FILTER_VALUES
}


def clean_filter_value(value: Optional[str]) -> Optional[str]:
    if not value:
        return None

    cleaned = re.sub(r"\s+", " ", value).strip()
    if not cleaned:
        return None

    if normalize_lookup_key(cleaned) in INVALID_FILTER_LOOKUP_KEYS:
        return None

    return cleaned


def normalize_work_type(value: Optional[str]) -> Optional[str]:
    cleaned = clean_filter_value(value)
    if not cleaned:
        return None

    return WORK_TYPE_ALIASES.get(normalize_lookup_key(cleaned))


def normalize_employment_type(value: Optional[str]) -> Optional[str]:
    cleaned = clean_filter_value(value)
    if not cleaned:
        return None

    key = normalize_lookup_key(cleaned)
    if key in EMPLOYMENT_TYPE_ALIASES:
        return EMPLOYMENT_TYPE_ALIASES[key]

    return cleaned[:1].upper() + cleaned[1:]


def normalize_career_level(value: Optional[str]) -> Optional[str]:
    cleaned = clean_filter_value(value)
    if not cleaned:
        return None

    return cleaned[:1].upper() + cleaned[1:]


def _is_region_bucket(key: str) -> bool:
    return key in REGION_BUCKET_KEYS or key.endswith(" region")


def _split_location_tokens(location: Optional[str]) -> list[str]:
    cleaned = clean_filter_value(location)
    if not cleaned:
        return []

    parts = re.split(r"[;,|/]", cleaned)
    tokens: list[str] = []
    seen: set[str] = set()

    for part in parts:
        token = re.sub(r"\s+", " ", part).strip()
        if not token:
            continue

        token_key = normalize_lookup_key(token)
        if not token_key or token_key in INVALID_FILTER_VALUES:
            continue

        if token_key in seen:
            continue

        seen.add(token_key)
        tokens.append(token)

    return tokens


def infer_location_country(location: Optional[str]) -> Optional[str]:
    return normalize_location(location).country


def normalize_location(location: Optional[str]) -> NormalizedLocation:
    tokens = _split_location_tokens(location)
    if not tokens:
        return NormalizedLocation(country=None, city=None, tokens=tuple())

    token_keys = [normalize_lookup_key(token) for token in tokens]

    if "egypt" in token_keys or any(key in EGYPT_TOKEN_ALIASES for key in token_keys):
        country = "Egypt"
    else:
        last_key = token_keys[-1]
        if last_key in COUNTRY_ALIASES:
            country = COUNTRY_ALIASES[last_key]
        elif last_key in US_STATE_CODES:
            country = "United States"
        elif _is_region_bucket(last_key):
            country = None
        elif len(tokens) == 1 and _is_region_bucket(token_keys[0]):
            country = None
        else:
            country = tokens[-1]

    city = _infer_location_city(tokens, country)
    return NormalizedLocation(country=country, city=city, tokens=tuple(tokens))


def _infer_location_city(tokens: list[str], country: Optional[str]) -> Optional[str]:
    if not tokens or not country:
        return None

    country_key = normalize_lookup_key(country)

    if country == "Egypt":
        for token in tokens:
            token_key = normalize_lookup_key(token)
            if token_key == "egypt":
                continue

            city = EGYPT_TOKEN_ALIASES.get(token_key)
            if city:
                return city

        for token in tokens:
            token_key = normalize_lookup_key(token)
            if token_key != "egypt":
                return token

        return None

    if len(tokens) == 1 and normalize_lookup_key(tokens[0]) == country_key:
        return None

    for token in tokens:
        token_key = normalize_lookup_key(token)
        if not token_key or token_key == country_key:
            continue
        if token_key in COUNTRY_ALIASES and COUNTRY_ALIASES[token_key] == country:
            continue
        if _is_region_bucket(token_key):
            continue
        return token

    return None


def normalize_job_metadata(
    *,
    location: Optional[str],
    work_type: Optional[str],
    employment_type: Optional[str],
    career_level: Optional[str],
) -> NormalizedJobMetadata:
    normalized_location = normalize_location(location)
    return NormalizedJobMetadata(
        country=normalized_location.country,
        city=normalized_location.city,
        work_type=normalize_work_type(work_type),
        employment_type=normalize_employment_type(employment_type),
        career_level=normalize_career_level(career_level),
    )


def build_filter_option_items(
    values: Iterable[Optional[str]],
    *,
    excluded_values: Optional[set[str]] = None,
) -> list[dict[str, int | str]]:
    excluded = excluded_values or set()
    counts = Counter(value for value in values if value and value not in excluded)
    options = [
        {"id": value, "title": value, "count": count}
        for value, count in counts.items()
    ]
    return sorted(options, key=lambda option: (-int(option["count"]), str(option["title"]).lower()))


def compute_page_number(skip: int, limit: int) -> int:
    if limit <= 0:
        return 1
    return math.floor(skip / limit) + 1


def compute_total_pages(total: int, limit: int) -> int:
    if limit <= 0:
        return 0
    return math.ceil(total / limit)
