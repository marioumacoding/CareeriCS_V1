"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import RoadmapConnectorLayer from "@/app/features/roadmap/components/roadmap-connector-layer";
import RoadmapStepNode from "@/app/features/roadmap/components/roadmap-step-node";
import {
  type RoadmapFlowNode,
  useRoadmapFlowLayout,
} from "@/app/features/roadmap/hooks/use-roadmap-flow-layout";
import type {
  RoadmapRead,
  SectionProgressSummary,
} from "@/types";

interface JourneyRoadmapCanvasProps {
  roadmap: RoadmapRead | null;
  progressBySectionId?: Record<string, SectionProgressSummary>;
  selectedSectionId?: string | null;
  onSelectSection?: (sectionId: string) => void;
  emptyMessage?: string;
}

export default function JourneyRoadmapCanvas({
  roadmap,
  progressBySectionId,
  selectedSectionId,
  onSelectSection,
  emptyMessage = "No sections available in this roadmap yet.",
}: JourneyRoadmapCanvasProps) {
  const { nodes, edges, width, height } = useRoadmapFlowLayout(roadmap, {
    columns: 4,
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
  const selectedNode = nodes.find((node) => node.id === selectedId) ?? null;

  useEffect(() => {
    if (!selectedNode) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const maxScrollLeft = Math.max(0, renderWidth - viewport.clientWidth);
    const maxScrollTop = Math.max(0, renderHeight - viewport.clientHeight);

    const targetLeft = Math.max(
      0,
      Math.min(
        offsetX + selectedNode.x + selectedNode.width / 2 - viewport.clientWidth / 2,
        maxScrollLeft,
      ),
    );

    const targetTop = Math.max(
      0,
      Math.min(
        offsetY + selectedNode.y + selectedNode.height / 2 - viewport.clientHeight / 2,
        maxScrollTop,
      ),
    );

    viewport.scrollTo({
      left: targetLeft,
      top: targetTop,
      behavior: "auto",
    });
  }, [offsetX, offsetY, renderHeight, renderWidth, selectedNode]);

  return (
    <div
      ref={viewportRef}
      className="relative h-full min-h-0 overflow-auto rounded-2xl border border-white/15 bg-[#102359] [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:h-0 [&::-webkit-scrollbar]:w-0"
      aria-label="Journey roadmap flowchart"
    >
      <div className="relative min-h-full min-w-full" style={{ width: renderWidth, height: renderHeight }}>
        <div className="absolute" style={{ left: offsetX, top: offsetY, width, height }}>
          <RoadmapConnectorLayer edges={edges} width={width} height={height} />

          {nodes.map((node: RoadmapFlowNode) => (
            <RoadmapStepNode
              key={node.id}
              node={node}
              selected={selectedId === node.id}
              onSelect={onSelectSection}
            />
          ))}
        </div>
      </div>
    </div>
  );
}