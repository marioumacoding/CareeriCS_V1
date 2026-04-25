from typing import List
from urllib.parse import quote_plus, urlparse

from .base import BaseProviderConnector, ProviderCourseCandidate


class UdacityProviderConnector(BaseProviderConnector):
    provider = "udacity"
    allowed_hosts = ("udacity.com",)

    def search_courses(self, query: str, limit: int = 3) -> List[ProviderCourseCandidate]:
        search_url = f"https://www.udacity.com/courses/all?search={quote_plus(query)}"
        try:
            soup = self._get_soup(search_url)
            extracted = self._extract_course_links(
                soup=soup,
                page_url=search_url,
                path_contains=("/course/",),
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
                            provider_course_id=self._extract_course_slug(url),
                            source_payload={"source": "udacity_search_page"},
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

        segments = [segment for segment in path.split("/") if segment]
        if len(segments) >= 2 and segments[0] == "course":
            path = f"/course/{segments[1]}"
        else:
            path = "/" + "/".join(segments[:2]) if segments else "/"

        if not host.endswith("udacity.com"):
            host = "www.udacity.com"
        return f"https://{host}{path}"

    @staticmethod
    def _extract_course_slug(url: str) -> str | None:
        parsed = urlparse(url)
        segments = [segment for segment in parsed.path.split("/") if segment]
        if len(segments) >= 2 and segments[0] == "course":
            return segments[1]
        return None
