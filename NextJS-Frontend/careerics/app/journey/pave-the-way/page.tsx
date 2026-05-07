"use client";

import JourneyButton from "@/components/ui/journey-button";
import JourneyTree from "@/components/ui/journey-tree";
import { StepFlow } from "@/components/ui/roadmap-flow";
import RoadmapProgress from "@/components/ui/roadmapProgress";

export default function JourneyPage() {

  const courses = [
    { title: "React Fundamentals", org: "Meta" },
    { title: "Advanced TypeScript", org: "Microsoft" },
    { title: "System Design Basics", org: "Educative" },
    { title: "Frontend Performance", org: "Google" },
    { title: "Next.js Mastery", org: "Vercel" },
    { title: "UI Engineering", org: "Coursera" },
    { title: "Clean Code Practices", org: "Uncle Bob Academy" },
    { title: "Cybersecurity Basics", org: "Cyber Talents" },
  ];

  const steps = [
    { id: 1, label: "Fundamentals", href: "#" },
    { id: 2, label: "HTML & CSS", href: "#" },
    { id: 3, label: "JavaScript Basics", href: "#" },
    { id: 4, label: "React Intro", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
    { id: 5, label: "Projects", href: "#" },
  ];

  return (
    <JourneyTree
      current={2}
      maxReached={5}
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
            overflow: "hidden"
          }}
        >

          {/*===== Quick Stats =====*/}
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

            <h1 style={{ color: "white" }}>Quick Stats</h1>

            {/* Main Container */}
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
                alignItems: "left"
              }}
            >

              {/* Current Level */}
              <div>
                <h1 style={{ color: "white", marginBottom: "0.5rem" }}>Current Level</h1>

                <RoadmapProgress isTotal={false} isScore={false} text={"Beginner"} />
              </div>

              {/* Roadmap Progress */}
              <div>
                <h1 style={{ color: "white", marginBottom: "0.5rem" }}>Roadmap Progress</h1>

                {/* Progress bar */}
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
              </div>

              {/* Completed Topics */}
              <RoadmapProgress
                isTotal={false}
                done="10"
                text={"Completed Topics"}
              />

              {/* Remaining Topics */}
              <RoadmapProgress
                isTotal={false}
                done="10"
                text={"Remaining Topics"}
                color="#FFB2B2"
              />
            </div>
          </div>


          {/*===== Roadmap =====*/}
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

            <h1 style={{ color: "white" }}>Roadmap</h1>

            {/* Main Container */}
            <div
              style={{
                backgroundColor: "#C1CBE6",
                padding: "2rem",
                borderRadius: "4vh",
                minWidth: 0,
                minHeight: 0,
                overflowY: "auto",
                scrollbarWidth: "none",
              }}
            >
              {/* Roadmap Steps */}
              <div>
                <StepFlow
                  variant="dark"
                  steps={steps}
                  roadmapId={undefined}
                  selectedIndex={undefined}
                  onSelect={undefined}
                />
              </div>
            </div>
          </div>


          {/*===== Skill Assessment =====*/}
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

            <h1 style={{ color: "white" }}>Test Your Skills</h1>

            {/* Start Assessment */}
            <JourneyButton
              variant="sA"
              course="Start Assessment"
              style={{width:"100%",height:"100%" }}
              onClick={() => { }}
            />
          </div>


          {/*===== Courses Section =====*/}
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
              }}
            >
              Courses
            </h1>

            {/* Courses */}
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
              {courses.map((c, i) => (
                <JourneyButton
                  key={i}
                  variant="courses"
                  course={c.title}
                  organization={c.org}
                  onClick={() => { }}
                  style={{
                    flexShrink: 0,
                  }}
                />
              ))}
            </div>
          </div>

        </div>
      )}
    />
  );
}