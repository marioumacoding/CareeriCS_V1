"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ChoiceCard from "@/components/ui/choice-card-career";
import { useAuth } from "@/providers/auth-provider";
import { careerService } from "@/services";
import type { APICareerTrack } from "@/types";
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

  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);
  const [careerTracks, setCareerTracks] = useState<APICareerTrack[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  const [startIndex, setStartIndex] = useState(0);

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

  const handleStartQuiz = async () => {
    if (isStartingQuiz || isAuthLoading) {
      return;
    }

    if (!user?.id) {
      setStartError("Please sign in first to start the career quiz.");
      router.push("/auth/login?callbackUrl=/features/career");
      return;
    }

    setStartError(null);
    setIsStartingQuiz(true);

    const response = await careerService.createSession({ user_id: user.id });

    if (!response.success || !response.data?.id) {
      setIsStartingQuiz(false);
      setStartError(response.message || "Unable to start the quiz right now. Please try again.");
      return;
    }

    router.push(`/quiz-features/hobbies?sessionId=${encodeURIComponent(response.data.id)}`);
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

        {/* Career Paths */}
        <CareerCardsContainer
          isScrollable
          Title="Discover more career paths"
          leftOnclick={handlePrev}
          rightOnclick={handleNext}
          style={{
            gridArea: "3 / 1 / 8 / 7",
            backgroundColor: "#1C427B",
            borderRadius: "4vh",
            gap: 0
          }}
        >

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
                />
              );
            })
            : null}


        </CareerCardsContainer>
      </div>
    </div>
  );
}
