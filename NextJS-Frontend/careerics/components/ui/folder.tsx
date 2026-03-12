"use client";
import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";

type FolderProps = {
  children?: ReactNode;
};

const Folder = ({ children }: FolderProps) => {
  const pathname = usePathname();

  const pageConfig: Record<string, { title: string; subtitle: string }> = {
    "/features/home": { title: "Home", subtitle: "Welcome to CareeriCS" },
    "/features/career": { title: "Career Exploration", subtitle: "Find your path" },
    "/features/courses": { title: "Courses Hub", subtitle: "Expand your knowledge" },
    "/features/roadmap": { title: "Roadmaps", subtitle: "Clarity in every step" },
    "/features/skill": { title: "Skill Assessment", subtitle: "Discover where you stand" },
    "/features/cv": { title: "CV Crafting", subtitle: "Turn experience into impact" },
    "/features/interview": { title: "Interview Preparation", subtitle: "Practice makes perfect" },
    "/features/job": { title: "Job Search", subtitle: "Your next opportunity is waiting" },
  };

  const current =
    pageConfig[pathname] || { title: "CareeriCS", subtitle: "Loading..." };

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        gap: 0,
        left: 0,
      }}
    >

      <div
        style={{
          display: "grid",
          position: "relative",
          margin: 0,
          width: "fit-content",
          height: "clamp(7vh,7vh,7vh)",
        }}
      >

        <svg preserveAspectRatio="none" width="125%" height="100%" viewBox="0 0 650 95" fill="none" xmlns="http://www.w3.org/2000/svg"
          style={{
            zIndex: 1,
            gridArea: "1 / 1 / 2 / 2"
          }}>
          <path d="M0 49.5C0 22.1619 22.1619 0 49.5 0H455.747C468.663 0 481.328 3.57384 492.339 10.326L623.205 90.5741C630.605 95.1115 639.067 97.6234 647.744 97.8579L653 98H0V49.5Z" fill="#BABABA" />
        </svg>
        <h2
          style={{
            zIndex: "2",
            paddingInline: "1rem",
            gridArea: "1 / 1 / 2 / 2",
            textAlign:"center",
            lineHeight:"1vh",
            fontSize:"clamp(0.8rem,1.7vw,1.5rem)"
          }}
        >
          {current.title}
        </h2>
      </div>

      <div
        style={{
          backgroundColor: "var(--bg-grey)",
          marginRight: "1rem",
          marginBottom: "1vh",
          borderRadius: "1rem",
          borderStartStartRadius: "0rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default Folder;