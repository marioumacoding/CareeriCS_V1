/**
 * Interview service — all backend calls for the interview feature.
 *
 * Maps directly to the FastAPI routers:
 *   POST/GET/DELETE  /sessions/…
 *   GET/POST         /questions/…
 *   POST             /answers/  and  /answers/evaluate/
 *
 * Components and hooks must never call fastapiApi directly.
 */

import { fastapiApi } from "@/lib/api";
import { publicConfig } from "@/config";
import type {
  ApiResponse,
  APISession,
  APISessionCreate,
  APIQuestion,
  APIQuestionCreate,
  APISubmitAnswerResponse,
  APIEvaluationResponse,
  APIFollowup,
  APIFollowupRead,
} from "@/types";

export const interviewService = {
  // ── Sessions ────────────────────────────────────────────────────────────────

  createSession(payload: APISessionCreate): Promise<ApiResponse<APISession>> {
    return fastapiApi.post<APISession>("/sessions/", payload);
  },

  getSession(sessionId: string): Promise<ApiResponse<APISession>> {
    return fastapiApi.get<APISession>(`/sessions/${sessionId}`);
  },

  getUserSessions(userId: string): Promise<ApiResponse<APISession[]>> {
    return fastapiApi.get<APISession[]>(`/sessions/user/${userId}`);
  },

  deleteSession(sessionId: string): Promise<ApiResponse<{ detail: string }>> {
    return fastapiApi.delete<{ detail: string }>(`/sessions/${sessionId}`);
  },

  /**
   * Returns a direct URL for the PDF session report.
   * Use as an <a href> download link or window.open() — the browser will handle streaming.
   */
  getSessionReportUrl(sessionId: string): string {
    const base = publicConfig.fastapiUrl.replace(/\/+$/, "");
    return `${base}/sessions/${sessionId}/report`;
  },

  // ── Questions ────────────────────────────────────────────────────────────────

  listQuestions(): Promise<ApiResponse<APIQuestion[]>> {
    return fastapiApi.get<APIQuestion[]>("/questions/");
  },

  getQuestion(questionId: string): Promise<ApiResponse<APIQuestion>> {
    return fastapiApi.get<APIQuestion>(`/questions/${questionId}`);
  },

  getQuestionsByType(questionType: string): Promise<ApiResponse<APIQuestion[]>> {
    return fastapiApi.get<APIQuestion[]>(`/questions/type/${questionType}`);
  },

  createQuestion(payload: APIQuestionCreate): Promise<ApiResponse<APIQuestion>> {
    return fastapiApi.post<APIQuestion>("/questions/", payload);
  },

  massCreateQuestions(
    payload: APIQuestionCreate[],
  ): Promise<ApiResponse<APIQuestion[]>> {
    return fastapiApi.post<APIQuestion[]>("/questions/mass_create/", payload);
  },

  // ── Answers ──────────────────────────────────────────────────────────────────

  /**
   * Submit an audio/video recording for a question.
   * `audio` should be the raw Blob from MediaRecorder (webm format).
   */
  submitAnswer(
    sessionId: string,
    questionId: string,
    audio: Blob,
  ): Promise<ApiResponse<APISubmitAnswerResponse>> {
    const form = new FormData();
    form.append("session_id", sessionId);
    form.append("question_id", questionId);
    form.append("audio", audio, "answer.webm");
    return fastapiApi.post<APISubmitAnswerResponse>("/answers/", form);
  },

  /**
   * Trigger server-side evaluation (FER + SER + sentiment + AI scoring)
   * for a previously submitted answer. May return a follow-up question.
   */
  evaluateAnswer(
    sessionId: string,
    questionId: string,
  ): Promise<ApiResponse<APIEvaluationResponse>> {
    const form = new FormData();
    form.append("session_id", sessionId);
    form.append("question_id", questionId);
    return fastapiApi.post<APIEvaluationResponse>("/answers/evaluate/", form);
  },

  async getFollowupByAnswerId(
    answerId: string,
  ): Promise<ApiResponse<APIFollowup | null>> {
    const response = await fastapiApi.get<APIFollowupRead | null>(`/followups/${answerId}`);

    if (!response.success) {
      return {
        ...response,
        data: null,
      };
    }

    if (!response.data) {
      return {
        ...response,
        data: null,
      };
    }

    return {
      ...response,
      data: {
        id: response.data.id,
        text: response.data.fquestion_text,
        audio: response.data.fquestion_audio || "",
      },
    };
  },
} as const;
