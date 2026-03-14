import Link from "next/link";
import styles from "@/components/roadmaps/roadmap-theme.module.scss";
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
        className={styles.graphEmpty}
        style={{ minHeight: "24rem", display: "flex", alignItems: "center", justifyContent: "center" }}
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
    <div className={styles.graphViewport}>
      <div
        className={styles.graphCanvas}
        style={{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }}
      >
        <svg
          width={canvasWidth}
          height={canvasHeight}
          className={styles.graphSvg}
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
                className={styles.graphEdge}
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
                className={styles.sectionNode}
                style={{ left, top, width, minHeight: height }}
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
                className={[
                  styles.textNode,
                  node.type === "title"
                    ? styles.textTitle
                    : node.type === "paragraph"
                      ? styles.textParagraph
                      : styles.textLabel,
                ].join(" ")}
                style={{
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
                  backgroundColor: nodeBackground,
                  border: nodeBorder,
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
                className={styles.buttonNode}
                style={{
                  left,
                  top,
                  width,
                  minHeight: height,
                  color: node.data?.color || "var(--roadmap-ink)",
                  backgroundColor: node.data?.backgroundColor || "var(--roadmap-yellow)",
                  border: `1px solid ${node.data?.borderColor || node.data?.backgroundColor || "var(--roadmap-yellow-strong)"}`,
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
              className={styles.nodeLink}
              style={{ left, top, width, minHeight: height }}
            >
              <div
                className={[
                  styles.nodeCard,
                  node.completed ? styles.nodeComplete : "",
                  isSelected ? styles.nodeSelected : "",
                ].filter(Boolean).join(" ")}
                style={{
                  backgroundColor: node.completed
                    ? undefined
                    : node.data?.style?.backgroundColor || undefined,
                  borderColor: isSelected
                    ? undefined
                    : node.completed
                      ? undefined
                      : node.data?.style?.borderColor || undefined,
                }}
              >
                <div
                  className={styles.nodeCardTitle}
                  style={{
                    fontSize: node.data?.style?.fontSize
                      ? `${Math.max(0.9, node.data.style.fontSize / 16)}rem`
                      : "1rem",
                  }}
                >
                  {getRoadmapNodeLabel(node)}
                </div>
                <div className={styles.nodeMeta}>
                  <span>{node.completed ? "Completed" : "Open step"}</span>
                  <span className={styles.statusDot} />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}