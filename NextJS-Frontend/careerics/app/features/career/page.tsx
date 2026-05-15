"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import ChoiceCard from "@/components/ui/choice-card-career";
import TipCard from "@/components/ui/3ateyat";
import { CareerCardsContainer } from "@/components/ui/career-cards-container";

import { useAuth } from "@/providers/auth-provider";
import { careerService } from "@/services";
import {
  buildCareerQuizSelectionHref,
  startCareerQuizSession,
} from "@/lib/career-quiz";

import type { APICareerTrack } from "@/types";
import { useResponsive } from "@/hooks/useResponsive";


const TRACK_FALLBACK =
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

  const [tracks, setTracks] = useState<APICareerTrack[]>([]);
  const [loadingTracks, setLoadingTracks] = useState(true);
  const [tracksError, setTracksError] = useState<string | null>(null);

  const [startIndex, setStartIndex] = useState(0);

  const [startingQuiz, setStartingQuiz] = useState(false);
  const [quizError, setQuizError] = useState<string | null>(null);

  // ---------------- FETCH TRACKS ----------------
  useEffect(() => {
    let alive = true;

    const load = async () => {
      setLoadingTracks(true);

      const res = await careerService.listTracks();
      if (!alive) return;

      if (!res.success || !res.data) {
        setTracks([]);
        setTracksError(res.message || "Failed to load tracks.");
        setLoadingTracks(false);
        return;
      }

      setTracks(res.data);
      setTracksError(null);
      setLoadingTracks(false);
    };

    void load();

    return () => {
      alive = false;
    };
  }, []);


  const visibleTracks = useMemo(() => {
    return tracks;
  }, [tracks, startIndex]);


  // ---------------- QUIZ ----------------
  const handleStartQuiz = async () => {
    if (startingQuiz || isAuthLoading) return;

    if (!user?.id) {
      router.push("/auth/login?redirect=/features/career");
      return;
    }

    try {
      setQuizError(null);
      setStartingQuiz(true);

      const sessionId = await startCareerQuizSession(user.id);

      router.push(buildCareerQuizSelectionHref(sessionId));
    } catch (e) {
      setStartingQuiz(false);
      setQuizError(
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
        gridTemplateRows: !isLarge?"1fr 4fr":"1fr 2fr",
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
        {loadingTracks && (
          <div style={{ color: "#D7E3FF" }}>Loading tracks...</div>
        )}

        {!loadingTracks && tracksError && (
          <div style={{ color: "#FFD3D3" }}>{tracksError}</div>
        )}

        {!loadingTracks &&
          !tracksError &&
          visibleTracks.length === 0 && (
            <div style={{ color: "#d7ffdd" }}>
              No career tracks available.
            </div>
          )}

        {!loadingTracks &&
          !tracksError &&
          visibleTracks.map((track) => (
            <ChoiceCard
              key={track.id}
              title={track.name}
              description={track.description || TRACK_FALLBACK}
              image={`/tracks/${track.id}.svg`}
              buttonVariant="primary-inverted"
              buttonLabel="Learn More"
              onClick={() =>
                router.push(buildTrackBlogPath(track))
              }
            />
          ))}
      </CareerCardsContainer>
    </div>
  );
}