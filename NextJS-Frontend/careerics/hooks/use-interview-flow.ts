"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { interviewService } from "@/services/interview.service";

export type InterviewType = "HR" | "TECH";

export interface UIQuestion {
  id: number;
  text: string;
  questionId: string;
}

interface RecordingOverrides {
  type?: InterviewType;
  sessionId?: string | null;
  q?: string;
  questionId?: string | null;
  followup?: string | null;
}

interface AnalyzingOverrides {
  type?: InterviewType;
  sessionId?: string;
  q?: string;
  questionId?: string;
}

const CANONICAL_TYPE_ALIASES: Record<InterviewType, string[]> = {
  HR: ["HR", "hr", "behavioral", "Behavioural"],
  TECH: ["TECH", "tech", "technical", "Technical"],
};

function normalizeInterviewType(rawType: string | null | undefined): InterviewType {
  if (!rawType) return "HR";
  const normalized = rawType.trim().toLowerCase();

  if (normalized === "tech" || normalized === "technical") {
    return "TECH";
  }

  if (normalized === "hr" || normalized === "behavioral" || normalized === "behavioural") {
    return "HR";
  }

  return "HR";
}

async function getQuestionsByCanonicalType(interviewType: InterviewType) {
  for (const alias of CANONICAL_TYPE_ALIASES[interviewType]) {
    const response = await interviewService.getQuestionsByType(alias);
    if (response.success && response.data?.length) {
      return response;
    }
  }

  return interviewService.getQuestionsByType(interviewType);
}

export function useInterviewFlow() {
  const searchParams = useSearchParams();

  const interviewType = useMemo<InterviewType>(() => {
    return normalizeInterviewType(searchParams.get("type"));
  }, [searchParams]);

  const sessionId = searchParams.get("sessionId") || "";
  const questionId = searchParams.get("questionId") || "";
  const followupText = searchParams.get("followup") || "";

  const currentQ = useMemo(() => {
    const parsed = Number(searchParams.get("q") || "1");
    if (!Number.isFinite(parsed) || parsed < 1) return 1;
    return Math.floor(parsed);
  }, [searchParams]);

  const [questions, setQuestions] = useState<UIQuestion[]>([]);
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(true);
  const [questionsError, setQuestionsError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadQuestions = async () => {
      setIsQuestionsLoading(true);
      setQuestionsError("");

      const response = await getQuestionsByCanonicalType(interviewType);
      if (!alive) return;

      if (!response.success || !response.data?.length) {
        setQuestions([]);
        setQuestionsError(response.message || "No questions found for this interview type.");
        setIsQuestionsLoading(false);
        return;
      }

      const mapped: UIQuestion[] = response.data.map((q, index) => ({
        id: index + 1,
        text: q.question_text,
        questionId: q.id,
      }));

      setQuestions(mapped);
      setIsQuestionsLoading(false);
    };

    loadQuestions();

    return () => {
      alive = false;
    };
  }, [interviewType]);

  const buildRecordingUrl = useCallback(
    (overrides: RecordingOverrides = {}) => {
      const next = new URLSearchParams(searchParams.toString());

      if (overrides.type) {
        next.set("type", overrides.type);
      } else if (!next.get("type")) {
        next.set("type", interviewType);
      }

      if (overrides.sessionId === null) {
        next.delete("sessionId");
      } else if (typeof overrides.sessionId === "string") {
        next.set("sessionId", overrides.sessionId);
      }

      if (overrides.q) {
        next.set("q", overrides.q);
      }

      if (overrides.questionId === null) {
        next.delete("questionId");
      } else if (typeof overrides.questionId === "string") {
        next.set("questionId", overrides.questionId);
      }

      if (overrides.followup === null) {
        next.delete("followup");
      } else if (typeof overrides.followup === "string") {
        next.set("followup", overrides.followup);
      }

      return `/interview-feature/recording?${next.toString()}`;
    },
    [searchParams, interviewType],
  );

  const buildAnalyzingUrl = useCallback(
    (overrides: AnalyzingOverrides) => {
      const params = new URLSearchParams({
        type: overrides.type || interviewType,
        sessionId: overrides.sessionId || sessionId,
        q: overrides.q || String(currentQ),
        questionId: overrides.questionId || questionId,
      });

      return `/interview-feature/analyzing?${params.toString()}`;
    },
    [interviewType, sessionId, currentQ, questionId],
  );

  return {
    interviewType,
    sessionId,
    questionId,
    followupText,
    currentQ,
    questions,
    isQuestionsLoading,
    questionsError,
    buildRecordingUrl,
    buildAnalyzingUrl,
  };
}
