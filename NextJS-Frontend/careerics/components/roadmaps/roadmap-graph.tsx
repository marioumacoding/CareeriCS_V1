import Link from "next/link";
import {
  getRoadmapNodeContentKey,
  getRoadmapNodeHref,
  getRoadmapNodeLabel,
  isRoadmapConnectorNode,
  isRoadmapStepNode,
  isRoadmapTextNode,
} from "@/lib/roadmaps";
import type { RoadmapDocument, RoadmapNode } from "@/types";

interface RoadmapGraphProps {
  roadmapSlug: string;
  roadmap: RoadmapDocument;
  selectedNodeId?: string;
}

const DEFAULT_NODE_WIDTH = 220;
const DEFAULT_NODE_HEIGHT = 88;
const CANVAS_PADDING = 120;
const VALID_STROKE_LINECAPS = new Set(["inherit", "round", "butt", "square"]);

function getNodeWidth(node: RoadmapNode): number {
  return node.width ?? node.data?.style?.width ?? DEFAULT_NODE_WIDTH;
}

function getNodeHeight(node: RoadmapNode): number {
  return node.height ?? node.data?.style?.height ?? DEFAULT_NODE_HEIGHT;
}

export function RoadmapGraph({ roadmapSlug, roadmap, selectedNodeId }: RoadmapGraphProps) {
  const nodes = roadmap.nodes.filter((node) => node.position);
  const renderableNodes = nodes.filter((node) => !isRoadmapConnectorNode(node));
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));

  if (!renderableNodes.length) {
    return (
      <div
        style={{
          minHeight: "24rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "28px",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
        }}
      >
        No roadmap nodes were returned by the API.
      </div>
    );
  }

  const minX = Math.min(...renderableNodes.map((node) => node.position?.x ?? 0));
  const minY = Math.min(...renderableNodes.map((node) => node.position?.y ?? 0));
  const maxX = Math.max(...renderableNodes.map((node) => (node.position?.x ?? 0) + getNodeWidth(node)));
  const maxY = Math.max(...renderableNodes.map((node) => (node.position?.y ?? 0) + getNodeHeight(node)));

  const canvasWidth = maxX - minX + CANVAS_PADDING * 2;
  const canvasHeight = maxY - minY + CANVAS_PADDING * 2;

  return (
    <div
      style={{
        overflow: "auto",
        background:
          "radial-gradient(circle at top left, rgba(0,178,255,0.14), rgba(255,255,255,0) 35%), linear-gradient(180deg, rgba(20,33,67,0.95), rgba(10,10,10,0.96))",
        borderRadius: "28px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        minHeight: "34rem",
      }}
    >
      <div
        style={{
          position: "relative",
          width: `${canvasWidth}px`,
          height: `${canvasHeight}px`,
        }}
      >
        <svg
          width={canvasWidth}
          height={canvasHeight}
          style={{ position: "absolute", inset: 0, overflow: "visible" }}
        >
          {roadmap.edges.map((edge, index) => {
            if (!edge.source || !edge.target) return null;

            const sourceNode = nodeMap.get(edge.source);
            const targetNode = nodeMap.get(edge.target);
            if (!sourceNode?.position || !targetNode?.position) return null;

            const x1 = sourceNode.position.x - minX + CANVAS_PADDING + getNodeWidth(sourceNode) / 2;
            const y1 = sourceNode.position.y - minY + CANVAS_PADDING + getNodeHeight(sourceNode) / 2;
            const x2 = targetNode.position.x - minX + CANVAS_PADDING + getNodeWidth(targetNode) / 2;
            const y2 = targetNode.position.y - minY + CANVAS_PADDING + getNodeHeight(targetNode) / 2;
            const controlOffset = Math.max(36, Math.abs(y2 - y1) * 0.18);

            return (
              <path
                key={edge.id ?? `${edge.source}-${edge.target}-${index}`}
                d={`M ${x1} ${y1} C ${x1} ${y1 + controlOffset}, ${x2} ${y2 - controlOffset}, ${x2} ${y2}`}
                fill="none"
                stroke={typeof edge.style?.stroke === "string" ? edge.style.stroke : "rgba(255,255,255,0.24)"}
                strokeWidth={typeof edge.style?.strokeWidth === "number" ? edge.style.strokeWidth : 2}
                strokeLinecap={
                  typeof edge.style?.strokeLinecap === "string" && VALID_STROKE_LINECAPS.has(edge.style.strokeLinecap)
                    ? (edge.style.strokeLinecap as "inherit" | "round" | "butt" | "square")
                    : "round"
                }
                strokeDasharray={typeof edge.style?.strokeDasharray === "string" ? edge.style.strokeDasharray : undefined}
              />
            );
          })}
        </svg>

        {renderableNodes.map((node) => {
          if (!node.position) return null;

          const href = getRoadmapNodeHref(roadmapSlug, node);
          const left = node.position.x - minX + CANVAS_PADDING;
          const top = node.position.y - minY + CANVAS_PADDING;
          const width = getNodeWidth(node);
          const height = getNodeHeight(node);
          const contentKey = getRoadmapNodeContentKey(node);
          const isSelected = selectedNodeId === node.id || selectedNodeId === contentKey;

          if (node.type === "section") {
            return (
              <div
                key={node.id}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width,
                  minHeight: height,
                  borderRadius: "28px",
                  backgroundColor: "rgba(255, 255, 255, 0.04)",
                  border: "1px dashed rgba(255,255,255,0.12)",
                }}
              />
            );
          }

          if (isRoadmapTextNode(node)) {
            const nodeBackground =
              node.data?.style?.backgroundColor && node.data.style.backgroundColor !== "transparent"
                ? node.data.style.backgroundColor
                : "transparent";
            const nodeBorder =
              node.data?.style?.borderColor && node.data.style.borderColor !== "transparent"
                ? `1px solid ${node.data.style.borderColor}`
                : "none";
            const nodeColor =
              nodeBackground !== "transparent"
                ? node.data?.style?.color || "#0a0a0a"
                : "#f4f7fb";

            return (
              <div
                key={node.id}
                style={{
                  position: "absolute",
                  left,
                  top,
                  width,
                  minHeight: height,
                  padding: node.type === "paragraph" ? "0.8rem 0.95rem" : "0.35rem 0.5rem",
                  color: nodeColor,
                  lineHeight: 1.45,
                  fontWeight: node.type === "title" ? 800 : node.type === "label" ? 700 : 500,
                  fontSize: node.data?.style?.fontSize
                    ? `${Math.max(0.95, node.data.style.fontSize / 16)}rem`
                    : node.type === "title"
                      ? "1.8rem"
                      : node.type === "paragraph"
                        ? "0.98rem"
                        : "1rem",
                  fontFamily: node.type === "title" ? "var(--font-nova-square)" : "var(--font-jura)",
                    backgroundColor: nodeBackground,
                    border: nodeBorder,
                  borderRadius: "18px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {getRoadmapNodeLabel(node)}
              </div>
            );
          }

          if (node.type === "button" && href) {
            return (
              <a
                key={node.id}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={{
                  position: "absolute",
                  left,
                  top,
                  width,
                  minHeight: height,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.85rem 1rem",
                  borderRadius: "18px",
                  color: node.data?.color || "white",
                  backgroundColor: node.data?.backgroundColor || "#4136D4",
                  border: `1px solid ${node.data?.borderColor || node.data?.backgroundColor || "#4136D4"}`,
                  fontWeight: 700,
                  textAlign: "center",
                  boxShadow: "0 14px 30px rgba(0,0,0,0.18)",
                }}
              >
                {getRoadmapNodeLabel(node)}
              </a>
            );
          }

          if (!isRoadmapStepNode(node) || !href) {
            return null;
          }

          return (
            <Link
              key={node.id}
              href={href}
              style={{
                position: "absolute",
                left,
                top,
                width,
                minHeight: height,
                textDecoration: "none",
                color: "white",
                display: "flex",
              }}
            >
              <div
                style={{
                  width: "100%",
                  minHeight: "100%",
                  borderRadius: "22px",
                  padding: "0.95rem 1rem",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: "0.6rem",
                  backgroundColor: node.data?.style?.backgroundColor || "rgba(20, 33, 67, 0.94)",
                  border: `2px solid ${
                    isSelected
                      ? "var(--light-blue)"
                      : node.completed
                        ? "var(--primary-green)"
                        : node.data?.style?.borderColor || "rgba(255,255,255,0.18)"
                  }`,
                  boxShadow: isSelected
                    ? "0 0 0 4px rgba(0,178,255,0.16), 0 18px 30px rgba(0,0,0,0.28)"
                    : "0 14px 28px rgba(0,0,0,0.18)",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    lineHeight: 1.35,
                    fontSize: node.data?.style?.fontSize
                      ? `${Math.max(0.9, node.data.style.fontSize / 16)}rem`
                      : "1rem",
                  }}
                >
                  {getRoadmapNodeLabel(node)}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.78rem",
                    color: "rgba(255,255,255,0.74)",
                  }}
                >
                  <span>{node.completed ? "Completed" : "Open step"}</span>
                  <span
                    style={{
                      width: "0.8rem",
                      height: "0.8rem",
                      borderRadius: "999px",
                      backgroundColor: node.completed ? "var(--primary-green)" : "rgba(255,255,255,0.2)",
                    }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}