"use client";
import React from "react";

type JourneyButtonProps = {
  course?: string;
  organization?: string;
  onClick?: () => void;
  variant?: "sA" | "courses";
  style?: React.CSSProperties;
};

export default function JourneyButton({
  course = "Title",
  organization = "Org name",
  onClick = () => { },
  variant = "sA",
  style = {} as React.CSSProperties,
}) {
  const isSA = variant === "sA";
  const icon = isSA?"/sidebar/skill.svg":"/courses/course-icon.svg";

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: isSA ? "var(--medium-blue)" : "#C1CBE6",
        borderRadius: "4vh",
        border: "none",
        height: "100%",
        width: "fit-content",
        cursor: "pointer",
        padding: "1rem",
        justifyContent: "space-around",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        ...style,
      }}
    >

      {/* Icon */}
      <img
        src={icon}
        alt={course}
        style={{
          height: "2rem",
          objectFit: "contain",
          filter:isSA?"none":"brightness(0)"
        }}
      />

      {/* Divider */}
      <div
        style={{
          width: "0.1rem",
          height: "100%",
          backgroundColor: isSA ? "white" : "black",
          borderRadius: "999px",
        }}
      />

      {/* Text */}
      <div>
        <h1
          style={{
            color: isSA ? "white" : "#000000",
            margin: 0,
            fontSize: "1rem",
            lineHeight: "1.2",
            textAlign: "left",
            maxWidth: isSA?"min-content":"max-content"
          }}
        >
          {course}
        </h1>
        {!isSA && (
          <p
            style={{
              color: "#000000",
              margin: 0,
              lineHeight: "1.2",
              textAlign: "left",
              minWidth: "fit-content",
              whiteSpace:"nowrap",

            }}
          >
            By: {organization}
          </p>
        )}
      </div>
    </button>
  );
}