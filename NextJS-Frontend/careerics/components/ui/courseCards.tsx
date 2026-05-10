"use client";

import { useRef, type CSSProperties } from "react";
import type { RoadmapCourse } from "@/types";
import { EnrolledCourseCard } from "./enrolled-course-card";

export { EnrolledCourseCard, type EnrolledCourseCardProps } from "./enrolled-course-card";

type BasicCourseCard = {
  id?: string;
  title: string;
  provider: string;
  completed?: boolean;
};

type CurrentCoursesCardProps = {
  courses: BasicCourseCard[];
  selected?: string;
  onSelect: (courseId: string) => void;
  style?: CSSProperties;
};

type FieldsDiscoverCardProps = {
  fields: string[];
  selected?: string;
  onSelect: (field: string) => void;
  style?: CSSProperties;
};

type CompletedCoursesCardProps = {
  courses: BasicCourseCard[];
  style?: CSSProperties;
};

export const CurrentCoursesCard = ({
  courses,
  selected,
  onSelect,
  style,
}: CurrentCoursesCardProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 250, behavior: "smooth" });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--medium-blue)",
        borderRadius: "4vh",
        padding: "20px 30px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        ...style,
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

        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <div
          ref={scrollRef}
          style={{
            display: "flex",
            gap: "15px",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {courses.map((course) => {
            const cardKey = course.id ?? course.title;
            const isCompleted = course.completed === true;

            return (
              <div
                key={cardKey}
                onClick={() => onSelect(cardKey)}
                style={{
                  width: "clamp(220px, 24vw, 320px)",
                  minWidth: "220px",
                  minHeight: "84px",
                  padding: "12px 44px 12px 14px",
                  borderRadius: "15px",
                  backgroundColor: selected === cardKey ? "var(--light-green)" : "#c1cbe6",
                  color: "black",
                  cursor: "pointer",
                  position: "relative",
                  transition: "0.2s",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "6px",
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: "14px",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                  }}
                >
                  {course.title}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "bold",
                    lineHeight: 1.2,
                    wordBreak: "break-word",
                  }}
                >
                  by {course.provider}
                </div>

                <div
                  style={{
                    position: "absolute",
                    right: "15px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    border: "2px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    fontWeight: "bold",
                    backgroundColor: "transparent",
                    color: "black",
                  }}
                >
                  {isCompleted ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>

        <span
          onClick={handleScroll}
          style={{ fontSize: "24px", cursor: "pointer", color: "#c1cbe6" }}
        >
          ❯
        </span>
      </div>
    </div>
  );
};

export const FieldsDiscoverCard = ({
  fields,
  selected,
  onSelect,
  style,
}: FieldsDiscoverCardProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: 200,
        behavior: "smooth",
      });
    }
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: -200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--dark-blue)",
        borderRadius: "4vh",
        padding: "20px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          marginBottom: "15px",
          fontFamily: "var(--font-nova-square)",
          fontWeight: "100",
        }}
      >
        More fields to discover
      </h3>

      <div
        ref={scrollRef}
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px",
          overflowY: "auto",
          scrollbarWidth: "none",
          flexGrow: 1,
          paddingBottom: "40px",
        }}
      >
        {fields.map((field) => (
          <button
            key={field}
            onClick={() => onSelect(field)}
            style={{
              padding: "15px 5px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: selected === field ? "var(--light-green)" : "var(--medium-blue)",
              color: selected === field ? "black" : "white",
              fontSize: "0.7rem",
              fontWeight: "bold",
              cursor: "pointer",
              transition: "0.2s",
              fontFamily: "var(--font-jura)",
            }}
          >
            {field}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: "auto",
          width: "fit-content",
          marginLeft: "auto",
        }}
      >
        <div
          onClick={scrollUp}
          style={{
            cursor: "pointer",
            transform: "rotate(-270deg)",
            marginRight: "auto",
          }}
        >
          <img
            src="/auth/Back Arrow.svg"
            alt="Scroll"
            width={30}
            height={30}
          />
        </div>

        <div
          onClick={scrollDown}
          style={{
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
            transform: "rotate(270deg)",
          }}
        >
          <img
            src="/auth/Back Arrow.svg"
            alt="Scroll"
            width={30}
            height={30}
          />
        </div>
      </div>
    </div>
  );
};

export const CompletedCoursesCard = ({ courses, style }: CompletedCoursesCardProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: 200,
        behavior: "smooth",
      });
    }
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: -200,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "var(--dark-blue)",
        borderRadius: "4vh",
        padding: "20px",
        color: "white",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <h3
        style={{
          fontSize: "20px",
          textAlign: "left",
          marginBottom: "5px",
          fontFamily: "var(--font-nova-square)",
          fontWeight: "200",
        }}
      >
        Completed Courses
      </h3>

      <div
        ref={scrollRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          overflowY: "auto",
          scrollbarWidth: "none",
          flexGrow: 1,
          paddingBottom: "40px",
        }}
      >
        {courses.map((course, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: "#c1cbe6",
              borderRadius: "12px",
              padding: "12px 15px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "black",
            }}
          >
            <div style={{ fontFamily: "var(--font-nova-square)" }}>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>{course.title}</div>
              <div style={{ fontSize: "0.6rem" }}>by {course.provider}</div>
            </div>
            <div
              style={{
                fontWeight: "bold",
                fontSize: "0.9rem",
                cursor: "pointer",
                transform: "rotate(-90deg)",
              }}
            >
              ↺
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: "auto",
          width: "fit-content",
          marginLeft: "auto",
        }}
      >
        <div
          onClick={scrollUp}
          style={{
            cursor: "pointer",
            transform: "rotate(-270deg)",
            marginRight: "auto",
          }}
        >
          <img
            src="/auth/Back Arrow.svg"
            alt="Scroll"
            width={30}
            height={30}
          />
        </div>

        <div
          onClick={scrollDown}
          style={{
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
            transform: "rotate(270deg)",
          }}
        >
          <img
            src="/auth/Back Arrow.svg"
            alt="Scroll"
            width={30}
            height={30}
          />
        </div>
      </div>
    </div>
  );
};

export const CourseCards = ({
  courses,
  onCourseClick,
  statusByCourseId,
}: {
  courses: RoadmapCourse[];
  onCourseClick?: (course: RoadmapCourse) => void;
  statusByCourseId?: Partial<Record<string, "enrolled" | "completed">>;
}) => {
  if (!courses.length) {
    return (
      <div
        style={{
          color: "rgba(255,255,255,0.7)",
          fontSize: "14px",
          fontFamily: "var(--font-jura)",
        }}
      >
        No courses available for this section yet.
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "25px",
      }}
    >
      {courses.map((course) => (
        <EnrolledCourseCard
          key={course.id}
          title={course.title}
          provider={course.provider}
          status={statusByCourseId?.[course.id] ?? "default"}
          onSelect={onCourseClick ? () => onCourseClick(course) : undefined}
          style={{
            width: "280px",
            minWidth: "280px",
            maxWidth: "280px",
          }}
        />
      ))}
    </div>
  );
};
