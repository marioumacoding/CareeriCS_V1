import type { UnifiedBookmarkDraft, UnifiedBookmarkEntry, UnifiedBookmarkKind } from "@/types";

export const MAX_UNIFIED_BOOKMARKS = 3;
export const UNIFIED_BOOKMARKS_UPDATED_EVENT = "unified-bookmarks-updated";

function getStorageKey(userId?: string | null): string {
  return `unified-bookmarks:${userId ?? "guest"}`;
}

function getMigrationKey(userId?: string | null): string {
  return `unified-bookmarks:migrated:${userId ?? "guest"}`;
}

function getLegacyCareerStorageKey(userId?: string | null): string {
  return `career-bookmarks:${userId ?? "guest"}`;
}

function normalizeTimestamp(value?: string): string {
  if (!value) {
    return new Date().toISOString();
  }

  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    return new Date().toISOString();
  }

  return new Date(parsed).toISOString();
}

function normalizeBookmarkEntry(raw: unknown): UnifiedBookmarkEntry | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const maybe = raw as Partial<UnifiedBookmarkEntry>;
  if (maybe.kind !== "roadmap" && maybe.kind !== "career") {
    return null;
  }

  if (typeof maybe.entity_id !== "string" || typeof maybe.title !== "string") {
    return null;
  }

  const score = typeof maybe.score === "number" ? maybe.score : null;
  const description =
    typeof maybe.description === "string" || maybe.description === null
      ? maybe.description
      : null;

  return {
    kind: maybe.kind,
    entity_id: maybe.entity_id,
    title: maybe.title,
    description,
    score,
    saved_at: normalizeTimestamp(maybe.saved_at),
  };
}

function toBookmarkKey(entry: Pick<UnifiedBookmarkEntry, "kind" | "entity_id">): string {
  return `${entry.kind}:${entry.entity_id}`;
}

function sortByMostRecent(entries: UnifiedBookmarkEntry[]): UnifiedBookmarkEntry[] {
  return [...entries].sort((a, b) => {
    return Date.parse(b.saved_at) - Date.parse(a.saved_at);
  });
}

function normalizeAndCap(entries: UnifiedBookmarkEntry[]): UnifiedBookmarkEntry[] {
  const byKey = new Map<string, UnifiedBookmarkEntry>();

  for (const raw of sortByMostRecent(entries)) {
    const normalized = normalizeBookmarkEntry(raw);
    if (!normalized) {
      continue;
    }

    const key = toBookmarkKey(normalized);
    if (!byKey.has(key)) {
      byKey.set(key, normalized);
    }
  }

  return Array.from(byKey.values()).slice(0, MAX_UNIFIED_BOOKMARKS);
}

function parseUnifiedBookmarks(raw: string | null): UnifiedBookmarkEntry[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed
      .map((item) => normalizeBookmarkEntry(item))
      .filter((item): item is UnifiedBookmarkEntry => Boolean(item));

    return normalizeAndCap(normalized);
  } catch {
    return [];
  }
}

function parseLegacyCareerBookmarks(raw: string | null): UnifiedBookmarkEntry[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized: UnifiedBookmarkEntry[] = [];

    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        continue;
      }

      const maybe = item as {
        track_id?: unknown;
        track_name?: unknown;
        track_description?: unknown;
        score?: unknown;
        saved_at?: unknown;
      };

      if (typeof maybe.track_id !== "string" || typeof maybe.track_name !== "string") {
        continue;
      }

      normalized.push({
        kind: "career",
        entity_id: maybe.track_id,
        title: maybe.track_name,
        description:
          typeof maybe.track_description === "string" || maybe.track_description === null
            ? maybe.track_description
            : null,
        score: typeof maybe.score === "number" ? maybe.score : null,
        saved_at: normalizeTimestamp(typeof maybe.saved_at === "string" ? maybe.saved_at : undefined),
      });
    }

    return normalizeAndCap(normalized);
  } catch {
    return [];
  }
}

function notifyUnifiedBookmarksUpdated(userId?: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(UNIFIED_BOOKMARKS_UPDATED_EVENT, {
      detail: { userId: userId ?? "guest" },
    }),
  );
}

