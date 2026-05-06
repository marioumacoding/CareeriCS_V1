"use client";

import React from "react";
import { Button } from "./button";

type CourseActionMode = "enroll" | "complete";

interface CourseActionPopupProps {
  courseTitle: string;
  courseOrg: string;
  mode: CourseActionMode;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function CourseActionPopup({
  courseTitle,
  courseOrg,
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
      aria-label={
        isEnrollMode
          ? "Course enrollment confirmation"
          : "Course completion confirmation"
      }
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
          width: "26rem",
          height: "fit-content",
          borderRadius: "4vh",
          backgroundColor: "var(--light-green)",
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
          color: "#111827",
          boxShadow: "0 16px 48px rgba(0, 0, 0, 0.35)",
          fontFamily: "var(--font-nova-square)",
          gap: "1rem",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >

            Courses Details
          </h2>
          <img
            onClick={onCancel}
            src="/global/close.svg"
            style={{
              width: "2rem",
              height: "2rem",
              filter: "invert(1)",
              cursor: "pointer",
            }}
          />
        </div>

        <div
          style={{
            width: "100%",
            height: "0.1rem",
            backgroundColor: "black",
            borderRadius: "999px",
          }}
        />

        {/* Course Name */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <p style={{ marginRight: "1rem", whiteSpace: "nowrap", paddingBlock:"0.5rem" }}>Course Name:</p>
          <div
            style={{
              paddingInline: "1rem",
              paddingBlock: "0.5rem",
              backgroundColor: "var(--medium-grey)",
              borderRadius: "2vh",
              color: "white",
            }}
          >
            <p>{courseTitle}</p>
          </div>
        </div>

        {/* Organization */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <p style={{paddingTop:"0.5rem"}}>Organization:</p>
          <div
            style={{
              paddingInline: "1rem",
              paddingBlock: "0.5rem",
              backgroundColor: "var(--medium-grey)",
              borderRadius: "2vh",
              color: "white",
            }}
          >
            <p>{courseOrg}</p>
          </div>
        </div>

        {/* Actions */}
        {mode === "complete" &&
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              onClick={onConfirm}
              variant="popup-inverted"
              style={{
                minWidth: "45%",
                flex: 0,
                whiteSpace: "nowrap",
              }}
            >
              Mark as done
            </Button>

            <Button
              onClick={onCancel}
              variant="popup"
              style={{
                minWidth: "45%",
                flex: 0,
                whiteSpace: "nowrap",
              }}
            >
              Continue
            </Button>
          </div>
        }

        {mode === "enroll" &&
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Button
              onClick={onConfirm}
              variant="popup"
              style={{
                flex: 1,
                whiteSpace: "nowrap",
              }}
            >
              Enroll
            </Button>
          </div>
        }

      </div>
    </div>
  );
}