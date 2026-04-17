"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { buildSectionProgressMap } from "@/app/features/roadmap/utils";
import JourneyButton from "@/components/ui/journey-button";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type {
  CurrentRoadmapLearning,
  RoadmapListItem,
  RoadmapProgressSummary,
  RoadmapRead,
} from "@/types";
import JourneyRoadmapCanvas from "./components/journey-roadmap-canvas";

const COURSES = [
  {
    topic: "Frontend Basics",
    courses: [
      { name: "HTML Fundamentals", org: "FreeCodeCamp" },
      { name: "CSS Layouts", org: "Coursera" },
      { name: "JavaScript Basics", org: "Udemy" },
      { name: "Responsive Design", org: "Meta" },
    ],
  },
  {
    topic: "React",
    courses: [
      { name: "React Fundamentals", org: "Meta" },
      { name: "React Hooks", org: "Scrimba" },
      { name: "State Management", org: "Frontend Masters" },
    ],
  },
];

function resolveCurrentLevel(progressPercent: number): "Beginner" | "Intermediate" | "Advanced" | "Expert" {
  if (progressPercent >= 90) {
    return "Expert";
  }

  if (progressPercent >= 60) {
    return "Advanced";
  }

  if (progressPercent >= 30) {
    return "Intermediate";
  }

  return "Beginner";
}

