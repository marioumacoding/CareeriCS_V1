"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type StepItem = {
  label: string;
  href: string;
};

type StepNode = {
  label: string | null;
  href?: string;
  globalIndex: number;
};

type StepFlowProps = {
  steps: StepItem[];
  isNavigatable?: boolean;
  onSelect?: (index: number) => void;
  selectedIndex?: number;

  // NEW: allow parent-controlled routing
  routeOnClick?: boolean;
  roadmapId?: string;
};

const COLUMNS = 4;
const ROW_GAP = 60;
const DEFAULT_BORDER_COLOR = "#C1CBE6";
const NODE_HEIGHT = 50;

export const StepFlow: React.FC<StepFlowProps> = ({
  steps,
  onSelect,
  isNavigatable = true,
  selectedIndex,
  routeOnClick = true,
  roadmapId,
}) => {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const rows: StepNode[][] = [];

  for (let i = 0; i < steps.length; i += COLUMNS) {
    const chunk: StepNode[] = steps
      .slice(i, i + COLUMNS)
      .map((step, index) => ({
        label: step.label,
        href: step.href,
        globalIndex: i + index,
      }));

    const rowIndex = Math.floor(i / COLUMNS);
    const isOddRow = rowIndex % 2 === 1;

    while (chunk.length < COLUMNS) {
      chunk.push({
        label: null,
        globalIndex: -1,
      });
    }

    if (isOddRow) chunk.reverse();

    rows.push(chunk);
  }

  const flat = rows.flat();
  const HORIZONTAL_DISTANCE = ROW_GAP;

  const toSlug = (text: string) =>
    text.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
        columnGap: `${ROW_GAP}px`,
        rowGap: `${ROW_GAP}px`,
        width: "100%",
        height: "100%",
      }}
    >
      {flat.map((node, index) => {
        if (!node.label)
          return <div key={`empty-${index}`} />;

        const rowIndex = Math.floor(index / COLUMNS);
        const colIndex = index % COLUMNS;
        const isOddRow = rowIndex % 2 === 1;

        const isLastStep = node.globalIndex === steps.length - 1;

        const isEndOfRow = isOddRow
          ? colIndex === 0
          : colIndex === COLUMNS - 1;

        const isHovered = hoveredIndex === node.globalIndex;
        const isSelected = selectedIndex === node.globalIndex;

        return (
          <div
            key={node.globalIndex}
            style={{
              position: "relative",
              width: "100%",
              height: NODE_HEIGHT,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontFamily: "var(--font-nova-square)",
            }}
          >
            {/* NODE */}
            <div
              onMouseEnter={() => setHoveredIndex(node.globalIndex)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => {
                onSelect?.(node.globalIndex);

                if (isNavigatable && routeOnClick && node.label) {
                  router.push(
                    `/roadmap-feature${
                      roadmapId
                        ? `?roadmap=${roadmapId}&step=${toSlug(
                            node.label
                          )}`
                        : `?step=${toSlug(node.label)}`
                    }`
                  );
                }
              }}
              style={{
                width: "100%",
                height: NODE_HEIGHT,

                border: `2px solid ${
                  isHovered || isSelected
                    ? "var(--hover-green)"
                    : DEFAULT_BORDER_COLOR
                }`,

                borderRadius: "99px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                background:
                  isHovered || isSelected
                    ? "var(--hover-green)"
                    : "#C1CBE6",

                fontWeight: "bold",
                zIndex: 2,
                cursor: isNavigatable ? "pointer" : "default",
              }}
            >
              {node.label}
            </div>

            {/* HORIZONTAL CONNECTOR */}
            {!isEndOfRow && !isLastStep && (
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: isOddRow
                    ? `-${HORIZONTAL_DISTANCE}px`
                    : "100%",
                  width: `${HORIZONTAL_DISTANCE}px`,
                  height: "20px",
                  transform: "translateY(-50%)",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                <img
                  src="/connector.svg"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                  }}
                />
              </div>
            )}

            {/* VERTICAL CONNECTOR */}
            {isEndOfRow && !isLastStep && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "50%",
                  width: "20px",
                  height: `${ROW_GAP}px`,
                  transform: "translateX(-50%)",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                <img
                  src="/connectorV.svg"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "fill",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};