"use client";

import type { CSSProperties } from "react";
import { normalizeBackendAssetUrl } from "@/lib/asset-url";

type EnrolledCourseCardStatus = "default" | "enrolled" | "completed";

export interface EnrolledCourseCardProps {
  title: string;
  provider: string;
  selected?: boolean;
  onSelect?: () => void;
  status?: EnrolledCourseCardStatus;
  style?: CSSProperties;
}

export function EnrolledCourseCard({
  title,
  provider,
  selected = false,
  onSelect,
  status = "default",
  style,
}: EnrolledCourseCardProps) {
  const isCompleted = status === "completed";
  const isEnrolled = status === "enrolled";

  const backgroundColor = isCompleted
    ? "var(--dark-grey)"
    : isEnrolled
      ? "var(--light-green)"
      : "var(--light-blue)";
  const foregroundColor = isCompleted ? "var(--light-blue)" : "#0B0B0B";
  const dividerColor = isCompleted ? "rgba(193, 203, 230, 0.85)" : "rgba(11, 11, 11, 0.8)";
  const iconSrc = normalizeBackendAssetUrl(
    isCompleted ? "/courses/course-completed.svg" : "/courses/course-icon.svg",
  );

  return (
    <button
      type="button"
      onClick={onSelect}
      style={{
        width: "280px",
        minWidth: "220px",
        maxWidth: "280px",
        minHeight: "120px",
        backgroundColor,
        borderRadius: "40px",
        padding: "10px",
        display: "flex",
        alignItems: "stretch",
        position: "relative",
        textAlign: "left",
        border: "none",
        color: foregroundColor,
        cursor: onSelect ? "pointer" : "default",
        boxShadow: selected ? "0 0 0 2px rgba(11, 11, 11, 0.18) inset" : "none",
        transition: "0.2s",
        flexShrink: 0,
        ...style,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "70px",
          flexShrink: 0,
        }}
      >
        <img
          src={iconSrc}
          alt=""
          aria-hidden="true"
          style={{ width: "60px" }}
        />
      </div>

      <div
        style={{
          width: "1.5px",
          backgroundColor: dividerColor,
          margin: "0 20px",
          alignSelf: "stretch",
          flexShrink: 0,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "6px",
          flex: 1,
          minWidth: 0,
        }}
      >
        <h4
          style={{
            margin: 0,
            color: foregroundColor,
            fontSize: "15px",
            fontWeight: "600",
          }}
        >
          {title}
        </h4>

        <p
          style={{
            margin: 0,
            color: foregroundColor,
            fontSize: "12px",
            fontWeight: "500",
            opacity: isCompleted ? 0.92 : 1,
          }}
        >
          -by {provider}
        </p>
      </div>
    </button>
  );
}
