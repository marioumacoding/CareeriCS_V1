"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/components/ui/dropdown-menu";
import BookmarkReplacePopup from "@/components/ui/bookmarkReplacePopup";
import { StepFlow } from "@/components/ui/roadmap-flow";
import {
  createRoadmapUnifiedBookmark,
  resolveUnifiedBookmarkHref,
} from "@/lib/bookmark-targets";
import { removeBookmarkEntryFromUnifiedList } from "@/lib/unified-bookmark-actions";
import {
  addOrMoveUnifiedBookmark,
  getUnifiedBookmarks,
  MAX_UNIFIED_BOOKMARKS,
  replaceUnifiedBookmark,
  UNIFIED_BOOKMARKS_UPDATED_EVENT,
} from "@/lib/unified-bookmarks";
import {
  normalizeRoadmapListPayload,
  syncBackendRoadmapBookmarksToUnifiedList,
} from "@/lib/roadmap-bookmark-sync";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type {
  ApiResponse,
  RoadmapListItem,
  RoadmapRead,
  UnifiedBookmarkDraft,
  UnifiedBookmarkEntry,
  UserRoadmapBookmark,
} from "@/types";

type CachedApiRequest<T> = {
  expiresAt: number;
  promise: Promise<ApiResponse<T>>;
};

const DEFAULT_PATH_OPTION = "__default_path__";
const ROADMAP_DETAILS_CACHE_TTL_MS = 60_000;

