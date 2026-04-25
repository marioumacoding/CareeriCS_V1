"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  RoadmapRead,
  SectionProgressSummary,
} from "@/types";

import {
  type RoadmapFlowNode,
  useRoadmapFlowLayout,
} from "../hooks/use-roadmap-flow-layout";
import RoadmapConnectorLayer from "./roadmap-connector-layer";
import RoadmapStepNode from "./roadmap-step-node";

interface RoadmapFlowchartCanvasProps {
  roadmap: RoadmapRead | null;
  progressBySectionId?: Record<string, SectionProgressSummary>;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  compact?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
}

export default function RoadmapFlowchartCanvas({
  roadmap,
  progressBySectionId,
  selectedSectionId,
  onSelectSection,
  compact = false,
  disabled = false,
  emptyMessage = "No steps available for this roadmap yet.",
  className,
}: RoadmapFlowchartCanvasProps) {
  const { nodes, edges, width, height } = useRoadmapFlowLayout(roadmap, {
    compact,
    columns: compact ? 4 : 4,
    progressBySectionId,
  });

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const element = viewportRef.current;
    if (!element || typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      setViewportSize({
        width: Math.floor(entry.contentRect.width),
        height: Math.floor(entry.contentRect.height),
      });
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const renderWidth = useMemo(
    () => Math.max(width, viewportSize.width),
    [viewportSize.width, width],
  );

  const renderHeight = useMemo(
    () => Math.max(height, viewportSize.height),
    [viewportSize.height, height],
  );

  const offsetX = Math.max(0, Math.floor((renderWidth - width) / 2));
  const offsetY = Math.max(0, Math.floor((renderHeight - height) / 2));

  if (!nodes.length) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-2xl border border-white/15 bg-[#0f1f4d]/55 px-6 text-center text-[0.95rem] text-[#d8e0f5]">
        {emptyMessage}
      </div>
    );
  }

  const selectedId = selectedSectionId ?? nodes[0]?.id;

  return (
    <div
      ref={viewportRef}
      className={`relative min-h-0 overflow-auto rounded-2xl border border-white/15 bg-[#102359] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0 ${className ?? ""}`}
      aria-label="Roadmap flowchart"
    >
      <div className="relative min-h-full min-w-full" style={{ width: renderWidth, height: renderHeight }}>
        <div className="absolute" style={{ left: offsetX, top: offsetY, width, height }}>
          <RoadmapConnectorLayer edges={edges} width={width} height={height} />

          {nodes.map((node: RoadmapFlowNode) => (
            <RoadmapStepNode
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              disabled={disabled}
              onSelect={onSelectSection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
