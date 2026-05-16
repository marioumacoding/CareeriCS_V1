"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ChoiceCard from "@/components/ui/choice-card-career";
import BookmarkReplacePopup from "@/components/ui/bookmarkReplacePopup";
import { useAuth } from "@/providers/auth-provider";
import { careerService } from "@/services";
import {
  buildCareerQuizSelectionHref,
  startCareerQuizSession,
} from "@/lib/career-quiz";
import { createCareerUnifiedBookmark } from "@/lib/bookmark-targets";
import { removeBookmarkEntryFromUnifiedList } from "@/lib/unified-bookmark-actions";
import {
  addOrMoveUnifiedBookmark,
  getUnifiedBookmarks,
  MAX_UNIFIED_BOOKMARKS,
} from "@/lib/unified-bookmarks";

import type { APICareerTrack, UnifiedBookmarkDraft, UnifiedBookmarkEntry } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";
import { CareerCardsContainer } from "@/components/ui/career-cards-container";
import TipCard from "@/components/ui/3ateyat";

const VISIBLE_TRACKS_COUNT = 4;
const TRACK_DESCRIPTION_FALLBACK =
  "Explore this path and see what the day-to-day work, opportunities, and growth can look like.";

function buildTrackBlogPath(track: APICareerTrack) {
  const params = new URLSearchParams({
    jobTitle: track.name,
    trackId: track.id,
  });

  return `/quiz-features/blog?${params.toString()}`;
}

