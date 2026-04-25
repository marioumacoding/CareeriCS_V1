"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import CustomDropdown from "@/components/ui/dropdown-menu";
import { StepFlow } from "@/components/ui/roadmap-flow";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type { ApiResponse, RoadmapListItem, RoadmapRead } from "@/types";

type CachedApiRequest<T> = {
  expiresAt: number;
  promise: Promise<ApiResponse<T>>;
};

const DEFAULT_PATH_OPTION = "__default_path__";
const MAX_BOOKMARKS = 3;
const ROADMAP_DETAILS_CACHE_TTL_MS = 60_000;

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

  const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
  const [selectedRoadmapPreferenceId, setSelectedRoadmapPreferenceId] = useState<string>(
    DEFAULT_PATH_OPTION,
  );
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [bookmarkedRoadmapIds, setBookmarkedRoadmapIds] = useState<string[]>([]);
  const [selectedRoadmapDetails, setSelectedRoadmapDetails] = useState<RoadmapRead | null>(null);

  const roadmapByIdCacheRef = useRef<Map<string, CachedApiRequest<RoadmapRead>>>(new Map());

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
  }, []);

  const options = useMemo(
    () => [
      { id: DEFAULT_PATH_OPTION, title: "Find a new path" },
      ...roadmaps.map((roadmap) => ({ id: roadmap.id, title: roadmap.title })),
    ],
    [roadmaps],
  );

  const roadmapTitleById = useMemo(() => {
    return new Map(roadmaps.map((roadmap) => [roadmap.id, roadmap.title] as const));
  }, [roadmaps]);

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

    return roadmaps[0]?.id || DEFAULT_PATH_OPTION;
  }, [bookmarkedRoadmapIds, roadmaps, selectedRoadmapPreferenceId]);

  const bookmarkedRoadmaps = useMemo(() => {
    return bookmarkedRoadmapIds.map((id) => ({ id, title: roadmapTitleById.get(id) || "Roadmap" }));
  }, [bookmarkedRoadmapIds, roadmapTitleById]);

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

      const list = normalizeRoadmapListPayload(response.data);
      setRoadmaps(list);
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
      if (!user?.id) {
        setBookmarkedRoadmapIds([]);
        return;
      }

      const response = await roadmapService.getUserRoadmapBookmarks(user.id);
      if (!alive) {
        return;
      }

      if (!response.success || !response.data?.bookmarks) {
        setBookmarkedRoadmapIds([]);
        return;
      }

      const uniqueIds = Array.from(
        new Set(response.data.bookmarks.map((bookmark) => String(bookmark.roadmap_id))),
      );
      setBookmarkedRoadmapIds(uniqueIds.slice(0, MAX_BOOKMARKS));
    };

    void loadBookmarks();

    return () => {
      alive = false;
    };
  }, [isAuthLoading, user?.id]);

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

  const onRoadmapChange = (roadmapId: string) => {
    setSelectedRoadmapPreferenceId(roadmapId);
    setActiveStep(null);
  };

  const toggleLocalBookmark = (roadmapId: string) => {
    setBookmarkedRoadmapIds((previous) => {
      const exists = previous.includes(roadmapId);
      if (exists) {
        return previous.filter((id) => id !== roadmapId);
      }

      if (previous.length >= MAX_BOOKMARKS) {
        console.warn("Max 3 bookmarks allowed");
        return previous;
      }

      return [roadmapId, ...previous];
    });
  };

  const handleBookmark = async () => {
    if (!selectedRoadmap || selectedRoadmap.id === DEFAULT_PATH_OPTION) {
      return;
    }

    const roadmapId = selectedRoadmap.id;
    const currentlyBookmarked = bookmarkedRoadmapIds.includes(roadmapId);

    if (!currentlyBookmarked && bookmarkedRoadmapIds.length >= MAX_BOOKMARKS) {
      console.warn("Max 3 bookmarks allowed");
      return;
    }

    if (!user?.id) {
      toggleLocalBookmark(roadmapId);
      return;
    }

    const response = await roadmapService.toggleRoadmapBookmark(roadmapId, user.id);
    if (!response.success || !response.data) {
      return;
    }

    setBookmarkedRoadmapIds((previous) => {
      const withoutCurrent = previous.filter((id) => id !== roadmapId);
      if (!response.data.bookmarked) {
        return withoutCurrent;
      }

      if (withoutCurrent.length >= MAX_BOOKMARKS) {
        return previous;
      }

      return [roadmapId, ...withoutCurrent];
    });
  };

  const handleFullscreen = () => {
    if (!selectedRoadmapId || selectedRoadmapId === DEFAULT_PATH_OPTION) {
      return;
    }

    router.push(`/roadmap-feature?roadmap=${selectedRoadmapId}`);
  };

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
      {/* Top Row */}
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
        }}
      >
        <CustomDropdown
          value={selectedRoadmapId}
          options={options}
          placeholder="Find a new path"
          onChange={onRoadmapChange}
        />

        {/* Bookmarked Display */}
        {bookmarkedRoadmaps.length > 0 ? (
          bookmarkedRoadmaps.map((bookmark) => (
            <div
              key={bookmark.id}
              style={{
                fontFamily: "var(--font-nova-square)",
                padding: "6px 10px",
                borderRadius: "8px",
                backgroundColor:
                  selectedRoadmapId === bookmark.id ? "var(--hover-green)" : "var(--medium-blue)",
                color: selectedRoadmapId === bookmark.id ? "black" : "white",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              onClick={() => onRoadmapChange(bookmark.id)}
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

      {/* Roadmap Panel */}
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
        {/* Header */}
        <div
          style={{
            display: "flex",
            height: "fit-content",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.2rem",
              color: "white",
            }}
          >
            {selectedRoadmap?.title} Roadmap
          </h1>

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
                cursor: "pointer",
              }}
              onClick={handleFullscreen}
            />

            <img
              src={"/roadmap/bookmark.svg"}
              alt="Toggle roadmap bookmark"
              style={{
                height: "1.5rem",
                cursor: "pointer",
                transition: "filter 0.2s ease, transform 0.2s ease",
                filter: isSelectedRoadmapBookmarked
                  ? "brightness(0) saturate(100%) invert(87%) sepia(10%) saturate(1385%) hue-rotate(44deg) brightness(101%) contrast(90%)"
                  : "none",
                transform: isSelectedRoadmapBookmarked ? "scale(1.06)" : "scale(1)",
              }}
              onClick={() => {
                void handleBookmark();
              }}
            />
          </div>
        </div>

        {/* Roadmap */}
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
            <StepFlow
              steps={steps}
              roadmapId={selectedRoadmapId}
              selectedIndex={activeStep ?? undefined}
              onSelect={setActiveStep}
            />
          </div>
        </div>
      </div>
    </div>
  );
}