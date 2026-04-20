import type { RoadmapFlowNode } from "../hooks/use-roadmap-flow-layout";
import { statusNodeClass } from "../utils";

interface RoadmapStepNodeProps {
  node: RoadmapFlowNode;
  selected: boolean;
  disabled?: boolean;
  onSelect?: (sectionId: string) => void;
}

export default function RoadmapStepNode({
  node,
  selected,
  disabled = false,
  onSelect,
}: RoadmapStepNodeProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      onClick={() => onSelect?.(node.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect?.(node.id);
        }
      }}
      className={`absolute rounded-[1.05rem] border p-3 text-left transition-all ${statusNodeClass(node.status)} ${
        selected ? "ring-2 ring-[#b8ef46] ring-offset-2 ring-offset-[#17295c]" : ""
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: node.width,
        height: node.height,
        cursor: disabled ? "not-allowed" : "pointer",
      }}
      aria-label={`Section ${node.sectionIndex + 1}: ${node.section.title}`}
      aria-pressed={selected}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="m-0 truncate text-[0.92rem] font-semibold leading-tight">
            {node.section.title}
          </p>
          <p className="m-0 mt-1 truncate text-[0.68rem] uppercase tracking-[0.07em] opacity-75">
            Section {node.sectionIndex + 1}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[0.66rem] opacity-75">
        <span>
          {node.completedSteps}/{node.totalSteps} steps
        </span>
        <span>{node.status.replace("_", " ")}</span>
      </div>
    </div>
  );
}
