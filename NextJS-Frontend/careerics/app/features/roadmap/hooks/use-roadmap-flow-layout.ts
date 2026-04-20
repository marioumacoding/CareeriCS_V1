import { useMemo } from "react";

import type {
  RoadmapCompletionStatus,
  RoadmapRead,
  RoadmapSectionRead,
  SectionProgressSummary,
} from "@/types";

export interface RoadmapFlowNode {
  id: string;
  section: RoadmapSectionRead;
  sectionIndex: number;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: RoadmapCompletionStatus;
  completedSteps: number;
  totalSteps: number;
}

export interface RoadmapFlowEdge {
  id: string;
  fromId: string;
  toId: string;
  path: string;
  sectionBreak: boolean;
}

interface UseRoadmapFlowLayoutOptions {
  compact?: boolean;
  columns?: number;
  progressBySectionId?: Record<string, SectionProgressSummary>;
}

interface RoadmapFlowLayout {
  nodes: RoadmapFlowNode[];
  edges: RoadmapFlowEdge[];
  width: number;
  height: number;
}

const COMPACT_METRICS = {
  nodeWidth: 168,
  nodeHeight: 64,
  gapX: 56,
  gapY: 50,
  paddingX: 34,
  paddingY: 30,
};

const DETAILED_METRICS = {
  nodeWidth: 212,
  nodeHeight: 78,
  gapX: 74,
  gapY: 62,
  paddingX: 36,
  paddingY: 30,
};

function resolveStatus(
  sectionId: string,
  progressBySectionId: Record<string, SectionProgressSummary> | undefined,
): RoadmapCompletionStatus {
  return progressBySectionId?.[sectionId]?.completion_status ?? "not_started";
}

function resolveCompletedSteps(
  section: RoadmapSectionRead,
  progressBySectionId: Record<string, SectionProgressSummary> | undefined,
): number {
  return progressBySectionId?.[section.id]?.completed_steps ?? 0;
}

function connectorPath(fromNode: RoadmapFlowNode, toNode: RoadmapFlowNode): string {
  const fromCenterY = fromNode.y + fromNode.height / 2;
  const toCenterY = toNode.y + toNode.height / 2;

  const goingRight = toNode.x > fromNode.x;
  const startX = goingRight ? fromNode.x + fromNode.width : fromNode.x;
  const endX = goingRight ? toNode.x : toNode.x + toNode.width;

  const horizontalDistance = Math.abs(endX - startX);
  const controlOffsetX = Math.max(28, Math.min(126, horizontalDistance * 0.5));
  const controlStartX = goingRight ? startX + controlOffsetX : startX - controlOffsetX;
  const controlEndX = goingRight ? endX - controlOffsetX : endX + controlOffsetX;

  return `M ${startX} ${fromCenterY} C ${controlStartX} ${fromCenterY}, ${controlEndX} ${toCenterY}, ${endX} ${toCenterY}`;
}

export function useRoadmapFlowLayout(
  roadmap: RoadmapRead | null,
  options: UseRoadmapFlowLayoutOptions = {},
): RoadmapFlowLayout {
  return useMemo(() => {
    if (!roadmap) {
      return {
        nodes: [],
        edges: [],
        width: 0,
        height: 0,
      };
    }

    const compact = options.compact ?? false;
    const metrics = compact ? COMPACT_METRICS : DETAILED_METRICS;
    const requestedColumns = options.columns ?? (compact ? 4 : 4);

    const flattened = roadmap.sections
      .slice()
      .sort((a, b) => a.order - b.order)
      .map((section, sectionIndex) => ({ section, sectionIndex }));

    if (!flattened.length) {
      return {
        nodes: [],
        edges: [],
        width: 0,
        height: 0,
      };
    }

    const columns = Math.max(2, Math.min(requestedColumns, flattened.length));

    const nodes: RoadmapFlowNode[] = flattened.map(({ section, sectionIndex }, index) => {
      const row = Math.floor(index / columns);
      const colInRow = index % columns;
      const serpentineCol = row % 2 === 0 ? colInRow : columns - 1 - colInRow;

      const x = metrics.paddingX + serpentineCol * (metrics.nodeWidth + metrics.gapX);
      const y = metrics.paddingY + row * (metrics.nodeHeight + metrics.gapY);

      return {
        id: section.id,
        section,
        sectionIndex,
        row,
        col: serpentineCol,
        x,
        y,
        width: metrics.nodeWidth,
        height: metrics.nodeHeight,
        status: resolveStatus(section.id, options.progressBySectionId),
        completedSteps: resolveCompletedSteps(section, options.progressBySectionId),
        totalSteps: section.steps.length,
      };
    });

    const edges: RoadmapFlowEdge[] = [];
    for (let index = 0; index < nodes.length - 1; index += 1) {
      const fromNode = nodes[index];
      const toNode = nodes[index + 1];
      const sectionBreak = fromNode.section.id !== toNode.section.id;

      edges.push({
        id: `${fromNode.id}-${toNode.id}`,
        fromId: fromNode.id,
        toId: toNode.id,
        path: connectorPath(fromNode, toNode),
        sectionBreak,
      });
    }

    const maxCol = nodes.reduce((acc, node) => Math.max(acc, node.col), 0);
    const maxRow = nodes.reduce((acc, node) => Math.max(acc, node.row), 0);

    return {
      nodes,
      edges,
      width:
        metrics.paddingX * 2 +
        (maxCol + 1) * metrics.nodeWidth +
        maxCol * metrics.gapX,
      height:
        metrics.paddingY * 2 +
        (maxRow + 1) * metrics.nodeHeight +
        maxRow * metrics.gapY,
    };
  }, [roadmap, options.columns, options.compact, options.progressBySectionId]);
}
