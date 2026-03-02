/** Domain entity types — expand as your schema grows. */

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "user" | "guest";

/** Auth session shape (used by auth provider + middleware). */
export interface AuthSession {
  user: Pick<User, "id" | "email" | "displayName" | "role">;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix epoch seconds
}

// ── Interview domain ────────────────────────────

export type InterviewSessionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "cancelled";

export type QuestionStatus = "pending" | "recording" | "recorded" | "skipped";

export interface InterviewQuestion {
  id: string;
  index: number;
  text: string;
  status: QuestionStatus;
  /** Duration of the recorded answer in seconds (null if not yet recorded). */
  recordedDurationSec: number | null;
  /** URL to the recorded video blob / upload (null until recorded). */
  videoUrl: string | null;
}

export interface InterviewSession {
  id: string;
  title: string;
  code: string; // e.g. "001"
  status: InterviewSessionStatus;
  questions: InterviewQuestion[];
  /** Total allowed time per question in seconds. */
  timeLimitPerQuestionSec: number;
  createdAt: string;
  updatedAt: string;
}
