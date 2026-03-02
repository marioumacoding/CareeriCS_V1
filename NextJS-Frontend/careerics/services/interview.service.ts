/**
 * Interview session service.
 *
 * All backend calls for the interview feature go through here.
 * Components / hooks never call HttpClient directly.
 */

import { fastapiApi } from "@/lib/api";
import type {
  ApiResponse,
  InterviewSession,
  InterviewQuestion,
} from "@/types";

export interface SubmitAnswerPayload {
  questionId: string;
  /** Base-64 or pre-signed upload URL reference. */
  videoBlob: Blob;
  durationSec: number;
}

export const interviewService = {
  /** Fetch a single interview session by ID. */
  getSession(sessionId: string) {
    return fastapiApi.get<InterviewSession>(`/interviews/${sessionId}`);
  },

  /** List all sessions for the authenticated user. */
  listSessions() {
    return fastapiApi.get<InterviewSession[]>("/interviews");
  },

  /** Submit (or re-submit) an answer for a question. */
  submitAnswer(sessionId: string, payload: SubmitAnswerPayload) {
    const form = new FormData();
    form.append("videoBlob", payload.videoBlob);
    form.append("questionId", payload.questionId);
    form.append("durationSec", String(payload.durationSec));

    return fastapiApi.post<InterviewQuestion>(
      `/interviews/${sessionId}/answers`,
      form,
    );
  },

  /** Delete a previously recorded answer. */
  deleteAnswer(sessionId: string, questionId: string) {
    return fastapiApi.delete<void>(
      `/interviews/${sessionId}/answers/${questionId}`,
    );
  },

  /** Mark the entire session as completed. */
  completeSession(sessionId: string) {
    return fastapiApi.patch<InterviewSession>(
      `/interviews/${sessionId}/complete`,
    );
  },
} as const;
