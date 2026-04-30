"use client";
import React, { useState } from "react";
import { Button } from "./button";

interface SkillConfirmPopupProps {
  skillName: string;
  isLoading?: boolean;
  onConfirm: (questions: number) => void;
  onCancel: () => void;
  testCode: string;
}

export default function SkillConfirmPopup({
  skillName,
  isLoading = false,
  onConfirm,
  onCancel,
  testCode,
}: SkillConfirmPopupProps) {
  const [questions, setQuestions] = useState("");

  const numericValue = Number(questions);
  const isValid =
    questions !== "" && numericValue >= 5 && numericValue <= 20;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Start skill assessment confirmation"
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
        zIndex: 1000,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={{
          backgroundColor: "#E6FFB2",
          width: "26rem",
          padding: "4vh",
          borderRadius: "40px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "2vh",
          fontFamily: "var(--font-nova-square)",
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
            Customize Your Assessment
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

        {/* Code */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ marginRight: "1rem", whiteSpace: "nowrap" }}>
            Assessment's Code:
          </p>
          <div
            style={{
              paddingInline: "1rem",
              paddingBlock: "0.5rem",
              backgroundColor: "#636771",
              borderRadius: "2vh",
              color: "white",
              width: "12rem",
            }}
          >
            <p>{testCode}</p>
          </div>
        </div>

        {/* Skill */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ marginRight: "1rem", whiteSpace: "nowrap" }}>
            Skill Chosen:
          </p>
          <div
            style={{
              paddingInline: "1rem",
              paddingBlock: "0.5rem",
              backgroundColor: "#636771",
              borderRadius: "2vh",
              color: "white",
              width: "12rem",
            }}
          >
            <p>{skillName}</p>
          </div>
        </div>

        {/* Questions */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <p style={{ marginRight: "1rem", whiteSpace: "nowrap" }}>
            No. of Questions:
          </p>

          <input
            type="text"
            inputMode="numeric"
            placeholder="Enter number (5–20)"
            value={questions}
            onChange={(e) => {
              const value = e.target.value;

              // allow only digits
              if (!/^\d*$/.test(value)) return;

              if (value === "") {
                setQuestions("");
                return;
              }

              const num = Number(value);

              if (num <= 20) {
                setQuestions(value);
              }
            }}
            onBlur={() => {
              if (questions === "") return;

              let num = Number(questions);

              if (num < 5) num = 5;
              if (num > 20) num = 20;

              setQuestions(String(num));
            }}
            style={{
              paddingInline: "1rem",
              paddingBlock: "0.5rem",
              backgroundColor: "white",
              borderRadius: "2vh",
              color: "black",
              width: "12rem",
              border: "none",
              outline: "none",
            }}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
            <Button
              onClick={onCancel}
              variant="popup-inverted"
              style={{
                minWidth: "45%",
                flex: 0,
                whiteSpace: "nowrap",
              }}
            >
              Cancel
            </Button>

          <Button
            onClick={() => onConfirm(numericValue)}
            disabled={!isValid || isLoading}
            variant="popup"
            style={{
              minWidth: "45%",
              flex: 0,
              whiteSpace: "nowrap",
            }}
          >
            {isLoading ? "Starting..." : "Start Assessment"}
          </Button>
        </div>
      </div>
    </div>
  );
}