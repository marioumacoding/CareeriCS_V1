"use client";

import ChoiceCard from "@/components/ui/home/choice-card-home";
import { useEffect, useMemo, useState } from "react";
import { RecentActivityCard } from "@/components/ui/home/recent-activity";
import { JourneyProgressCard } from "@/components/ui/home/journey-progress-card";
import { PhaseCard } from "@/components/ui/home/phase-card";
import { CareerCardsContainer } from "@/components/ui/career-cards-container";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import {
  careerService,
  interviewService,
  jobService,
  roadmapService,
  skillAssessmentService,
} from "@/services";
import {
  COURSE_PROGRESS_UPDATED_EVENT,
  loadCourseProgress,
} from "@/lib/course-progress";
import {
  getUnifiedBookmarks,
  UNIFIED_BOOKMARKS_UPDATED_EVENT,
} from "@/lib/unified-bookmarks";
import { resolveUnifiedBookmarkHref } from "@/lib/bookmark-targets";
import {
  normalizeRoadmapListPayload,
  syncBackendRoadmapBookmarksToUnifiedList,
} from "@/lib/roadmap-bookmark-sync";
import {
  CAREER_FEATURE_ROUTE,
  buildCareerQuizResultsHref,
  buildCareerQuizSelectionHref,
  startCareerQuizSession,
} from "@/lib/career-quiz";
import { buildJobDetailsHref, mapApiJobToUiModel } from "@/lib/jobs";
import type { UnifiedBookmarkEntry } from "@/types";

type CareerCardItem = {
  key: string;
  title: string;
  desc: string;
  href?: string;
  buttonLabel?: string;
  type?: string;
  disabled?: boolean;
  onAction?: () => void;
};

type RecentActivityItem = {
  key: string;
  id: string;
  date: string;
  type: "career" | "skill" | "interview" | "course" | "job" | "file";
  score?: number;
  timestamp: number;
  href?: string | null;
  downloadUrl?: string | null;
};

const RECENT_ACTIVITY_PLACEHOLDER: RecentActivityItem[] = [
  {
    key: "placeholder",
    id: "No activity yet",
    date: "Complete a quiz, assessment, interview, course, or job application to see activity here",
    type: "file",
    timestamp: 0,
  },
];

function formatActivityDate(value: string, prefix: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return `Recently ${prefix.toLowerCase()}`;
  }

  return `${prefix} ${parsed.toLocaleDateString()}`;
}

