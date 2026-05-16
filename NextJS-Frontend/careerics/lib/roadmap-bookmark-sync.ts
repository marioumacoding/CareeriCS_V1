import { createRoadmapUnifiedBookmark } from "@/lib/bookmark-targets";
import { resolveStoredTrackRoadmapLink } from "@/lib/track-roadmap-links";
import {
  createUnifiedBookmarkEntry,
  getUnifiedBookmarks,
  setUnifiedBookmarks,
} from "@/lib/unified-bookmarks";
import type {
  RoadmapListItem,
  UnifiedBookmarkEntry,
  UserRoadmapBookmark,
} from "@/types";

export function normalizeRoadmapListPayload(payload: unknown): RoadmapListItem[] {
  if (Array.isArray(payload)) {
    return payload as RoadmapListItem[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "roadmaps" in payload &&
    Array.isArray((payload as { roadmaps: unknown }).roadmaps)
  ) {
    return (payload as { roadmaps: RoadmapListItem[] }).roadmaps;
  }

  return [];
}

export function syncBackendRoadmapBookmarksToUnifiedList(options: {
  userId: string;
  backendBookmarks: UserRoadmapBookmark[];
  roadmaps: RoadmapListItem[];
}): UnifiedBookmarkEntry[] {
  const { userId, backendBookmarks, roadmaps } = options;

  const existingUnifiedBookmarks = getUnifiedBookmarks(userId);
  const careerBookmarks = existingUnifiedBookmarks.filter((bookmark) => bookmark.kind === "career");
  const existingRoadmapBookmarksById = new Map(
    existingUnifiedBookmarks
      .filter((bookmark) => bookmark.kind === "roadmap")
      .map((bookmark) => [bookmark.entity_id, bookmark] as const),
  );
  const roadmapsById = new Map(roadmaps.map((roadmap) => [roadmap.id, roadmap] as const));
  const uniqueBackendBookmarks = Array.from(
    new Map(
      backendBookmarks.map((bookmark) => [String(bookmark.roadmap_id), bookmark] as const),
    ).values(),
  );

  const roadmapEntries = uniqueBackendBookmarks.map((bookmark) => {
    const roadmapId = String(bookmark.roadmap_id);
    const roadmap = roadmapsById.get(roadmapId);
    const existingBookmark = existingRoadmapBookmarksById.get(roadmapId);
    const storedLink = resolveStoredTrackRoadmapLink({
      roadmapId,
      roadmapTitle: roadmap?.title || existingBookmark?.title || null,
    });

    return createUnifiedBookmarkEntry(
      createRoadmapUnifiedBookmark({
        roadmapId,
        title: roadmap?.title || existingBookmark?.title || "Roadmap",
        description: roadmap?.description ?? existingBookmark?.description ?? null,
        savedAt: bookmark.created_at || existingBookmark?.saved_at,
        trackId: existingBookmark?.metadata?.track_id ?? storedLink?.trackId ?? null,
        trackName:
          existingBookmark?.metadata?.track_name ??
          storedLink?.trackName ??
          existingBookmark?.title ??
          roadmap?.title ??
          null,
      }),
    );
  });

  return setUnifiedBookmarks([...roadmapEntries, ...careerBookmarks], userId);
}
