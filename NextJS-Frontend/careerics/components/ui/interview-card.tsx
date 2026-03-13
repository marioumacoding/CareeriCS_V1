"use client";
import React, { ReactNode } from "react";

interface InterviewContainerProps {
  questionTitle: string;
  videoContent: ReactNode;
  controlsContent: ReactNode;
  actionButton: ReactNode;
}

export default function InterviewContainer({
  questionTitle,
  videoContent,
  controlsContent,
  actionButton,
}: InterviewContainerProps) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: "800px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "3vh",
      }}
    >
      {/* Question */}
      <h2
        style={{
          fontSize: "24px",
          fontWeight: 400,
          margin: 0,
          textAlign: "center",
          width: "90%",
          color: "white",
        }}
      >
        {questionTitle}
      </h2>

      {/* Video Box */}
      <div
        style={{
          width: "60%",
          height: "50vh",
          backgroundColor: "#c4c4c4",
          borderRadius: "40px",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {videoContent}
      </div>

      {/* Controls */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          maxWidth: "420px",
        }}
      >
        {controlsContent}
      </div>

      {/* Submit */}
      {actionButton}
    </div>
  );
}