import {
  careerService,
  interviewService,
  jobService,
  reportsService,
  roadmapService,
  skillAssessmentService,
} from "@/services";
import { loadCourseProgress } from "@/lib/course-progress";
import {
  normalizeRoadmapListPayload,
  syncBackendRoadmapBookmarksToUnifiedList,
} from "@/lib/roadmap-bookmark-sync";
import { getUnifiedBookmarks } from "@/lib/unified-bookmarks";
import type {
  APICareerTrackScore,
  RoadmapListItem,
  RoadmapProgressSummary,
  UnifiedBookmarkEntry,
} from "@/types";

export type JourneyPhaseNumber = 1 | 2 | 3 | 4 | 5;

export type JourneyPhaseDefinition = {
  number: JourneyPhaseNumber;
  slug: string;
  title: string;
  description: string;
};

export type JourneyTrackCard = {
  id: string;
  title: string;
  description: string;
  roadmapId: string | null;
  score: number | null;
  source: "bookmark" | "recommendation";
};

export type JourneyPhaseProgress = JourneyPhaseDefinition & {
  progress: number;
  completed: boolean;
};

export type JourneyTrackSummary = {
  track: JourneyTrackCard;
  phases: JourneyPhaseProgress[];
  overallProgress: number;
  currentPhase: JourneyPhaseProgress;
  nextPhase: JourneyPhaseProgress;
  maxReached: JourneyPhaseNumber;
  roadmapProgress: RoadmapProgressSummary | null;
};

export type JourneyPhaseState = {
  maxReached: JourneyPhaseNumber;
};

type JourneyUserSignals = {
  submittedAssessmentsCount: number;
  cvReportsCount: number;
  completedInterviewsCount: number;
  inProgressInterviewsCount: number;
  currentCoursesCount: number;
  completedCoursesCount: number;
  savedJobsCount: number;
  recentlyViewedJobsCount: number;
  appliedJobsCount: number;
};

const JOURNEY_SELECTED_TRACK_STORAGE_KEY = "journey:selected-track-id";
const JOURNEY_PHASE_STATE_STORAGE_KEY = "journey:phase-state";
export const JOURNEY_PHASE_STATE_UPDATED_EVENT = "journey-phase-state-updated";
const JOURNEY_TRACK_CARDS_CACHE_TTL_MS = 5_000;
const journeyTrackCardsCache = new Map<
  string,
  {
    data: JourneyTrackCard[];
    expiresAt: number;
  }
>();
const journeyTrackCardsPromiseCache = new Map<string, Promise<JourneyTrackCard[]>>();

export const JOURNEY_PHASES: JourneyPhaseDefinition[] = [
  {
    number: 1,
    slug: "the-crosspaths",
    title: "The Crosspaths",
    description:
      "Kickstart your journey by clearing the fog of career confusion. We analyze you and pinpoint where you'll actually thrive.",
  },
  {
    number: 2,
    slug: "pave-the-way",
    title: "Pave The Way",
    description:
      "You chose the career, we do the rest. Find roadmaps, courses, resources, and assessments to learn efficiently.",
  },
  {
    number: 3,
    slug: "document-it",
    title: "Document It",
    description:
      "Transform your professional story into a recruiter magnet using CV builder, enhancer, extractor, and history.",
  },
  {
    number: 4,
    slug: "trial-round",
    title: "Trial Round",
    description:
      "Practice technical and behavioral interviews with AI mock sessions before your real interviews.",
  },
  {
    number: 5,
    slug: "job-hunt",
    title: "Job Hunt",
    description:
      "Use profile-fit opportunities, bookmarks, and recent activity to remove manual job-board noise.",
  },
];

export function getJourneyPhase(phaseNumber: number): JourneyPhaseDefinition {
  return (
    JOURNEY_PHASES.find((phase) => phase.number === phaseNumber) ||
    JOURNEY_PHASES[0]
  );
}

export function buildJourneyPhaseHref(phase: number, trackId?: string | null): string {
  const phaseConfig = getJourneyPhase(phase);
  const params = new URLSearchParams();

  if (trackId) {
    params.set("trackId", trackId);
  }

  const query = params.toString();
  const basePath = `/journey/${phaseConfig.slug}`;

  return query ? `${basePath}?${query}` : basePath;
}

export function buildJourneyFirstPhaseHref(trackId?: string | null): string {
  return buildJourneyPhaseHref(1, trackId);
}