function migrateLegacyCareerBookmarksIfNeeded(userId?: string | null): void {
  if (typeof window === "undefined") {
    return;
  }

  const migrationKey = getMigrationKey(userId);
  if (window.localStorage.getItem(migrationKey) === "1") {
    return;
  }

  const unifiedKey = getStorageKey(userId);
  if (window.localStorage.getItem(unifiedKey)) {
    window.localStorage.setItem(migrationKey, "1");
    return;
  }

  const legacyRaw = window.localStorage.getItem(getLegacyCareerStorageKey(userId));
  const legacyBookmarks = parseLegacyCareerBookmarks(legacyRaw);

  if (legacyBookmarks.length > 0) {
    window.localStorage.setItem(unifiedKey, JSON.stringify(legacyBookmarks));
    notifyUnifiedBookmarksUpdated(userId);
  }

  window.localStorage.setItem(migrationKey, "1");
}

export function getUnifiedBookmarks(userId?: string | null): UnifiedBookmarkEntry[] {
  if (typeof window === "undefined") {
    return [];
  }

  migrateLegacyCareerBookmarksIfNeeded(userId);

  const raw = window.localStorage.getItem(getStorageKey(userId));
  return parseUnifiedBookmarks(raw);
}

export function setUnifiedBookmarks(
  bookmarks: UnifiedBookmarkEntry[],
  userId?: string | null,
): UnifiedBookmarkEntry[] {
  const normalized = normalizeAndCap(bookmarks);

  if (typeof window === "undefined") {
    return normalized;
  }

  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(normalized));
  notifyUnifiedBookmarksUpdated(userId);
  return normalized;
}

export function createUnifiedBookmarkEntry(draft: UnifiedBookmarkDraft): UnifiedBookmarkEntry {
  return {
    kind: draft.kind,
    entity_id: draft.entity_id,
    title: draft.title,
    description: draft.description ?? null,
    score: typeof draft.score === "number" ? draft.score : null,
    saved_at: normalizeTimestamp(draft.saved_at),
  };
}

export function getUnifiedBookmarkKey(
  kind: UnifiedBookmarkKind,
  entityId: string,
): string {
  return `${kind}:${entityId}`;
}

export function isUnifiedBookmarked(
  kind: UnifiedBookmarkKind,
  entityId: string,
  userId?: string | null,
): boolean {
  const key = getUnifiedBookmarkKey(kind, entityId);
  return getUnifiedBookmarks(userId).some((entry) => toBookmarkKey(entry) === key);
}

export function addOrMoveUnifiedBookmark(
  draft: UnifiedBookmarkDraft,
  userId?: string | null,
): UnifiedBookmarkEntry[] {
  const next = createUnifiedBookmarkEntry(draft);
  const current = getUnifiedBookmarks(userId).filter((entry) => {
    return toBookmarkKey(entry) !== toBookmarkKey(next);
  });

  return setUnifiedBookmarks([next, ...current], userId);
}

export function removeUnifiedBookmark(
  kind: UnifiedBookmarkKind,
  entityId: string,
  userId?: string | null,
): UnifiedBookmarkEntry[] {
  const key = getUnifiedBookmarkKey(kind, entityId);
  const next = getUnifiedBookmarks(userId).filter((entry) => toBookmarkKey(entry) !== key);
  return setUnifiedBookmarks(next, userId);
}

export function replaceUnifiedBookmark(
  replaced: Pick<UnifiedBookmarkEntry, "kind" | "entity_id">,
  replacement: UnifiedBookmarkDraft,
  userId?: string | null,
): UnifiedBookmarkEntry[] {
  const replacementEntry = createUnifiedBookmarkEntry(replacement);
  const replacedKey = toBookmarkKey(replaced);
  const replacementKey = toBookmarkKey(replacementEntry);

  const rest = getUnifiedBookmarks(userId).filter((entry) => {
    const key = toBookmarkKey(entry);
    return key !== replacedKey && key !== replacementKey;
  });

  return setUnifiedBookmarks([replacementEntry, ...rest], userId);
}
