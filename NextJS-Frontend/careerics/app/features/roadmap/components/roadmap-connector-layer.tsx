import type { RoadmapFlowEdge } from "../hooks/use-roadmap-flow-layout";

interface RoadmapConnectorLayerProps {
  edges: RoadmapFlowEdge[];
  width: number;
  height: number;
}

export default function RoadmapConnectorLayer({
  edges,
  width,
  height,
}: RoadmapConnectorLayerProps) {
  if (!edges.length || width <= 0 || height <= 0) {
    return null;
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="absolute left-0 top-0"
      aria-hidden="true"
    >
      {edges.map((edge) => (
        <path
          key={edge.id}
          d={edge.path}
          fill="none"
          stroke={edge.sectionBreak ? "#dce4ff" : "#bfcdf1"}
          strokeWidth={edge.sectionBreak ? 2.2 : 1.9}
          strokeDasharray={edge.sectionBreak ? "8 7" : undefined}
          strokeLinecap="round"
          opacity={edge.sectionBreak ? 0.95 : 0.82}
        />
      ))}
    </svg>
  );
}
