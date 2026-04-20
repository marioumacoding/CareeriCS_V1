"use client";

import { Bookmark, Expand } from "lucide-react";

import type {
  RoadmapRead,
  SectionProgressSummary,
} from "@/types";

import RoadmapFlowchartCanvas from "./roadmap-flowchart-canvas";

interface RoadmapPreviewPanelProps {
  roadmap: RoadmapRead | null;
  progressBySectionId: Record<string, SectionProgressSummary>;
  onSelectSection?: (sectionId: string) => void;
  onExpand?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  bookmarkLoading?: boolean;
  loading?: boolean;
  error?: string | null;
}

export default function RoadmapPreviewPanel({
  roadmap,
  progressBySectionId,
  onSelectSection,
  onExpand,
  onBookmark,
  isBookmarked = false,
  bookmarkLoading = false,
  loading = false,
  error,
}: RoadmapPreviewPanelProps) {
  return (
    <section
      className="flex-1 rounded-[0.68rem] border border-white/10 bg-[#17295c] p-5 sm:p-6"
      aria-label="Roadmap preview"
    >
      <div className="relative flex min-h-9 items-center justify-center">
        <h2 className="m-0 text-center text-[clamp(1.7rem,2.35vw,2.25rem)] leading-none text-[#eef4ff]">
          Roadmap Preview
        </h2>

        <div className="absolute right-0 top-0 inline-flex gap-1.5">
          <button
            type="button"
            aria-label="Expand roadmap"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#eef4ff]"
            onClick={onExpand}
          >
            <Expand size={18} strokeWidth={2.2} />
          </button>
          <button
            type="button"
            aria-label={isBookmarked ? "Remove roadmap bookmark" : "Bookmark roadmap"}
            className={`inline-flex h-7 w-7 items-center justify-center rounded-md ${
              isBookmarked ? "text-[#d4ef9f]" : "text-[#eef4ff]"
            }`}
            onClick={onBookmark}
            disabled={bookmarkLoading || !roadmap}
          >
            <Bookmark size={18} strokeWidth={2.2} className={isBookmarked ? "fill-current" : undefined} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 flex min-h-48 items-center justify-center rounded-xl border border-white/15 bg-[#0f1f4d]/55 text-[#d9e2fa]">
          Loading roadmap...
        </div>
      ) : null}

      {!loading && error ? (
        <div className="mt-4 rounded-xl border border-rose-200/30 bg-rose-200/10 px-4 py-3 text-[0.9rem] text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="mt-4 space-y-3.5">
          <RoadmapFlowchartCanvas
            roadmap={roadmap}
            progressBySectionId={progressBySectionId}
            onSelectSection={onSelectSection}
            compact
            className="min-h-[18rem] sm:min-h-[22rem]"
          />
        </div>
      ) : null}
    </section>
  );
}
