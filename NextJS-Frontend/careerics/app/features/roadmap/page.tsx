"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import RootLayout from "@/app/features/layout";
import BookmarkReplacePopup from "@/components/ui/bookmarkReplacePopup";
import {
  addOrMoveUnifiedBookmark,
  getUnifiedBookmarks,
  MAX_UNIFIED_BOOKMARKS,
  removeUnifiedBookmark,
  replaceUnifiedBookmark,
  setUnifiedBookmarks as persistUnifiedBookmarks,
  UNIFIED_BOOKMARKS_UPDATED_EVENT,
} from "@/lib/unified-bookmarks";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type {
  RoadmapListItem,
  RoadmapProgressSummary,
  RoadmapRead,
  UnifiedBookmarkDraft,
  UnifiedBookmarkEntry,
  UserRoadmapProgressItem,
} from "@/types";

import {
  DEFAULT_PATH_OPTION,
  RoadmapHeaderControls,
  RoadmapPreviewPanel,
} from "./components";
import {
  buildSectionProgressMap,
} from "./utils";

function normalizeRoadmapListPayload(payload: unknown): RoadmapListItem[] {
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

function normalizeRoadmapLookupText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findRoadmapMatchByCareer(
  careerName: string,
  roadmaps: RoadmapListItem[],
): RoadmapListItem | null {
  const target = normalizeRoadmapLookupText(careerName);
  if (!target) {
    return null;
  }

  const targetTokens = target.split(" ").filter(Boolean);
  let best: { roadmap: RoadmapListItem; score: number } | null = null;

  for (const roadmap of roadmaps) {
    const title = normalizeRoadmapLookupText(roadmap.title);
    if (!title) {
      continue;
    }

    if (title === target) {
      return roadmap;
    }

    let score = 0;
    const hasBroadTextMatch = title.includes(target) || target.includes(title);
    if (hasBroadTextMatch) {
      score += 70;
    }

    const titleTokens = title.split(" ").filter(Boolean);
    let overlap = 0;

    for (const token of targetTokens) {
      let matchedToken = false;

      for (const titleToken of titleTokens) {
        if (token === titleToken) {
          overlap += 1;
          matchedToken = true;
          break;
        }

        if (
          token.length >= 5 &&
          titleToken.length >= 5 &&
          (token.startsWith(titleToken) || titleToken.startsWith(token))
        ) {
          overlap += 1;
          matchedToken = true;
          break;
        }
      }

      if (matchedToken) {
        continue;
      }
    }

    score += overlap * 10;

    const minTokenOverlap = targetTokens.length >= 2 ? 2 : 1;
    if (!hasBroadTextMatch && overlap < minTokenOverlap) {
      continue;
    }

    if (score < 20) {
      continue;
    }

    if (!best || score > best.score) {
      best = { roadmap, score };
    }
  }

  return best?.roadmap ?? null;
}

export default function RoadmapPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const hasUserSelectedRoadmapRef = useRef(false);

  const [selectedRoadmapId, setSelectedRoadmapId] = useState<string>(DEFAULT_PATH_OPTION);

  const [roadmapList, setRoadmapList] = useState<RoadmapListItem[]>([]);
  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapRead | null>(null);
  const [selectedRoadmapProgress, setSelectedRoadmapProgress] = useState<RoadmapProgressSummary | null>(
    null,
  );

  const [isListLoading, setIsListLoading] = useState(true);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(false);
  const [isBookmarksLoading, setIsBookmarksLoading] = useState(false);
  const [bookmarkMutationRoadmapId, setBookmarkMutationRoadmapId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [userRoadmapProgress, setUserRoadmapProgress] = useState<
    Record<string, UserRoadmapProgressItem>
  >({});
  const [bookmarkedRoadmapIds, setBookmarkedRoadmapIds] = useState<string[]>([]);
  const [unifiedBookmarks, setUnifiedBookmarksState] = useState<UnifiedBookmarkEntry[]>([]);
  const [replaceCandidates, setReplaceCandidates] = useState<UnifiedBookmarkEntry[]>([]);
  const [pendingRoadmapBookmark, setPendingRoadmapBookmark] = useState<UnifiedBookmarkDraft | null>(
    null,
  );
  const [isReplacingBookmark, setIsReplacingBookmark] = useState(false);

  const activeRoadmapId = useMemo(() => {
    if (selectedRoadmapId !== DEFAULT_PATH_OPTION) {
      const selectedRoadmapExists = roadmapList.some((roadmap) => roadmap.id === selectedRoadmapId);
      if (selectedRoadmapExists) {
        return selectedRoadmapId;
      }

      return roadmapList[0]?.id ?? null;
    }

    return roadmapList[0]?.id ?? null;
  }, [roadmapList, selectedRoadmapId]);

  const progressBySectionId = useMemo(
    () => buildSectionProgressMap(selectedRoadmapProgress),
    [selectedRoadmapProgress],
  );

  const bookmarkedRoadmapIdSet = useMemo(
    () => new Set(bookmarkedRoadmapIds),
    [bookmarkedRoadmapIds],
  );

  const loadUserProgress = useCallback(async () => {
    if (!user?.id) {
      setUserRoadmapProgress({});
      return;
    }

    const response = await roadmapService.getUserRoadmapsProgress(user.id);

    if (!response.success) {
      return;
    }

    const map: Record<string, UserRoadmapProgressItem> = {};
    for (const item of response.data.roadmaps) {
      map[item.roadmap_id] = item;
    }

    setUserRoadmapProgress(map);
  }, [user?.id]);

  const loadRoadmapList = useCallback(async () => {
    setIsListLoading(true);
    setErrorMessage(null);

    const response = await roadmapService.listRoadmaps();

    if (!response.success) {
      setErrorMessage(response.message ?? "Unable to load roadmaps.");
      setRoadmapList([]);
      setIsListLoading(false);
      return;
    }

    const normalizedRoadmaps = normalizeRoadmapListPayload(response.data);
    setRoadmapList(normalizedRoadmaps);
    setIsListLoading(false);
  }, []);

  const loadUserBookmarks = useCallback(async () => {
    if (!user?.id) {
      setBookmarkedRoadmapIds([]);
      return;
    }

    setIsBookmarksLoading(true);
    const response = await roadmapService.getUserRoadmapBookmarks(user.id);

    if (response.success) {
      const bookmarks = response.data.bookmarks;
      const limitedBookmarks = bookmarks.slice(0, MAX_UNIFIED_BOOKMARKS);

      setBookmarkedRoadmapIds(limitedBookmarks.map((bookmark) => bookmark.roadmap_id));

      if (bookmarks.length > MAX_UNIFIED_BOOKMARKS) {
        const overflowBookmarks = bookmarks.slice(MAX_UNIFIED_BOOKMARKS);

        for (const overflowBookmark of overflowBookmarks) {
          void roadmapService.toggleRoadmapBookmark(overflowBookmark.roadmap_id, user.id);
        }
      }
    }

    setIsBookmarksLoading(false);
  }, [user?.id]);

  useEffect(() => {
    void loadRoadmapList();
  }, [loadRoadmapList]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    void loadUserProgress();
    void loadUserBookmarks();
  }, [isAuthLoading, loadUserBookmarks, loadUserProgress]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    const loadUnifiedBookmarks = () => {
      setUnifiedBookmarksState(getUnifiedBookmarks(user?.id));
    };

    loadUnifiedBookmarks();

    const handleBookmarksUpdated = () => {
      loadUnifiedBookmarks();
    };

    window.addEventListener(UNIFIED_BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated as EventListener);
    window.addEventListener("storage", handleBookmarksUpdated);

    return () => {
      window.removeEventListener(
        UNIFIED_BOOKMARKS_UPDATED_EVENT,
        handleBookmarksUpdated as EventListener,
      );
      window.removeEventListener("storage", handleBookmarksUpdated);
    };
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    if (!roadmapList.length) {
      return;
    }

    setSelectedRoadmapId((prev) => {
      const selectedExists =
        prev !== DEFAULT_PATH_OPTION &&
        roadmapList.some((item) => item.id === prev);

      const topBookmarkedRoadmapId = bookmarkedRoadmapIds.find((roadmapId) => {
        return roadmapList.some((item) => item.id === roadmapId);
      });

      if (topBookmarkedRoadmapId) {
        if (!selectedExists) {
          return topBookmarkedRoadmapId;
        }

        // Allow bookmark-first auto-promotion after async bookmark load
        // unless the user already made an explicit manual selection.
        if (!hasUserSelectedRoadmapRef.current) {
          return topBookmarkedRoadmapId;
        }

        return prev;
      }

      if (selectedExists) {
        return prev;
      }

      return roadmapList[0]?.id ?? DEFAULT_PATH_OPTION;
    });
  }, [bookmarkedRoadmapIds, roadmapList]);

  const handleRoadmapChange = useCallback((roadmapId: string) => {
    hasUserSelectedRoadmapRef.current = roadmapId !== DEFAULT_PATH_OPTION;
    setSelectedRoadmapId(roadmapId);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSelectedRoadmap() {
      if (!activeRoadmapId) {
        setSelectedRoadmap(null);
        setSelectedRoadmapProgress(null);
        return;
      }

      setIsRoadmapLoading(true);
      setErrorMessage(null);

      const roadmapPromise = roadmapService.getRoadmapById(activeRoadmapId);
      const progressPromise = user?.id
        ? roadmapService.getRoadmapProgress(activeRoadmapId, user.id)
        : Promise.resolve(null);

      const [roadmapResponse, progressResponse] = await Promise.all([
        roadmapPromise,
        progressPromise,
      ]);

      if (cancelled) {
        return;
      }

      if (!roadmapResponse.success) {
        setSelectedRoadmap(null);
        setSelectedRoadmapProgress(null);
        setErrorMessage(roadmapResponse.message ?? "Unable to load roadmap details.");
        setIsRoadmapLoading(false);
        return;
      }

      setSelectedRoadmap(roadmapResponse.data);

      if (!user?.id) {
        setSelectedRoadmapProgress(null);
        setIsRoadmapLoading(false);
        return;
      }

      if (progressResponse?.success) {
        setSelectedRoadmapProgress(progressResponse.data);
      } else {
        setSelectedRoadmapProgress(null);
      }

      setIsRoadmapLoading(false);
    }

    void loadSelectedRoadmap();

    return () => {
      cancelled = true;
    };
  }, [activeRoadmapId, user?.id]);

  const handleExpand = useCallback(() => {
    if (!activeRoadmapId) {
      return;
    }

    router.push(`/features/roadmap/${activeRoadmapId}`);
  }, [activeRoadmapId, router]);

  const handleOpenSectionInDetail = useCallback(
    (sectionId: string) => {
      if (!activeRoadmapId) {
        return;
      }

      router.push(`/features/roadmap/${activeRoadmapId}?sectionId=${encodeURIComponent(sectionId)}`);
    },
    [activeRoadmapId, router],
  );

  const unbookmarkRoadmapIfNeeded = useCallback(
    async (roadmapId: string): Promise<boolean> => {
      if (!user?.id) {
        return false;
      }

      const knownAsBookmarked = bookmarkedRoadmapIdSet.has(roadmapId);
      if (knownAsBookmarked) {
        const response = await roadmapService.toggleRoadmapBookmark(roadmapId, user.id);
        return response.success ? !response.data.bookmarked : false;
      }

      const listResponse = await roadmapService.getUserRoadmapBookmarks(user.id);
      if (!listResponse.success) {
        return false;
      }

      const exists = listResponse.data.bookmarks.some((bookmark) => bookmark.roadmap_id === roadmapId);
      if (!exists) {
        return true;
      }

      const response = await roadmapService.toggleRoadmapBookmark(roadmapId, user.id);
      return response.success ? !response.data.bookmarked : false;
    },
    [bookmarkedRoadmapIdSet, user?.id],
  );

  const closeReplacePopup = useCallback(() => {
    if (isReplacingBookmark) {
      return;
    }

    setPendingRoadmapBookmark(null);
    setReplaceCandidates([]);
  }, [isReplacingBookmark]);

  const handleToggleBookmark = useCallback(async () => {
    if (!activeRoadmapId || !user?.id || isReplacingBookmark) {
      return;
    }

    const roadmapFromList = roadmapList.find((item) => item.id === activeRoadmapId);
    const roadmapTitle =
      selectedRoadmap?.id === activeRoadmapId
        ? selectedRoadmap.title
        : roadmapFromList?.title;

    const roadmapDescription =
      selectedRoadmap?.id === activeRoadmapId
        ? selectedRoadmap.description
        : roadmapFromList?.description;

    if (!roadmapTitle) {
      return;
    }

    const candidate: UnifiedBookmarkDraft = {
      kind: "roadmap",
      entity_id: activeRoadmapId,
      title: roadmapTitle,
      description: roadmapDescription ?? null,
    };

    const currentlyBookmarked = bookmarkedRoadmapIdSet.has(activeRoadmapId);

    setBookmarkMutationRoadmapId(activeRoadmapId);
    setErrorMessage(null);

    if (currentlyBookmarked) {
      const response = await roadmapService.toggleRoadmapBookmark(activeRoadmapId, user.id);

      if (response.success && !response.data.bookmarked) {
        setBookmarkedRoadmapIds((prev) => prev.filter((id) => id !== activeRoadmapId));
        removeUnifiedBookmark("roadmap", activeRoadmapId, user.id);
      } else {
        setErrorMessage(response.message ?? "Unable to remove bookmark right now.");
      }

      setBookmarkMutationRoadmapId(null);
      return;
    }

    const unifiedBookmarks = getUnifiedBookmarks(user.id);
    if (unifiedBookmarks.length >= MAX_UNIFIED_BOOKMARKS) {
      setPendingRoadmapBookmark(candidate);
      setReplaceCandidates(unifiedBookmarks);
      setBookmarkMutationRoadmapId(null);
      return;
    }

    const response = await roadmapService.toggleRoadmapBookmark(activeRoadmapId, user.id);

    if (response.success && response.data.bookmarked) {
      setBookmarkedRoadmapIds((prev) => {
        return [activeRoadmapId, ...prev.filter((id) => id !== activeRoadmapId)];
      });
      addOrMoveUnifiedBookmark(candidate, user.id);
    } else {
      setErrorMessage(response.message ?? "Unable to add bookmark right now.");
    }

    setBookmarkMutationRoadmapId(null);
  }, [
    activeRoadmapId,
    bookmarkedRoadmapIdSet,
    isReplacingBookmark,
    roadmapList,
    selectedRoadmap,
    user?.id,
  ]);

  const handleReplaceBookmark = useCallback(
    async (bookmarkToReplace: UnifiedBookmarkEntry) => {
      if (!pendingRoadmapBookmark || !user?.id) {
        return;
      }

      setIsReplacingBookmark(true);
      setErrorMessage(null);

      const addResponse = await roadmapService.toggleRoadmapBookmark(
        pendingRoadmapBookmark.entity_id,
        user.id,
      );

      if (!addResponse.success || !addResponse.data.bookmarked) {
        setIsReplacingBookmark(false);
        setErrorMessage(addResponse.message ?? "Unable to replace bookmark right now. Please try again.");
        return;
      }

      if (bookmarkToReplace.kind === "roadmap") {
        const removed = await unbookmarkRoadmapIfNeeded(bookmarkToReplace.entity_id);
        if (!removed) {
          await roadmapService.toggleRoadmapBookmark(pendingRoadmapBookmark.entity_id, user.id);
          setIsReplacingBookmark(false);
          setErrorMessage("Unable to replace bookmark right now. Please try again.");
          return;
        }
      }

      setBookmarkedRoadmapIds((prev) => {
        const withoutReplaced =
          bookmarkToReplace.kind === "roadmap"
            ? prev.filter((id) => id !== bookmarkToReplace.entity_id)
            : prev;

        return [
          pendingRoadmapBookmark.entity_id,
          ...withoutReplaced.filter((id) => id !== pendingRoadmapBookmark.entity_id),
        ];
      });

      replaceUnifiedBookmark(bookmarkToReplace, pendingRoadmapBookmark, user.id);
      setPendingRoadmapBookmark(null);
      setReplaceCandidates([]);
      setIsReplacingBookmark(false);
    },
    [pendingRoadmapBookmark, unbookmarkRoadmapIfNeeded, user?.id],
  );

  useEffect(() => {
    if (user?.id) {
      return;
    }

    setPendingRoadmapBookmark(null);
    setReplaceCandidates([]);
    setIsReplacingBookmark(false);
  }, [user?.id]);

  const compactRoadmapOptions = roadmapList.map((roadmap) => ({
    id: roadmap.id,
    title: roadmap.title,
  }));

  const roadmapListById = useMemo(
    () => new Map(roadmapList.map((roadmap) => [roadmap.id, roadmap] as const)),
    [roadmapList],
  );

  useEffect(() => {
    if (!user?.id || !roadmapListById.size) {
      return;
    }

    const unifiedBookmarks = getUnifiedBookmarks(user.id);
    const careerEntries = unifiedBookmarks.filter((bookmark) => bookmark.kind !== "roadmap");

    const existingRoadmapById = new Map(
      unifiedBookmarks
        .filter((bookmark): bookmark is UnifiedBookmarkEntry => bookmark.kind === "roadmap")
        .map((bookmark) => [bookmark.entity_id, bookmark] as const),
    );

    const reconciledRoadmapEntries = bookmarkedRoadmapIds
      .map((roadmapId) => roadmapListById.get(roadmapId))
      .filter((roadmap): roadmap is RoadmapListItem => Boolean(roadmap))
      .slice(0, MAX_UNIFIED_BOOKMARKS)
      .map((roadmap, index) => {
        const existing = existingRoadmapById.get(roadmap.id);

        return {
          kind: "roadmap" as const,
          entity_id: roadmap.id,
          title: roadmap.title,
          description: roadmap.description ?? null,
          saved_at:
            existing?.saved_at ?? new Date(Date.now() - index * 1000).toISOString(),
        };
      });

    const nextBookmarks = persistUnifiedBookmarks([...reconciledRoadmapEntries, ...careerEntries], user.id);
    setUnifiedBookmarksState(nextBookmarks);
  }, [bookmarkedRoadmapIds, roadmapListById, user?.id]);

  const bookmarkedRoadmapOptions = useMemo(() => {
    if (!roadmapList.length) {
      return [];
    }

    const seenRoadmapIds = new Set<string>();
    const options: Array<{ id: string; title: string; kind: "roadmap"; isBookmarked: true }> = [];

    for (const bookmark of unifiedBookmarks) {
      let mappedRoadmap: RoadmapListItem | null = null;

      if (bookmark.kind === "roadmap") {
        mappedRoadmap = roadmapListById.get(bookmark.entity_id) ?? null;
      } else {
        mappedRoadmap = findRoadmapMatchByCareer(bookmark.title, roadmapList);
      }

      if (!mappedRoadmap || seenRoadmapIds.has(mappedRoadmap.id)) {
        continue;
      }

      seenRoadmapIds.add(mappedRoadmap.id);
      options.push({
        id: mappedRoadmap.id,
        title: mappedRoadmap.title,
        kind: "roadmap",
        isBookmarked: true,
      });
    }

    return options;
  }, [roadmapList, roadmapListById, unifiedBookmarks]);

  useEffect(() => {
    if (isAuthLoading || !user?.id || !bookmarkedRoadmapOptions.length) {
      return;
    }

    let cancelled = false;

    const syncMappedRoadmapsToBackendBookmarks = async () => {
      const backendResponse = await roadmapService.getUserRoadmapBookmarks(user.id);
      if (cancelled || !backendResponse.success) {
        return;
      }

      const backendRoadmapIdSet = new Set(
        backendResponse.data.bookmarks.map((bookmark) => bookmark.roadmap_id),
      );

      const mappedRoadmapIds = Array.from(
        new Set(bookmarkedRoadmapOptions.map((option) => option.id)),
      ).slice(0, MAX_UNIFIED_BOOKMARKS);

      const missingRoadmapIds = mappedRoadmapIds.filter((roadmapId) => {
        return !backendRoadmapIdSet.has(roadmapId);
      });

      if (!missingRoadmapIds.length) {
        return;
      }

      for (const roadmapId of missingRoadmapIds) {
        const toggleResponse = await roadmapService.toggleRoadmapBookmark(roadmapId, user.id);
        if (cancelled) {
          return;
        }

        if (!toggleResponse.success || !toggleResponse.data.bookmarked) {
          continue;
        }
      }

      if (cancelled) {
        return;
      }

      await loadUserBookmarks();
    };

    void syncMappedRoadmapsToBackendBookmarks();

    return () => {
      cancelled = true;
    };
  }, [bookmarkedRoadmapOptions, isAuthLoading, loadUserBookmarks, user?.id]);

  return (
    <RootLayout
      style={{
        gridTemplateColumns: "1fr",
        gridTemplateRows: "1fr",
        alignItems: "stretch",
        width: "100%",
        height: "100%",
        minWidth: 0,
      }}
    >
      <section className="flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto">
        <RoadmapHeaderControls
          selectedRoadmapId={selectedRoadmapId}
          options={compactRoadmapOptions}
          allRoadmaps={bookmarkedRoadmapOptions}
          emptyStateMessage="No bookmarks yet. Save roadmap or career suggestions to see them here."
          onRoadmapChange={handleRoadmapChange}
        />

        <div className="flex min-h-0 flex-1 flex-col gap-3 px-6 pb-5 sm:px-7">
          {isListLoading ? (
            <div className="rounded-xl border border-white/15 bg-[#112557]/55 px-4 py-3 text-[#d5ddf5]">
              Loading roadmap catalog...
            </div>
          ) : null}

          {!isListLoading && !roadmapList.length ? (
            <div className="rounded-xl border border-dashed border-white/20 bg-white/5 px-4 py-4 text-[#e3e8f8]">
              No roadmap data is available yet.
            </div>
          ) : null}

          <RoadmapPreviewPanel
            roadmap={selectedRoadmap}
            progressBySectionId={progressBySectionId}
            onSelectSection={handleOpenSectionInDetail}
            onExpand={handleExpand}
            onBookmark={handleToggleBookmark}
            isBookmarked={activeRoadmapId ? bookmarkedRoadmapIdSet.has(activeRoadmapId) : false}
            bookmarkLoading={
              isBookmarksLoading ||
              isReplacingBookmark ||
              (activeRoadmapId !== null && bookmarkMutationRoadmapId === activeRoadmapId)
            }
            loading={isRoadmapLoading}
            error={errorMessage}
          />
        </div>
      </section>

      {pendingRoadmapBookmark ? (
        <BookmarkReplacePopup
          incomingTitle={pendingRoadmapBookmark.title}
          bookmarks={replaceCandidates}
          isLoading={isReplacingBookmark}
          onReplace={(bookmark) => {
            void handleReplaceBookmark(bookmark);
          }}
          onCancel={closeReplacePopup}
        />
      ) : null}
    </RootLayout>
  );
}
