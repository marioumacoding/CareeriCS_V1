"use client";
import React, { ReactNode, CSSProperties } from "react";

interface InterviewContainerProps {
  questionTitle: string;
  videoContent: ReactNode;
  controlsContent?: ReactNode;
  actionButton?: ReactNode;
  style?: CSSProperties;         // Targets the whole wrapper
  videoBoxStyle?: CSSProperties; // Targets ONLY the big rectangle
}

export default function InterviewContainer({
  questionTitle,
  videoContent,
  controlsContent,
  actionButton,
  style,
  videoBoxStyle,
}: InterviewContainerProps) {
  return (
    <div style={{
      width: "100%",
      maxWidth: "900px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "3vh",
      ...style, // Whole container style
    }}>
      {questionTitle && (
        <h2 style={{ fontSize: "24px", color: "white", textAlign: "center" }}>
          {questionTitle}
        </h2>
      )}

      {/* This is the "Big Rectangle" */}
      <div style={{
        width: "60%",
        height: "50vh",
        backgroundColor: "#c4c4c4", // Default color
        borderRadius: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        ...videoBoxStyle, // THIS updates ONLY the rectangle
      }}>
        {videoContent}
      </div>

      {controlsContent && (
        <div style={{ display: "flex", width: "100%", maxWidth: "420px", justifyContent: "space-between" }}>
          {controlsContent}
        </div>
      )}

      {actionButton}
    </div>
  );
}