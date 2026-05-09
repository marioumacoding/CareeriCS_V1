"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import {
  JOURNEY_PHASE_STATE_UPDATED_EVENT,
  type JourneyPhaseNumber,
  type JourneyPhaseState,
  type JourneyTrackCard,
  getTrackById,
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
  isPhaseLocked: boolean;
  redirectPhase: JourneyPhaseNumber | null;
};

function normalizeTrackId(value: string | null): string | null {
  const normalized = (value || "").trim();
  return normalized.length ? normalized : null;
}

export function useJourneyPhase(currentPhase: JourneyPhaseNumber): UseJourneyPhaseState {
  const searchParams = useSearchParams();
  const queryTrackId = normalizeTrackId(searchParams.get("trackId"));
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [tracks, setTracks] = useState<JourneyTrackCard[]>([]);
  const [isLoadingTracks, setIsLoadingTracks] = useState(true);
  const [trackError, setTrackError] = useState<string | null>(null);
  const [, setPhaseStateRefreshNonce] = useState(0);

  useEffect(() => {
    let alive = true;

    const loadTracks = async () => {
      if (isAuthLoading) {
        return;
      }

      setIsLoadingTracks(true);
      setTrackError(null);

      try {
        const nextTracks = await loadJourneyTrackCards(userId);
        if (!alive) {
          return;
        }

        setTracks(nextTracks);
        setIsLoadingTracks(false);
      } catch {
        if (!alive) {
          return;
        }

        setTracks([]);
        setTrackError("Unable to load your journey tracks right now.");
        setIsLoadingTracks(false);
      }
    };

    void loadTracks();

    return () => {
      alive = false;
    };
  }, [isAuthLoading, userId]);

  const selectedTrack = useMemo(() => {
    if (!tracks.length) {
      return null;
    }

    const fromQuery = queryTrackId ? getTrackById(tracks, queryTrackId) : null;
    if (fromQuery) {
      return fromQuery;
    }

    const persistedTrackId = readSelectedJourneyTrackId(userId);
    const fromStorage = persistedTrackId ? getTrackById(tracks, persistedTrackId) : null;
    if (fromStorage) {
      return fromStorage;
    }

    return tracks[0] || null;
  }, [queryTrackId, tracks, userId]);

  const selectedTrackId = selectedTrack?.id || null;

  useEffect(() => {
    persistSelectedJourneyTrackId(selectedTrackId, userId);
  }, [selectedTrackId, userId]);

  useEffect(() => {
    if (!selectedTrackId || !selectedTrack) {
      return;
    }

    const storedState = readJourneyPhaseState(selectedTrackId, userId);

    if (currentPhase > storedState.maxReached) {
      return;
    }

    visitJourneyPhase(selectedTrackId, currentPhase, userId);
  }, [currentPhase, selectedTrack, selectedTrackId, userId]);

  useEffect(() => {
    const handleJourneyPhaseStateUpdated = () => {
      setPhaseStateRefreshNonce((previous) => previous + 1);
    };

    window.addEventListener(
      JOURNEY_PHASE_STATE_UPDATED_EVENT,
      handleJourneyPhaseStateUpdated as EventListener,
    );

    return () => {
      window.removeEventListener(
        JOURNEY_PHASE_STATE_UPDATED_EVENT,
        handleJourneyPhaseStateUpdated as EventListener,
      );
    };
  }, []);

  const phaseState: JourneyPhaseState = selectedTrackId
    ? readJourneyPhaseState(selectedTrackId, userId)
    : { maxReached: 1 };

  const redirectPhase = !selectedTrackId
    ? null
    : (() => {
        const storedState = readJourneyPhaseState(selectedTrackId, userId);
        return currentPhase > storedState.maxReached ? storedState.maxReached : null;
      })();

  return {
    tracks,
    selectedTrack,
    selectedTrackId,
    phaseState,
    maxReached: phaseState.maxReached,
    isLoadingTracks,
    trackError,
    queryTrackId,
    isPhaseLocked: Boolean(redirectPhase),
    redirectPhase,
  };
}
