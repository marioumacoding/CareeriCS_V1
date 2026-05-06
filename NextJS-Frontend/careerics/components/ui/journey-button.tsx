"use client";
import React from "react";

export default function JourneyButton({
  course = "Title",
  organization = "Org name",
  icon = "/sidebar/CV.svg",
  onClick = () => { },
  variant = "sA",
}) {
  const isSA = variant === "sA";

  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: isSA ? "var(--medium-blue)" : "#C1CBE6",
        borderRadius: "4vh",
        border: "none",
        height: "100%",
        display: "grid",
        alignContent: "center",
        justifyContent: "left",
        cursor: "pointer",
        padding: "20px",
        width: "100%"
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2vh",
        }}
      >
        {/* Icon */}
        <img
          src={icon}
          alt={course}
          style={{
            height: "10vh",
            objectFit: "contain",
          }}
        />

        {/* Divider */}
        <div
          style={{
            width: "3px",
            height: "100%",
            backgroundColor: isSA ? "white" : "black",
            borderRadius: "2px",
          }}
        />

        {/* Text */}
        <div>
          <h1
            style={{
              color: isSA ? "white" : "#000000",
              margin: 0,
              fontSize: "18px",
              lineHeight: "1.2",
              textAlign: "left",
              maxWidth: "10ch"
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
                maxWidth: "15ch",
              }}
            >
              By: {organization}
            </p>
          )}
        </div>

      </div>
    </button>
  );
}