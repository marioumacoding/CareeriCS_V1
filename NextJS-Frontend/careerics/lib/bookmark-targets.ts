import {
  CAREER_FEATURE_ROUTE,
  resolveCareerBookmarkHref,
} from "@/lib/career-quiz";
import type { UnifiedBookmarkDraft, UnifiedBookmarkEntry } from "@/types";

export function buildRoadmapBookmarkHref(roadmapId: string): string {
  return `/roadmap-feature?roadmap=${encodeURIComponent(roadmapId)}`;
}

export function createRoadmapUnifiedBookmark(options: {
  roadmapId: string;
  title: string;
  description?: string | null;
  savedAt?: string;
  trackId?: string | null;
  trackName?: string | null;
}): UnifiedBookmarkDraft {
  const { roadmapId, title, description = null, savedAt, trackId = null, trackName = null } = options;

  return {
    kind: "roadmap",
    entity_id: roadmapId,
    title,
    description,
    saved_at: savedAt,
    target_href: buildRoadmapBookmarkHref(roadmapId),
    metadata: {
      roadmap_id: roadmapId,
      track_id: trackId,
      track_name: trackName ?? title,
      source: "roadmap",
    },
  };
}

export function createCareerUnifiedBookmark(options: {
  trackId: string;
  title: string;
  description?: string | null;
  score?: number | null;
  savedAt?: string;
}): UnifiedBookmarkDraft {
  const {
    trackId,
    title,
    description = null,
    score = null,
    savedAt,
  } = options;

  return {
    kind: "career",
    entity_id: trackId,
    title,
    description,
    score,
    saved_at: savedAt,
    target_href: resolveCareerBookmarkHref({
      trackId,
      trackName: title,
    }),
    metadata: {
      track_id: trackId,
      track_name: title,
      source: "career_quiz",
    },
  };
}

export function resolveUnifiedBookmarkHref(bookmark: UnifiedBookmarkEntry): string {
  if (bookmark.target_href) {
    return bookmark.target_href;
  }

  if (bookmark.kind === "roadmap") {
    const roadmapId = bookmark.metadata?.roadmap_id || bookmark.entity_id;
    return roadmapId ? buildRoadmapBookmarkHref(roadmapId) : CAREER_FEATURE_ROUTE;
  }

  return resolveCareerBookmarkHref({
    
    trackId: bookmark.metadata?.track_id || bookmark.entity_id,
    trackName: bookmark.metadata?.track_name || bookmark.title,
  });
}
