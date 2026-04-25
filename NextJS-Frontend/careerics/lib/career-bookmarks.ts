import type { APICareerTrackScore } from "@/types";
import {
  addOrMoveUnifiedBookmark,
  getUnifiedBookmarks,
  isUnifiedBookmarked,
  MAX_UNIFIED_BOOKMARKS,
  removeUnifiedBookmark,
  setUnifiedBookmarks,
  UNIFIED_BOOKMARKS_UPDATED_EVENT,
} from "@/lib/unified-bookmarks";

export interface CareerBookmarkItem {
  track_id: string;
  track_name: string;
  track_description?: string | null;
  score: number;
  saved_at: string;
}

export const CAREER_BOOKMARKS_UPDATED_EVENT = UNIFIED_BOOKMARKS_UPDATED_EVENT;

function mapToCareerBookmark(item: {
  entity_id: string;
  title: string;
  description?: string | null;
  score?: number | null;
  saved_at: string;
}): CareerBookmarkItem {
  return {
    track_id: item.entity_id,
    track_name: item.title,
    track_description: item.description ?? null,
    score: typeof item.score === "number" ? item.score : 0,
    saved_at: item.saved_at,
  };
}

export function getCareerBookmarks(userId?: string | null): CareerBookmarkItem[] {
  return getUnifiedBookmarks(userId)
    .filter((bookmark) => bookmark.kind === "career")
    .map((bookmark) => mapToCareerBookmark(bookmark));
}

export function isCareerBookmarked(trackId: string, userId?: string | null): boolean {
  return isUnifiedBookmarked("career", trackId, userId);
}

export function setCareerBookmarks(bookmarks: CareerBookmarkItem[], userId?: string | null): void {
  const nonCareer = getUnifiedBookmarks(userId).filter((bookmark) => bookmark.kind !== "career");
  const careers = bookmarks.map((bookmark) => ({
    kind: "career" as const,
    entity_id: bookmark.track_id,
    title: bookmark.track_name,
    description: bookmark.track_description ?? null,
    score: bookmark.score,
    saved_at: bookmark.saved_at,
  }));

  setUnifiedBookmarks([...careers, ...nonCareer], userId);
}

export function toggleCareerBookmark(
  track: APICareerTrackScore,
  userId?: string | null,
): { bookmarked: boolean; bookmarks: CareerBookmarkItem[] } {
  const alreadyBookmarked = isUnifiedBookmarked("career", track.track_id, userId);

  if (alreadyBookmarked) {
    const next = removeUnifiedBookmark("career", track.track_id, userId)
      .filter((bookmark) => bookmark.kind === "career")
      .map((bookmark) => mapToCareerBookmark(bookmark));
    return { bookmarked: false, bookmarks: next };
  }

  const unified = getUnifiedBookmarks(userId);
  if (unified.length >= MAX_UNIFIED_BOOKMARKS) {
    return {
      bookmarked: false,
      bookmarks: getCareerBookmarks(userId),
    };
  }

  const next = addOrMoveUnifiedBookmark(
    {
      kind: "career",
      entity_id: track.track_id,
      title: track.track_name,
      description: track.track_description ?? null,
      score: track.score,
    },
    userId,
  )
    .filter((bookmark) => bookmark.kind === "career")
    .map((bookmark) => mapToCareerBookmark(bookmark));

  return { bookmarked: true, bookmarks: next };
}
