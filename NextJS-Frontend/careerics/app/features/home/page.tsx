"use client";

import ChoiceCard from "@/components/ui/choice-card-home";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CareersCard, RecentActivityCard, JourneyProgressCard, NextPhaseCard, CurrentPhaseCard } from "@/components/ui/dashboardCards";
import { useAuth } from "@/providers/auth-provider";
import { careerService, interviewService, reportsService, skillAssessmentService } from "@/services";
import {
  getUnifiedBookmarks,
  UNIFIED_BOOKMARKS_UPDATED_EVENT,
} from "@/lib/unified-bookmarks";
import type { UnifiedBookmarkEntry } from "@/types";

type CareerCardItem = {
  title: string;
  desc: string;
  href?: string;
  buttonLabel?: string;
  tag?: string;
  type?: string;
};

type RecentActivityItem = {
  id: string;
  date: string;
  type: "career" | "roadmap" | "file";
  score?: number;
  timestamp: number;
};

const RECENT_ACTIVITY_PLACEHOLDER: RecentActivityItem[] = [
  {
    id: "No activity yet",
    date: "Complete actions across CareeriCS to see activity here",
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
    return "Skills Assessment";
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

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<UnifiedBookmarkEntry[]>([]);
  const [projectActivities, setProjectActivities] = useState<RecentActivityItem[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const handleContinue = (career: CareerCardItem) => {
    setSelectedCareer(career.title);
  };

  const activeSelectedCareer = selectedCareer ?? bookmarks[0]?.title ?? null;
  const selectedBookmark = useMemo(() => {
    return bookmarks.find((bookmark) => bookmark.title === activeSelectedCareer) || null;
  }, [activeSelectedCareer, bookmarks]);

  const recentActivities = useMemo<RecentActivityItem[]>(() => {
    const bookmarkActivities = bookmarks.map((bookmark) => {
      const activityScore =
        bookmark.kind === "career" && typeof bookmark.score === "number"
          ? Math.min(Math.max(Math.round(bookmark.score), 0), 100)
          : undefined;

      return {
        id: bookmark.title,
        date: formatActivityDate(bookmark.saved_at, "Saved on"),
        type: bookmark.kind,
        score: activityScore,
        timestamp: toTimestamp(bookmark.saved_at),
      };
    });

    const mergedActivities = [...bookmarkActivities, ...projectActivities]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);

    if (!mergedActivities.length) {
      return RECENT_ACTIVITY_PLACEHOLDER;
    }

    return mergedActivities;
  }, [bookmarks, projectActivities]);

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
        nextPhaseDesc: "Select a career or roadmap to see next phase details.",
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

  useEffect(() => {
    let isCancelled = false;

    const loadProjectActivities = async () => {
      if (isAuthLoading) {
        return;
      }

      if (!user?.id) {
        if (!isCancelled) {
          setProjectActivities([]);
        }
        return;
      }

      try {
        const reportRequests = [
          { type: "cv" as const, label: "CV Report" },
          { type: "interview_session" as const, label: "Interview Report" },
          { type: "skill_assessment" as const, label: "Assessment Report" },
          { type: "other" as const, label: "Project Report" },
        ];

        const [
          reportResponses,
          assessmentSessionsResponse,
          interviewSessionsResponse,
          careerSessionsResponse,
        ] = await Promise.all([
          Promise.all(
            reportRequests.map((request) => reportsService.listUserReports(user.id, request.type)),
          ),
          skillAssessmentService.getUserSessions(user.id),
          interviewService.getUserSessions(user.id),
          careerService.getUserSessions(user.id),
        ]);

        const reportActivities = reportResponses.flatMap((response, index) => {
          const { label } = reportRequests[index];
          const reports = response.success ? response.data ?? [] : [];

          return reports.map((report) => ({
            id: `${label}: ${report.filename}`,
            date: formatActivityDate(report.created_at, "Generated on"),
            type: "file" as const,
            timestamp: toTimestamp(report.created_at),
          }));
        });

        const assessmentActivities = (
          assessmentSessionsResponse.success ? assessmentSessionsResponse.data ?? [] : []
        )
          .filter((session) => session.status === "submitted")
          .map((session) => {
            const activityTimestamp = toTimestamp(session.submitted_at ?? session.started_at);
            const activityScore =
              typeof session.score === "number"
                ? Math.min(Math.max(Math.round(session.score), 0), 100)
                : undefined;

            return {
              id: getAssessmentActivityTitle(session.type),
              date: formatActivityDate(
                session.submitted_at ?? session.started_at,
                "Submitted on",
              ),
              type: "file" as const,
              score: activityScore,
              timestamp: activityTimestamp,
            };
          });

        const interviewActivities = (
          interviewSessionsResponse.success ? interviewSessionsResponse.data ?? [] : []
        ).map((session) => {
          const normalizedStatus = session.status?.toLowerCase();
          const datePrefix =
            normalizedStatus === "completed"
              ? "Completed on"
              : normalizedStatus === "cancelled"
                ? "Cancelled on"
                : "Started on";

          return {
            id: `Interview Session: ${session.name}`,
            date: formatActivityDate(session.created_at ?? "", datePrefix),
            type: "file" as const,
            timestamp: toTimestamp(session.created_at),
          };
        });

        const careerActivities = (
          careerSessionsResponse.success ? careerSessionsResponse.data ?? [] : []
        ).map((session) => {
          const normalizedStatus = session.status?.toLowerCase();
          const isSubmitted = normalizedStatus === "submitted";
          const activityDate = isSubmitted
            ? session.submitted_at ?? session.started_at ?? ""
            : session.started_at ?? session.submitted_at ?? "";

          return {
            id: isSubmitted ? "Career Quiz Submitted" : "Career Quiz Session Started",
            date: formatActivityDate(activityDate, isSubmitted ? "Submitted on" : "Started on"),
            type: "file" as const,
            timestamp: toTimestamp(activityDate),
          };
        });

        const merged = [
          ...reportActivities,
          ...assessmentActivities,
          ...interviewActivities,
          ...careerActivities,
        ].sort((a, b) => b.timestamp - a.timestamp);

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
  }, [isAuthLoading, user?.id]);

  const loadBookmarks = useCallback(() => {
    if (isAuthLoading) {
      return;
    }

    setBookmarks(getUnifiedBookmarks(user?.id));
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      loadBookmarks();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [loadBookmarks]);

  useEffect(() => {
    const handleBookmarksUpdated = () => {
      loadBookmarks();
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
  }, [loadBookmarks]);

  const careerData: CareerCardItem[] = useMemo(() => {
    if (bookmarks.length > 0) {
      return bookmarks.map((bookmark) => {
        if (bookmark.kind === "roadmap") {
          return {
            title: bookmark.title,
            desc: bookmark.description || "Continue your roadmap journey.",
            href: `/journey?career=${encodeURIComponent(bookmark.title)}`,
            buttonLabel: "Continue",
          };
        }

        return {
          title: bookmark.title,
          desc: bookmark.description || `Match score: ${bookmark.score ?? 0}%`,
          href: `/journey?career=${encodeURIComponent(bookmark.title)}`,
          buttonLabel: "Continue",
          tag: "Career Suggestion",
        };
      });
    }

    return [
      {
        title: "No Bookmarks Yet",
        desc: "Save roadmap or career suggestions and they will appear here.",
        href: "/features/roadmap",
        buttonLabel: "Explore",
        type: "bookmark",
      },
    ];
  }, [bookmarks]);

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
      <CareersCard
        careers={careerData}
        style={{ gridArea: "1 / 1 / 3 / 4" }}
      >
        {careerData.map((career) => (
          <ChoiceCard
            key={career.title}
            isSelected={activeSelectedCareer === career.title}
            title={career.title}
            image={`/landing/Rectangle.svg`}
            description={career.desc}
            buttonLabel={career.buttonLabel}
            blogPath={career.href}
            onClick={() => handleContinue(career)}
            type={career.type || ""}
          />
        ))}
      </CareersCard>

      <RecentActivityCard
        activities={dashboardData.activities}
        style={{ gridArea: "1 / 4 / 3 / 6" }}
      />

      <JourneyProgressCard
        percentage={dashboardData.progress}
        style={{ gridArea: "3 / 1 / 5 / 2" }}
      />

      <CurrentPhaseCard
        percentage={dashboardData.currentPhase}
        style={{ gridArea: "3 / 2 / 5 / 2" }}
      />

      <NextPhaseCard
        style={{ gridArea: "3 / 3 / 5 / 6" }}
        desc={dashboardData.nextPhaseDesc}
        phaseNumber={String(dashboardData.nextPhase)}
      />
    </div>
  );
}
