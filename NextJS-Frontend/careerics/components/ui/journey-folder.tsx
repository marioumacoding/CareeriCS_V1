"use client";

import React from "react";
import { useRouter } from "next/navigation";

const PHASE_CONFIG = {
  1: {
    label: "The Crosspaths",
    path: "/journey/the-crosspaths",
    marginTop: "0",
  },
  2: {
    label: "Pave The Way",
    path: "/journey/pave-the-way",
    marginTop: "8rem",
  },
  3: {
    label: "Document It",
    path: "/journey/document-it",
    marginTop: "16rem",
  },
  4: {
    label: "Trial Round",
    path: "/journey/trial-round",
    marginTop: "24rem",
  },
  5: {
    label: "Job Hunt",
    path: "/journey/job-hunt",
    marginTop: "auto",
  },
} as const;

export default function JourneyFolder({
  phase = 2,
  children,
  primaryColor = "var(--dark-blue)",
  current = false,
  closed = false,
  path,
  locked = false,
}: {
  phase?: number;
  children?: React.ReactNode;
  primaryColor?: string;
  current?: boolean;
  closed?: boolean;
  path?: string;
  locked?: boolean;
}) {
  const router = useRouter();

  const config = PHASE_CONFIG[phase as keyof typeof PHASE_CONFIG];

  if (!config) {
    throw new Error(`Invalid phase: ${phase}`);
  }

  const { label, path: defaultPath, marginTop } = config;
  const targetPath = path || defaultPath;

  const phaseColor = `var(--phase${phase}-color)`;

  const topRight = phase === 1 ? "0" : "10";
  const bottomRight = phase === 5 ? "100" : "90";

  const clipPath = `
    polygon(
      100% ${topRight}%,
      0% 0%,
      0% 100%,
      100% ${bottomRight}%
    )
  `;

  const handleNavigation = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevents nested click conflicts
    if (locked) {
      return;
    }
    router.push(targetPath);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
      }}
    >
      {/* Main panel */}
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: current ? primaryColor : phaseColor,
          borderRadius: "4vh",
          overflow: "hidden",
          borderTopRightRadius: phase === 1 ? "0" : "4vh",
          borderBottomRightRadius: phase === 5 ? "0" : "4vh",
          paddingRight: "0.5rem",
          boxShadow: "10px 0 15px rgba(0, 0, 0, 0.66)",
          maxWidth: closed ? "12rem" : "100%",
          display: "flex",
        }}
      >
        {children}
      </div>

      {/* Label */}
      <div
        onClick={handleNavigation}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          cursor: locked ? "not-allowed" : "pointer",
          opacity: locked ? 0.55 : 1,
        }}
      >
        <div
          style={{
            marginTop,
            width: "fit-content",
            height: "fit-content",
            backgroundColor: current ? primaryColor : phaseColor,
            clipPath,
            borderTopRightRadius: "5vh",
            borderBottomRightRadius: "5vh",
            writingMode: "vertical-rl",
            textAlign: "center",
            paddingBlock: "0.5rem",
            paddingInline: "2.5rem",
            fontFamily: "var(--font-nova-square)",
            color: !current ? primaryColor : phaseColor,
            fontSize: "1rem",
            userSelect: "none",
            cursor: locked ? "not-allowed" : "pointer",
          }}
        >
          {locked ? `${label} (Locked)` : label}
        </div>
      </div>
    </div>
  );
}
