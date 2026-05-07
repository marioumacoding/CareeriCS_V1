import { roadmapService } from "@/services";
import { removeUnifiedBookmark } from "@/lib/unified-bookmarks";
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