function toTimestamp(value?: string | null): number {
  if (!value) {
    return 0;
  }

  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function getAssessmentActivityTitle(sessionType?: string): string {
  const normalized = sessionType?.toLowerCase();
  if (normalized === "skills" || normalized === "skill") {
    return "Skill Assessment";
  }

  if (normalized === "roadmap") {
    return "Roadmap Assessment";
  }

  if (normalized === "section") {
    return "Section Assessment";
  }

  if (normalized === "step") {
    return "Step Assessment";
  }

  return "Assessment Session";
}

function dedupeActivities(activities: RecentActivityItem[]): RecentActivityItem[] {
  const byKey = new Map<string, RecentActivityItem>();

  for (const activity of [...activities].sort((a, b) => b.timestamp - a.timestamp)) {
    if (!byKey.has(activity.key)) {
      byKey.set(activity.key, activity);
    }
  }

  return Array.from(byKey.values()).sort((a, b) => b.timestamp - a.timestamp);
}

function toProgressBucket(value: number): number {
  const clamped = Math.min(Math.max(value, 0), 100);
  const roundedToTen = Math.round(clamped / 10) * 10;
  return Math.min(100, Math.max(10, roundedToTen));
}

function toCurrentPhase(progress: number): number {
  if (progress >= 90) return 5;
  if (progress >= 70) return 4;
  if (progress >= 45) return 3;
  if (progress >= 20) return 2;
  return 1;
}

function getBookmarkKey(bookmark: UnifiedBookmarkEntry): string {
  return `${bookmark.kind}:${bookmark.entity_id}`;
}

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const userId = user?.id ?? null;

  const [projectActivities, setProjectActivities] = useState<RecentActivityItem[]>([]);
  const [selectedCareerKey, setSelectedCareerKey] = useState<string | null>(null);
  const [isStartingCareerQuiz, setIsStartingCareerQuiz] = useState(false);
  const [careerQuizError, setCareerQuizError] = useState<string | null>(null);
  const [activityRefreshNonce, setActivityRefreshNonce] = useState(0);
  const [bookmarkRefreshNonce, setBookmarkRefreshNonce] = useState(0);

  const handleContinue = (career: CareerCardItem) => {
    setSelectedCareerKey(career.key);
  };

  const bookmarks = useMemo(() => {
    if (isAuthLoading) {
      return [];
    }

    return getUnifiedBookmarks(userId);
  }, [bookmarkRefreshNonce, isAuthLoading, userId]);

  const handleStartCareerQuiz = async () => {
    if (isStartingCareerQuiz || isAuthLoading) {
      return;
    }

    if (!userId) {
      setCareerQuizError("Please sign in first to start the career quiz.");
      router.push(`/auth/login?redirect=${encodeURIComponent(CAREER_FEATURE_ROUTE)}`);
      return;
    }

    setCareerQuizError(null);
    setIsStartingCareerQuiz(true);

    try {
      const sessionId = await startCareerQuizSession(userId);
      router.push(buildCareerQuizSelectionHref(sessionId));
    } catch (error) {
      setCareerQuizError(
        error instanceof Error
          ? error.message
          : "Unable to start the career quiz right now. Please try again.",
      );
      setIsStartingCareerQuiz(false);
    }
  };

  useEffect(() => {
    const handleBookmarksUpdated = () => {
      if (!isAuthLoading) {
        setBookmarkRefreshNonce((previous) => previous + 1);
      }
    };

    window.addEventListener(UNIFIED_BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated as EventListener);
    window.addEventListener("storage", handleBookmarksUpdated);

    return () => {
      window.removeEventListener(
        UNIFIED_BOOKMARKS_UPDATED_EVENT,
        handleBookmarksUpdated as EventListener,
      );
      window.removeEventListener("storage", handleBookmarksUpdated);
    };
  }, [isAuthLoading]);

  useEffect(() => {
    if (isAuthLoading || !userId) {
      return;
    }

    let isCancelled = false;

    const syncRoadmapBookmarks = async () => {
      const [roadmapBookmarksResponse, roadmapListResponse] = await Promise.all([
        roadmapService.getUserRoadmapBookmarks(userId),
        roadmapService.listRoadmaps(),
      ]);

      if (isCancelled) {
        return;
      }

      if (
        !roadmapBookmarksResponse.success ||
        !roadmapBookmarksResponse.data?.bookmarks ||
        !roadmapListResponse.success
      ) {
        return;
      }

      syncBackendRoadmapBookmarksToUnifiedList({
        userId,
        backendBookmarks: roadmapBookmarksResponse.data.bookmarks,
        roadmaps: normalizeRoadmapListPayload(roadmapListResponse.data),
      });
    };

    void syncRoadmapBookmarks();

    return () => {
      isCancelled = true;
    };
  }, [isAuthLoading, userId]);

  useEffect(() => {
    const handleCourseProgressUpdated = () => {
      setActivityRefreshNonce((previous) => previous + 1);
    };

    window.addEventListener(
      COURSE_PROGRESS_UPDATED_EVENT,
      handleCourseProgressUpdated as EventListener,
    );

    return () => {
      window.removeEventListener(
        COURSE_PROGRESS_UPDATED_EVENT,
        handleCourseProgressUpdated as EventListener,
      );
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadProjectActivities = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!userId) {
        if (!isCancelled) {
          setProjectActivities([]);
        }
        return;
      }

      try {
        const [
          assessmentSessionsResponse,
          interviewSessionsResponse,
          careerSessionsResponse,
          jobApplicationsResponse,
        ] = await Promise.all([
          skillAssessmentService.getUserSessions(userId),
          interviewService.getUserSessions(userId),
          careerService.getUserSessions(userId),
          jobService.getAllUserApplications(userId),
        ]);

        const careerSessions = (careerSessionsResponse.success
          ? careerSessionsResponse.data ?? []
          : []
        )
          .filter((session) => session.status?.toLowerCase() === "submitted")
          .sort(
            (left, right) =>
              toTimestamp(right.submitted_at ?? right.started_at) -
              toTimestamp(left.submitted_at ?? left.started_at),
          );

        const careerResultsResponses = await Promise.all(
          careerSessions.map((session) => careerService.getCareerResults(session.id)),
        );

        const careerActivities = careerSessions.map((session, index) => {
          const activityDate = session.submitted_at ?? session.started_at ?? "";
          const resultsResponse = careerResultsResponses[index];
          const topTrack =
            resultsResponse.success && resultsResponse.data?.track_scores?.length
              ? resultsResponse.data.track_scores[0]
              : null;

          return {
            key: `career:${session.id}`,
            id: topTrack
              ? `Career Quiz: ${topTrack.track_name}`
              : "Career Quiz Completed",
            date: formatActivityDate(activityDate, "Completed on"),
            type: "career" as const,
            score:
              typeof topTrack?.score === "number"
                ? Math.min(Math.max(Math.round(topTrack.score), 0), 100)
                : undefined,
            timestamp: toTimestamp(activityDate),
            href: buildCareerQuizResultsHref(session.id, topTrack?.track_id),
          };
        });

        const assessmentActivities = (
          assessmentSessionsResponse.success ? assessmentSessionsResponse.data ?? [] : []
        )
          .filter((session) => session.status === "submitted")
          .map((session) => {
            const activityDate = session.submitted_at ?? session.started_at;
            const activityScore =
              typeof session.score === "number"
                ? Math.min(Math.max(Math.round(session.score), 0), 100)
                : undefined;

            return {
              key: `skill:${session.id}`,
              id: `${getAssessmentActivityTitle(session.type)} Completed`,
              date: formatActivityDate(activityDate, "Completed on"),
              type: "skill" as const,
              score: activityScore,
              timestamp: toTimestamp(activityDate),
              href: "/features/skill",
            };
          });

        const interviewActivities = (
          interviewSessionsResponse.success ? interviewSessionsResponse.data ?? [] : []
        )
          .filter((session) => session.status?.toLowerCase() === "completed")
          .map((session) => ({
            key: `interview:${session.id}`,
            id: `Interview: ${session.name}`,
            date: formatActivityDate(session.created_at ?? "", "Completed on"),
            type: "interview" as const,
            timestamp: toTimestamp(session.created_at),
            href: `/interview-feature/last-analysis?type=${encodeURIComponent(
              session.type || "hr",
            )}&sessionId=${encodeURIComponent(session.id)}&q=1`,
          }));

        const courseActivities = loadCourseProgress(user?.id).completed.map((course) => {
          const activityDate = course.completedAt ?? course.updatedAt ?? "";

          return {
            key: `course:${course.id}`,
            id: `Course Completed: ${course.title}`,
            date: formatActivityDate(activityDate, "Completed on"),
            type: "course" as const,
            timestamp: toTimestamp(activityDate),
            href: "/features/courses",
          };
        });

        const jobActivities = (
          jobApplicationsResponse.success ? (jobApplicationsResponse.data ?? []).map(mapApiJobToUiModel) : []
        )
          .filter((job) => Boolean(job.appliedAt))
          .map((job) => ({
            key: `job:${job.id}`,
            id: `Applied to ${job.title}`,
            date: formatActivityDate(job.appliedAt ?? "", "Applied on"),
            type: "job" as const,
            timestamp: toTimestamp(job.appliedAt),
            href: buildJobDetailsHref(job.id),
          }));

        const merged = dedupeActivities([
          ...careerActivities,
          ...assessmentActivities,
          ...interviewActivities,
          ...courseActivities,
          ...jobActivities,
        ]).slice(0, 5);

        if (!isCancelled) {
          setProjectActivities(merged);
        }
      } catch {
        if (!isCancelled) {
          setProjectActivities([]);
        }
      }
    };

    void loadProjectActivities();

    return () => {
      isCancelled = true;
    };
  }, [activityRefreshNonce, isAuthLoading, userId]);

  const recentActivities = useMemo<RecentActivityItem[]>(() => {
    if (!projectActivities.length) {
      return RECENT_ACTIVITY_PLACEHOLDER;
    }

    return projectActivities;
  }, [projectActivities]);

  const careerData: CareerCardItem[] = useMemo(() => {
    if (bookmarks.length > 0) {
      return bookmarks.map((bookmark) => {
        const href = resolveUnifiedBookmarkHref(bookmark);
        const bookmarkKey = getBookmarkKey(bookmark);

        return {
          key: bookmarkKey,
          title: bookmark.title,
          desc:
            bookmark.kind === "roadmap"
              ? bookmark.description || "Continue your roadmap journey."
              : bookmark.description || `Match score: ${bookmark.score ?? 0}%`,
          href,
          buttonLabel:
            bookmark.kind === "roadmap"
              ? "Continue"
              : "Learn More",
          onAction: () => {
            router.push(href);
          },
        };
      });
    }

    return [
      {
        key: "career-quiz-empty-state",
        title: "No Bookmarks Yet",
        desc: "Take the career quiz to generate your first recommendation and roadmap.",
        buttonLabel: isStartingCareerQuiz ? "Starting..." : "Take Quiz",
        type: "bookmark",
        disabled: isStartingCareerQuiz || isAuthLoading,
        onAction: () => {
          void handleStartCareerQuiz();
        },
      },
    ];
  }, [bookmarks, handleStartCareerQuiz, isAuthLoading, isStartingCareerQuiz, router]);

  const activeSelectedCareerKey = selectedCareerKey ?? careerData[0]?.key ?? null;

  const selectedBookmark = useMemo(() => {
    if (!activeSelectedCareerKey) {
      return null;
    }

    return (
      bookmarks.find((bookmark) => getBookmarkKey(bookmark) === activeSelectedCareerKey) || null
    );
  }, [activeSelectedCareerKey, bookmarks]);

  const dashboardData = useMemo(() => {
    const selectedScore =
      selectedBookmark?.kind === "career" && typeof selectedBookmark.score === "number"
        ? selectedBookmark.score
        : 10;

    const progress = toProgressBucket(selectedScore);
    const currentPhase = toCurrentPhase(progress);
    const nextPhase = Math.min(5, currentPhase + 1);

    if (!selectedBookmark) {
      return {
        activities: recentActivities,
        progress: 10,
        currentPhase: 1,
        nextPhase: 2,
        nextPhaseDesc: "Take the quiz or save a roadmap to see your next phase details.",
      };
    }

    return {
      activities: recentActivities,
      progress,
      currentPhase,
      nextPhase,
      nextPhaseDesc: selectedBookmark.description ?? "No next phase description available.",
    };
  }, [recentActivities, selectedBookmark]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "grid",
        gridTemplateColumns: "1.3fr 1.3fr 1.3fr 0.7fr 0.9fr",
        gridTemplateRows: "1.4fr 1.4fr 0.7fr 0.9fr",
        gridColumnGap: "25px",
        gridRowGap: "20px",
      }}
    >
      <CareerCardsContainer
        Title="Your Careers"
        style={{ gridArea: "1 / 1 / 3 / 4" }}
      >
        {careerQuizError ? (
          <p
            style={{
              margin: "0 0 1rem 0",
              color: "#FFD3D3",
              fontFamily: "var(--font-jura)",
              fontSize: "0.95rem",
            }}
          >
            {careerQuizError}
          </p>
        ) : null}

        {careerData.map((career) => (
          <ChoiceCard
            key={career.key}
            isSelected={activeSelectedCareerKey === career.key}
            title={career.title}
            image={`/landing/Rectangle.svg`}
            description={career.desc}
            buttonLabel={career.buttonLabel}
            blogPath={career.href}
            onClick={() => handleContinue(career)}
            type={career.type || ""}
            disabled={career.disabled}
            onAction={career.onAction}
          />
        ))}
      </CareerCardsContainer>

      <RecentActivityCard
        activities={dashboardData.activities}
        style={{ gridArea: "1 / 4 / 3 / 6" }}
      />

      <JourneyProgressCard
        percentage={dashboardData.progress}
        style={{ gridArea: "3 / 1 / 5 / 2" }}
      />

      <PhaseCard
        type="current"
        phaseNumber={String(dashboardData.currentPhase)}
        style={{ gridArea: "3 / 2 / 5 / 2" }}
      />

      <PhaseCard
        type="next"
        phaseNumber={String(dashboardData.nextPhase)}
        desc={dashboardData.nextPhaseDesc || "No next phase description available."}
        style={{ gridArea: "3 / 3 / 5 / 6" }}
      />
    </div>
  );
}
