"use client";

import React, { ReactNode } from "react";
import { createPortal } from "react-dom";

interface InterviewAudioDockProps {
  children: ReactNode;
  visible?: boolean;
}

export default function InterviewAudioDock({
  children,
  visible = true,
}: InterviewAudioDockProps) {
  if (!visible || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      style={{
        position: "fixed",
        right: "20px",
        bottom: "20px",
        zIndex: 2147483000,
        width: "min(440px, calc(100vw - 40px))",
        pointerEvents: "auto",
      }}
    >
      {children}
    </div>,
    document.body,
  );
}