export function normalizeJourneyPhaseNumber(value: string | number | null | undefined): JourneyPhaseNumber {
  const numeric = typeof value === "number" ? value : Number(value ?? 1);
  if (numeric <= 1) return 1;
  if (numeric === 2) return 2;
  if (numeric === 3) return 3;
  if (numeric === 4) return 4;
  return 5;
}

export function readSelectedJourneyTrackId(userId?: string | null): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const scopedKey = `${JOURNEY_SELECTED_TRACK_STORAGE_KEY}:${userId ?? "guest"}`;
  const value = window.localStorage.getItem(scopedKey);
  return value?.trim() || null;
}

function getJourneyTrackCardsCacheKey(userId: string): string {
  return userId.trim();
}

function getCachedJourneyTrackCards(
  userId: string,
): JourneyTrackCard[] | null {
  const cacheKey = getJourneyTrackCardsCacheKey(userId);
  const cached = journeyTrackCardsCache.get(cacheKey);

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    journeyTrackCardsCache.delete(cacheKey);
    return null;
  }

  return cached.data;
}

export function invalidateJourneyTrackCardsCache(
  userId?: string | null,
): void {
  if (!userId) {
    journeyTrackCardsCache.clear();
    journeyTrackCardsPromiseCache.clear();
    return;
  }

  const cacheKey = getJourneyTrackCardsCacheKey(userId);
  journeyTrackCardsCache.delete(cacheKey);
  journeyTrackCardsPromiseCache.delete(cacheKey);
}

export function persistSelectedJourneyTrackId(
  trackId: string | null,
  userId?: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  const scopedKey = `${JOURNEY_SELECTED_TRACK_STORAGE_KEY}:${userId ?? "guest"}`;
  if (!trackId) {
    window.localStorage.removeItem(scopedKey);
    return;
  }

  window.localStorage.setItem(scopedKey, trackId);
}

function getJourneyPhaseStateStorageKey(
  trackId: string,
  userId?: string | null,
): string {
  return `${JOURNEY_PHASE_STATE_STORAGE_KEY}:${userId ?? "guest"}:${trackId}`;
}

function normalizeJourneyPhaseState(raw: unknown): JourneyPhaseState {
  if (!raw || typeof raw !== "object") {
    return { maxReached: 1 };
  }

  const maybe = raw as Partial<JourneyPhaseState>;

  return {
    maxReached: normalizeJourneyPhaseNumber(maybe.maxReached),
  };
}

function notifyJourneyPhaseStateUpdated(
  trackId: string,
  state: JourneyPhaseState,
  userId?: string | null,
): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(JOURNEY_PHASE_STATE_UPDATED_EVENT, {
      detail: {
        trackId,
        userId: userId ?? "guest",
        state,
      },
    }),
  );
}

export function readJourneyPhaseState(
  trackId?: string | null,
  userId?: string | null,
): JourneyPhaseState {
  if (typeof window === "undefined" || !trackId) {
    return { maxReached: 1 };
  }

  const raw = window.localStorage.getItem(
    getJourneyPhaseStateStorageKey(trackId, userId),
  );

  if (!raw) {
    return { maxReached: 1 };
  }

  try {
    return normalizeJourneyPhaseState(JSON.parse(raw));
  } catch {
    return { maxReached: 1 };
  }
}

export function persistJourneyPhaseState(
  trackId: string,
  state: JourneyPhaseState,
  userId?: string | null,
): JourneyPhaseState {
  const normalizedState = normalizeJourneyPhaseState(state);

  if (typeof window === "undefined") {
    return normalizedState;
  }

  const storageKey = getJourneyPhaseStateStorageKey(trackId, userId);
  const nextRaw = JSON.stringify(normalizedState);
  const currentRaw = window.localStorage.getItem(storageKey);

  if (currentRaw === nextRaw) {
    return normalizedState;
  }

  window.localStorage.setItem(storageKey, nextRaw);
  notifyJourneyPhaseStateUpdated(trackId, normalizedState, userId);
  return normalizedState;
}

export function visitJourneyPhase(
  trackId: string,
  phase: JourneyPhaseNumber,
  userId?: string | null,
): JourneyPhaseState {
  const currentState = readJourneyPhaseState(trackId, userId);

  const nextMaxReached: JourneyPhaseNumber = Math.max(
    currentState.maxReached,
    phase
  ) as JourneyPhaseNumber;

  return persistJourneyPhaseState(
    trackId,
    { maxReached: nextMaxReached },
    userId
  );
}

function toTimestamp(value?: string | null): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeTrackKey(value?: string | null): string {
  return String(value ?? "").trim();
}

