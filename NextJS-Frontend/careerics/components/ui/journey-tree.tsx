"use client";

import React from "react";
import JourneyFolder from "@/components/ui/journey-folder";

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

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        display: "flex",
        padding: "40px",
      }}
    >
      {renderChain(phases, current, maxReached, renderContent)}
    </div>
  );
}