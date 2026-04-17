"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import RootLayout from "@/app/features/layout";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type {
  RoadmapListItem,
  RoadmapProgressSummary,
  RoadmapRead,
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

export default function RoadmapPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

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
      setBookmarkedRoadmapIds(response.data.bookmarks.map((bookmark) => bookmark.roadmap_id));
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
    if (!roadmapList.length) {
      return;
    }

    setSelectedRoadmapId((prev) => {
      if (prev === DEFAULT_PATH_OPTION) {
        return prev;
      }

      const exists = roadmapList.some((item) => item.id === prev);
      return exists ? prev : DEFAULT_PATH_OPTION;
    });
  }, [roadmapList]);

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

      const roadmapResponse = await roadmapService.getRoadmapById(activeRoadmapId);

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

      const progressResponse = await roadmapService.getRoadmapProgress(activeRoadmapId, user.id);

      if (cancelled) {
        return;
      }

      if (progressResponse.success) {
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

  const handleToggleBookmark = useCallback(async () => {
    if (!activeRoadmapId || !user?.id) {
      return;
    }

    setBookmarkMutationRoadmapId(activeRoadmapId);

    const response = await roadmapService.toggleRoadmapBookmark(activeRoadmapId, user.id);

    if (response.success) {
      setBookmarkedRoadmapIds((prev) => {
        if (response.data.bookmarked) {
          return [activeRoadmapId, ...prev.filter((id) => id !== activeRoadmapId)];
        }

        return prev.filter((id) => id !== activeRoadmapId);
      });
    }

    setBookmarkMutationRoadmapId(null);
  }, [activeRoadmapId, user?.id]);

  const compactRoadmapOptions = roadmapList.map((roadmap) => ({
    id: roadmap.id,
    title: roadmap.title,
  }));

  const roadmapListById = useMemo(
    () => new Map(roadmapList.map((roadmap) => [roadmap.id, roadmap] as const)),
    [roadmapList],
  );

  const bookmarkedRoadmapOptions = bookmarkedRoadmapIds
    .map((roadmapId) => roadmapListById.get(roadmapId))
    .filter((roadmap): roadmap is RoadmapListItem => Boolean(roadmap))
    .map((roadmap) => ({
      id: roadmap.id,
      title: roadmap.title,
      completionPercent: userRoadmapProgress[roadmap.id]?.completion_percent ?? 0,
      completionStatus: userRoadmapProgress[roadmap.id]?.completion_status ?? "not_started",
      isBookmarked: true,
    }));

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
          emptyStateMessage="No bookmarked roadmaps yet. Use the bookmark icon in preview to save one."
          onRoadmapChange={setSelectedRoadmapId}
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
              (activeRoadmapId !== null && bookmarkMutationRoadmapId === activeRoadmapId)
            }
            loading={isRoadmapLoading}
            error={errorMessage}
          />
        </div>
      </section>
    </RootLayout>
  );
}
