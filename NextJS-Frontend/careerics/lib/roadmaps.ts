import type { RoadmapNode } from "@/types";

const ROADMAP_STEP_TYPES = new Set(["topic", "subtopic"]);
const ROADMAP_CONNECTOR_TYPES = new Set(["horizontal", "vertical"]);
const ROADMAP_TEXT_TYPES = new Set(["title", "paragraph", "label"]);

export function isRoadmapStepNode(node: RoadmapNode): boolean {
  return ROADMAP_STEP_TYPES.has(node.type ?? "");
}

export function isRoadmapConnectorNode(node: RoadmapNode): boolean {
  return ROADMAP_CONNECTOR_TYPES.has(node.type ?? "");
}

export function isRoadmapTextNode(node: RoadmapNode): boolean {
  return ROADMAP_TEXT_TYPES.has(node.type ?? "");
}

export function getRoadmapNodeLabel(node: RoadmapNode): string {
  const label = typeof node.data?.label === "string" ? node.data.label.trim() : "";
  const slug = typeof node.data?.slug === "string" ? node.data.slug.trim() : "";
  return label || slug || node.id;
}

export function getRoadmapNodeContentKey(node: RoadmapNode): string {
  const slug = typeof node.data?.slug === "string" ? node.data.slug.trim() : "";
  return slug || node.id;
}

export function getRoadmapNodeHref(roadmapSlug: string, node: RoadmapNode): string | null {
  if (isRoadmapStepNode(node)) {
    return `/dashboard/roadmaps/${roadmapSlug}/${getRoadmapNodeContentKey(node)}`;
  }

  if (node.type === "button" && typeof node.data?.href === "string" && node.data.href.trim()) {
    return node.data.href.trim();
  }

  return null;
}