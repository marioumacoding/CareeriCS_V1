"use client";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";

type FolderProps = {
  children?: ReactNode;
};

const Folder = ({ children }: FolderProps) => {
  const pathname = usePathname();

  const pageConfig: Record<string, { title: string; subtitle: string; tabwidth: string }> = {
    "/features/home": { title: "Home", subtitle: "Welcome to CareeriCS", tabwidth: "20%" },
    "/features/career": { title: "Career Exploration", subtitle: "Find your path", tabwidth: "33%" },
    "/features/courses": { title: "Courses Hub", subtitle: "Expand your knowledge", tabwidth: "25%" },
    "/features/roadmap": { title: "Roadmaps", subtitle: "Discover where you stand", tabwidth: "20%" },
    "/features/skill": { title: "Skill Assessment", subtitle: "Discover where you stand", tabwidth: "20%" },
    "/features/cv": { title: "CV Crafting", subtitle: "Turn experience into impact", tabwidth: "25%" },
    "/features/interview": {
      title: "Interview Preparation",
      subtitle: "Practice makes perfect",
      tabwidth: "38%",
    },
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
        minHeight: "97vh",
        minWidth: 0,
        padding: "1vh",
        gap: 0,
      }}
    >

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
            display: "grid",
            width: current.tabwidth,
            height: "100%",
          }}
        >
          <svg
            preserveAspectRatio="none"
            viewBox="0 0 650 95"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              zIndex: 1,
              gridArea: "1 / 1",
              width: "100%",
              height: "100%",
            }}
          >
            <path
              d="M0 49.5C0 22.1619 22.1619 0 49.5 0H455.747C468.663 0 481.328 3.57384 492.339 10.326L623.205 90.5741C630.605 95.1115 639.067 97.6234 647.744 97.8579L653 98H0V49.5Z"
              fill="var(--bg-grey)"
            />
          </svg>
          <span
            style={{
              zIndex: 3,
              paddingInline: "3vw",
              paddingTop: "clamp(0.7rem, 2.2vh, 1.3rem)",
              gridArea: "1 / 1",
              textAlign: "left",
              fontSize: "clamp(1rem, 1.8vw, 1.6rem)",
              fontWeight: "700",
            }}
          >
            {current.title}
          </span>
        </div>

        <div
          id="blue-tab"
        style={{
          display: "grid",
          flex: 1,
          height: "clamp(2.15rem, 5vh, 3rem)",
          marginLeft: "clamp(-2.2rem, -3vw, -1rem)",
        }}
      >
        <svg
          preserveAspectRatio="none"
          viewBox="0 0 1200 50"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            zIndex: 0,
            gridArea: "1 / 1",
            height: "100%",
          }}
        >
          <path
            d="M5.86613 22.3015C-4.59211 16.0533 -0.161839 0 12.0207 0H813.538C833.972 0 850.538 16.5655 850.538 37C850.538 57.4345 833.972 74 813.538 74H106.198C97.1673 74 88.3056 71.5544 80.5535 66.923L5.86613 22.3015Z"
            fill="var(--medium-blue)"
          />
        </svg>
        <span
          style={{
            zIndex: 2,
            gridArea: "1 / 1",
            paddingLeft: "clamp(1.4rem, 4vw, 4rem)",
            paddingRight: "clamp(0.7rem, 2vw, 2rem)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
            color: "white",
            fontSize: "clamp(0.78rem, 1.35vw, 1.25rem)",
          }}
        >
          {current.subtitle}
        </span>
      </div>
    </div>

      <div
        id="folder-body"
        style={{
          zIndex: 2,
          backgroundColor: "var(--bg-grey)",
          marginRight: "1rem",
          borderRadius: "50px",
          flex: 1,
          minHeight: 0,
          borderTopLeftRadius: "0px",
          borderTopRightRadius: "30px",
          borderBottomLeftRadius: "30px",
          borderBottomRightRadius: "30px",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "stretch",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Folder;