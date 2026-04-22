import React from "react";

type StepNode = {
  label: string | null;
  globalIndex: number;
};

type StepFlowProps = {
  steps: string[];
};

const COLUMNS = 4;
const ROW_GAP = 60;
const BORDER_COLOR = "#C1CBE6";
const NODE_HEIGHT = 50;

export const StepFlow: React.FC<StepFlowProps> = ({ steps }) => {
  const rows: StepNode[][] = [];

  // Build snake rows
  for (let i = 0; i < steps.length; i += COLUMNS) {
    const chunk: StepNode[] = steps.slice(i, i + COLUMNS).map((step, index) => ({
      label: step,
      globalIndex: i + index,
    }));

    const rowIndex = Math.floor(i / COLUMNS);
    const isOddRow = rowIndex % 2 === 1;

    // pad row
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

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
        columnGap: `${ROW_GAP}px`,
        rowGap: `${ROW_GAP}px`,
        width: "100%",
        height:"100%",
      }}
    >
      {flat.map((node, index) => {
        if (!node.label) return <div key={`empty-${index}`} />;

        const rowIndex = Math.floor(index / COLUMNS);
        const colIndex = index % COLUMNS;
        const isOddRow = rowIndex % 2 === 1;

        const isLastStep = node.globalIndex === steps.length - 1;

        const isEndOfRow = isOddRow
          ? colIndex === 0
          : colIndex === COLUMNS - 1;

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
              style={{
                width: "100%",
                height: NODE_HEIGHT,
                border: `2px solid ${BORDER_COLOR}`,
                borderRadius: "99px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#C1CBE6",
                fontWeight: "bold",
                zIndex: 2,
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
                  left: isOddRow ? `-${HORIZONTAL_DISTANCE}px` : "100%",
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