"use client";

import { useState } from "react";
import JourneyTree from "@/components/ui/journey-tree";
import { RectangularCard } from "@/components/ui/rectangular-card";

type Level = "Entry" | "Junior" | "Senior";

interface LevelData {
  salary: string;
  demand: string;
  demandColor: string;
  responsibilities: string[];
  fit: string[];
}

export default function JourneyPage() {
  const [level, setLevel] = useState<Level>("Entry");

  const track = {
    title: "Backend Developer",
    description: "Build and maintain server-side logic, APIs, and databases.",
    skills: ["Node.js", "Databases", "APIs"],

    levels: {
      Entry: {
        salary: "E£ 10-15K",
        demand: "Low",
        demandColor: "#FFBC6A",
        responsibilities: [
          "Write basic API endpoints",
          "Fix bugs in backend services",
          "Work with simple database queries",
          "Assist in debugging server issues",
          "Follow coding standards and reviews",
        ],
        fit: [
          "You enjoy logic over visuals",
          "You like working with data structures",
          "You are patient with debugging",
          "You prefer structured systems",
          "You enjoy backend architecture basics",
        ],
      },

      Junior: {
        salary: "E£ 20-35K",
        demand: "Medium",
        demandColor: "#FFF47C",
        responsibilities: [
          "Develop RESTful APIs",
          "Optimize database queries",
          "Handle authentication systems",
          "Integrate third-party services",
          "Write reusable backend modules",
        ],
        fit: [
          "You think in systems not pages",
          "You enjoy solving performance issues",
          "You understand API design",
          "You like scalable thinking",
          "You handle complexity well",
        ],
      },

      Senior: {
        salary: "E£ 50-80K+",
        demand: "High",
        demandColor: "var(--light-green)",
        responsibilities: [
          "Design system architecture",
          "Lead backend development teams",
          "Ensure scalability and performance",
          "Handle distributed systems",
          "Review and enforce best practices",
        ],
        fit: [
          "You think in large-scale systems",
          "You can mentor others",
          "You handle high responsibility",
          "You optimize for performance at scale",
          "You design long-term solutions",
        ],
      },
    } as Record<Level, LevelData>,
  };

  const current = track.levels[level];

  return (
    <JourneyTree
      current={1}
      maxReached={5}
      renderContent={() => (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            padding: "40px",
            gridTemplateColumns: "repeat(2,1fr)",
            gridTemplateRows: "1fr",
            gridColumnGap: "1rem",
            color: "white",
            textAlign: "left",
            overflow: "hidden",
          }}
        >
          {/*Left Section*/}
          <div
            style={{
              width: "100%",
              height: "100%",
              gridArea: "1 / 1 /2 /2",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "2rem",
            }}
          >

            {/* Title and Subtitle */}
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                {track.title}
              </h1>
              <p
                style={{
                  color: "lightgrey",
                }}
              >
                {track.description}
              </p>
            </div>

            {/* Skills */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                width: "fit-content",
                gap: "1rem"
              }}
            >
              {track.skills.map((skill, i) => (
                <RectangularCard
                  key={i}
                  style={{ width: "100%" }}
                  theme="dark"
                  Title={skill}
                />
              ))}
            </div>

            {/* Key Responsibities */}
            <div>
              <h1
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                }}
              >
                Key Responsibilities
              </h1>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(1, 1fr)",
                  width: "fit-content",
                  gap: "1rem"
                }}
              >
                {current.responsibilities.map((r, i) => (
                  <p key={i} style={{ color: "lightgrey" }}> • {r} </p>
                ))}
              </div>

            </div>


          </div>

          {/*Right Section*/}
          <div
            style={{
              width: "100%",
              height: "100%",
              gridArea: "1 / 2 /2 /3",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "2rem",
            }}
          >

            {/* Level Filter */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                width: "fit-content",
                gap: "1rem",
              }}
            >
              {(["Entry", "Junior", "Senior"] as Level[]).map((lvl) => (
                <RectangularCard
                  style={{ width: "100%" }}
                  key={lvl}
                  font="jura"
                  theme="light"
                  Title={lvl === "Entry" ? "Entry Level" : lvl}
                  selected={level === lvl}
                  selectable
                  onSelect={() => setLevel(lvl)}
                />
              ))}
            </div>

            {/* Salary Range and Market Demand */}
            <div
              style={{
                width: "100%",
                height: "fit-content",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "5rem",
              }}
            >
              {/* Salary Range */}
              <div>
                <h1
                  style={{
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Salary Range
                </h1>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    color: "lightgrey",
                  }}
                >
                  {current.salary}
                </h1>
              </div>

              {/* Market Demand */}
              <div>
                <h1
                  style={{
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  Market Demand
                </h1>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    color: current.demandColor,
                  }}
                >
                  {current.demand}
                </h1>
              </div>
            </div>

            {/* Fit Profile */}
            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "var(--medium-blue)",
                borderRadius: "4vh",
                padding: "2rem",
              }}
            >
              <h1
                style={{
                  fontSize: "1.2rem",
                  marginBottom: "1rem",
                }}
              >
                This Would fit you if
              </h1>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(1, 1fr)",
                  width: "fit-content",
                  gap: "1rem"
                }}
              >
                {current.fit.map((f, i) => (
                  <p key={i} style={{ color: "lightgrey" }}> • {f}</p>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    />
  );
}