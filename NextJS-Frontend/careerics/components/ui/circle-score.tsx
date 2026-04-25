import React from "react";

type CircleScoreProps = {
    score: number;
};

export const CircleScore = ({ score }: CircleScoreProps) => {
    const radius = 18;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
        <div
            style={{
                position: "relative",
                width: "55px",
                height: "55px",
                backgroundColor: "#1A2E5A",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
            }}
        >
            <svg width="45" height="45" style={{ transform: "rotate(-90deg)" }}>
                {/* Track */}
                <circle
                    cx="22.5"
                    cy="22.5"
                    r={radius}
                    fill="none"
                    stroke="rgba(212, 255, 71, 0.1)"
                    strokeWidth="3.5"
                />

                {/* Progress */}
                <circle
                    cx="22.5"
                    cy="22.5"
                    r={radius}
                    fill="none"
                    stroke="#d4ff47"
                    strokeWidth="3.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    style={{ transition: "stroke-dashoffset 0.5s ease" }}
                />
            </svg>

            <span
                style={{
                    position: "absolute",
                    color: "white",
                    fontSize: "11px",
                    fontWeight: "bold",
                    fontFamily: "var(--font-nova-square)",
                }}
            >
                {score}%
            </span>
        </div>
    );
};