export default function CareerDiscoveryPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [careerTracks, setCareerTracks] = useState<APICareerTrack[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);
  const [bookmarkError, setBookmarkError] = useState<string | null>(null);
  const [pendingCareerBookmark, setPendingCareerBookmark] = useState<UnifiedBookmarkDraft | null>(null);
  const [replaceCandidates, setReplaceCandidates] = useState<UnifiedBookmarkEntry[]>([]);
  const [isReplacingBookmark, setIsReplacingBookmark] = useState(false);
  const [unifiedBookmarks, setUnifiedBookmarks] = useState<UnifiedBookmarkEntry[]>([]);

  const [startIndex, setStartIndex] = useState(0);
  useEffect(() => {
    if (isAuthLoading) {
      setUnifiedBookmarks([]);
      return;
    }

    setUnifiedBookmarks(getUnifiedBookmarks(userId));
  }, [isAuthLoading, userId]);

  const bookmarkedTrackIds = useMemo(() => {
    return unifiedBookmarks.flatMap((bookmark) => {
      if (bookmark.kind === "career") {
        return [bookmark.entity_id];
      }

      if (bookmark.kind === "roadmap") {
        return [bookmark.metadata?.track_id].filter((value): value is string => Boolean(value));
      }

      return [];
    });
  }, [unifiedBookmarks]);

  useEffect(() => {
    let alive = true;

    const load = async () => {
      setIsLoadingTracks(true);

      const res = await careerService.listTracks();
      if (!alive) return;

      if (!res.success || !res.data) {
        setCareerTracks([]);
        setTracksError(res.message || "Failed to load tracks.");
        setIsLoadingTracks(false);
        return;
      }

      setCareerTracks(res.data);
      setTracksError(null);
      setIsLoadingTracks(false);
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);

  const maxStartIndex = Math.max(0, careerTracks.length - VISIBLE_TRACKS_COUNT);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);

  const visibleCards = useMemo(
    () => careerTracks,
    [careerTracks, safeStartIndex],
  );

  
  const closeReplacePopup = useCallback(() => {
    if (isReplacingBookmark) {
      return;
    }

    setPendingCareerBookmark(null);
    setReplaceCandidates([]);
  }, [isReplacingBookmark]);

  const handleToggleBookmark = async (track: APICareerTrack) => {
    if (isAuthLoading || isReplacingBookmark) {
      return;
    }

    setBookmarkError(null);

    const existingBookmark = unifiedBookmarks.find((bookmark) => {
      if (bookmark.kind === "career") {
        return bookmark.entity_id === track.id;
      }

      return bookmark.kind === "roadmap" && bookmark.metadata?.track_id === track.id;
    });

    if (existingBookmark) {
      const removal = await removeBookmarkEntryFromUnifiedList(existingBookmark, userId);
      if (!removal.success) {
        setBookmarkError(removal.message || "Unable to update bookmark right now. Please try again.");
        return;
      }
      setUnifiedBookmarks(removal.bookmarks);
      return;
    }

    const candidate = createCareerUnifiedBookmark({
      trackId: track.id,
      title: track.name,
      description: track.description ?? null,
      savedAt: new Date().toISOString(),
    });

    if (unifiedBookmarks.length >= MAX_UNIFIED_BOOKMARKS) {
      setPendingCareerBookmark(candidate);
      setReplaceCandidates(unifiedBookmarks);
      return;
    }

    const next = addOrMoveUnifiedBookmark(candidate, userId);
    setUnifiedBookmarks(next);
  };

  const handleReplaceBookmark = useCallback(
    async (bookmarkToReplace: UnifiedBookmarkEntry) => {
      if (!pendingCareerBookmark) {
        return;
      }

      setBookmarkError(null);
      setIsReplacingBookmark(true);

      const removal = await removeBookmarkEntryFromUnifiedList(bookmarkToReplace, userId);
      if (!removal.success) {
        setBookmarkError(removal.message || "Unable to replace bookmark right now. Please try again.");
        setIsReplacingBookmark(false);
        return;
      }

      const next = addOrMoveUnifiedBookmark(pendingCareerBookmark, userId);
      setUnifiedBookmarks(next);
      setPendingCareerBookmark(null);
      setReplaceCandidates([]);
      setIsReplacingBookmark(false);
    },
    [pendingCareerBookmark, userId],
  );

  const handleStartQuiz = async () => {
    if (isStartingQuiz || isAuthLoading) return;

    if (!user?.id) {
      router.push("/auth/login?redirect=/features/career");
      return;
    }

    try {
      setStartError(null);
      setIsStartingQuiz(true);

      const sessionId = await startCareerQuizSession(user.id);

      router.push(buildCareerQuizSelectionHref(sessionId));
    } catch (e) {
      setIsStartingQuiz(false);
      setStartError(
        e instanceof Error
          ? e.message
          : "Failed to start quiz. Try again."
      );
    }
  };

  const { isLarge, isMedium, isSmall, width } = useResponsive();
  // ---------------- UI ----------------
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "var(--space-lg)",
        gridRowGap: "var(--space-lg)",
        gridColumnGap: "var(--space-lg)",
        display: "grid",
        gridTemplateColumns: "1fr",
        gridTemplateRows: !isLarge ? "1fr 4fr" : "1fr 2fr",
        overflow: "hidden",
      }}
    >
      {/* HERO */}
      <TipCard
        variant="feature"
        onclick={handleStartQuiz}
        style={{
          gridArea: "1 / 1 / 2 / 2",
          backgroundColor: "var(--dark-blue)",
        }}
        icon="/tracks/career-quiz.svg"
        title="Start career quiz"
        description={
          "Choose your interests and answer a few questions. Get career matches instantly."
        }
      />


      {/* TRACKS */}
      <CareerCardsContainer
        type="career"
        columns={isSmall ? 2 : 4}
        isScrollable
        Title="Discover more career paths"
        style={{
          gridArea: "2 / 1 / 3 / 2",
          backgroundColor: "var(--medium-blue)",
        }}
      >
        {isLoadingTracks && (
          <div style={{ color: "#D7E3FF" }}>Loading tracks...</div>
        )}

        {!isLoadingTracks && tracksError && (
          <div style={{ color: "#FFD3D3" }}>{tracksError}</div>
        )}

        {!isLoadingTracks &&
          !tracksError &&
          visibleCards.length === 0 && (
            <div style={{ color: "#d7ffdd" }}>
              No career tracks available.
            </div>
          )}

        {!isLoadingTracks && !tracksError && !visibleCards.length ? (
          <div
            style={{
              gridColumn: "1 / -1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d7ffdd",
              fontFamily: "var(--font-jura)",
              fontSize: "1rem",
            }}
          >
            No career tracks are available yet.
          </div>
        ) : null}

        {!isLoadingTracks && !tracksError
          ? visibleCards.map((track) => {
            const blogPath = buildTrackBlogPath(track);

            return (
              <ChoiceCard
                key={track.id}
                title={track.name}
                description={track.description || TRACK_DESCRIPTION_FALLBACK}
                image={`/tracks/${track.id}.svg`}
                buttonVariant="primary-inverted"
                buttonLabel="Learn More"
                onClick={() => router.push(blogPath)}
                onBookmark={() => {
                  void handleToggleBookmark(track);
                }}
                isBookmarked={bookmarkedTrackIds.includes(track.id)}
              />
            );
          })
          : null}


      </CareerCardsContainer>


      {
        pendingCareerBookmark ? (
          <BookmarkReplacePopup
            incomingTitle={pendingCareerBookmark.title}
            bookmarks={replaceCandidates}
            isLoading={isReplacingBookmark}
            onReplace={(bookmark) => {
              void handleReplaceBookmark(bookmark);
            }}
            onCancel={closeReplacePopup}
          />
        ) : null
      }
    </div >
  );
}