function createJourneyTrackCardFromBookmark(
  bookmark: UnifiedBookmarkEntry,
  roadmapTitleById: Map<string, string>,
): JourneyTrackCard | null {
  if (bookmark.kind !== "career" && bookmark.kind !== "roadmap") {
    return null;
  }

  const trackId =
    bookmark.kind === "career"
      ? normalizeTrackKey(bookmark.entity_id)
      : normalizeTrackKey(bookmark.metadata?.track_id || bookmark.entity_id);

  if (!trackId) {
    return null;
  }

  const roadmapId =
    bookmark.kind === "roadmap"
      ? normalizeTrackKey(bookmark.entity_id) || null
      : normalizeTrackKey(bookmark.metadata?.roadmap_id || null) || null;

  const titleFallback =
    (bookmark.kind === "roadmap" && roadmapId && roadmapTitleById.get(roadmapId)) ||
    bookmark.metadata?.track_name ||
    bookmark.title ||
    "Career Track";

  const description =
    bookmark.description ||
    (bookmark.kind === "roadmap"
      ? "Continue your roadmap journey."
      : typeof bookmark.score === "number"
      ? `Match score: ${Math.round(bookmark.score)}%`
      : "Continue your career journey.");

  return {
    id: trackId,
    title: titleFallback,
    description,
    roadmapId,
    score: typeof bookmark.score === "number" ? bookmark.score : null,
    source: "bookmark",
  };
}

function mergeJourneyTrack(
  target: JourneyTrackCard,
  incoming: Partial<JourneyTrackCard>,
): JourneyTrackCard {
  return {
    ...target,
    ...incoming,
    title: incoming.title?.trim() || target.title,
    description: incoming.description?.trim() || target.description,
    roadmapId: incoming.roadmapId ?? target.roadmapId,
    score: typeof incoming.score === "number" ? incoming.score : target.score,
    source: target.source === "bookmark" ? "bookmark" : incoming.source || target.source,
  };
}

function normalizeTrackCards(
  bookmarks: UnifiedBookmarkEntry[],
  recommendations: APICareerTrackScore[],
  roadmaps: RoadmapListItem[],
): JourneyTrackCard[] {
  const roadmapTitleById = new Map(roadmaps.map((roadmap) => [roadmap.id, roadmap.title] as const));
  const byTrackId = new Map<string, JourneyTrackCard>();
  const order: string[] = [];

  for (const bookmark of bookmarks) {
    const candidate = createJourneyTrackCardFromBookmark(bookmark, roadmapTitleById);
    if (!candidate) {
      continue;
    }

    if (!byTrackId.has(candidate.id)) {
      byTrackId.set(candidate.id, candidate);
      order.push(candidate.id);
      continue;
    }

    byTrackId.set(candidate.id, mergeJourneyTrack(byTrackId.get(candidate.id)!, candidate));
  }

  for (const recommendation of recommendations) {
    const trackId = normalizeTrackKey(recommendation.track_id);
    if (!trackId) {
      continue;
    }

    const candidate: JourneyTrackCard = {
      id: trackId,
      title: recommendation.track_name || "Career Track",
      description:
        recommendation.track_description ||
        `Match score: ${Math.round(recommendation.score)}%`,
      roadmapId: normalizeTrackKey(recommendation.roadmap_id) || null,
      score: recommendation.score,
      source: "recommendation",
    };

    if (!byTrackId.has(trackId)) {
      byTrackId.set(trackId, candidate);
      order.push(trackId);
      continue;
    }

    byTrackId.set(trackId, mergeJourneyTrack(byTrackId.get(trackId)!, candidate));
  }

  return order
    .map((trackId) => byTrackId.get(trackId))
    .filter((item): item is JourneyTrackCard => Boolean(item));
}

async function getLatestCareerRecommendations(userId: string): Promise<APICareerTrackScore[]> {
  const sessionsResponse = await careerService.getUserSessions(userId);
  if (!sessionsResponse.success || !sessionsResponse.data?.length) {
    return [];
  }

  const sessionsByRecency = [...sessionsResponse.data]
    .filter((session) => session.status?.toLowerCase() === "submitted")
    .sort((left, right) => {
      return (
        toTimestamp(right.submitted_at ?? right.started_at) -
        toTimestamp(left.submitted_at ?? left.started_at)
      );
    });

  for (const session of sessionsByRecency) {
    const resultResponse = await careerService.getCareerResults(session.id);
    if (resultResponse.success && resultResponse.data?.track_scores?.length) {
      return [...resultResponse.data.track_scores].sort((left, right) => right.score - left.score);
    }
  }

  return [];
}

