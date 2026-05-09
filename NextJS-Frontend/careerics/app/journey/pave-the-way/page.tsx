"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import JourneyButton from "@/components/ui/journey-button";
import JourneyTree from "@/components/ui/journey-tree";
import { StepFlow } from "@/components/ui/roadmap-flow";
import RoadmapProgress from "@/components/ui/roadmapProgress";
import { useJourneyPhase } from "@/hooks/use-journey-phase";
import { useAuth } from "@/providers/auth-provider";
import { buildJourneyPhaseHref, resolveRoadmapLevel } from "@/lib/journey";
import { enrollCourse } from "@/lib/course-progress";
import { roadmapService } from "@/services";
import type {
  RoadmapCoursesRead,
  RoadmapProgressSummary,
  RoadmapRead,
} from "@/types";

type CourseItem = {
  id: string;
  title: string;
  provider: string;
  url?: string | null;
};

export default function JourneyPaveTheWayPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    selectedTrack,
    maxReached,
    redirectPhase,
    isLoadingTracks,
    trackError,
  } = useJourneyPhase(2);

  const [roadmap, setRoadmap] = useState<RoadmapRead | null>(null);
  const [roadmapCourses, setRoadmapCourses] = useState<RoadmapCoursesRead | null>(null);
  const [roadmapProgress, setRoadmapProgress] = useState<RoadmapProgressSummary | null>(null);
  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [roadmapError, setRoadmapError] = useState<string | null>(null);

  useEffect(() => {
    if (!redirectPhase || !selectedTrack?.id) {
      return;
    }

    router.replace(buildJourneyPhaseHref(redirectPhase, selectedTrack.id));
  }, [redirectPhase, router, selectedTrack?.id]);

  useEffect(() => {
    let alive = true;

    const loadRoadmapData = async () => {
      if (!selectedTrack?.roadmapId) {
        setRoadmap(null);
        setRoadmapCourses(null);
        setRoadmapProgress(null);
        setRoadmapError(null);
        return;
      }

      setIsLoadingRoadmap(true);
      setRoadmapError(null);

      const [roadmapResponse, coursesResponse, progressResponse] = await Promise.all([
        roadmapService.getRoadmapById(selectedTrack.roadmapId),
        roadmapService.getRoadmapCourses(selectedTrack.roadmapId),
        user?.id
          ? roadmapService.getRoadmapProgress(selectedTrack.roadmapId, user.id)
          : Promise.resolve({ success: false, data: null, message: "" }),
      ]);

      if (!alive) {
        return;
      }

      if (!roadmapResponse.success || !roadmapResponse.data) {
        setRoadmap(null);
        setRoadmapCourses(null);
        setRoadmapProgress(null);
        setRoadmapError(roadmapResponse.message || "Unable to load roadmap details.");
        setIsLoadingRoadmap(false);
        return;
      }

      setRoadmap(roadmapResponse.data);
      setRoadmapCourses(coursesResponse.success ? coursesResponse.data || null : null);
      setRoadmapProgress(progressResponse.success ? progressResponse.data || null : null);
      if (!coursesResponse.success && coursesResponse.message) {
        setRoadmapError(coursesResponse.message);
      } else {
        setRoadmapError(null);
      }
      setIsLoadingRoadmap(false);
    };

    void loadRoadmapData();

    return () => {
      alive = false;
    };
  }, [selectedTrack?.roadmapId, user?.id]);

  const steps = !roadmap?.sections?.length
    ? []
    : roadmap.sections
        .slice()
        .sort((left, right) => left.order - right.order)
        .map((section) => ({
          label: section.title,
          href: section.id,
        }));

  const courses: CourseItem[] = (() => {
    if (!roadmapCourses?.sections?.length) {
      return [];
    }

    const unique = new Map<string, CourseItem>();
    for (const section of roadmapCourses.sections) {
      for (const course of section.courses) {
        if (!unique.has(course.id)) {
          unique.set(course.id, {
            id: course.id,
            title: course.title,
            provider: course.provider,
            url: course.url,
          });
        }
      }
    }

    return Array.from(unique.values()).slice(0, 12);
  })();

  const completionPercent = roadmapProgress?.completion_percent || 0;
  const completedTopics = roadmapProgress?.completed_steps || 0;
  const totalTopics = roadmapProgress?.total_steps || 0;
  const remainingTopics = Math.max(0, totalTopics - completedTopics);
  const currentLevel = resolveRoadmapLevel(completionPercent);

  const handleCourseClick = (course: CourseItem) => {
    enrollCourse(
      {
        id: course.id,
        title: course.title,
        provider: course.provider,
        url: course.url || null,
      },
      user?.id,
    );

    if (course.url) {
      window.open(course.url, "_blank", "noopener,noreferrer");
    }
  };

  if (!selectedTrack && !isLoadingTracks) {
    return (
      <JourneyTree
        current={2}
        maxReached={1}
        renderContent={() => (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "1rem",
              color: "white",
              textAlign: "center",
              padding: "40px",
            }}
          >
            <h1 style={{ margin: 0, fontSize: "1.5rem" }}>No Track Selected</h1>
            <p style={{ margin: 0, color: "#C1CBE6", maxWidth: "60ch" }}>
              Select a track from Home to unlock this phase and load roadmap learning data.
            </p>
            <button
              type="button"
              onClick={() => router.push("/features/home")}
              style={{
                border: "none",
                borderRadius: "2vh",
                backgroundColor: "var(--light-green)",
                color: "black",
                padding: "0.9rem 1.6rem",
                fontFamily: "var(--font-nova-square)",
                cursor: "pointer",
              }}
            >
              Back To Home
            </button>
          </div>
        )}
      />
    );
  }

  return (
    <JourneyTree
      current={2}
      maxReached={maxReached}
      resolvePhasePath={(phase) => buildJourneyPhaseHref(phase, selectedTrack?.id)}
      renderContent={() => (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 3fr",
            gridTemplateRows: "3fr 1fr",
            columnGap: "25px",
            rowGap: "20px",
            width: "100%",
            height: "100%",
            padding: "40px",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              gridArea: "1 / 1 / 2 / 2",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <h1 style={{ color: "white", margin: 0 }}>Quick Stats</h1>

            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "var(--medium-blue)",
                padding: "1rem",
                borderRadius: "4vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "left",
                boxSizing: "border-box",
              }}
            >
              <div>
                <h1 style={{ color: "white", marginBottom: "0.5rem", marginTop: 0 }}>Current Level</h1>
                <RoadmapProgress isTotal={false} isScore={false} text={currentLevel} />
              </div>

              <div>
                <h1 style={{ color: "white", marginBottom: "0.5rem", marginTop: 0 }}>Roadmap Progress</h1>

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
                      width: `${Math.max(0, Math.min(100, completionPercent))}%`,
                      height: "100%",
                      backgroundColor: "#E6FFB2",
                      borderRadius: "1vh",
                    }}
                  />
                </div>
              </div>

              <RoadmapProgress
                isTotal={false}
                done={String(completedTopics)}
                text="Completed Topics"
              />

              <RoadmapProgress
                isTotal={false}
                done={String(remainingTopics)}
                text="Remaining Topics"
                color="#FFB2B2"
              />
            </div>
          </div>

          <div
            style={{
              gridArea: "1 / 2 / 2 / 3",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "0.5rem",
              overflow: "hidden",
            }}
          >
            <h1 style={{ color: "white", margin: 0 }}>
              {selectedTrack?.title || "Track"} Roadmap
            </h1>

            <div
              style={{
                backgroundColor: "#C1CBE6",
                padding: "2rem",
                borderRadius: "4vh",
                minWidth: 0,
                minHeight: 0,
                overflowY: "auto",
                scrollbarWidth: "none",
                width: "100%",
                flex: 1,
                boxSizing: "border-box",
              }}
            >
              {isLoadingRoadmap ? (
                <p style={{ color: "black", margin: 0 }}>Loading roadmap...</p>
              ) : steps.length ? (
                <StepFlow
                  variant="dark"
                  steps={steps}
                  roadmapId={selectedTrack?.roadmapId || undefined}
                  selectedIndex={undefined}
                  onSelect={undefined}
                  routeOnClick={false}
                />
              ) : (
                <div style={{ color: "black" }}>
                  <p style={{ marginTop: 0 }}>
                    No roadmap sections are available for this track yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push("/features/roadmap")}
                    style={{
                      border: "none",
                      borderRadius: "2vh",
                      backgroundColor: "var(--medium-blue)",
                      color: "white",
                      padding: "0.7rem 1.2rem",
                      cursor: "pointer",
                      fontFamily: "var(--font-nova-square)",
                    }}
                  >
                    Open Roadmaps
                  </button>
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              gridArea: "2 / 1 / 3 / 2",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <h1 style={{ color: "white", margin: 0 }}>Test Your Skills</h1>

            <JourneyButton
              variant="sA"
              course="Start Assessment"
              style={{ width: "100%", height: "100%" }}
              onClick={() => router.push("/features/skill")}
            />
          </div>

          <div
            style={{
              gridArea: "2 / 2 / 3 / 3",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "0.5rem",
              overflow: "hidden",
              minWidth: 0,
              minHeight: 0,
            }}
          >
            <h1
              style={{
                color: "white",
                flexShrink: 0,
                margin: 0,
              }}
            >
              Courses
            </h1>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                overflowX: "auto",
                overflowY: "hidden",
                scrollbarWidth: "none",
                width: "100%",
                minWidth: 0,
                minHeight: 0,
                flex: 1,
                alignItems: "stretch",
              }}
            >
              {courses.length ? (
                courses.map((course) => (
                  <JourneyButton
                    key={course.id}
                    variant="courses"
                    course={course.title}
                    organization={course.provider}
                    onClick={() => handleCourseClick(course)}
                    style={{
                      flexShrink: 0,
                    }}
                  />
                ))
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "white",
                    opacity: 0.8,
                  }}
                >
                  {isLoadingRoadmap
                    ? "Loading courses..."
                    : "No courses are mapped to this roadmap yet."}
                </div>
              )}
            </div>
          </div>

          {trackError || roadmapError ? (
            <p
              style={{
                margin: 0,
                color: "#FFD3D3",
                position: "absolute",
                bottom: "16px",
                right: "24px",
                fontSize: "0.9rem",
              }}
            >
              {trackError || roadmapError}
            </p>
          ) : null}
        </div>
      )}
    />
  );
}