export default function RoadmapPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
  const [selectedRoadmapPreferenceId, setSelectedRoadmapPreferenceId] = useState<string>(
    DEFAULT_PATH_OPTION,
  );
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [backendRoadmapBookmarks, setBackendRoadmapBookmarks] = useState<UserRoadmapBookmark[]>([]);
  const [hasLoadedRoadmapBookmarks, setHasLoadedRoadmapBookmarks] = useState(false);
  const [selectedRoadmapDetails, setSelectedRoadmapDetails] = useState<RoadmapRead | null>(null);
  const [pendingRoadmapBookmark, setPendingRoadmapBookmark] = useState<UnifiedBookmarkDraft | null>(null);
  const [replaceCandidates, setReplaceCandidates] = useState<UnifiedBookmarkEntry[]>([]);
  const [isReplacingBookmark, setIsReplacingBookmark] = useState(false);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [bookmarkRefreshNonce, setBookmarkRefreshNonce] = useState(0);

  const roadmapByIdCacheRef = useRef<Map<string, CachedApiRequest<RoadmapRead>>>(new Map());
  const unifiedBookmarks = useMemo(() => {
    if (isAuthLoading) {
      return [];
    }

    return getUnifiedBookmarks(userId);
  }, [bookmarkRefreshNonce, isAuthLoading, userId]);

  const getRoadmapByIdCached = useCallback((roadmapId: string) => {
    const now = Date.now();
    const cached = roadmapByIdCacheRef.current.get(roadmapId);
    if (cached && cached.expiresAt > now) {
      return cached.promise;
    }

    const requestPromise = roadmapService.getRoadmapById(roadmapId).then((response) => {
      if (!response.success) {
        roadmapByIdCacheRef.current.delete(roadmapId);
      }
      return response;
    });

    roadmapByIdCacheRef.current.set(roadmapId, {
      expiresAt: now + ROADMAP_DETAILS_CACHE_TTL_MS,
      promise: requestPromise,
    });

    return requestPromise;
  }, [isAuthLoading]);

  useEffect(() => {
    const handleBookmarksUpdated = () => {
      setBookmarkRefreshNonce((previous) => previous + 1);
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
  }, []);

  const options = useMemo(
    () => roadmaps.map((roadmap) => ({ id: roadmap.id, title: roadmap.title })),
    [roadmaps],
  );

  const roadmapTitleById = useMemo(() => {
    return new Map(roadmaps.map((roadmap) => [roadmap.id, roadmap.title] as const));
  }, [roadmaps]);

  const bookmarkedRoadmapIds = useMemo(() => {
    return unifiedBookmarks
      .filter((bookmark) => bookmark.kind === "roadmap")
      .map((bookmark) => bookmark.entity_id);
  }, [unifiedBookmarks]);

  const selectedRoadmapId = useMemo(() => {
    const validSelection =
      selectedRoadmapPreferenceId !== DEFAULT_PATH_OPTION &&
      roadmaps.some((roadmap) => roadmap.id === selectedRoadmapPreferenceId);

    if (validSelection) {
      return selectedRoadmapPreferenceId;
    }

    const bookmarkedSelection = bookmarkedRoadmapIds.find((id) =>
      roadmaps.some((roadmap) => roadmap.id === id),
    );

    if (bookmarkedSelection) {
      return bookmarkedSelection;
    }

    return DEFAULT_PATH_OPTION;
  }, [bookmarkedRoadmapIds, roadmaps, selectedRoadmapPreferenceId]);

  const bookmarkCards = useMemo(() => {
    return unifiedBookmarks.map((bookmark) => ({
      ...bookmark,
      title:
        bookmark.kind === "roadmap"
          ? roadmapTitleById.get(bookmark.entity_id) || bookmark.title || "Roadmap"
          : bookmark.title,
      href: resolveUnifiedBookmarkHref(bookmark),
    }));
  }, [roadmapTitleById, unifiedBookmarks]);

  const selectedRoadmap = useMemo(() => {
    return options.find((option) => option.id === selectedRoadmapId) || options[0];
  }, [options, selectedRoadmapId]);

  const isSelectedRoadmapBookmarked = useMemo(
    () =>
      selectedRoadmapId !== DEFAULT_PATH_OPTION &&
      bookmarkedRoadmapIds.includes(selectedRoadmapId),
    [bookmarkedRoadmapIds, selectedRoadmapId],
  );

  const steps = useMemo(() => {
    if (!selectedRoadmapDetails || selectedRoadmapDetails.id !== selectedRoadmapId) {
      return [];
    }

    return selectedRoadmapDetails.sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section) => ({
        label: section.title,
        href: section.id,
      }));
  }, [selectedRoadmapDetails, selectedRoadmapId]);

  useEffect(() => {
    let alive = true;

    const loadRoadmaps = async () => {
      const response = await roadmapService.listRoadmaps();
      if (!alive) {
        return;
      }

      if (!response.success) {
        setRoadmaps([]);
        return;
      }

      setRoadmaps(normalizeRoadmapListPayload(response.data));
    };

    void loadRoadmaps();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let alive = true;

    const loadBookmarks = async () => {
      if (!userId) {
        setBackendRoadmapBookmarks([]);
        setHasLoadedRoadmapBookmarks(true);
        return;
      }

      setHasLoadedRoadmapBookmarks(false);
      setBackendRoadmapBookmarks([]);

      const response = await roadmapService.getUserRoadmapBookmarks(userId);
      if (!alive) {
        return;
      }

      if (response.success && response.data?.bookmarks) {
        const uniqueBookmarks = Array.from(
          new Map(
            response.data.bookmarks.map((bookmark) => {
              return [String(bookmark.roadmap_id), bookmark] as const;
            }),
          ).values(),
        );

        setBackendRoadmapBookmarks(uniqueBookmarks);
      }

      setHasLoadedRoadmapBookmarks(true);
    };

    void loadBookmarks();

    return () => {
      alive = false;
    };
  }, [isAuthLoading, userId]);

  useEffect(() => {
    if (isAuthLoading || !userId || !hasLoadedRoadmapBookmarks) {
      return;
    }

    syncBackendRoadmapBookmarksToUnifiedList({
      userId,
      backendBookmarks: backendRoadmapBookmarks,
      roadmaps,
    });
  }, [
    backendRoadmapBookmarks,
    hasLoadedRoadmapBookmarks,
    isAuthLoading,
    roadmaps,
    userId,
  ]);

  useEffect(() => {
    let alive = true;

    if (!selectedRoadmapId || selectedRoadmapId === DEFAULT_PATH_OPTION) {
      return;
    }

    const loadSelectedRoadmap = async () => {
      const response = await getRoadmapByIdCached(selectedRoadmapId);
      if (!alive) {
        return;
      }

      if (!response.success || !response.data) {
        setSelectedRoadmapDetails(null);
        return;
      }

      setSelectedRoadmapDetails(response.data);
    };

    void loadSelectedRoadmap();

    return () => {
      alive = false;
    };
  }, [getRoadmapByIdCached, selectedRoadmapId]);

  const removeLocalBackendRoadmap = useCallback((roadmapId: string) => {
    setBackendRoadmapBookmarks((previous) =>
      previous.filter((bookmark) => bookmark.roadmap_id !== roadmapId),
    );
  }, []);

  const addLocalBackendRoadmap = useCallback((roadmapId: string, createdAt?: string) => {
    setBackendRoadmapBookmarks((previous) => {
      const withoutCurrent = previous.filter((bookmark) => bookmark.roadmap_id !== roadmapId);
      return [
        { roadmap_id: roadmapId, created_at: createdAt || new Date().toISOString() },
        ...withoutCurrent,
      ];
    });
  }, []);

  const closeReplacePopup = useCallback(() => {
    if (isReplacingBookmark) {
      return;
    }

    setPendingRoadmapBookmark(null);
    setReplaceCandidates([]);
  }, [isReplacingBookmark]);

  const onRoadmapChange = (roadmapId: string) => {
    setSelectedRoadmapPreferenceId(roadmapId);
    setActiveStep(null);
    setBookmarkError(null);
  };

  const handleBookmarkChipClick = (bookmark: UnifiedBookmarkEntry) => {
    if (bookmark.kind === "roadmap" && roadmaps.some((roadmap) => roadmap.id === bookmark.entity_id)) {
      onRoadmapChange(bookmark.entity_id);
      return;
    }

    router.push(resolveUnifiedBookmarkHref(bookmark));
  };

  const handleBookmark = async () => {
    if (!selectedRoadmap || selectedRoadmap.id === DEFAULT_PATH_OPTION) {
      return;
    }

    const roadmapId = selectedRoadmap.id;
    const currentlyBookmarked = unifiedBookmarks.some((bookmark) => {
      return bookmark.kind === "roadmap" && bookmark.entity_id === roadmapId;
    });

    setBookmarkError(null);

    if (currentlyBookmarked) {
      const bookmarkToRemove = unifiedBookmarks.find((bookmark) => {
        return bookmark.kind === "roadmap" && bookmark.entity_id === roadmapId;
      });

      if (!bookmarkToRemove) {
        return;
      }

      const removal = await removeBookmarkEntryFromUnifiedList(bookmarkToRemove, userId);
      if (!removal.success) {
        setBookmarkError(removal.message || "Unable to update bookmark right now. Please try again.");
        return;
      }

      if (removal.removedRoadmapId) {
        removeLocalBackendRoadmap(removal.removedRoadmapId);
      }
      return;
    }

    const candidate = createRoadmapUnifiedBookmark({
      roadmapId,
      title: roadmapTitleById.get(roadmapId) || selectedRoadmap.title || "Roadmap",
      description: roadmaps.find((roadmap) => roadmap.id === roadmapId)?.description ?? null,
    });

    if (unifiedBookmarks.length >= MAX_UNIFIED_BOOKMARKS) {
      setPendingRoadmapBookmark(candidate);
      setReplaceCandidates(unifiedBookmarks);
      return;
    }

    const alreadyInBackend = backendRoadmapBookmarks.some((bookmark) => bookmark.roadmap_id === roadmapId);

    if (userId && !alreadyInBackend) {
      const response = await roadmapService.toggleRoadmapBookmark(roadmapId, userId);
      if (!response.success || !response.data?.bookmarked) {
        setBookmarkError(response.message || "Unable to save bookmark right now. Please try again.");
        return;
      }
    }

    if (userId) {
      addLocalBackendRoadmap(roadmapId, candidate.saved_at);
    }

    addOrMoveUnifiedBookmark(candidate, userId);
  };

  const handleReplaceBookmark = useCallback(
    async (bookmarkToReplace: UnifiedBookmarkEntry) => {
      if (!pendingRoadmapBookmark) {
        return;
      }

      setBookmarkError(null);
      setIsReplacingBookmark(true);

      let addedRoadmap = false;

      const alreadyInBackend = backendRoadmapBookmarks.some(
        (bookmark) => bookmark.roadmap_id === pendingRoadmapBookmark.entity_id,
      );

      if (userId && !alreadyInBackend) {
        const addResponse = await roadmapService.toggleRoadmapBookmark(
          pendingRoadmapBookmark.entity_id,
          userId,
        );

        if (!addResponse.success || !addResponse.data?.bookmarked) {
          setBookmarkError(addResponse.message || "Unable to save the new bookmark right now.");
          setIsReplacingBookmark(false);
          return;
        }

        addedRoadmap = true;
      }

      if (userId) {
        addLocalBackendRoadmap(pendingRoadmapBookmark.entity_id, pendingRoadmapBookmark.saved_at);
      }

      const removal = await removeBookmarkEntryFromUnifiedList(bookmarkToReplace, userId);
      if (!removal.success) {
        if (addedRoadmap && userId) {
          const rollbackResponse = await roadmapService.toggleRoadmapBookmark(
            pendingRoadmapBookmark.entity_id,
            userId,
          );

          if (rollbackResponse.success && rollbackResponse.data && !rollbackResponse.data.bookmarked) {
            removeLocalBackendRoadmap(pendingRoadmapBookmark.entity_id);
          }
        }

        setBookmarkError(removal.message || "Unable to replace bookmark right now. Please try again.");
        setIsReplacingBookmark(false);
        return;
      }

      if (removal.removedRoadmapId) {
        removeLocalBackendRoadmap(removal.removedRoadmapId);
      }

      replaceUnifiedBookmark(bookmarkToReplace, pendingRoadmapBookmark, userId);
      setPendingRoadmapBookmark(null);
      setReplaceCandidates([]);
      setIsReplacingBookmark(false);
    },
    [addLocalBackendRoadmap, backendRoadmapBookmarks, pendingRoadmapBookmark, removeLocalBackendRoadmap, userId],
  );

  const handleFullscreen = () => {
    if (!selectedRoadmapId || selectedRoadmapId === DEFAULT_PATH_OPTION) {
      return;
    }

    router.push(`/roadmap-feature?roadmap=${selectedRoadmapId}`);
  };

  const roadmapHeading = selectedRoadmapDetails?.id === selectedRoadmapId && selectedRoadmapDetails.title
    ? `${selectedRoadmapDetails.title} Roadmap`
    : selectedRoadmapId === DEFAULT_PATH_OPTION
      ? ""
      : "Loading roadmap...";

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: "fit-content",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          marginRight: "auto",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        <CustomDropdown
        maxwidth="22vw"
          value={selectedRoadmapId}
          options={options}
          placeholder="select a path to view roadmap"
          onChange={onRoadmapChange}
        />

        {bookmarkCards.length > 0 ? (
          bookmarkCards.map((bookmark) => (
            <div
              key={`${bookmark.kind}:${bookmark.entity_id}`}
              style={{
                fontFamily: "var(--font-nova-square)",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor:
                  selectedRoadmapId === bookmark.entity_id && bookmark.kind === "roadmap"
                    ? "var(--light-green)"
                    : "var(--medium-blue)",
                color:
                  selectedRoadmapId === bookmark.entity_id && bookmark.kind === "roadmap"
                    ? "black"
                    : "white",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              onClick={() => handleBookmarkChipClick(bookmark)}
            >
              {bookmark.title}
            </div>
          ))
        ) : (
          <span
            style={{
              fontSize: "0.9rem",
              color: "#6b7280",
            }}
          >
            No bookmarks
          </span>
        )}
      </div>

      <div
        style={{
          width: "100%",
          flex: 1,
          minHeight: 0,
          borderRadius: "4vh",
          backgroundColor: "var(--dark-blue)",
          display: "flex",
          flexDirection: "column",
          padding: "2rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            height: "fit-content",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            {roadmapHeading ? (
              <h1
                style={{
                  fontSize: "1.2rem",
                  color: "white",
                  margin: 0,
                }}
              >
                {roadmapHeading}
              </h1>
            ) : null}

            {bookmarkError ? (
              <p style={{ margin: 0, color: "#FFD3D3", fontSize: "0.9rem" }}>
                {bookmarkError}
              </p>
            ) : null}
          </div>

          <div
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <img
              src={"/roadmap/fullscreen.svg"}
              alt="Open roadmap in fullscreen"
              style={{
                height: "1.5rem",
                cursor: selectedRoadmapId === DEFAULT_PATH_OPTION ? "default" : "pointer",
                opacity: selectedRoadmapId === DEFAULT_PATH_OPTION ? 0.5 : 1,
              }}
              onClick={handleFullscreen}
            />

            <img
              src={isSelectedRoadmapBookmarked ? "/global/bookmark-filled.svg" : "/global/bookmark.svg"}
              alt="Toggle roadmap bookmark"
              style={{
                height: "1.5rem",
                cursor: selectedRoadmapId === DEFAULT_PATH_OPTION ? "default" : "pointer",
                opacity: selectedRoadmapId === DEFAULT_PATH_OPTION ? 0.5 : 1,
              }}
              onClick={() => {
                void handleBookmark();
              }}
            />
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "100%",
            paddingInline: "2rem",
            overflowY: "auto",
            scrollbarWidth: "none",
          }}
        >
          <div>
            {steps.length ? (
              <StepFlow
                steps={steps}
                roadmapId={selectedRoadmapId}
                selectedIndex={activeStep ?? undefined}
                onSelect={setActiveStep}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-nova-square)",
                  color: "white",
                  fontSize: selectedRoadmapId === DEFAULT_PATH_OPTION ? "2.5rem" : "1rem",
                }}
              >
                {selectedRoadmapId === DEFAULT_PATH_OPTION ? "select a path to view roadmap" : "Loading..."}
              </div>
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
