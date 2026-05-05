"use client";
import React, { useRef } from 'react';
import type { RoadmapCourse } from "@/types";

// --- Card 1: Courses you are currently taking (Checkmark Logic Only) ---
export const CurrentCoursesCard = ({ courses, selected, onSelect, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
  };

  return (
    <div style={{
      backgroundColor: "#1C427B", borderRadius: "4vh", padding: "20px 30px", color: "white",
      display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", ...style
    }}>
      <h3 style={{ fontSize: "18px", marginBottom: "15px", fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
        Courses you are currently taking
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
        <div
          ref={scrollRef}
          style={{
            display: "flex", gap: "15px", overflowX: "auto",
            scrollbarWidth: "none", msOverflowStyle: "none"
          }}
        >
          {courses.map((course: any) => {
            const isCompleted = course.completed === true;

            return (
              <div
                key={course.title}
                onClick={() => onSelect(course.title)}
                style={{
                  padding: "10px", borderRadius: "15px", flexShrink: 0, minWidth: "220px",
                  // El lon sabet: ya selected (Light Green) ya default (Grey-Blue)
                  backgroundColor: selected === course.title ? "#E6FFB2" : "#c1cbe6",
                  color: "black", cursor: "pointer", position: "relative", transition: "0.2s"
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{course.title}</div>
                <div style={{ fontSize: "10px", fontWeight: "bold" }}>by {course.provider}</div>

                <div
                  style={{
                    position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)",
                    width: "22px", height: "22px", borderRadius: "50%",
                    border: "2px solid black", display: "flex", alignItems: "center",
                    justifyContent: "center", fontSize: "14px", fontWeight: "bold",
                    backgroundColor: "transparent", color: "black"

                  }}>
                  {isCompleted ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>
        <span onClick={handleScroll} style={{ fontSize: "24px", cursor: "pointer", color: "#c1cbe6" }}>❯</span>
      </div>
    </div>
  );
};

// --- Card 2: More fields to discover ---
export const FieldsDiscoverCard = ({ fields, selected, onSelect, style }: any) => {
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
    <div style={{
      backgroundColor: "#142143", borderRadius: "4vh", padding: "20px", color: "white",
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", ...style
    }}>
      <h3 style={{ fontSize: "20px", marginBottom: "15px", fontFamily: 'var(--font-nova-square)', fontWeight: "100" }}>
        More fields to discover
      </h3>

      <div
        ref={scrollRef}
        style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px",
          overflowY: "auto", scrollbarWidth: "none", flexGrow: 1, paddingBottom: "40px"
        }}
      >
        {fields.map((field: string) => (
          <button
            key={field}
            onClick={() => onSelect(field)}
            style={{
              padding: "15px 5px", borderRadius: "12px", border: "none",
              backgroundColor: selected === field ? "#E6FFB2" : "#1C427B",
              color: selected === field ? "black" : "white",
              fontSize: "0.7rem", fontWeight: "bold", cursor: "pointer", transition: "0.2s", fontFamily: "var(--font-jura)"
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
                    marginLeft: "auto"
                }} >

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

// --- Card 3: Completed Courses ---
export const CompletedCoursesCard = ({ courses, style }: any) => {
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
    <div style={{
      backgroundColor: "#142143", borderRadius: "4vh", padding: "20px", color: "white",
      display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden", ...style
    }}>
      <h3 style={{ fontSize: "20px", textAlign: "left", marginBottom: "5px", fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
        Completed Courses
      </h3>

      <div
        ref={scrollRef}
        style={{
          display: "flex", flexDirection: "column", gap: "10px",
          overflowY: "auto", scrollbarWidth: "none", flexGrow: 1, paddingBottom: "40px"
        }}
      >
        {courses.map((course: any, idx: number) => (
          <div key={idx} style={{ backgroundColor: "#c1cbe6", borderRadius: "12px", padding: "12px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "black" }}>
            <div
              style={{ fontFamily: "var(--font-nova-square)" }}
            >
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>{course.title}</div>
              <div style={{ fontSize: "0.6rem" }}>by {course.provider}</div>
            </div>
            <div style={{ fontWeight: "bold", fontSize: "0.9rem", cursor: "pointer", transform: "rotate(-90deg)" }}>↺</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: "auto",
          width: "fit-content",
          marginLeft: "auto"
        }} >

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
}: {
  courses: RoadmapCourse[];
  onCourseClick?: (course: RoadmapCourse) => void;
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
      {courses.map((course) => {
        return (
          <button
            key={course.id}
            type="button"
            onClick={() => onCourseClick?.(course)}
            style={{
              width: "fit-content",
              minHeight: "120px",
              height: "fit-content",
              backgroundColor: "#C1CBE6",
              borderRadius: "40px",
              padding: "10px",
              display: "flex",
              alignItems: "stretch",
              position: "relative",
              textAlign: "left",
              whiteSpace:"nowrap",
              border: "none",
              cursor: onCourseClick ? "pointer" : "default",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                
              }}
            >
              <img src="/courses/course-icon.svg" alt="icon" style={{ width: "60px" }} />
            </div>

            <div
              style={{
                width: "1.5px",
                backgroundColor: "rgb(0, 0, 0)",
                margin: "0 20px",
                alignSelf: "stretch",
                flexShrink: 0,
              }}
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "6px",
                flex: 1,
                minWidth: 0,
              }}
            >
              <h4
                style={{
                  margin: 0,
                  color: "#0b0b0b",
                  fontSize: "15px",
                  fontWeight: "600",
                }}
              >
                {course.title}
              </h4>

              <p
                style={{
                  margin: 0,
                  color: "rgb(0, 0, 0)",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                -by {course.provider}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};