function normalizeRoadmapListPayload(payload: unknown): RoadmapListItem[] {
  if (Array.isArray(payload)) {
    return payload as RoadmapListItem[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "roadmaps" in payload &&
    Array.isArray((payload as { roadmaps: unknown }).roadmaps)
  ) {
    return (payload as { roadmaps: RoadmapListItem[] }).roadmaps;
  }

  return [];
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function findRoadmapMatchByCareer(
  careerName: string,
  roadmaps: RoadmapListItem[],
): RoadmapListItem | null {
  const target = normalizeText(careerName);
  if (!target) {
    return null;
  }

  const targetTokens = target.split(" ").filter(Boolean);
  let best: { roadmap: RoadmapListItem; score: number } | null = null;

  for (const roadmap of roadmaps) {
    const title = normalizeText(roadmap.title);
    if (!title) {
      continue;
    }

    if (title === target) {
      return roadmap;
    }

    let score = 0;
    const hasBroadTextMatch = title.includes(target) || target.includes(title);
    if (hasBroadTextMatch) {
      score += 70;
    }

    const titleTokens = title.split(" ").filter(Boolean);

    let overlap = 0;
    for (const token of targetTokens) {
      let matchedToken = false;

      for (const titleToken of titleTokens) {
        if (token === titleToken) {
          overlap += 1;
          matchedToken = true;
          break;
        }

        if (
          token.length >= 5 &&
          titleToken.length >= 5 &&
          (token.startsWith(titleToken) || titleToken.startsWith(token))
        ) {
          overlap += 1;
          matchedToken = true;
          break;
        }
      }

      if (matchedToken) {
        continue;
      }
    }

    score += overlap * 10;

    const minTokenOverlap = targetTokens.length >= 2 ? 2 : 1;
    if (!hasBroadTextMatch && overlap < minTokenOverlap) {
      continue;
    }

    if (score < 20) {
      continue;
    }

    if (!best || score > best.score) {
      best = { roadmap, score };
    }
  }

  return best?.roadmap ?? null;
}
function resolveInitialSectionId(
  roadmap: RoadmapRead | null,
  progressSummary: RoadmapProgressSummary | null,
  preferredSectionId?: string | null,
): string | null {
  if (!roadmap) {
    return null;
  }

  const orderedSections = roadmap.sections.slice().sort((a, b) => a.order - b.order);
  const orderedSectionsWithSteps = orderedSections.filter((section) => section.steps.length > 0);
  const fallbackSection = orderedSectionsWithSteps[0] ?? orderedSections[0] ?? null;

  if (!fallbackSection) {
    return null;
  }

  if (
    preferredSectionId &&
    orderedSections.some((section) => section.id === preferredSectionId)
  ) {
    return preferredSectionId;
  }

  const inProgressSection = progressSummary?.sections.find(
    (section) => section.completion_status === "in_progress",
  );

  if (
    inProgressSection &&
    orderedSections.some((section) => section.id === inProgressSection.section_id)
  ) {
    return inProgressSection.section_id;
  }

  return fallbackSection.id;
}

export default function JourneyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();
  const requestedCareer = (searchParams.get("career") ?? "").trim();

  const [currentLearning, setCurrentLearning] = useState<CurrentRoadmapLearning | null>(null);
  const [currentRoadmap, setCurrentRoadmap] = useState<RoadmapRead | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgressSummary | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [isRoadmapLoading, setIsRoadmapLoading] = useState(true);
  const [roadmapMessage, setRoadmapMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let cancelled = false;

    const loadJourneyData = async () => {
      if (!user?.id) {
        setCurrentLearning(null);
        setCurrentRoadmap(null);
        setRoadmapProgress(null);
        setSelectedSectionId(null);
        setRoadmapMessage("Please sign in to view your current roadmap.");
        setIsRoadmapLoading(false);
        return;
      }

      setIsRoadmapLoading(true);
      setRoadmapMessage(null);

      let roadmapIdToLoad: string | null = null;
      let preferredSectionId: string | null = null;
      let fallbackProgressPercent = 0;
      let requestedRoadmapLearning: CurrentRoadmapLearning | null = null;

      if (requestedCareer) {
        const byTitleResponse = await roadmapService.getRoadmapByTitle(requestedCareer);

        if (cancelled) {
          return;
        }

        if (byTitleResponse.success && byTitleResponse.data?.id) {
          roadmapIdToLoad = byTitleResponse.data.id;
        } else {
          const roadmapListResponse = await roadmapService.listRoadmaps();

          if (cancelled) {
            return;
          }

          if (roadmapListResponse.success) {
            const roadmapList = normalizeRoadmapListPayload(roadmapListResponse.data);
            const matchedRoadmap = findRoadmapMatchByCareer(requestedCareer, roadmapList);
            roadmapIdToLoad = matchedRoadmap?.id ?? null;
          }
        }

        if (!roadmapIdToLoad) {
          setCurrentLearning(null);
          setCurrentRoadmap(null);
          setRoadmapProgress(null);
          setSelectedSectionId(null);
          setRoadmapMessage(
            `No roadmap matched ${requestedCareer} yet. Please pick one from Roadmaps.`,
          );
          setIsRoadmapLoading(false);
          return;
        }
      }

      if (!roadmapIdToLoad) {
        const currentLearningResponse = await roadmapService.getCurrentRoadmapLearning(user.id);

        if (cancelled) {
          return;
        }

        if (!currentLearningResponse.success || !currentLearningResponse.data?.roadmap_id) {
          setCurrentLearning(null);
          setCurrentRoadmap(null);
          setRoadmapProgress(null);
          setSelectedSectionId(null);
          setRoadmapMessage(
            currentLearningResponse.message ??
              "No active roadmap found. Start one from the Roadmaps page.",
          );
          setIsRoadmapLoading(false);
          return;
        }

        const learning = currentLearningResponse.data;
        roadmapIdToLoad = learning.roadmap_id;
        preferredSectionId = learning.section_id ?? null;
        fallbackProgressPercent = learning.progress_percent ?? 0;
        setCurrentLearning(learning);
      } else {
        const scopedLearningResponse = await roadmapService.getCurrentRoadmapLearning(
          user.id,
          roadmapIdToLoad,
        );

        if (cancelled) {
          return;
        }

        if (scopedLearningResponse.success && scopedLearningResponse.data) {
          requestedRoadmapLearning = scopedLearningResponse.data;
          preferredSectionId = scopedLearningResponse.data.section_id ?? preferredSectionId;
          fallbackProgressPercent = scopedLearningResponse.data.progress_percent ?? fallbackProgressPercent;
          setCurrentLearning(scopedLearningResponse.data);
        } else {
          setCurrentLearning(null);
        }
      }

      const [roadmapResponse, progressResponse] = await Promise.all([
        roadmapService.getRoadmapById(roadmapIdToLoad),
        roadmapService.getRoadmapProgress(roadmapIdToLoad, user.id),
      ]);

      if (cancelled) {
        return;
      }

      if (!roadmapResponse.success) {
        setCurrentRoadmap(null);
        setRoadmapProgress(null);
        setSelectedSectionId(null);
        setRoadmapMessage(
          roadmapResponse.message ?? "Unable to load your current roadmap details.",
        );
        setIsRoadmapLoading(false);
        return;
      }

      const loadedRoadmap = roadmapResponse.data;
      const loadedProgress = progressResponse.success ? progressResponse.data : null;

      if (!preferredSectionId && loadedProgress) {
        const inProgressSection = loadedProgress.sections.find(
          (section) => section.completion_status === "in_progress",
        );
        preferredSectionId = inProgressSection?.section_id ?? null;
      }

      const resolvedSectionId = resolveInitialSectionId(
        loadedRoadmap,
        loadedProgress,
        preferredSectionId,
      );

      const resolvedSectionTitle = loadedRoadmap.sections.find(
        (section) => section.id === resolvedSectionId,
      )?.title;

      if (requestedCareer && !requestedRoadmapLearning) {
        setCurrentLearning({
          roadmap_id: loadedRoadmap.id,
          roadmap_title: loadedRoadmap.title,
          section_id: resolvedSectionId,
          section_title: resolvedSectionTitle ?? null,
          step_id: null,
          step_title: null,
          progress_percent: loadedProgress?.completion_percent ?? fallbackProgressPercent,
        });
      }

      setCurrentRoadmap(loadedRoadmap);
      setRoadmapProgress(loadedProgress);
      setSelectedSectionId(resolvedSectionId);
      setIsRoadmapLoading(false);
    };

    void loadJourneyData();

    return () => {
      cancelled = true;
    };
  }, [isAuthLoading, requestedCareer, user?.id]);

  const progressBySectionId = useMemo(
    () => buildSectionProgressMap(roadmapProgress),
    [roadmapProgress],
  );

  const totalSectionsFromRoadmap = useMemo(
    () => currentRoadmap?.sections.length ?? 0,
    [currentRoadmap],
  );

  const totalStepsFromRoadmap = useMemo(
    () =>
      currentRoadmap?.sections.reduce((total, section) => total + section.steps.length, 0) ?? 0,
    [currentRoadmap],
  );

  const completionPercent = Math.round(
    roadmapProgress?.completion_percent ?? currentLearning?.progress_percent ?? 0,
  );
  const currentLevel = resolveCurrentLevel(completionPercent);

  const completedSections = roadmapProgress?.completed_sections ?? 0;
  const totalSections = roadmapProgress?.total_sections ?? totalSectionsFromRoadmap;
  const completedSteps = roadmapProgress?.completed_steps ?? 0;
  const totalSteps = roadmapProgress?.total_steps ?? totalStepsFromRoadmap;

  const selectedSectionTitle = useMemo(() => {
    if (!currentRoadmap || !selectedSectionId) {
      return currentLearning?.section_title ?? "No active section";
    }

    const section = currentRoadmap.sections.find((item) => item.id === selectedSectionId);
    return section?.title ?? currentLearning?.section_title ?? "No active section";
  }, [currentLearning?.section_title, currentRoadmap, selectedSectionId]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        gap: "1vh",
        minWidth: 0,
      }}
    >
      <div
        style={{
        width: "clamp(240px, 26.25vw, 345px)",  
                flexShrink: 0,
          height: "fit-content",
          paddingInline: "10px",
          display: "block",
        }}
      >
        <h1 style={{ color: "white", fontSize: "24px", marginBottom: "2vh" }}>
          Quick Stats
        </h1>

        <div
          style={{
            width: "100%",
            backgroundColor: "#1C427B",
            borderRadius: "4vh",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "1vh",
          }}
        >
          <h1 style={{ color: "white", marginBottom: "0.6vh" }}>Current Level</h1>

          <div style={{ display: "flex", alignItems: "stretch", gap: "1vh" }}>
            <div
              style={{
                width: "1vh",
                backgroundColor: "#E6FFB2",
                borderRadius: "1vh",
              }}
            />
            <h1 style={{ color: "white", margin: 0 }}>{currentLevel}</h1>
          </div>

          <p
            style={{
              color: "#C9D5F1",
              margin: "0.3vh 0 0 0",
              fontSize: "13px",
              lineHeight: 1.35,
            }}
          >
            {currentLearning?.roadmap_title ?? "No active roadmap"}
          </p>
          <p
            style={{
              color: "#C9D5F1",
              margin: "0 0 1.2vh 0",
              fontSize: "12px",
              lineHeight: 1.35,
            }}
          >
            Current section: {selectedSectionTitle}
          </p>

          <h1 style={{ color: "white", marginTop: "1.4vh" }}>Roadmap Progress</h1>

          <div
            style={{
              width: "100%",
              height: "2vh",
              backgroundColor: "#131F3F",
              borderRadius: "1vh",
            }}
          >
            <div
              style={{
                width: `${Math.min(Math.max(completionPercent, 0), 100)}%`,
                height: "100%",
                backgroundColor: "#E6FFB2",
                borderRadius: "1vh",
                transition: "width 240ms ease",
              }}
            />
          </div>

          <p style={{ color: "#E6FFB2", margin: "0.5vh 0 0 0", fontSize: "13px" }}>
            {completionPercent}% complete
          </p>

          <div style={{ display: "flex", gap: "1vh", marginTop: "2vh" }}>
            <div
              style={{
                width: "1vh",
                backgroundColor: "#E6FFB2",
                borderRadius: "1vh",
              }}
            />
            <div>
              <h1 style={{ color: "#E6FFB2", margin: 0, fontSize: "24px" }}>
                {completedSections}/{totalSections}
              </h1>
              <h1 style={{ color: "white", margin: 0 }}>Completed Sections</h1>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1vh", marginTop: "2vh" }}>
            <div
              style={{
                width: "1vh",
                backgroundColor: "#FFB2B2",
                borderRadius: "1vh",
              }}
            />
            <div>
              <h1 style={{ color: "#FFB2B2", margin: 0, fontSize: "24px" }}>
                {completedSteps}/{totalSteps}
              </h1>
              <h1 style={{ color: "white", margin: 0 }}>Completed Steps</h1>
            </div>
          </div>
        </div>

        <div>
          <h1
            style={{
              color: "white",
              fontSize: "24px",
              marginTop: "3vh",
              marginBottom: "2vh",
            }}
          >
            Test Your Skills
          </h1>

          <JourneyButton
            course="Take Assessment"
            icon="/sidebar/CV.svg"
            onClick={() => router.push("/features/skill")}
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          minWidth: 0,
          height: "100%",
          paddingInline: "10px",
        }}
      >
        <h1 style={{ color: "white", fontSize: "24px", marginBottom: "2vh" }}>
          Roadmap
        </h1>

        <div
          style={{
            width: "100%",
            height: "clamp(240px, 38vh, 340px)",
            backgroundColor: "#C1CBE6",
            borderRadius: "4vh",
            padding: "14px",
          }}
        >
          {isRoadmapLoading ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "3vh",
                backgroundColor: "#16386D",
                color: "#EFF4FF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "16px",
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              Loading your current roadmap...
            </div>
          ) : null}

          {!isRoadmapLoading && currentRoadmap ? (
            <JourneyRoadmapCanvas
              roadmap={currentRoadmap}
              progressBySectionId={progressBySectionId}
              selectedSectionId={selectedSectionId}
              onSelectSection={setSelectedSectionId}
              emptyMessage="No sections available in this roadmap yet."
            />
          ) : null}

          {!isRoadmapLoading && !currentRoadmap ? (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "3vh",
                backgroundColor: "#16386D",
                color: "#EFF4FF",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1.5vh",
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              <p style={{ margin: 0, maxWidth: "50ch", lineHeight: 1.45 }}>
                {roadmapMessage ?? "No active roadmap found yet."}
              </p>
              <button
                type="button"
                onClick={() => router.push("/features/roadmap")}
                style={{
                  border: "none",
                  borderRadius: "999px",
                  backgroundColor: "#E6FFB2",
                  color: "#101C3A",
                  padding: "10px 18px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Explore Roadmaps
              </button>
            </div>
          ) : null}
        </div>

        {COURSES.map((topicItem, topicIndex) => (
          <div key={topicIndex}>
            <h1
              style={{
                color: "white",
                fontSize: "24px",
                marginTop: "3vh",
                marginBottom: "2vh",
              }}
            >
              Courses - {topicItem.topic}
            </h1>

            <div
              style={{
                width: "100%",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "4vh",
              }}
            >
              {topicItem.courses.map((course, courseIndex) => (
                <JourneyButton
                  key={courseIndex}
                  course={course.name}
                  organization={course.org}
                  icon="/interview/download.svg"
                  variant="secondary"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}