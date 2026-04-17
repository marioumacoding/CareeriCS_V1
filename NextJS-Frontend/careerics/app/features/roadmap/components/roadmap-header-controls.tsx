"use client";

import { useRef } from "react";
import { Bookmark, ChevronRight } from "lucide-react";

import type { RoadmapCompletionStatus } from "@/types";

interface RoadmapOption {
  id: string;
  title: string;
}

interface RoadmapQuickPick extends RoadmapOption {
  completionPercent?: number;
  completionStatus?: RoadmapCompletionStatus;
  isBookmarked?: boolean;
}

interface RoadmapHeaderControlsProps {
  selectedRoadmapId: string;
  options: RoadmapOption[];
  allRoadmaps: RoadmapQuickPick[];
  emptyStateMessage?: string;
  onRoadmapChange: (roadmapId: string) => void;
}

const DEFAULT_PATH_OPTION = "__default_path__";
const END_SCROLL_THRESHOLD = 10;

export default function RoadmapHeaderControls({
  selectedRoadmapId,
  options,
  allRoadmaps,
  emptyStateMessage,
  onRoadmapChange,
}: RoadmapHeaderControlsProps) {
  const roadmapRowRef = useRef<HTMLDivElement | null>(null);

  const handleScrollByArrow = () => {
    const row = roadmapRowRef.current;

    if (!row) {
      return;
    }

    const maxScrollLeft = Math.max(0, row.scrollWidth - row.clientWidth);
    if (maxScrollLeft <= 0) {
      return;
    }

    const step = Math.max(240, Math.floor(row.clientWidth * 0.85));
    const isAtOrNearEnd = maxScrollLeft - row.scrollLeft <= END_SCROLL_THRESHOLD;
    const nextLeft = isAtOrNearEnd ? 0 : Math.min(row.scrollLeft + step, maxScrollLeft);

    row.scrollTo({
      left: nextLeft,
      behavior: "smooth",
    });
  };

  return (
    <div className="flex w-full flex-col items-start gap-2.5 overflow-x-hidden px-6 pb-2 pt-6 sm:px-7 sm:pb-2 sm:pt-7 md:gap-2.5">
      <div className="flex w-full min-w-0 flex-col gap-2 md:flex-row md:items-center md:gap-3">
        <label className="block w-full md:w-[14.5rem] md:shrink-0" htmlFor="path-select">
          <span className="sr-only">Select roadmap path</span>
          <select
            id="path-select"
            value={selectedRoadmapId}
            onChange={(event) => onRoadmapChange(event.target.value)}
            className="h-11 w-full rounded-full border border-[#2b5da4] bg-transparent px-5 text-[0.95rem] text-[#323232] outline-none transition-colors focus:border-[#1f467f]"
          >
            <option value={DEFAULT_PATH_OPTION}>Find a new path</option>
            {options.map((option) => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </label>

        <div className="flex w-full min-w-0 items-center gap-2 md:flex-1">
          <div
            ref={roadmapRowRef}
            className="min-w-0 flex-1 overflow-x-auto scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0"
          >
            <div className="inline-flex w-max flex-nowrap items-center gap-2.5 pb-1 pr-1" role="tablist" aria-label="Roadmaps">
              {allRoadmaps.length > 0 ? (
                allRoadmaps.map((roadmap) => {
                  const active = selectedRoadmapId === roadmap.id;

                  return (
                    <button
                      key={roadmap.id}
                      type="button"
                      role="tab"
                      aria-selected={active}
                      onClick={() => onRoadmapChange(roadmap.id)}
                      className={`h-10 min-w-[8.2rem] rounded-[0.52rem] px-4 text-[0.9rem] font-semibold transition-all whitespace-nowrap ${
                        active
                          ? "bg-[#d4ef9f] text-[#1f2f22]"
                          : "bg-[#214c90] text-[#eef4ff] hover:-translate-y-[1px]"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        {roadmap.isBookmarked ? <Bookmark size={13} className="fill-current" /> : null}
                        <span>{roadmap.title}</span>
                      </span>
                    </button>
                  );
                })
              ) : (
                <p className="pl-1 text-[0.88rem] font-medium text-[#4f5a70]">
                  {emptyStateMessage ?? "No bookmarked roadmaps yet. Use the bookmark icon to save one."}
                </p>
              )}
            </div>
          </div>

          {allRoadmaps.length > 0 ? (
            <button
              type="button"
              onClick={handleScrollByArrow}
              className="inline-flex h-10 w-8 shrink-0 items-center justify-center text-[#214c90]"
              aria-label="Scroll roadmaps"
            >
              <ChevronRight size={22} strokeWidth={2.2} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export { DEFAULT_PATH_OPTION };
