import type { APICareerTrack, APICareerTrackScore, RoadmapListItem } from "@/types";

export type TrackRoadmapLink = {
  trackId: string;
  roadmapId: string;
  trackName?: string | null;
  roadmapTitle?: string | null;
  updatedAt: string;
};

const TRACK_ROADMAP_LINKS_STORAGE_KEY = "careerics:track-roadmap-links";
const ROLE_SUFFIX_TOKENS = new Set([
  "developer",
  "developers",
  "engineer",
  "engineers",
  "specialist",
  "specialists",
  "administrator",
  "administrators",
  "admin",
  "admins",
  "analyst",
  "analysts",
  "architect",
  "architects",
  "manager",
  "managers",
  "consultant",
  "consultants",
  "designer",
  "designers",
]);

function normalizeLabel(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/\broadmap\b/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripRoleSuffix(value: string): string {
  const tokens = normalizeLabel(value)
    .split(" ")
    .filter(Boolean);

  while (tokens.length > 1 && ROLE_SUFFIX_TOKENS.has(tokens[tokens.length - 1])) {
    tokens.pop();
  }

  return tokens.join(" ");
}

function getMatchKeys(value?: string | null): string[] {
  const normalized = normalizeLabel(value || "");
  if (!normalized) {
    return [];
  }

  const stripped = stripRoleSuffix(normalized);
  return Array.from(new Set([normalized, stripped].filter(Boolean)));
}

function getTitleMatchScore(left?: string | null, right?: string | null): number {
  const leftKeys = getMatchKeys(left);
  const rightKeys = getMatchKeys(right);

  if (!leftKeys.length || !rightKeys.length) {
    return 0;
  }

  for (const leftKey of leftKeys) {
    for (const rightKey of rightKeys) {
      if (leftKey !== rightKey) {
        continue;
      }

      return leftKey.split(" ").length > 1 ? 100 : 80;
    }
  }

  for (const leftKey of leftKeys) {
    for (const rightKey of rightKeys) {
      const smaller = leftKey.length <= rightKey.length ? leftKey : rightKey;
      const larger = leftKey.length > rightKey.length ? leftKey : rightKey;
      const tokenCount = smaller.split(" ").filter(Boolean).length;

      if (tokenCount >= 2 && larger.includes(smaller)) {
        return 84;
      }
    }
  }

  return 0;
}

function normalizeTimestamp(value?: string | null): string {
  const parsed = Date.parse(value || "");
  if (!Number.isFinite(parsed)) {
    return new Date().toISOString();
  }

  return new Date(parsed).toISOString();
}

function isTrackRoadmapLink(value: unknown): value is TrackRoadmapLink {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybe = value as Partial<TrackRoadmapLink>;
  return typeof maybe.trackId === "string" && typeof maybe.roadmapId === "string";
}

function mergeTrackRoadmapLinks(links: TrackRoadmapLink[]): TrackRoadmapLink[] {
  const byCompositeKey = new Map<string, TrackRoadmapLink>();

  for (const raw of links) {
    if (!isTrackRoadmapLink(raw)) {
      continue;
    }

    const trackId = raw.trackId.trim();
    const roadmapId = raw.roadmapId.trim();
    if (!trackId || !roadmapId) {
      continue;
    }

    const key = `${trackId}:${roadmapId}`;
    const existing = byCompositeKey.get(key);
    const updatedAt = normalizeTimestamp(raw.updatedAt);

    byCompositeKey.set(key, {
      trackId,
      roadmapId,
      trackName: raw.trackName?.trim() || existing?.trackName || null,
      roadmapTitle: raw.roadmapTitle?.trim() || existing?.roadmapTitle || null,
      updatedAt:
        Date.parse(updatedAt) >= Date.parse(existing?.updatedAt || "")
          ? updatedAt
          : existing?.updatedAt || updatedAt,
    });
  }

  return [...byCompositeKey.values()].sort((left, right) => {
    return Date.parse(right.updatedAt) - Date.parse(left.updatedAt);
  });
}

function readStoredTrackRoadmapLinks(): TrackRoadmapLink[] {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(TRACK_ROADMAP_LINKS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return mergeTrackRoadmapLinks(parsed);
  } catch {
    return [];
  }
}

function persistTrackRoadmapLinks(links: TrackRoadmapLink[]): TrackRoadmapLink[] {
  const normalized = mergeTrackRoadmapLinks(links);

  if (typeof window === "undefined") {
    return normalized;
  }

  window.localStorage.setItem(TRACK_ROADMAP_LINKS_STORAGE_KEY, JSON.stringify(normalized));
  return normalized;
}

function findBestStoredLink(options: {
  trackId?: string | null;
  trackTitle?: string | null;
  roadmapId?: string | null;
  roadmapTitle?: string | null;
}): TrackRoadmapLink | null {
  const { trackId, trackTitle, roadmapId, roadmapTitle } = options;
  const links = readStoredTrackRoadmapLinks();

  if (trackId) {
    const exactTrackMatch = links.find((link) => link.trackId === trackId);
    if (exactTrackMatch) {
      return exactTrackMatch;
    }
  }

  if (roadmapId) {
    const exactRoadmapMatch = links.find((link) => link.roadmapId === roadmapId);
    if (exactRoadmapMatch) {
      return exactRoadmapMatch;
    }
  }

  let bestMatch: TrackRoadmapLink | null = null;
  let bestScore = 0;
  let hasTie = false;

  for (const link of links) {
    const titleScore = Math.max(
      getTitleMatchScore(trackTitle, link.trackName),
      getTitleMatchScore(roadmapTitle, link.roadmapTitle),
      getTitleMatchScore(trackTitle, link.roadmapTitle),
      getTitleMatchScore(roadmapTitle, link.trackName),
    );

    if (titleScore <= 0) {
      continue;
    }

    if (titleScore > bestScore) {
      bestMatch = link;
      bestScore = titleScore;
      hasTie = false;
      continue;
    }

    if (titleScore === bestScore) {
      hasTie = true;
    }
  }

  if (!bestMatch || hasTie || bestScore < 80) {
    return null;
  }

  return bestMatch;
}

function findBestMatchByTitle<T extends { id: string; title?: string | null; name?: string | null }>(
  sourceTitle: string,
  candidates: T[],
): T | null {
  let bestMatch: T | null = null;
  let bestScore = 0;
  let hasTie = false;

  for (const candidate of candidates) {
    const candidateTitle = candidate.title ?? candidate.name ?? "";
    const score = getTitleMatchScore(sourceTitle, candidateTitle);

    if (score <= 0) {
      continue;
    }

    if (score > bestScore) {
      bestMatch = candidate;
      bestScore = score;
      hasTie = false;
      continue;
    }

    if (score === bestScore) {
      hasTie = true;
    }
  }

  if (!bestMatch || hasTie || bestScore < 80) {
    return null;
  }

  return bestMatch;
}

export function registerTrackRoadmapLink(link: {
  trackId: string;
  roadmapId: string;
  trackName?: string | null;
  roadmapTitle?: string | null;
}): TrackRoadmapLink[] {
  const trackId = link.trackId.trim();
  const roadmapId = link.roadmapId.trim();

  if (!trackId || !roadmapId) {
    return readStoredTrackRoadmapLinks();
  }

  return persistTrackRoadmapLinks([
    ...readStoredTrackRoadmapLinks(),
    {
      trackId,
      roadmapId,
      trackName: link.trackName?.trim() || null,
      roadmapTitle: link.roadmapTitle?.trim() || null,
      updatedAt: new Date().toISOString(),
    },
  ]);
}

export function registerTrackRoadmapLinksFromRecommendations(
  recommendations: APICareerTrackScore[],
  roadmaps?: RoadmapListItem[],
): TrackRoadmapLink[] {
  const roadmapTitleById = new Map(
    (roadmaps || []).map((roadmap) => [roadmap.id, roadmap.title] as const),
  );

  const links = recommendations
    .filter((recommendation) => recommendation.track_id && recommendation.roadmap_id)
    .map((recommendation) => ({
      trackId: recommendation.track_id,
      roadmapId: recommendation.roadmap_id!,
      trackName: recommendation.track_name || null,
      roadmapTitle: roadmapTitleById.get(recommendation.roadmap_id || "") || null,
    }));

  return persistTrackRoadmapLinks([
    ...readStoredTrackRoadmapLinks(),
    ...links.map((link) => ({
      ...link,
      updatedAt: new Date().toISOString(),
    })),
  ]);
}

export function resolveRoadmapLinkForTrack(options: {
  trackId?: string | null;
  trackTitle?: string | null;
  roadmaps: RoadmapListItem[];
}): TrackRoadmapLink | null {
  const { trackId, trackTitle, roadmaps } = options;

  const stored = findBestStoredLink({
    trackId,
    trackTitle,
  });

  if (stored) {
    const matchingRoadmap = roadmaps.find((roadmap) => roadmap.id === stored.roadmapId);
    if (matchingRoadmap) {
      return {
        ...stored,
        roadmapTitle: matchingRoadmap.title || stored.roadmapTitle || null,
      };
    }
  }

  if (!trackTitle) {
    return null;
  }

  const matchingRoadmap = findBestMatchByTitle(
    trackTitle,
    roadmaps.map((roadmap) => ({ id: roadmap.id, title: roadmap.title })),
  );

  if (!matchingRoadmap) {
    return null;
  }

  return {
    trackId: trackId?.trim() || "",
    roadmapId: matchingRoadmap.id,
    trackName: trackTitle,
    roadmapTitle: matchingRoadmap.title || null,
    updatedAt: new Date().toISOString(),
  };
}

export function resolveTrackLinkForRoadmap(options: {
  roadmapId?: string | null;
  roadmapTitle?: string | null;
  tracks: APICareerTrack[];
}): TrackRoadmapLink | null {
  const { roadmapId, roadmapTitle, tracks } = options;

  const stored = findBestStoredLink({
    roadmapId,
    roadmapTitle,
  });

  if (stored) {
    const matchingTrack = tracks.find((track) => track.id === stored.trackId);
    if (matchingTrack) {
      return {
        ...stored,
        trackName: matchingTrack.name || stored.trackName || null,
      };
    }
  }

  if (!roadmapTitle) {
    return null;
  }

  const matchingTrack = findBestMatchByTitle(
    roadmapTitle,
    tracks.map((track) => ({ id: track.id, name: track.name })),
  );

  if (!matchingTrack) {
    return null;
  }

  return {
    trackId: matchingTrack.id,
    roadmapId: roadmapId?.trim() || "",
    trackName: matchingTrack.name || null,
    roadmapTitle,
    updatedAt: new Date().toISOString(),
  };
}

export function resolveStoredTrackRoadmapLink(options: {
  trackId?: string | null;
  trackTitle?: string | null;
  roadmapId?: string | null;
  roadmapTitle?: string | null;
}): TrackRoadmapLink | null {
  return findBestStoredLink(options);
}
