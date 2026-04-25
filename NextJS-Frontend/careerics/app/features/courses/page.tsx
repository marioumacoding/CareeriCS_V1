"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { CardsContainer } from "@/components/ui/cards-container";
import { RectangularCard } from "@/components/ui/rectangular-card";
import { ActivityCard } from "@/components/ui/activity-card";
import CourseActionPopup from "@/components/ui/course-action-popup";
import { roadmapService } from "@/services";
import type { RoadmapListItem } from "@/types";
import {
  COURSE_PROGRESS_UPDATED_EVENT,
  completeCourse,
  DEFAULT_COMPLETED_COURSES,
  DEFAULT_CURRENT_COURSES,
  loadCourseProgress,
  type CourseProgressItem,
} from "@/lib/course-progress";

function LoadingState({ label }: { label: string }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        color: "#D7E3FF",
        fontFamily: "var(--font-jura)",
      }}
    >
      <LoaderCircle size={20} className="courses-spinner" />
      <span>{label}</span>
      <style jsx>{`
        .courses-spinner {
          animation: courses-spin 1s linear infinite;
        }
        @keyframes courses-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();

  const [selectedCourseId, setSelectedCourseId] = useState("html-beginner");
  const [currentCourses, setCurrentCourses] = useState<CourseProgressItem[]>(DEFAULT_CURRENT_COURSES);
  const [completedCourses, setCompletedCourses] = useState<CourseProgressItem[]>(DEFAULT_COMPLETED_COURSES);
  const [pendingCompletionCourse, setPendingCompletionCourse] = useState<CourseProgressItem | null>(null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState("");
  const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(true);
  const [roadmapsError, setRoadmapsError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    const loadRoadmaps = async () => {
      setIsLoadingRoadmaps(true);

      const response = await roadmapService.listRoadmaps();
      if (!alive) {
        return;
      }

      if (!response.success || !response.data) {
        setRoadmaps([]);
        setRoadmapsError(response.message || "Unable to load roadmaps right now.");
        setIsLoadingRoadmaps(false);
        return;
      }

      setRoadmaps(response.data);
      setSelectedRoadmapId((previous) => previous || response.data[0]?.id || "");
      setRoadmapsError(null);
      setIsLoadingRoadmaps(false);
    };

    void loadRoadmaps();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const syncCourseProgress = () => {
      const progress = loadCourseProgress();

      setCurrentCourses(progress.current);
      setCompletedCourses(progress.completed);
      setSelectedCourseId(progress.current[0]?.id || "html-beginner");
    };

    syncCourseProgress();

    const handleCourseProgressUpdated = () => {
      syncCourseProgress();
    };

    window.addEventListener(COURSE_PROGRESS_UPDATED_EVENT, handleCourseProgressUpdated as EventListener);
    window.addEventListener("storage", handleCourseProgressUpdated);

    return () => {
      window.removeEventListener(
        COURSE_PROGRESS_UPDATED_EVENT,
        handleCourseProgressUpdated as EventListener,
      );
      window.removeEventListener("storage", handleCourseProgressUpdated);
    };
  }, []);

  const handleCurrentCourseClick = (course: CourseProgressItem) => {
    setSelectedCourseId(course.id);
    setPendingCompletionCourse(course);
  };

  const confirmCompletion = () => {
    if (!pendingCompletionCourse) {
      return;
    }

    const progress = completeCourse(pendingCompletionCourse.id);
    setCurrentCourses(progress.current);
    setCompletedCourses(progress.completed);
    setSelectedCourseId(progress.current[0]?.id || "html-beginner");
    setPendingCompletionCourse(null);
  };

  const dynamicCurrentCourses = currentCourses.map((course) => ({
    ...course,
    completed: completedCourses.some((completed) => completed.id === course.id),
  }));

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(6,1fr)",
        gridTemplateRows: "repeat(6,1fr)",
        gridColumnGap: "25px",
        gridRowGap: "20px",
        height: "100%",
        width: "100%",
        padding: "40px",
      }}
    >
      <CardsContainer
        Title="Courses you are currently taking"
        variant="horizontal"
        style={{ gridArea: "1 /1 /3 /7", width: "100%" }}
      >
        {dynamicCurrentCourses.map((course) => (
          <RectangularCard
            key={course.id}
            Title={course.title}
            theme="light"
            variant="radio"
            subtext={`by ${course.provider}`}
            isSubtextVisible={true}
            selectable
            selected={selectedCourseId === course.id}
            onSelect={() => handleCurrentCourseClick(course)}
            style={{
              height: "100%",
            }}
          />
        ))}
      </CardsContainer>

      <CardsContainer
        Title="Discover roadmaps"
        Columns={3}
        variant="vertical"
        style={{ gridArea: "3 / 1 / 7 / 5", backgroundColor: "#142143" }}
      >
        {isLoadingRoadmaps ? <LoadingState label="Loading roadmaps..." /> : null}

        {!isLoadingRoadmaps && roadmapsError ? (
          <div
            style={{
              gridColumn: "1 / -1",
              color: "#FFD3D3",
              fontFamily: "var(--font-jura)",
              textAlign: "center",
              paddingInline: "20px",
            }}
          >
            {roadmapsError}
          </div>
        ) : null}

        {!isLoadingRoadmaps && !roadmapsError && !roadmaps.length ? (
          <div
            style={{
              gridColumn: "1 / -1",
              color: "#D7E3FF",
              fontFamily: "var(--font-jura)",
              textAlign: "center",
              paddingInline: "20px",
            }}
          >
            No roadmaps available yet.
          </div>
        ) : null}

        {!isLoadingRoadmaps && !roadmapsError
          ? roadmaps.map((roadmap) => (
              <RectangularCard
                key={roadmap.id}
                Title={roadmap.title}
                theme="dark"
                selectable
                selected={selectedRoadmapId === roadmap.id}
                onSelect={() => {
                  setSelectedRoadmapId(roadmap.id);
                  router.push(`/courses?roadmapId=${encodeURIComponent(roadmap.id)}`);
                }}
                style={{
                  width: "100%",
                }}
              />
            ))
          : null}
      </CardsContainer>

      <CardsContainer
        Title="Completed Courses"
        variant="vertical"
        Columns={1}
        style={{ gridArea: "3 / 5 / 7 / 7", width: "100%", backgroundColor: "#142143" }}
      >
        {completedCourses.map((course) => (
          <ActivityCard
            variant="retake"
            key={course.id}
            title={course.title}
            provider={course.provider}
          />
        ))}
      </CardsContainer>

      {pendingCompletionCourse ? (
        <CourseActionPopup
          mode="complete"
          courseTitle={pendingCompletionCourse.title}
          onConfirm={confirmCompletion}
          onCancel={() => setPendingCompletionCourse(null)}
        />
      ) : null}
    </div>
  );
}
