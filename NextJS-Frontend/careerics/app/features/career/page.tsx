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
import { CareerCardsContainer } from "@/components/ui/career-cards-container";
import TipCard from "@/components/ui/3ateyat";

const VISIBLE_TRACKS_COUNT = 4;
const TRACK_DESCRIPTION_FALLBACK =
  "Explore this path and see what the day-to-day work, opportunities, and growth can look like.";

function buildTrackBlogPath(track: APICareerTrack): string {
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

    const loadCareerTracks = async () => {
      setIsLoadingTracks(true);

      const response = await careerService.listTracks();
      if (!alive) {
        return;
      }

      if (!response.success || !response.data) {
        setCareerTracks([]);
        setTracksError(response.message || "Unable to load career tracks right now.");
        setIsLoadingTracks(false);
        return;
      }

      setCareerTracks(response.data);
      setTracksError(null);
      setIsLoadingTracks(false);
    };

    void loadCareerTracks();

    return () => {
      alive = false;
    };
  }, []);

  const maxStartIndex = Math.max(0, careerTracks.length - VISIBLE_TRACKS_COUNT);
  const safeStartIndex = Math.min(startIndex, maxStartIndex);

  const visibleCards = useMemo(
    () => careerTracks.slice(safeStartIndex, safeStartIndex + VISIBLE_TRACKS_COUNT),
    [careerTracks, safeStartIndex],
  );

  const handleNext = () => {
    setStartIndex(Math.min(safeStartIndex + 4, maxStartIndex));
  };

  const handlePrev = () => {
    setStartIndex(Math.max(safeStartIndex - 4, 0));
  };

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
    if (isStartingQuiz || isAuthLoading) {
      return;
    }

    if (!user?.id) {
      setStartError("Please sign in first to start the career quiz.");
      router.push("/auth/login?redirect=/features/career");
      return;
    }

    setStartError(null);
    setIsStartingQuiz(true);

    try {
      const sessionId = await startCareerQuizSession(user.id);
      router.push(buildCareerQuizSelectionHref(sessionId));
    } catch (error) {
      setIsStartingQuiz(false);
      setStartError(
        error instanceof Error
          ? error.message
          : "Unable to start the quiz right now. Please try again.",
      );
    }
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "1.6fr repeat(6, 1fr)",
          gridRowGap: "20px",
          flex: 1,
          height: "100%",
        }}
      >
        <TipCard
          variant="feature"
          onclick={() => {
              void handleStartQuiz();
            }}
          style={{
            gridArea: "1 / 1 / 3 / 7",
            backgroundColor: "var(--dark-blue)"
          }}
          icon="/tracks/career-quiz.svg"
          title="Start career quiz"
          description={
            "Choose your favorite hobbies and activities,then answer a few personalized questions.\n" +
            "Just like that, you’ll get your best fit career choices."
          }        >

        </TipCard>

        {startError ? (
          <p
            style={{
              gridArea: "2 / 1 / 3 / 7",
              margin: 0,
              color: "#FFD3D3",
              fontFamily: "var(--font-jura)",
              fontSize: "0.95rem",
              alignSelf: "end",
            }}
          >
            {startError}
          </p>
        ) : null}

        {/* Career Paths */}
        <CareerCardsContainer
          isScrollable
          Title="Discover more career paths"
          leftOnclick={handlePrev}
          rightOnclick={handleNext}
          style={{
            gridArea: "3 / 1 / 8 / 7",
            backgroundColor: "var(--medium-blue)",
            borderRadius: "4vh",
            gap: 0
          }}
        >
          {bookmarkError ? (
            <div
              style={{
                gridColumn: "1 / -1",
                color: "#FFD3D3",
                fontFamily: "var(--font-jura)",
                fontSize: "0.95rem",
                display: "flex",
                alignItems: "center",
              }}
            >
              {bookmarkError}
            </div>
          ) : null}


          {isLoadingTracks ? (
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#D7E3FF",
                fontFamily: "var(--font-jura)",
                fontSize: "1rem",
              }}
            >
              Loading career tracks...
            </div>
          ) : null}

          {!isLoadingTracks && tracksError ? (
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFD3D3",
                textAlign: "center",
                fontFamily: "var(--font-jura)",
                fontSize: "1rem",
                paddingInline: "2vw",
              }}
            >
              {tracksError}
            </div>
          ) : null}

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
      </div>

      {pendingCareerBookmark ? (
        <BookmarkReplacePopup
          incomingTitle={pendingCareerBookmark.title}
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
