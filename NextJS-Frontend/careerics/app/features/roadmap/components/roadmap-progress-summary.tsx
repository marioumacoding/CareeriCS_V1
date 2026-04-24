import type { RoadmapCompletionStatus } from "@/types";

import { statusChipClass } from "../utils";

interface RoadmapProgressSummaryProps {
  completedSteps: number;
  totalSteps: number;
  completedSections: number;
  totalSections: number;
  completionPercent: number;
  completionStatus: RoadmapCompletionStatus;
}

export default function RoadmapProgressSummary({
  completedSteps,
  totalSteps,
  completedSections,
  totalSections,
  completionPercent,
  completionStatus,
}: RoadmapProgressSummaryProps) {
  return (
    <section className="rounded-2xl border border-white/15 bg-[#0f1f4d]/60 p-4 text-[#eef4ff]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-[1.05rem]">Progress</h3>
        <span className={`rounded-full border px-2.5 py-1 text-[0.72rem] uppercase tracking-[0.07em] ${statusChipClass(completionStatus)}`}>
          {completionStatus.replace("_", " ")}
        </span>
      </div>

      <div className="mt-3 h-2.5 rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#b8ef46] transition-all"
          style={{ width: `${Math.min(Math.max(completionPercent, 0), 100)}%` }}
        />
      </div>

      <div className="mt-3 grid gap-2 text-[0.84rem] sm:grid-cols-3">
        <p className="m-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          {completionPercent}% complete
        </p>
        <p className="m-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          {completedSteps}/{totalSteps} steps
        </p>
        <p className="m-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
          {completedSections}/{totalSections} sections
        </p>
      </div>
    </section>
  );
}
