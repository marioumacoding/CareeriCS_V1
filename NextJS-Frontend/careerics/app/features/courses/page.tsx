"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import { CardsContainer } from "@/components/ui/cards-container";
import { RectangularCard } from "@/components/ui/rectangular-card";
import { ActivityCard } from "@/components/ui/activity-card";
import CourseActionPopup from "@/components/ui/course-action-popup";
import { CurrentCoursesCard } from "@/components/ui/courseCards";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type { RoadmapListItem } from "@/types";
import {
  COURSE_PROGRESS_UPDATED_EVENT,
  completeCourse,
  loadCourseProgress,
  retakeCourse as restartCourse,
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

function EmptyCoursesState({ label }: { label: string }) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#D7E3FF",
        fontFamily: "var(--font-jura)",
        textAlign: "center",
        padding: "0 24px",
      }}
    >
      {label}
    </div>
  );
}

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [currentCourses, setCurrentCourses] = useState<CourseProgressItem[]>([]);
  const [completedCourses, setCompletedCourses] = useState<CourseProgressItem[]>([]);
  const [pendingCompletionCourse, setPendingCompletionCourse] = useState<CourseProgressItem | null>(null);
  const [selectedRoadmapId, setSelectedRoadmapId] = useState("");
  const [roadmaps, setRoadmaps] = useState<RoadmapListItem[]>([]);
  const [isLoadingRoadmaps, setIsLoadingRoadmaps] = useState(false);
  const [roadmapsError, setRoadmapsError] = useState<string | null>(null);
  const [pendingRetakeCourse, setPendingRetakeCourse] = useState<CourseProgressItem | null>(null);

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
      const progress = loadCourseProgress(user?.id);

      setCurrentCourses(progress.current);
      setCompletedCourses(progress.completed);
      setSelectedCourseId((previous) => {
        if (progress.current.some((course) => course.id === previous)) {
          return previous;
        }

        return progress.current[0]?.id || "";
      });
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
  }, [user?.id]);

  const handleCurrentCourseClick = (course: CourseProgressItem) => {
    setSelectedCourseId(course.id);
    setPendingCompletionCourse(course);
  };

  const confirmCompletion = () => {
    if (!pendingCompletionCourse) {
      return;
    }

    const progress = completeCourse(pendingCompletionCourse.id, user?.id);
    setCurrentCourses(progress.current);
    setCompletedCourses(progress.completed);
    setSelectedCourseId(progress.current[0]?.id || "");
    setPendingCompletionCourse(null);
  };

  const handleContinueCurrentCourse = () => {
    if (pendingCompletionCourse?.url) {
      window.open(pendingCompletionCourse.url, "_blank", "noopener,noreferrer");
    }

    setPendingCompletionCourse(null);
  };

  const confirmRetake = (course: CourseProgressItem) => {
    const progress = restartCourse(course.id, user?.id);

    setCurrentCourses(progress.current);
    setCompletedCourses(progress.completed);
    setSelectedCourseId(course.id);
    setPendingRetakeCourse(null);

    if (course.url) {
      window.open(course.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr) repeat(2, 2fr)",
        gridTemplateRows: "1.5fr repeat(5, 1fr)",
        gridColumnGap: "25px",
        gridRowGap: "20px",
        height: "100%",
        width: "100%",
        padding: "40px",
      }}
    >
      {currentCourses.length ? (
        <CurrentCoursesCard
          courses={currentCourses.map((course) => ({
            id: course.id,
            title: course.title,
            provider: course.provider,
            completed: false,
          }))}
          selected={selectedCourseId}
          onSelect={(courseId) => {
            const course = currentCourses.find((item) => item.id === courseId);
            if (course) {
              handleCurrentCourseClick(course);
            }
          }}
          style={{ gridArea: "1 /1 /3 /5", width: "100%", height: "100%" }}
        />
      ) : (
        <div
          style={{
            gridArea: "1 /1 /3 /5",
            width: "100%",
            height: "100%",
            backgroundColor: "var(--medium-blue)",
            borderRadius: "4vh",
            padding: "20px 30px",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            boxSizing: "border-box",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              marginBottom: "15px",
              fontFamily: "var(--font-nova-square)",
              fontWeight: "200",
            }}
          >
            Courses you are currently taking
          </h3>
          <EmptyCoursesState label="You are not enrolled in any courses yet. Explore a roadmap to start learning." />
        </div>
      )}

      <CardsContainer
        Title="More fields to discover"
        Columns={3}
        variant="vertical"
        style={{ gridArea: "3 / 1 / 7 / 4", backgroundColor: "var(--dark-blue)" }}
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
        centerTitle
        style={{ gridArea: "3 / 4 / 7 / 5", width: "100%", backgroundColor: "var(--dark-blue)" }}
      >
        {completedCourses.length ? (
          completedCourses.map((course) => (
            <ActivityCard
              variant="retake"
              key={course.id}
              title={course.title}
              provider={course.provider}
              onClick={() => setPendingRetakeCourse(course)}
            />
          ))
        ) : (
          <EmptyCoursesState label="Complete a course and it will show up here." />
        )}
      </CardsContainer>

      {pendingCompletionCourse ? (
        <CourseActionPopup
          mode="complete"
          courseTitle={pendingCompletionCourse.title}
          courseOrg={pendingCompletionCourse.provider}
          onConfirm={confirmCompletion}
          onCancel={() => setPendingCompletionCourse(null)}
          onContinue={handleContinueCurrentCourse}
        />
      ) : null}

      {pendingRetakeCourse ? (
        <CourseActionPopup
          mode="retake"
          courseTitle={pendingRetakeCourse.title}
          courseOrg={pendingRetakeCourse.provider}
          onConfirm={() => confirmRetake(pendingRetakeCourse)}
          onCancel={() => setPendingRetakeCourse(null)}
        />
      ) : null}
    </div>
  );
}
