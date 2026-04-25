"use client";

import React, { useState } from "react";
import JourneyButton from "@/components/ui/journey-button";

export default function JourneyPage() {
  const [selected, setSelected] = useState("sections");

  const courses = [
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

  const skills = [
    { id: 1, name: "HTML" },
    { id: 2, name: "CSS" },
    { id: 3, name: "JavaScript" },
    { id: 4, name: "React" },
    { id: 5, name: "Next.js" },
    { id: 6, name: "TypeScript" },
    { id: 7, name: "Node.js" },
  ];

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
      }}
    >
      {/* ================= LEFT PANEL ================= */}
      <div
        style={{
          width: "30%",
          height: "fit-content",
          marginRight: "2vh",
          paddingInline: "10px",
          display: "block",
        }}
      >
        <h1 style={{ color: "white", fontSize: "24px", marginBottom: "2vh" }}>
          Quick Stats
        </h1>

        {/* Stats Card */}
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
          <h1 style={{ color: "white" }}>Current Level</h1>

          <div style={{ display: "flex", alignItems: "stretch", gap: "1vh" }}>
            <div
              style={{
                width: "1vh",
                backgroundColor: "#E6FFB2",
                borderRadius: "1vh",
              }}
            />
            <h1 style={{ color: "white", margin: 0 }}>Beginner</h1>
          </div>

          <h1 style={{ color: "white", marginTop: "3vh" }}>
            Roadmap Progress
          </h1>

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
                width: "30%",
                height: "100%",
                backgroundColor: "#E6FFB2",
                borderRadius: "1vh",
              }}
            />
          </div>

          {/* Completed */}
          <div style={{ display: "flex", gap: "1vh", marginTop: "3vh" }}>
            <div
              style={{
                width: "1vh",
                backgroundColor: "#E6FFB2",
                borderRadius: "1vh",
              }}
            />
            <div>
              <h1 style={{ color: "#E6FFB2", margin: 0, fontSize: "24px" }}>
                10
              </h1>
              <h1 style={{ color: "white", margin: 0 }}>
                Completed Topics
              </h1>
            </div>
          </div>

          {/* Remaining */}
          <div style={{ display: "flex", gap: "1vh", marginTop: "3vh" }}>
            <div
              style={{
                width: "1vh",
                backgroundColor: "#FFB2B2",
                borderRadius: "1vh",
              }}
            />
            <div>
              <h1 style={{ color: "#FFB2B2", margin: 0, fontSize: "24px" }}>
                10
              </h1>
              <h1 style={{ color: "white", margin: 0 }}>
                Remaining Topics
              </h1>
            </div>
          </div>
        </div>

        {/* ================= SKILLS ================= */}
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

          {selected === "sections" && (
            <JourneyButton
              course="Take Assessment"
              icon="/sidebar/CV.svg"
            />
          )}
        </div>

        {selected === "steps" && (
          <div
            style={{
              width: "100%",
              padding: "20px",
              backgroundColor: "#1C427B",
              borderRadius: "4vh",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
            }}
          >
            {skills.map((skill) => (
              <button
                key={skill.id}
                style={{
                  width: "100%",
                  backgroundColor: "#C1CBE6",
                  padding: "10px",
                  borderRadius: "2vh",
                  border: "none",
                  cursor: "pointer",
                  transition: "0.2s ease",
                  fontFamily: "var(--font-jura)",
                  fontWeight: "bold",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#E6FFB2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#C1CBE6";
                }}
              >
                {skill.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <div
        style={{
          width: "100%",
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
            height: "54vh",
            backgroundColor: "#C1CBE6",
            borderRadius: "4vh",
            padding: "20px",
          }}
        />

        {/* ================= COURSES ================= */}
        {courses.map((topicItem, topicIndex) => (
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