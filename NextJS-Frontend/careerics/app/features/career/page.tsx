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

  // ---------------- UI ----------------
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "1.6fr repeat(6, 1fr)",
          gap: "20px",
          flex: 1,
        }}
      >
        {/* HERO */}
        <TipCard
          variant="feature"
          onclick={handleStartQuiz}
          style={{
            gridArea: "1 / 1 / 3 / 7",
            backgroundColor: "var(--dark-blue)",
          }}
          icon="/tracks/career-quiz.svg"
          title="Start career quiz"
          description={
            "Choose your interests and answer a few questions.\nGet career matches instantly."
          }
        />

        {quizError && (
          <p
            style={{
              gridArea: "2 / 1 / 3 / 7",
              margin: 0,
              color: "#FFD3D3",
            }}
          >
            {quizError}
          </p>
        )}

        {/* TRACKS */}
        <CareerCardsContainer
          columns={4}
          isScrollable
          Title="Discover more career paths"
          style={{
            gridArea: "3 / 1 / 8 / 7",
            backgroundColor: "var(--medium-blue)",
            borderRadius: "4vh",
            gap: 0,
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
    </div>
  );
}