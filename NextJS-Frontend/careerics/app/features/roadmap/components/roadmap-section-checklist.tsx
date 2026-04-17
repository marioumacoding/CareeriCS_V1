import type {
  RoadmapCompletionStatus,
  RoadmapRead,
  StepProgressRead,
} from "@/types";

import { statusChipClass } from "../utils";

interface RoadmapSectionChecklistProps {
  roadmap: RoadmapRead | null;
  selectedSectionId?: string | null;
  progressByStepId: Record<string, StepProgressRead>;
  onToggleStep?: (stepId: string, nextStatus: RoadmapCompletionStatus) => void;
  onSelectStep?: (stepId: string) => void;
  updatingStepId?: string | null;
}

export default function RoadmapSectionChecklist({
  roadmap,
  selectedSectionId,
  progressByStepId,
  onToggleStep,
  onSelectStep,
  updatingStepId,
}: RoadmapSectionChecklistProps) {
  if (!roadmap) {
    return null;
  }

  const sections = roadmap.sections.slice().sort((a, b) => a.order - b.order);
  const activeSection =
    sections.find((section) => section.id === selectedSectionId) ??
    sections[0] ??
    null;

  if (!activeSection) {
    return null;
  }

  return (
    <section className="rounded-xl border border-white/15 bg-[#132657]/65 p-4 text-[#eef4ff]">
      <div className="flex items-center justify-between gap-2">
        <h3 className="m-0 text-[0.98rem]">{activeSection.title}</h3>
        <span className="rounded-full border border-white/20 bg-white/5 px-2 py-0.5 text-[0.68rem] uppercase tracking-[0.07em] text-white/75">
          {activeSection.steps.length} steps
        </span>
      </div>

      <ul className="m-0 mt-3 space-y-2 p-0">
        {activeSection.steps
          .slice()
          .sort((a, b) => a.order - b.order)
          .map((step) => {
            const status = progressByStepId[step.id]?.completion_status ?? "not_started";
            const checked = status === "completed";

            return (
              <li
                key={step.id}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2"
                onClick={() => onSelectStep?.(step.id)}
                role={onSelectStep ? "button" : undefined}
                tabIndex={onSelectStep ? 0 : undefined}
                onKeyDown={(event) => {
                  if (!onSelectStep) {
                    return;
                  }

                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectStep(step.id);
                  }
                }}
              >
                <div className="min-w-0">
                  <p className="m-0 truncate text-[0.84rem]">{step.title}</p>
                  <p className="m-0 mt-0.5 text-[0.72rem] text-white/70">
                    {step.resources.length ? `${step.resources.length} resources` : "No resources"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-0.5 text-[0.63rem] uppercase tracking-[0.07em] ${statusChipClass(status)}`}>
                    {status.replace("_", " ")}
                  </span>

                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={Boolean(updatingStepId)}
                    onClick={(event) => event.stopPropagation()}
                    onChange={() => {
                      const nextStatus: RoadmapCompletionStatus = checked
                        ? "not_started"
                        : "completed";
                      onToggleStep?.(step.id, nextStatus);
                    }}
                    className="h-4 w-4 cursor-pointer accent-[#2b5da4]"
                    aria-label={`Mark ${step.title} as ${checked ? "not started" : "completed"}`}
                  />
                </div>
              </li>
            );
          })}
      </ul>
    </section>
  );
}
