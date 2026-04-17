import type {
  RoadmapCompletionStatus,
  RoadmapProgressSummary,
  SectionProgressSummary,
  StepProgressRead,
} from "@/types";

export function buildStepProgressMap(
  progressSummary: RoadmapProgressSummary | null,
): Record<string, StepProgressRead> {
  if (!progressSummary) {
    return {};
  }

  const map: Record<string, StepProgressRead> = {};
  for (const section of progressSummary.sections) {
    for (const step of section.steps) {
      map[step.step_id] = step;
    }
  }

  return map;
}

export function buildSectionProgressMap(
  progressSummary: RoadmapProgressSummary | null,
): Record<string, SectionProgressSummary> {
  if (!progressSummary) {
    return {};
  }

  const map: Record<string, SectionProgressSummary> = {};
  for (const section of progressSummary.sections) {
    map[section.section_id] = section;
  }

  return map;
}

export function statusChipClass(status: RoadmapCompletionStatus): string {
  if (status === "completed") {
    return "border-emerald-300/50 bg-emerald-300/15 text-emerald-100";
  }

  if (status === "in_progress") {
    return "border-amber-200/40 bg-amber-200/15 text-amber-100";
  }

  return "border-white/20 bg-white/5 text-[#d6ddf3]";
}

export function statusNodeClass(status: RoadmapCompletionStatus): string {
  if (status === "completed") {
    return "border-[#8ee28f] bg-[#c6f4be] text-[#143317]";
  }

  if (status === "in_progress") {
    return "border-[#e8e4ad] bg-[#f4edb8] text-[#3e3b17]";
  }

  return "border-[#8ea6cf] bg-[#d4dced] text-[#1b2440]";
}

export function progressPercent(completed: number, total: number): number {
  if (total <= 0) {
    return 0;
  }

  return Math.round((completed / total) * 100);
}
