"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import JourneyTree from "@/components/ui/journey-tree";
import ChoiceCard from "@/components/ui/choice-card";
import TipCard from "@/components/ui/3ateyat";
import { CardsContainer } from "@/components/ui/cards-container";
import { ActivityCard } from "@/components/ui/activity-card";
import { useJourneyPhase } from "@/hooks/use-journey-phase";
import { buildJourneyPhaseHref } from "@/lib/journey";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/providers/auth-provider";

// TODO: Keep "hr" until backend ships a dedicated technical question bank.
const INTERVIEW_TYPE = "hr";

function buildRecordingRoute(sessionId: string | null): string {
  const params = new URLSearchParams({
    type: INTERVIEW_TYPE,
    q: "1",
  });

  if (sessionId) {
    params.set("sessionId", sessionId);
  }

  return `/interview-feature/recording?${params.toString()}`;
}

function formatSessionDate(value?: string | null): string {
  const parsed = new Date(value || "");
  if (Number.isNaN(parsed.getTime())) {
    return "Unknown";
  }

  return parsed.toLocaleDateString();
}

export default function JourneyTrialRoundPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const {
    selectedTrack,
    maxReached,
    isLoadingTracks,
    trackError,
  } = useJourneyPhase(4);

  const [preparedSessionId, setPreparedSessionId] = useState("");
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);
  const [archiveItems, setArchiveItems] = useState<Array<{ id: string; title: string; date: string; type: string }>>([]);
  const [archiveError, setArchiveError] = useState<string | null>(null);

  const pendingSessionCreationRef = useRef<Promise<string | null> | null>(null);
  const hasAutoPreparedRef = useRef(false);

 

  const createInterviewSession = useCallback(async (sessionName: string): Promise<string | null> => {
    if (!user?.id) {
      return null;
    }

    if (pendingSessionCreationRef.current) {
      return pendingSessionCreationRef.current;
    }

    const request = (async () => {
      setIsPreparingSession(true);

      const response = await interviewService.createSession({
        name: `${sessionName} Mock Interview`,
        type: INTERVIEW_TYPE,
        status: "in_progress",
        user_id: user.id,
      });

      if (!response.success || !response.data?.id) {
        return null;
      }

      setPreparedSessionId(response.data.id);
      return response.data.id;
    })()
      .finally(() => {
        pendingSessionCreationRef.current = null;
        setIsPreparingSession(false);
      });

    pendingSessionCreationRef.current = request;
    return request;
  }, [user?.id]);

  useEffect(() => {
    if (hasAutoPreparedRef.current || isLoading || !user?.id || preparedSessionId) {
      return;
    }

    hasAutoPreparedRef.current = true;
    void createInterviewSession("HR");
  }, [createInterviewSession, isLoading, preparedSessionId, user?.id]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    let alive = true;

    const loadArchive = async () => {
      if (!user?.id) {
        setArchiveItems([]);
        setArchiveError(null);
        return;
      }

      const response = await interviewService.getUserSessions(user.id);
      if (!alive) {
        return;
      }

      if (!response.success) {
        setArchiveItems([]);
        setArchiveError(response.message || "Unable to load interview archive.");
        return;
      }

      const sessions = (response.data ?? [])
        .filter((session) => session.status?.toLowerCase() === "completed")
        .sort((left, right) => {
          return new Date(right.created_at || "").getTime() - new Date(left.created_at || "").getTime();
        })
        .slice(0, 12)
        .map((session) => ({
          id: session.id,
          title: session.name || "Interview Session",
          date: formatSessionDate(session.created_at),
          type: session.type || "hr",
        }));

      setArchiveItems(sessions);
      setArchiveError(null);
    };

    void loadArchive();

    return () => {
      alive = false;
    };
  }, [isLoading, user?.id]);

  const handleStartInterview = useCallback(async (sessionName: string) => {
    if (isStartingInterview) {
      return;
    }

    setIsStartingInterview(true);

    try {
      if (!isLoading && !user?.id) {
        router.push("/auth/login");
        return;
      }

      let sessionId = preparedSessionId || null;
      if (!sessionId) {
        sessionId = await createInterviewSession(sessionName);
      }

      router.push(buildRecordingRoute(sessionId));
    } finally {
      setIsStartingInterview(false);
    }
  }, [createInterviewSession, isLoading, isStartingInterview, preparedSessionId, router, user?.id]);

  const startButtonLabel = useMemo(() => {
    if (isStartingInterview) {
      return "Starting...";
    }

    if (isLoading || (isPreparingSession && !preparedSessionId)) {
      return "Preparing...";
    }

    return "Start";
  }, [isLoading, isPreparingSession, isStartingInterview, preparedSessionId]);

  const isStartDisabled = isLoading || isStartingInterview || (isPreparingSession && !preparedSessionId);

  // Delay render until all data is ready
  const isInitializing = isLoadingTracks || isLoading;
  if (isInitializing && !selectedTrack) {
    return (
      <JourneyTree
        current={4}
        maxReached={4}
        renderContent={() => (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1rem",
                  marginBottom: "1rem",
                  opacity: 0.8,
                }}
              >
                Loading interview sessions...
              </div>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  border: "2px solid #4A5FC1",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        )}
      />
    );
  }

  if (!selectedTrack && !isLoadingTracks) {
    return (
      <JourneyTree
        current={4}
        maxReached={4}
        renderContent={() => (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              padding: "40px",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>No Track Selected</h1>
            <p style={{ margin: 0, color: "#C1CBE6", maxWidth: "60ch" }}>
              Select a track from Home first, then continue your journey phases.
            </p>
            <button
              type="button"
              onClick={() => router.push("/features/home")}
              style={{
                border: "none",
                borderRadius: "2vh",
                backgroundColor: "var(--light-green)",
                color: "black",
                padding: "0.9rem 1.6rem",
                fontFamily: "var(--font-nova-square)",
                cursor: "pointer",
              }}
            >
              Back To Home
            </button>
          </div>
        )}
      />
    );
  }

  const nextPhase = maxReached < 5
    ? maxReached + 1
    : maxReached;

  return (
    <JourneyTree
      current={4}
      maxReached={nextPhase}
      resolvePhasePath={(phase) => buildJourneyPhaseHref(phase, selectedTrack?.id)}
      renderContent={() => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gridColumnGap: "25px",
            gridRowGap: "20px",
            width: "100%",
            height: "100%",
            padding: "40px",
          }}
        >
          <ChoiceCard
            title="Behavioral Mock Interview"
            description="Practice common interview questions and improve how you present your skills and experience."
            buttonVariant="primary-inverted"
            onClick={() => {
              void handleStartInterview("Behavioral");
            }}
            disabled={isStartDisabled}
            buttonLabel={startButtonLabel}
            icon="/interview/hr.svg"
            style={{ gridArea: "1 / 1 / 3 / 2", backgroundColor: "var(--medium-blue)" }}
          />

          <ChoiceCard
            title="Technical Mock Interview"
            description="This route currently uses the same HR question bank to stay aligned with the current backend setup."
            buttonVariant="primary-inverted"
            onClick={() => {
              void handleStartInterview("Technical");
            }}
            disabled={isStartDisabled}
            buttonLabel={startButtonLabel}
            icon="/interview/tech.svg"
            style={{ gridArea: "1 / 2 / 3 / 3", backgroundColor: "var(--medium-blue)" }}
          />

          <CardsContainer
            Title="Interviews Archive"
            variant="vertical"
            Columns={1}
            centerTitle
            style={{ gridArea: "1 / 3 / 3 / 4" }}
          >
            {archiveItems.length ? (
              archiveItems.map((item) => (
                <ActivityCard
                  key={item.id}
                  title={item.title}
                  date={item.date}
                  variant="download"
                  onClick={() =>
                    router.push(
                      `/interview-feature/last-analysis?type=${encodeURIComponent(
                        item.type,
                      )}&sessionId=${encodeURIComponent(item.id)}&q=1`,
                    )
                  }
                />
              ))
            ) : (
              <div
                style={{
                  color: archiveError ? "#FFD3D3" : "#D7E3FF",
                  fontFamily: "var(--font-jura)",
                  textAlign: "center",
                  paddingInline: "10px",
                }}
              >
                {archiveError || "No completed interview sessions yet."}
              </div>
            )}
          </CardsContainer>

          <TipCard
            title="Tip of the day"
            description="Research the company and role before each mock. Your answers become stronger when they are contextual."
            icon="/global/tip.svg"
            style={{ gridArea: "3 / 1 / 4 / 4" }}
          />

          {trackError ? (
            <p style={{ margin: 0, color: "#FFD3D3", gridArea: "3 / 1 / 4 / 4", alignSelf: "end" }}>
              {trackError}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}
