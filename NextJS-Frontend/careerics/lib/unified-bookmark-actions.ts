import { roadmapService } from "@/services";
import { getUnifiedBookmarks, removeUnifiedBookmark } from "@/lib/unified-bookmarks";
import type { UnifiedBookmarkEntry } from "@/types";

type RemoveBookmarkResult = {
  success: boolean;
  bookmarks: UnifiedBookmarkEntry[];
  message?: string;
  removedRoadmapId?: string;
};

export async function removeBookmarkEntryFromUnifiedList(
  bookmark: UnifiedBookmarkEntry,
  userId?: string | null,
): Promise<RemoveBookmarkResult> {
  if (bookmark.kind === "roadmap" && userId) {
    const listResponse = await roadmapService.getUserRoadmapBookmarks(userId);
    if (!listResponse.success || !listResponse.data) {
      return {
        success: false,
        bookmarks: [],
        message: "Unable to validate roadmap bookmark. Please try again.",
      };
    }

    const exists = listResponse.data.bookmarks.some(
      (item) => item.roadmap_id === bookmark.entity_id,
    );

    if (exists) {
      const toggleResponse = await roadmapService.toggleRoadmapBookmark(
        bookmark.entity_id,
        userId,
      );

      if (!toggleResponse.success || toggleResponse.data?.bookmarked) {
        return {
          success: false,
          bookmarks: [],
          message: "Unable to update bookmark right now. Please try again.",
        };
      }
    }
  }

  const next = removeUnifiedBookmark(bookmark.kind, bookmark.entity_id, userId);
  return {
    success: true,
    bookmarks: next,
    removedRoadmapId: bookmark.kind === "roadmap" ? bookmark.entity_id : undefined,
  };
}

type RemoveTrackBookmarksOptions = {
  trackId: string;
  roadmapId?: string | null;
  userId?: string | null;
};

export async function removeTrackBookmarksFromUnifiedList(
  options: RemoveTrackBookmarksOptions,
): Promise<RemoveBookmarkResult> {
  const { trackId, roadmapId, userId } = options;
  const normalizedTrackId = trackId.trim();
  const normalizedRoadmapId = String(roadmapId || "").trim();
  const currentBookmarks = getUnifiedBookmarks(userId);
  const matchedByKey = new Map<string, UnifiedBookmarkEntry>();

  for (const bookmark of currentBookmarks) {
    const matchesCareer = bookmark.kind === "career" && bookmark.entity_id === normalizedTrackId;
    const matchesRoadmap = bookmark.kind === "roadmap" && (
      bookmark.entity_id === normalizedRoadmapId ||
      bookmark.metadata?.roadmap_id === normalizedRoadmapId ||
      bookmark.metadata?.track_id === normalizedTrackId
    );

    if (!matchesCareer && !matchesRoadmap) {
      continue;
    }

    matchedByKey.set(`${bookmark.kind}:${bookmark.entity_id}`, bookmark);
  }

  if (normalizedRoadmapId && !matchedByKey.has(`roadmap:${normalizedRoadmapId}`)) {
    matchedByKey.set(`roadmap:${normalizedRoadmapId}`, {
      kind: "roadmap",
      entity_id: normalizedRoadmapId,
      title: "Roadmap",
      description: null,
      score: null,
      target_href: null,
      metadata: {
        roadmap_id: normalizedRoadmapId,
        track_id: normalizedTrackId || null,
      },
      saved_at: new Date().toISOString(),
    });
  }

  let latestBookmarks = currentBookmarks;
  let removedRoadmapId: string | undefined;
  const roadmapBookmarks = Array.from(matchedByKey.values()).filter((bookmark) => bookmark.kind === "roadmap");
  const otherBookmarks = Array.from(matchedByKey.values()).filter((bookmark) => bookmark.kind !== "roadmap");

  for (const bookmark of [...roadmapBookmarks, ...otherBookmarks]) {
    const result = await removeBookmarkEntryFromUnifiedList(bookmark, userId);
    if (!result.success) {
      return {
        success: false,
        bookmarks: latestBookmarks,
        message: result.message,
        removedRoadmapId,
      };
    }

    latestBookmarks = result.bookmarks;
    removedRoadmapId = removedRoadmapId || result.removedRoadmapId;
  }

  return {
    success: true,
    bookmarks: latestBookmarks,
    removedRoadmapId,
  };
}
