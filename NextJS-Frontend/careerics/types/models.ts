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

// ── FastAPI Interview domain ─────────────────────────

export interface APISession {
  id: string;
  name: string;
  type: string;
  status: string;
  user_id: string;
  emotion_evaluation?: Record<string, unknown> | null;
  tone_evaluation?: Record<string, unknown> | null;
  sentiment_evaluation?: Record<string, unknown> | null;
}

export interface APISessionCreate {
  name: string;
  type: string;
  status: string;
  user_id: string;
}

export interface APIQuestion {
  id: string;
  type: string;
  question_text: string;
  question_audio?: string | null;
}

export interface APIQuestionCreate {
  type: string;
  question_text: string;
  question_audio?: string;
}

export interface APISubmitAnswerResponse {
  answer_id: string;
  answer_text: string;
  answer_audio: string;
}

export interface APIFollowup {
  id: string;
  text: string;
  audio: string;
}

export interface APIEvaluationResponse {
  evaluation: string | null;
  grade: number | null;
  followup: APIFollowup | null;
  emotion_evaluation: Record<string, unknown> | null;
  tone_evaluation: Record<string, unknown> | null;
}

// ── FastAPI CV domain ─────────────────────────────────

export interface CVSkillEntry {
  id: string;
  isCV: boolean;
  proficiency?: string | null;
  skill: { id: string; skill_name: string };
}

export interface CVExperience {
  id?: string;
  role: string;
  organization?: string | null;
  period?: string | null;
  responsibilities?: string[] | null;
  achievements?: string | null;
}

export interface CVEducation {
  id?: string;
  qualification?: string | null;
  institution?: string | null;
  period?: string | null;
  details?: string | null;
}

export interface CVCertification {
  id?: string;
  title?: string | null;
  organization?: string | null;
  period?: string | null;
}

export interface CVProject {
  id?: string;
  title?: string | null;
  description?: string | null;
  role?: string | null;
  technologies?: string[] | null;
  achievements?: string | null;
}

export interface CVLanguage {
  id?: string;
  language: string;
  proficiency?: string | null;
}

export interface CVAward {
  id?: string;
  title: string;
  organization?: string | null;
  date?: string | null;
  description?: string | null;
}

export interface CVReference {
  id?: string;
  name: string;
  role?: string | null;
  organization?: string | null;
  contact_info?: string | null;
}

export interface CVProfile {
  id?: string;
  full_name: string;
  professional_title?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  linkedin?: string | null;
  portfolio?: string | null;
  summary?: string | null;
  skills: CVSkillEntry[];
  experiences: CVExperience[];
  education: CVEducation[];
  certifications: CVCertification[];
  projects: CVProject[];
  languages: CVLanguage[];
  awards: CVAward[];
  references: CVReference[];
}

// ── Roadmap domain ─────────────────────────────────────────────

export interface RoadmapPosition {
  x: number;
  y: number;
}

export interface RoadmapNodeStyle {
  width?: number | null;
  height?: number | null;
  fontSize?: number | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  color?: string | null;
  stroke?: string | null;
  strokeWidth?: number | null;
  strokeDasharray?: string | null;
  strokeLinecap?: string | null;
  padding?: number | null;
  textAlign?: string | null;
  justifyContent?: string | null;
  [key: string]: unknown;
}

export interface RoadmapNodeData {
  label?: string | null;
  slug?: string | null;
  style?: RoadmapNodeStyle | null;
  href?: string | null;
  color?: string | null;
  backgroundColor?: string | null;
  borderColor?: string | null;
  [key: string]: unknown;
}

export interface RoadmapNode {
  id: string;
  type?: string | null;
  position?: RoadmapPosition | null;
  data?: RoadmapNodeData | null;
  width?: number | null;
  height?: number | null;
  completed?: boolean | null;
  [key: string]: unknown;
}

export interface RoadmapEdge {
  id?: string | null;
  source?: string | null;
  target?: string | null;
  style?: RoadmapNodeStyle | null;
  [key: string]: unknown;
}

export interface RoadmapDocument {
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface RoadmapNodeContent {
  slug: string;
  content: string;
}

export interface RoadmapCompletionResponse {
  success: boolean;
  nodeId: string;
  status: string;
}

export interface RoadmapCatalogItem {
  slug: string;
  title: string;
  description: string;
  level: string;
  estimatedDuration: string;
  focusAreas: string[];
}
