"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LoaderCircle } from "lucide-react";

import CourseActionPopup from "@/components/ui/course-action-popup";
import { CourseCards } from "@/components/ui/courseCards";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import {
  COURSE_PROGRESS_UPDATED_EVENT,
  completeCourse,
  enrollCourse,
  loadCourseProgress,
  type CourseProgressState,
} from "@/lib/course-progress";
import type { RoadmapCoursesRead } from "@/types";

function LoadingState({ label }: { label: string }) {
  return (
    <div
      style={{
        width: "100%",
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        color: "#D7E3FF",
        fontFamily: "var(--font-jura)",
      }}
    >
      <LoaderCircle size={22} className="course-page-spinner" />
      <span>{label}</span>
      <style jsx>{`
        .course-page-spinner {
          animation: course-page-spin 1s linear infinite;
        }
        @keyframes course-page-spin {
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

export default function CourseLibraryPage() {
  const searchParams = useSearchParams();
  const roadmapId = searchParams.get("roadmapId") || "";
  const { user } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [roadmapCourses, setRoadmapCourses] = useState<RoadmapCoursesRead | null>(null);
  const [courseProgress, setCourseProgress] = useState<CourseProgressState>({ current: [], completed: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activePopupMode, setActivePopupMode] = useState<"enroll" | "complete" | null>(null);
  const [activePopupCourse, setActivePopupCourse] = useState<
    RoadmapCoursesRead["sections"][number]["courses"][number] | null
  >(null);

  useEffect(() => {
    let alive = true;

    const loadRoadmapCourses = async () => {
      if (!roadmapId) {
        setRoadmapCourses(null);
        setError("Please choose a roadmap first.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const response = await roadmapService.getRoadmapCourses(roadmapId);
      if (!alive) {
        return;
      }

      if (!response.success || !response.data) {
        setRoadmapCourses(null);
        setError(response.message || "Unable to load roadmap courses right now.");
        setIsLoading(false);
        return;
      }

      setRoadmapCourses(response.data);
      setError(null);
      setIsLoading(false);
    };

    void loadRoadmapCourses();

    return () => {
      alive = false;
    };
  }, [roadmapId]);

  useEffect(() => {
    const syncCourseProgress = () => {
      setCourseProgress(loadCourseProgress(user?.id));
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

  const filteredSections = useMemo(() => {
    if (!roadmapCourses) {
      return [];
    }

    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return roadmapCourses.sections;
    }

    return roadmapCourses.sections
      .map((section) => ({
        ...section,
        courses: section.courses.filter((course) => {
          const haystack = `${course.title} ${course.provider} ${course.description || ""}`.toLowerCase();
          return haystack.includes(normalizedSearch);
        }),
      }))
      .filter((section) => section.courses.length > 0 || section.section_title.toLowerCase().includes(normalizedSearch));
  }, [roadmapCourses, searchTerm]);

  const courseStatusById: Partial<Record<string, "enrolled" | "completed">> = {};

  for (const course of courseProgress.current) {
    courseStatusById[course.id] = "enrolled";
  }

  for (const course of courseProgress.completed) {
    courseStatusById[course.id] = "completed";
  }

  const totalTopics = filteredSections.length;
  const totalCourses = filteredSections.reduce((acc, section) => acc + section.courses.length, 0);
  const completedCount = filteredSections.reduce(
    (acc, section) =>
      acc + section.courses.filter((course) => courseStatusById[course.id] === "completed").length,
    0,
  );

  const handleCourseClick = (course: RoadmapCoursesRead["sections"][number]["courses"][number]) => {
    if (courseStatusById[course.id] === "enrolled") {
      setActivePopupCourse(course);
      setActivePopupMode("complete");
      return;
    }

    if (courseStatusById[course.id] === "completed") {
      window.open(course.url, "_blank", "noopener,noreferrer");
      return;
    }

    window.open(course.url, "_blank", "noopener,noreferrer");
    setActivePopupCourse(course);
    setActivePopupMode("enroll");
  };

  const confirmEnrollment = () => {
    if (!activePopupCourse) {
      return;
    }

    const nextProgress = enrollCourse(
      {
        id: activePopupCourse.id,
        title: activePopupCourse.title,
        provider: activePopupCourse.provider,
        url: activePopupCourse.url,
      },
      user?.id,
    );

    setCourseProgress(nextProgress);
    setActivePopupMode("complete");
  };

  const confirmCompletion = () => {
    if (!activePopupCourse) {
      return;
    }

    const nextProgress = completeCourse(activePopupCourse.id, user?.id);
    setCourseProgress(nextProgress);
    setActivePopupCourse(null);
    setActivePopupMode(null);
  };

  const handleContinueCourse = () => {
    if (activePopupCourse?.url) {
      window.open(activePopupCourse.url, "_blank", "noopener,noreferrer");
    }

    setActivePopupCourse(null);
    setActivePopupMode(null);
  };

  if (isLoading) {
    return <LoadingState label="Loading courses..." />;
  }

  if (error) {
    return (
      <div
        style={{
          width: "100%",
          minHeight: "300px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#FFD3D3",
          fontFamily: "var(--font-jura)",
          textAlign: "center",
          padding: "20px 40px",
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        padding: "20px 40px",
        color: "white",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-nova-square)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "25px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "30px", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "24px", margin: 0 }}>
              {roadmapCourses?.roadmap_title || "Courses"}
            </h1>

            <div style={{ position: "relative", width: "280px" }}>
              <input
                type="text"
                placeholder="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "rgba(234, 18, 18, 0.05)",
                  border: "1px solid rgb(255, 255, 255)",
                  borderRadius: "20px",
                  padding: "8px 45px 8px 15px",
                  color: "white",
                  outline: "none",
                }}
              />
              <img
                src="/global/search.svg"
                alt="search"
                style={{
                  position: "absolute",
                  right: "5px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  width: "40px",
                  pointerEvents: "none",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "35px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "2px", height: "35px", backgroundColor: "#D4FF47" }} />
              <div>
                <span style={{ fontSize: "15px", fontWeight: "bold" }}>{totalTopics} topics</span>
                <br />
                <span style={{ fontSize: "11px", opacity: 0.6 }}>- by Top Courses</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "2px", height: "35px", backgroundColor: "#D4FF47" }} />
              <div>
                <span style={{ fontSize: "15px", fontWeight: "bold" }}>{totalCourses} courses</span>
                <br />
                <span style={{ fontSize: "11px", opacity: 0.6 }}>- by Top Courses</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: "#1E3A8A", padding: "20px 30px", borderRadius: "20px", minWidth: "170px" }}>
          <span style={{ fontSize: "13px", opacity: 0.8 }}>Courses Completed</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <div style={{ width: "3px", height: "40px", backgroundColor: "#D4FF47" }} />
            <h2 style={{ margin: 0, fontSize: "34px" }}>
              <span style={{ color: "#D4FF47" }}>{completedCount}</span>
              <span style={{ fontSize: "20px", opacity: 0.7 }}> /{totalCourses}</span>
            </h2>
          </div>
        </div>
      </div>

      <hr
        style={{
          border: "none",
          height: "1px",
          backgroundColor: "rgba(255,255,255,0.1)",
          marginBottom: "35px",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "45px" }}>
        {filteredSections.length ? (
          filteredSections.map((section) => (
            <div key={section.section_id}>
              <h3 style={{ fontSize: "20px", marginBottom: "40px", fontWeight: "400" }}>
                {section.section_title}:
              </h3>
              <CourseCards
                courses={section.courses}
                onCourseClick={handleCourseClick}
                statusByCourseId={courseStatusById}
              />
            </div>
          ))
        ) : (
          <div
            style={{
              color: "#D7E3FF",
              fontFamily: "var(--font-jura)",
              textAlign: "center",
              paddingBottom: "20px",
            }}
          >
            No courses matched your search.
          </div>
        )}
      </div>

      {activePopupCourse && activePopupMode ? (
        <CourseActionPopup
          mode={activePopupMode}
          courseTitle={activePopupCourse.title}
          courseOrg={activePopupCourse.provider}
          onConfirm={activePopupMode === "enroll" ? confirmEnrollment : confirmCompletion}
          onCancel={() => {
            setActivePopupCourse(null);
            setActivePopupMode(null);
          }}
          onContinue={activePopupMode === "complete" ? handleContinueCourse : undefined}
        />
      ) : null}
    </div>
  );
}
