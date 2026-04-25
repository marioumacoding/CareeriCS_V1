"use client";

import React from "react";

type CourseActionMode = "enroll" | "complete";

interface CourseActionPopupProps {
  courseTitle: string;
  mode: CourseActionMode;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CourseActionPopup({
  courseTitle,
  mode,
  isLoading = false,
  onConfirm,
  onCancel,
}: CourseActionPopupProps) {
  const isEnrollMode = mode === "enroll";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEnrollMode ? "Course enrollment confirmation" : "Course completion confirmation"}
      onClick={onCancel}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1200,
        padding: "16px",
        boxSizing: "border-box",
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          width: "min(92vw, 520px)",
          borderRadius: "24px",
          backgroundColor: "#E6FFB2",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          textAlign: "center",
          color: "#111827",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "22px", fontWeight: 400, lineHeight: 1.5 }}>
          {isEnrollMode
            ? `Enroll in "${courseTitle}"?`
            : `Did you finish the course "${courseTitle}"?`}
        </h2>

        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            style={{
              minWidth: "120px",
              padding: "10px 22px",
              borderRadius: "12px",
              border: "1px solid #334155",
              backgroundColor: "transparent",
              color: "#111827",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.6 : 1,
              fontWeight: 700,
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              minWidth: "120px",
              padding: "10px 22px",
              borderRadius: "12px",
              border: "none",
              backgroundColor: "#1e2b58",
              color: "white",
              cursor: isLoading ? "not-allowed" : "pointer",
              opacity: isLoading ? 0.7 : 1,
              fontWeight: 700,
            }}
          >
            {isEnrollMode ? "Enroll" : "Yes"}
          </button>
        </div>
      </div>
    </div>
  );
}