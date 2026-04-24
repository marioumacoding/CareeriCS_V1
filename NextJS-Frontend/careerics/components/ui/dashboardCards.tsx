"use client";

import React, { useRef } from "react";
import Image from "next/image";

// --- 1. Helper: CircleScoreSVG ---
const CircleScoreSVG = ({
  score,
  size = 30,
}: {
  score: number;
  size?: number;
}) => {
  const radius = size / 2 - 3;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: `${size + 10}px`,
        height: `${size + 10}px`,
        backgroundColor: "var(--medium-blue)",
        borderRadius: "10px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(212, 255, 71, 0.1)"
          strokeWidth="2.5"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#d4ff47"
          strokeWidth="2.5"
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
          fontSize: "8px",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        {score}%
      </span>
    </div>
  );
};


// --- Card 2: Recent Activity ---
export const RecentActivityCard = ({ activities, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: 100,
        behavior: "smooth",
      });
    }
  };

  const scrollUp = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        top: -100,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#142143",
        borderRadius: "3vh",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        paddingTop: "3vh",
        paddingBottom: "1vh",
        paddingInline: "5vh",
        fontFamily: "var(--font-nova-square)",
        ...style,
      }}
    >
      <h3
        style={{
          fontSize: "18px",
          textAlign: "center",
          marginBottom: "2vh",
        }}
      >
        Recent Activity
      </h3>

      <div
        ref={scrollRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5vh",
          overflowY: "auto",
          scrollbarWidth: "none",
          scrollBehavior: "smooth",
        }}
      >
        {activities.map((act: any, i: number) => (
          <div
            key={i}
            style={{
              backgroundColor: "#c1cbe6",
              borderRadius: "12px",
              padding: "1.5vh",
              color: "black",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>
                {act.id}
              </div>
              <div style={{ fontSize: "10px" }}>
                {act.date || `On ${act.topic}`}
              </div>
            </div>

            {act.score !== undefined ? (
              <CircleScoreSVG score={act.score} size={30} />
            ) : (
              <div
                style={{
                  position: "relative",
                  width: "20px",
                  height: "20px",
                  cursor: "pointer",
                }}
              >
                <Image
                  src="/interview/download.svg"
                  alt="Download"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          width: "fit-content",
          marginLeft: "auto",
          marginTop: "auto",
        }} >

        <div
          onClick={scrollUp}
          style={{
            cursor: "pointer",
            transform: "rotate(-270deg)",
            marginRight: "auto",
          }}
        >
          <Image
            src="/auth/Back Arrow.svg"
            alt="Scroll"
            width={30}
            height={30}
          />
        </div>

        <div
          onClick={scrollDown}
          style={{
            display: "flex",
            justifyContent: "center",
            cursor: "pointer",
            transform: "rotate(270deg)",
          }}
        >
          <Image
            src="/auth/Back Arrow.svg"
            alt="Scroll"
            width={30}
            height={30}
          />
        </div>
      </div>
    </div>
  );
};

// --- Card 3: Journey Progress ---
export const JourneyProgressCard = ({ percentage = 10, style }: any) => {


  return (
    <div
      style={{
        backgroundColor: "#142143",
        borderRadius: " 3vh",
        paddingTop: "3vh",
        color: "white",
        alignContent: "center",
        justifyItems: "center",
        ...style,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          marginBottom: "1vh",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        Journey Progress
      </h3>

      <img
        src={`/journeyProgress/${percentage}.svg`}
        alt="Progress"
        style={{
          position: "relative",
          height: "70%"
        }}
      />

    </div>
  );
};
// --- Card 3: Current Phase ---
export const CurrentPhaseCard = ({ percentage = 10, style }: any) => {


  return (
    <div
      style={{
        backgroundColor: "#142143",
        borderRadius: " 3vh",
        paddingTop: "3vh",
        color: "white",
        alignContent: "center",
        justifyItems: "center",
        ...style,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          fontFamily: "var(--font-nova-square)",
          marginBottom: "auto",
        }}
      >
        Current Phase
      </h3>

      <img
        src={`/phases/currentPhase/${percentage}.svg`}
        alt="Progress"
        style={{
          position: "relative",
          marginLeft: "auto",
          width: "100%",
        }}
      />

    </div>
  );
};

// --- Card 4: NextPhaseCard ---
type NextPhaseCardProps = {
  style?: React.CSSProperties;
  desc: string;
  phaseNumber: string;
};

export const NextPhaseCard = ({ style, desc, phaseNumber }: NextPhaseCardProps) => (
  <div
    style={{
      backgroundColor: "#142143",
      borderRadius: "3vh",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      height: "100%",
      paddingLeft: "3vw",
      overflow: "clip",
      ...style,
    }}
  >


    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "fit-content"
      }}
    >
      <h3
        style={{
          fontSize: "1.1rem",
          marginBottom: "10px",
          fontFamily: "var(--font-nova-square)",
          marginTop: "3vh",
        }}
      >
        Next Phase
      </h3>

      <p
        style={{
          fontSize: "0.9rem",
          opacity: 0.7,
          lineHeight: "1.4",
          margin: 0,
          width: "25ch"
        }}
      >
        {desc}
      </p>
    </div>

    <div
      style={{
        height: "100%",
        position: "relative",
        width: "fit-content",
        display: "flex",
        alignItems: "center"
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          height: "100%",
          width: "0.4vh",

        }} />
      <img
        src={`/phases/${phaseNumber}.svg`}
        alt="phase"
        style={{ position: "relative", height: "100%", marginLeft: "auto" }}
      />

    </div>

  </div>
);