import time
from dataclasses import dataclass, field
from typing import Any, Dict, Iterable, List, Optional
from urllib.parse import parse_qs, quote_plus, unquote, urljoin, urlparse

import httpx
from bs4 import BeautifulSoup


DEFAULT_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/122.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9,ar;q=0.8",
}


@dataclass
class ProviderCourseCandidate:
    provider: str
    title: str
    url: str
    description: Optional[str] = None
    language: Optional[str] = None
    is_free: Optional[bool] = None
    rating: Optional[float] = None
    provider_course_id: Optional[str] = None
    rank_in_provider: Optional[int] = None
    source_payload: Dict[str, Any] = field(default_factory=dict)


class BaseProviderConnector:
    provider: str
    allowed_hosts: tuple[str, ...]

    def search_courses(self, query: str, limit: int = 3) -> List[ProviderCourseCandidate]:
        raise NotImplementedError

    def canonicalize_url(self, url: str) -> str:
        raise NotImplementedError

    def _get_text(self, url: str, params: Optional[Dict[str, Any]] = None, retries: int = 3) -> str:
        with httpx.Client(timeout=20.0, follow_redirects=True, headers=DEFAULT_HEADERS) as client:
            backoff = 0.6
            last_exc: Optional[Exception] = None
            for _ in range(retries):
                try:
                    response = client.get(url, params=params)
                    if response.status_code == 429:
                        time.sleep(backoff)
                        backoff *= 2
                        continue
                    response.raise_for_status()
                    return response.text
                except Exception as exc:
                    last_exc = exc
                    time.sleep(backoff)
                    backoff *= 2
            if last_exc:
                raise last_exc
        return ""

    def _get_soup(self, url: str, params: Optional[Dict[str, Any]] = None) -> BeautifulSoup:
        page = self._get_text(url=url, params=params)
        return BeautifulSoup(page, "html.parser")

    def _extract_course_links(
        self,
        soup: BeautifulSoup,
        page_url: str,
        path_contains: Iterable[str],
    ) -> List[tuple[str, str]]:
        items: List[tuple[str, str]] = []
        seen = set()
        candidates = tuple(path_contains)

        for anchor in soup.select("a[href]"):
            href = (anchor.get("href") or "").strip()
            if not href:
                continue

            absolute = urljoin(page_url, href)
            absolute = self._normalize_candidate_href(absolute)
            if not absolute:
                continue

            parsed = urlparse(absolute)
            host = (parsed.netloc or "").lower()
            if not any(allowed in host for allowed in self.allowed_hosts):
                continue

            path = parsed.path or "/"
            if not any(token in path for token in candidates):
                continue

            canonical = self.canonicalize_url(absolute)
            if not canonical or canonical in seen:
                continue

            title = self._clean_text(anchor.get_text(" ", strip=True))
            if not title:
                title = canonical.rsplit("/", 1)[-1].replace("-", " ").strip().title() or "Course"

            seen.add(canonical)
            items.append((title, canonical))

        return items

    def _fallback_candidates(self, query: str, limit: int, search_url: str) -> List[ProviderCourseCandidate]:
        count = max(1, limit)
        safe_query = self._clean_text(query) or "learning"
        slug = quote_plus(safe_query.lower().replace(" ", "-"))
        base_fallback_url = self._normalized_https_url(search_url)
        if not base_fallback_url:
            base_fallback_url = f"https://{self.allowed_hosts[0]}/search/{slug}"

        fallback: List[ProviderCourseCandidate] = []
        for rank in range(1, count + 1):
            fallback.append(
                ProviderCourseCandidate(
                    provider=self.provider,
                    title=f"{safe_query} ({self.provider.title()} course {rank})",
                    url=f"{base_fallback_url}#fallback-{rank}",
                    description="Generated fallback course candidate",
                    language="en",
                    rank_in_provider=rank,
                    source_payload={"source": "provider_fallback"},
                )
            )
        return fallback

    @staticmethod
    def _normalize_candidate_href(href: str) -> Optional[str]:
        if not href:
            return None
        parsed = urlparse(href)
        query = parse_qs(parsed.query)
        if "url" in query and query["url"]:
            return unquote(query["url"][0])
        if "redirect" in query and query["redirect"]:
            return unquote(query["redirect"][0])
        return href

    @staticmethod
    def _clean_text(value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        compact = " ".join(value.split()).strip()
        return compact or None

    @staticmethod
    def _normalized_https_url(url: str) -> str:
        parsed = urlparse(url.strip())
        scheme = "https"
        netloc = (parsed.netloc or "").lower()
        if not netloc:
            return ""
        path = parsed.path or "/"
        path = "/".join([segment for segment in path.split("/") if segment])
        path = f"/{path}" if path else "/"
        return f"{scheme}://{netloc}{path}"
