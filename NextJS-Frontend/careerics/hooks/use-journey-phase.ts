"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { UNIFIED_BOOKMARKS_UPDATED_EVENT } from "@/lib/unified-bookmarks";
import {
  JOURNEY_PHASE_STATE_UPDATED_EVENT,
  type JourneyPhaseNumber,
  type JourneyPhaseState,
  type JourneyTrackCard,
  getTrackById,
  invalidateJourneyTrackCardsCache,
  loadJourneyTrackCards,
  persistSelectedJourneyTrackId,
  readSelectedJourneyTrackId,
  readJourneyPhaseState,
  visitJourneyPhase,
} from "@/lib/journey";

type UseJourneyPhaseState = {
  tracks: JourneyTrackCard[];
  selectedTrack: JourneyTrackCard | null;
  selectedTrackId: string | null;
  phaseState: JourneyPhaseState;
  maxReached: JourneyPhaseNumber;
  isLoadingTracks: boolean;
  trackError: string | null;
  queryTrackId: string | null;
};

function normalizeTrackId(value: string | null): string | null {
  const normalized = (value || "").trim();
  return normalized.length ? normalized : null;
}

export function useJourneyPhase(
  currentPhase: JourneyPhaseNumber,
): UseJourneyPhaseState {
  const searchParams = useSearchParams();
  const queryTrackId = normalizeTrackId(searchParams.get("trackId"));

  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [tracks, setTracks] = useState<JourneyTrackCard[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState(0);

  // -------------------------
  // Load tracks
  // -------------------------
  useEffect(() => {
    let alive = true;

    const loadTracks = async () => {
      if (isAuthLoading) return;

      setIsLoadingTracks(true);
      setTrackError(null);

      try {
        const nextTracks = await loadJourneyTrackCards(userId);

        if (!alive) return;

        setTracks(nextTracks);
        setIsLoadingTracks(false);
      } catch {
        if (!alive) return;

        setTracks([]);
        setTrackError("Unable to load your journey tracks right now.");
        setIsLoadingTracks(false);
      }
    };

    void loadTracks();

    return () => {
      alive = false;
    };
  }, [isAuthLoading, refreshToken, userId]);

  // -------------------------
  // Select track (query → storage → fallback)
  // -------------------------
  const selectedTrack = useMemo(() => {
    if (!tracks.length) return null;

    const fromQuery = queryTrackId
      ? getTrackById(tracks, queryTrackId)
      : null;
    if (fromQuery) return fromQuery;

    const stored = readSelectedJourneyTrackId(userId);
    const fromStorage = stored ? getTrackById(tracks, stored) : null;
    if (fromStorage) return fromStorage;

    return tracks[0] || null;
  }, [queryTrackId, tracks, userId]);

  const selectedTrackId = selectedTrack?.id ?? null;

  // -------------------------
  // Persist selected track
  // -------------------------
  useEffect(() => {
    persistSelectedJourneyTrackId(selectedTrackId, userId);
  }, [selectedTrackId, userId]);

  // -------------------------
  // Visit tracking (IMPORTANT)
  // -------------------------
  useEffect(() => {
    if (!selectedTrackId || !selectedTrack) return;

    visitJourneyPhase(selectedTrackId, currentPhase, userId);
  }, [currentPhase, selectedTrack, selectedTrackId, userId]);

  // -------------------------
  // React to storage updates
  // -------------------------
  useEffect(() => {
    const handlePhaseUpdate = () => setRefreshToken((previous) => previous + 1);
    const handleBookmarksUpdated = () => {
      invalidateJourneyTrackCardsCache(userId);
      setRefreshToken((previous) => previous + 1);
    };

    window.addEventListener(
      JOURNEY_PHASE_STATE_UPDATED_EVENT,
      handlePhaseUpdate as EventListener,
    );
    window.addEventListener(
      UNIFIED_BOOKMARKS_UPDATED_EVENT,
      handleBookmarksUpdated as EventListener,
    );
    window.addEventListener("storage", handleBookmarksUpdated);

    return () => {
      window.removeEventListener(
        JOURNEY_PHASE_STATE_UPDATED_EVENT,
        handlePhaseUpdate as EventListener,
      );
      window.removeEventListener(
        UNIFIED_BOOKMARKS_UPDATED_EVENT,
        handleBookmarksUpdated as EventListener,
      );
      window.removeEventListener("storage", handleBookmarksUpdated);
    };
  }, [userId]);

  // -------------------------
  // Phase state
  // -------------------------
  const phaseState: JourneyPhaseState = selectedTrackId
    ? readJourneyPhaseState(selectedTrackId, userId)
    : { maxReached: 1 };

  // -------------------------
  // Return
  // -------------------------
  return {
    tracks,
    selectedTrack,
    selectedTrackId,
    phaseState,
    maxReached: phaseState.maxReached,
    isLoadingTracks,
    trackError,
    queryTrackId,
  };
}
