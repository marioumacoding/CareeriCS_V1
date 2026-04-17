import type { APICareerTrackScore } from "@/types";

export interface CareerBookmarkItem {
  track_id: string;
  track_name: string;
  track_description?: string | null;
  score: number;
  saved_at: string;
}

export const CAREER_BOOKMARKS_UPDATED_EVENT = "career-bookmarks-updated";

function getStorageKey(userId?: string | null): string {
  return `career-bookmarks:${userId ?? "guest"}`;
}

function safeParseBookmarks(raw: string | null): CareerBookmarkItem[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is CareerBookmarkItem => {
      return Boolean(
        item &&
          typeof item.track_id === "string" &&
          typeof item.track_name === "string" &&
          typeof item.score === "number" &&
          typeof item.saved_at === "string",
      );
    });
  } catch {
    return [];
  }
}

function notifyBookmarksUpdated(userId?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(CAREER_BOOKMARKS_UPDATED_EVENT, {
      detail: { userId: userId ?? "guest" },
    }),
  );
}

export function getCareerBookmarks(userId?: string | null): CareerBookmarkItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  const key = getStorageKey(userId);
  const bookmarks = safeParseBookmarks(window.localStorage.getItem(key));

  return bookmarks.sort((a, b) => {
    return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
  });
}

export function isCareerBookmarked(trackId: string, userId?: string | null): boolean {
  return getCareerBookmarks(userId).some((bookmark) => bookmark.track_id === trackId);
}

export function setCareerBookmarks(bookmarks: CareerBookmarkItem[], userId?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const key = getStorageKey(userId);
  window.localStorage.setItem(key, JSON.stringify(bookmarks));
  notifyBookmarksUpdated(userId);
}

export function toggleCareerBookmark(
  track: APICareerTrackScore,
  userId?: string | null,
): { bookmarked: boolean; bookmarks: CareerBookmarkItem[] } {
  const existing = getCareerBookmarks(userId);
  const alreadyBookmarked = existing.some((item) => item.track_id === track.track_id);

  if (alreadyBookmarked) {
    const next = existing.filter((item) => item.track_id !== track.track_id);
    setCareerBookmarks(next, userId);
    return { bookmarked: false, bookmarks: next };
  }

  const next: CareerBookmarkItem[] = [
    {
      track_id: track.track_id,
      track_name: track.track_name,
      track_description: track.track_description,
      score: track.score,
      saved_at: new Date().toISOString(),
    },
    ...existing,
  ];

  setCareerBookmarks(next, userId);
  return { bookmarked: true, bookmarks: next };
}
