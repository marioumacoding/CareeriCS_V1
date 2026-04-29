"use client";

import { Activity, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import RootLayout from "@/app/features/layout";
import ArchiveCard from "@/components/ui/archive-card";
import ChoiceCard from "@/components/ui/choice-card";
import TipCard from "@/components/ui/tipcard";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/providers/auth-provider";
import { CardsContainer } from "@/components/ui/cards-container";
import { ActivityCard } from "@/components/ui/activity-card";

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

export default function Interview() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [preparedSessionId, setPreparedSessionId] = useState("");
  const [isPreparingSession, setIsPreparingSession] = useState(false);
  const [isStartingInterview, setIsStartingInterview] = useState(false);

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

  const archive = [
    { id: "Tech-001", date: "5/3/2026" },
    { id: "Tech-002", date: "5/3/2026" },
    { id: "Tech-003", date: "5/3/2026" },
    { id: "Tech-004", date: "5/3/2026" },
    { id: "Tech-005", date: "5/3/2026" },
    { id: "Tech-006", date: "5/3/2026" },
  ];

  return (
    <div
      style={{
        display:"grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridTemplateRows: "repeat(3, 1fr)",
        gridColumnGap: "25px",
        gridRowGap: "20px",
        width:"100%",
        height:"100%",
        padding:"40px",
      }}
    >
      <ChoiceCard
        title="Behavioral Mock Interview"
        description="Practice answering the most common interview questions and improve how you present yourself and your skills."
        buttonVariant="primary-inverted"
        onClick={() => {
          void handleStartInterview("Behavioral");
        }}
        disabled={isStartDisabled}
        buttonLabel={startButtonLabel}
        icon="/interview/hr.svg"
        style={{ gridArea: "1 / 1 / 3 / 2" }}
      />

      <ChoiceCard
        title="Technical Mock Interview"
        description="This route currently uses the same HR question bank to keep frontend and backend fully aligned."
        buttonVariant="primary-inverted"
        onClick={() => {
          void handleStartInterview("Technical");
        }}
        disabled={isStartDisabled}
        buttonLabel={startButtonLabel}
        icon="/interview/tech.svg"
        style={{ gridArea: "1 / 2 / 3 / 3" }}
      />

      <CardsContainer
        Title="Interviews Archive"
        variant="vertical"
        Columns={1}
        centerTitle
        style={{ gridArea: "1 / 3 / 3 / 4" }}
      >
        {archive.map((item) => (
          <ActivityCard
            key={item.id}
            title={item.id}
            date={item.date}
            variant="download"
          />
        ))}
      </CardsContainer>

      <TipCard
        title="Tip of the day"
        description="Research the company and interviewers before your interview so you understand the company's goals and show how you fit."
        icon="/global/tip.svg"
        style={{ gridArea: "3 / 1 / 4 / 4" }}
      />
    </div>
  );
}