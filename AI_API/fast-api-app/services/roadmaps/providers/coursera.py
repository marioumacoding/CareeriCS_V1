from typing import List
from urllib.parse import quote_plus, urlparse

from .base import BaseProviderConnector, ProviderCourseCandidate


class CourseraProviderConnector(BaseProviderConnector):
    provider = "coursera"
    allowed_hosts = ("coursera.org",)

    def search_courses(self, query: str, limit: int = 3) -> List[ProviderCourseCandidate]:
        search_url = f"https://www.coursera.org/search?query={quote_plus(query)}"
        try:
            soup = self._get_soup(search_url)
            extracted = self._extract_course_links(
                soup=soup,
                page_url=search_url,
                path_contains=("/learn/", "/specializations/", "/professional-certificates/", "/projects/"),
            )
            if extracted:
                results: List[ProviderCourseCandidate] = []
                for rank, (title, url) in enumerate(extracted[:limit], start=1):
                    results.append(
                        ProviderCourseCandidate(
                            provider=self.provider,
                            title=title,
                            url=url,
                            rank_in_provider=rank,
                            provider_course_id=self._extract_course_id(url),
                            source_payload={"source": "coursera_search_page"},
                        )
                    )
                return results
        except Exception:
            pass

        return self._fallback_candidates(query=query, limit=limit, search_url=search_url)

    def canonicalize_url(self, url: str) -> str:
        parsed = urlparse(url.strip())
        host = (parsed.netloc or "").lower().replace("www.", "")
        path = (parsed.path or "/").rstrip("/") or "/"

        parts = [part for part in path.split("/") if part]
        if len(parts) >= 2 and parts[0] in {"learn", "specializations", "professional-certificates", "projects"}:
            path = f"/{parts[0]}/{parts[1]}"
        else:
            path = "/" + "/".join(parts) if parts else "/"

        if not host.endswith("coursera.org"):
            host = "coursera.org"
        return f"https://{host}{path}"

    @staticmethod
    def _extract_course_id(url: str) -> str | None:
        parsed = urlparse(url)
        parts = [part for part in parsed.path.split("/") if part]
        if len(parts) >= 2:
            return parts[1]
        return None
