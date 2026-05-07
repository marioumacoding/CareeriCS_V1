"use client";

import React, { useReducer } from "react";
import JourneyFolder from "@/components/ui/journey-folder";
import { useRouter } from "next/navigation";

type JourneyTreeProps = {
  current: number;
  maxReached: number;
  renderContent?: () => React.ReactNode;
};

function renderChain(
  phases: number[],
  current: number,
  maxReached: number,
  renderContent?: () => React.ReactNode
): React.ReactNode {
  if (phases.length === 0) return null;

  const [first, ...rest] = phases;
  const isCurrent = first === current;
  const isAheadOfMax = current < maxReached;


  return (
    <JourneyFolder phase={first} current={isCurrent}>
      {rest.length > 0 &&
        (isCurrent ? (
          <div
            style={{
              width: isAheadOfMax ? "12rem" : "100%",
              display: "flex",
              flexShrink: 0,
            }}
          >
            {renderChain(rest, current, maxReached, renderContent)}
          </div>
        ) : (
          renderChain(rest, current, maxReached, renderContent)
        ))}

      {isCurrent && (
        <div
          style={{
            width: "100%",
            height: "100%",
          }}
        >
          {renderContent?.()}
        </div>
      )}
    </JourneyFolder>
  );
}

export default function JourneyTree({
  current,
  maxReached,
  renderContent,
}: JourneyTreeProps) {
  const phases = Array.from({ length: maxReached }, (_, i) => i + 1);
  const router = useRouter();

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        paddingInline: "40px",
        paddingBlock: "20px",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginBottom:"10px",
        }}
      >
        <img
          src={"/global/close.svg"}
          onClick={() => router.push("/features/home")}
          style={{
            width: "1.5rem",
            height: "1.5rem",
            cursor: "pointer",
          }}
        />
      </div>
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
        }}
      >
        {renderChain(phases, current, maxReached, renderContent)}
      </div>
    </div>
  );
}