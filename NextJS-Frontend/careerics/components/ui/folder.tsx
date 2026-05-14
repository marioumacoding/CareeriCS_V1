"use client";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";




type FolderProps = {
  children?: ReactNode;
};

const Folder = ({ children }: FolderProps) => {
  const pathname = usePathname();
  const LARGE = 1024;
  const MEDIUM = 640;

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLarge = width >= LARGE;
  const isMedium = width >= MEDIUM && width < LARGE;
  const isSmall = width < MEDIUM;

  const pageConfig: Record<string, { title: string; subtitle: string; tabwidth: string }> = {
    "/features/home": { title: "Careeri's Journey", subtitle: "Welcome to CareeriCS", tabwidth: "27%" },
    "/features/career": { title: "Career Exploration", subtitle: "Find your path", tabwidth: "28%" },
    "/features/courses": { title: "Courses Hub", subtitle: "Expand your knowledge", tabwidth: "22%" },
    "/features/roadmap": { title: "Roadmaps", subtitle: "Discover where you stand", tabwidth: "19%" },
    "/features/skill": { title: "Skill Assessment", subtitle: "Discover where you stand", tabwidth: "26.5%" },
    "/features/cv": { title: "CV Crafting", subtitle: "Turn experience into impact", tabwidth: "20%" },
    "/features/interview": { title: "Interview Preparation", subtitle: "Practice makes perfect", tabwidth: "31%" },
    "/features/job": { title: "Job Search", subtitle: "Your next opportunity is waiting", tabwidth: "20%" },
  };

  const current =
    pageConfig[pathname] || { title: "CareeriCS", subtitle: "Loading..." };

  return (
    <div
      id="page-wrapper"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minWidth: 0,
        gap: 0,
      }}
    >

      {!isSmall && (
        <div
          id="header"
          style={{
            display: "flex",
            position: "relative",
            margin: 0,
            width: "100%",
            height: "clamp(3.2rem, 7vh, 4.5rem)",
          }}
        >
          <div
            id="grey-tab"
            style={{
              display: "flex",
              width: current.tabwidth,
              height: "100%",
              position: "relative",
            }}
          >

            <div
              id="grey-tab-body"
              style={{
                flex: 1,
                backgroundColor: "var(--bg-grey)",
                borderTopLeftRadius: "50px",
                display: "flex",
                alignItems: "center",
                paddingLeft: "3vw",
              }}
            >
              <span
                style={{
                  zIndex: 3,
                  fontSize: "clamp(1rem, 1.8vw, 1.6rem)",
                  alignContent: "center",
                  paddingTop: "3vh",
                  fontWeight: "700",
                  whiteSpace: "nowrap",
                }}
              >
                {current.title}
              </span>
            </div>

            {/* The Slope*/}
            <svg
              viewBox="0 0 200 80"
              preserveAspectRatio="none"
              style={{
                height: "100%",
                width: "clamp(40px, 9vw, 93px)",
                flexShrink: 0,
                marginLeft: "-1px",
              }}
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M226 98.4475V110H0.754476L0 0C15 0 24.3358 2.80246 35.335 8.19287L213.665 95.5874C230 97.4692 221.724 98.4475 226 98.4475Z"
                fill="var(--bg-grey)"
              />
            </svg>
          </div>
          {isLarge &&
            <div
              id="blue-tab"
              style={{
                display: "grid",
                flex: 1,
                height: "clamp(2.15rem, 5vh, 3rem)",

              }}
            >
              <svg
                preserveAspectRatio="none"
                width="98%"
                height="90"
                viewBox="0 0 2195 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  zIndex: 0,
                  gridArea: "1 / 1",
                  height: "100%",
                }}
              >
                <path
                  d="M6.02354 22.3942C-4.61259 16.258 -0.259026 0 12.0202 0H2132.21C2157.06 0 2177.21 20.1472 2177.21 45C2177.21 69.8528 2157.06 90 2132.21 90H136.596C127.824 90 119.207 87.6925 111.61 83.3093L6.02354 22.3942Z"
                  fill="var(--medium-blue)"
                />
              </svg>
              <span
                style={{
                  zIndex: 2,
                  gridArea: "1 / 1",
                  margin: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  color: "white",
                  fontSize: "clamp(0.78rem, 1.35vw, 1.25rem)",
                }}
              >
                {current.subtitle}
              </span>
            </div>
          }
        </div>
      )
      }

      <div
        id="folder-body"
        style={{
          zIndex: 2,
          backgroundColor: "var(--bg-grey)",
          borderTopLeftRadius: isSmall ? "30px" : "0px",
          borderTopRightRadius: "30px",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",

          overflow: "hidden",
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Folder;