async function getJourneyUserSignals(userId: string): Promise<JourneyUserSignals> {
  const [
    reportsResponse,
    interviewSessionsResponse,
    assessmentSessionsResponse,
    savedJobsResponse,
    recentJobsResponse,
    jobApplicationsResponse,
  ] = await Promise.all([
    reportsService.listUserReports(userId, "cv"),
    interviewService.getUserSessions(userId),
    skillAssessmentService.getUserSessions(userId),
    jobService.getSavedJobs(userId, { limit: 1 }),
    jobService.getRecentlyViewedJobs(userId, { limit: 1 }),
    jobService.getUserApplications(userId, { limit: 1 }),
  ]);

  const courseProgress = loadCourseProgress(userId);
  const interviewSessions = interviewSessionsResponse.success
    ? interviewSessionsResponse.data ?? []
    : [];
  const assessmentSessions = assessmentSessionsResponse.success
    ? assessmentSessionsResponse.data ?? []
    : [];

  return {
    submittedAssessmentsCount: assessmentSessions.filter(
      (session) => session.status?.toLowerCase() === "submitted",
    ).length,
    cvReportsCount: reportsResponse.success ? reportsResponse.data?.length ?? 0 : 0,
    completedInterviewsCount: interviewSessions.filter(
      (session) => session.status?.toLowerCase() === "completed",
    ).length,
    inProgressInterviewsCount: interviewSessions.filter(
      (session) => session.status?.toLowerCase() === "in_progress",
    ).length,
    currentCoursesCount: courseProgress.current.length,
    completedCoursesCount: courseProgress.completed.length,
    savedJobsCount: savedJobsResponse.success ? savedJobsResponse.data?.total ?? 0 : 0,
    recentlyViewedJobsCount: recentJobsResponse.success ? recentJobsResponse.data?.total ?? 0 : 0,
    appliedJobsCount: jobApplicationsResponse.success ? jobApplicationsResponse.data?.total ?? 0 : 0,
  };
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function computeMaxReachedPhase(phases: JourneyPhaseProgress[]): JourneyPhaseNumber {
  let unlockedPhase: JourneyPhaseNumber = 1;

  for (const phase of phases) {
    if (phase.number !== unlockedPhase) {
      break;
    }

    if (phase.progress >= 100 && unlockedPhase < 5) {
      unlockedPhase = normalizeJourneyPhaseNumber(unlockedPhase + 1);
      continue;
    }

    break;
  }

  return unlockedPhase;
}

function computeJourneyPhases(options: {
  track: JourneyTrackCard;
  roadmapProgressPercent: number;
  userSignals: JourneyUserSignals;
}): JourneyPhaseProgress[] {
  const { track, roadmapProgressPercent, userSignals } = options;
  const hasTrackContext = Boolean(track.id);

  const phase1Progress = hasTrackContext ? 100 : 0;

  const phase2LocalSignals = Math.min(
    100,
    (userSignals.completedCoursesCount * 20) +
      (userSignals.currentCoursesCount * 10) +
      (userSignals.submittedAssessmentsCount * 10),
  );
  const phase2Progress = track.roadmapId
    ? Math.max(roadmapProgressPercent, phase2LocalSignals)
    : phase2LocalSignals;

  const phase3Progress = userSignals.cvReportsCount
    ? Math.min(100, 35 + userSignals.cvReportsCount * 20)
    : 0;

  const phase4Progress = userSignals.completedInterviewsCount
    ? Math.min(100, 30 + userSignals.completedInterviewsCount * 25)
    : userSignals.inProgressInterviewsCount
    ? 30
    : 0;

  const phase5SignalScore =
    userSignals.savedJobsCount +
    userSignals.recentlyViewedJobsCount +
    userSignals.appliedJobsCount * 2;
  const phase5Progress = phase5SignalScore
    ? Math.min(100, 20 + phase5SignalScore * 8)
    : 0;

  const phaseProgressByNumber = new Map<JourneyPhaseNumber, number>([
    [1, clampPercent(phase1Progress)],
    [2, clampPercent(phase2Progress)],
    [3, clampPercent(phase3Progress)],
    [4, clampPercent(phase4Progress)],
    [5, clampPercent(phase5Progress)],
  ]);

  return JOURNEY_PHASES.map((phase) => {
    const progress = phaseProgressByNumber.get(phase.number) || 0;
    return {
      ...phase,
      progress,
      completed: progress >= 100,
    };
  });
}

async function loadTrackRoadmapProgress(
  userId: string,
  roadmapId: string | null,
): Promise<RoadmapProgressSummary | null> {
  if (!roadmapId) {
    return null;
  }

  const response = await roadmapService.getRoadmapProgress(roadmapId, userId);
  if (!response.success || !response.data) {
    return null;
  }

  return response.data;
}

export async function loadJourneyTrackCards(
  userId?: string | null,
): Promise<JourneyTrackCard[]> {
  if (!userId) {
    return [];
  }

  const cachedTracks = getCachedJourneyTrackCards(userId);
  if (cachedTracks) {
    return cachedTracks;
  }

  const cacheKey = getJourneyTrackCardsCacheKey(userId);
  const pendingRequest = journeyTrackCardsPromiseCache.get(cacheKey);
  if (pendingRequest) {
    return pendingRequest;
  }

  const nextRequest = Promise.all([
    roadmapService.getUserRoadmapBookmarks(userId),
    roadmapService.listRoadmaps(),
    getLatestCareerRecommendations(userId),
  ])
    .then(([roadmapBookmarksResponse, roadmapListResponse, recommendations]) => {
      const roadmaps = roadmapListResponse.success
        ? normalizeRoadmapListPayload(roadmapListResponse.data)
        : [];

      let bookmarks = getUnifiedBookmarks(userId);

      if (
        roadmapBookmarksResponse.success &&
        roadmapBookmarksResponse.data?.bookmarks &&
        roadmaps.length
      ) {
        bookmarks = syncBackendRoadmapBookmarksToUnifiedList({
          userId,
          backendBookmarks: roadmapBookmarksResponse.data.bookmarks,
          roadmaps,
        });
      }

      const tracks = normalizeTrackCards(bookmarks, recommendations, roadmaps);
      journeyTrackCardsCache.set(cacheKey, {
        data: tracks,
        expiresAt: Date.now() + JOURNEY_TRACK_CARDS_CACHE_TTL_MS,
      });

      return tracks;
    })
    .finally(() => {
      journeyTrackCardsPromiseCache.delete(cacheKey);
    });

  journeyTrackCardsPromiseCache.set(cacheKey, nextRequest);
  return nextRequest;
}

export async function loadJourneySummaryForTrack(options: {
  track: JourneyTrackCard;
  userId?: string | null;
}): Promise<JourneyTrackSummary> {
  const { track, userId } = options;

  const emptyPhases = JOURNEY_PHASES.map((phase) => ({
    ...phase,
    progress: 0,
    completed: false,
  }));

  if (!userId) {
    const currentPhase = emptyPhases[0];
    const nextPhase = emptyPhases[1] || emptyPhases[0];

    return {
      track,
      phases: emptyPhases,
      overallProgress: 0,
      currentPhase,
      nextPhase,
      maxReached: 1,
      roadmapProgress: null,
    };
  }

  const [userSignals, roadmapProgress] = await Promise.all([
    getJourneyUserSignals(userId),
    loadTrackRoadmapProgress(userId, track.roadmapId),
  ]);

  const phases = computeJourneyPhases({
    track,
    roadmapProgressPercent: clampPercent(roadmapProgress?.completion_percent ?? 0),
    userSignals,
  });

  const overallProgress = clampPercent(
    phases.reduce((sum, phase) => sum + phase.progress, 0) / phases.length,
  );

  const currentPhase = phases.find((phase) => phase.progress < 100) || phases[4];
  const nextPhase = phases.find((phase) => phase.number === Math.min(5, currentPhase.number + 1)) || phases[4];
  const maxReached = computeMaxReachedPhase(phases);

  return {
    track,
    phases,
    overallProgress,
    currentPhase,
    nextPhase,
    maxReached,
    roadmapProgress,
  };
}

export function toProgressBucket(value: number): number {
  const clamped = Math.min(Math.max(value, 0), 100);
  const roundedToTen = Math.round(clamped / 10) * 10;
  return Math.min(100, Math.max(10, roundedToTen));
}

export function getTrackById(
  tracks: JourneyTrackCard[],
  trackId?: string | null,
): JourneyTrackCard | null {
  const targetId = normalizeTrackKey(trackId);
  if (!targetId) {
    return null;
  }

  return tracks.find((track) => normalizeTrackKey(track.id) === targetId) || null;
}

export function resolveRoadmapLevel(progressPercent: number): string {
  if (progressPercent >= 75) {
    return "Advanced";
  }

  if (progressPercent >= 40) {
    return "Intermediate";
  }

  return "Beginner";
}
