"use client";

/* eslint-disable react-hooks/set-state-in-effect, react-hooks/preserve-manual-memoization */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type {
  RoadmapCompletionStatus,
  RoadmapProgressSummary,
  RoadmapRead,
} from "@/types";

import {
  RoadmapFlowchartCanvas,
  RoadmapProgressSummary as RoadmapProgressSummaryCard,
  RoadmapSectionChecklist,
  StepResourcePanel,
} from "../components";
import {
  buildSectionProgressMap,
  buildStepProgressMap,
  statusChipClass,
} from "../utils";

const LAST_ACTIVE_ROADMAP_STORAGE_KEY = "roadmap:last-active-id";

export default function RoadmapDetailPage() {
  const router = useRouter();
  const params = useParams<{ roadmapId: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const roadmapId = params.roadmapId;
  const requestedSectionId = searchParams.get("sectionId");

  const [roadmap, setRoadmap] = useState<RoadmapRead | null>(null);
  const [progressSummary, setProgressSummary] = useState<RoadmapProgressSummary | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [updatingStepId, setUpdatingStepId] = useState<string | null>(null);

  const progressByStepId = useMemo(() => buildStepProgressMap(progressSummary), [progressSummary]);
  const progressBySectionId = useMemo(
    () => buildSectionProgressMap(progressSummary),
    [progressSummary],
  );

  const sections = useMemo(
    () => roadmap?.sections.slice().sort((a, b) => a.order - b.order) ?? [],
    [roadmap],
  );

  const selectedSection = useMemo(
    () => sections.find((section) => section.id === selectedSectionId) ?? sections[0] ?? null,
    [sections, selectedSectionId],
  );

  const selectedStep = useMemo(() => {
    if (!selectedSection) {
      return null;
    }

    const sortedSteps = selectedSection.steps.slice().sort((a, b) => a.order - b.order);
    if (!selectedStepId) {
      return sortedSteps[0] ?? null;
    }

    return sortedSteps.find((step) => step.id === selectedStepId) ?? sortedSteps[0] ?? null;
  }, [selectedSection, selectedStepId]);

  const loadRoadmapDetail = useCallback(async () => {
    if (!roadmapId) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const roadmapPromise = roadmapService.getRoadmapById(roadmapId);
    const progressPromise = user?.id
      ? roadmapService.getRoadmapProgress(roadmapId, user.id)
      : Promise.resolve(null);

    const [roadmapResponse, progressResponse] = await Promise.all([
      roadmapPromise,
      progressPromise,
    ]);

    if (!roadmapResponse.success) {
      setRoadmap(null);
      setProgressSummary(null);
      setErrorMessage(roadmapResponse.message ?? "Unable to load roadmap.");
      setIsLoading(false);
      return;
    }

    setRoadmap(roadmapResponse.data);

    const orderedSections = roadmapResponse.data.sections
      .slice()
      .sort((a, b) => a.order - b.order);

    const requestedSection = requestedSectionId
      ? orderedSections.find((section) => section.id === requestedSectionId) ?? null
      : null;

    const firstSection = orderedSections[0] ?? null;
    setSelectedSectionId((prev) => {
      if (requestedSection) {
        return requestedSection.id;
      }

      if (!prev) {
        return firstSection?.id ?? null;
      }

      const existsInRoadmap = orderedSections.some((section) => section.id === prev);
      return existsInRoadmap ? prev : firstSection?.id ?? null;
    });

    const sectionForStepSeed = requestedSection ?? firstSection;
    const firstStep = sectionForStepSeed?.steps
      .slice()
      .sort((a, b) => a.order - b.order)[0] ?? null;
    setSelectedStepId((prev) => {
      if (requestedSection) {
        return firstStep?.id ?? null;
      }

      return prev ?? firstStep?.id ?? null;
    });

    if (!user?.id) {
      setProgressSummary(null);
      setIsLoading(false);
      return;
    }

    if (progressResponse?.success) {
      setProgressSummary(progressResponse.data);
    } else {
      setProgressSummary(null);
    }

    setIsLoading(false);
  }, [roadmapId, requestedSectionId, user?.id]);

  useEffect(() => {
    void loadRoadmapDetail();
  }, [loadRoadmapDetail]);

  useEffect(() => {
    if (typeof window === "undefined" || !roadmapId) {
      return;
    }

    window.localStorage.setItem(LAST_ACTIVE_ROADMAP_STORAGE_KEY, roadmapId);
  }, [roadmapId]);

  const handleToggleStep = useCallback(
    async (stepId: string, nextStatus: RoadmapCompletionStatus) => {
      if (!roadmapId || !user?.id) {
        setErrorMessage("Sign in is required to update roadmap progress.");
        return;
      }

      setUpdatingStepId(stepId);
      setErrorMessage(null);

      const response = await roadmapService.upsertStepProgress(roadmapId, user.id, stepId, {
        completion_status: nextStatus,
      });

      if (!response.success) {
        setErrorMessage(response.message ?? "Unable to update step progress.");
        setUpdatingStepId(null);
        return;
      }

      setProgressSummary(response.data);
      setUpdatingStepId(null);
    },
    [roadmapId, user?.id],
  );

  const handleSelectSection = useCallback(
    (sectionId: string) => {
      setSelectedSectionId(sectionId);

      const targetSection = sections.find((section) => section.id === sectionId);
      const firstStep = targetSection?.steps.slice().sort((a, b) => a.order - b.order)[0] ?? null;
      setSelectedStepId(firstStep?.id ?? null);
    },
    [sections],
  );

  const handleSelectStep = useCallback(
    async (stepId: string) => {
      setSelectedStepId(stepId);

      if (!roadmapId || !user?.id) {
        return;
      }

      const currentStatus = progressByStepId[stepId]?.completion_status ?? "not_started";
      if (currentStatus !== "not_started") {
        return;
      }

      setUpdatingStepId(stepId);
      setErrorMessage(null);

      const response = await roadmapService.upsertStepProgress(roadmapId, user.id, stepId, {
        completion_status: "in_progress",
      });

      if (response.success) {
        setProgressSummary(response.data);
      } else {
        setErrorMessage(response.message ?? "Unable to mark step as in progress.");
      }

      setUpdatingStepId(null);
    },
    [progressByStepId, roadmapId, user?.id],
  );

  return (
    <section className="flex h-full min-h-0 w-full flex-col overflow-x-hidden overflow-y-auto rounded-2xl bg-gradient-to-br from-[#071f50] via-[#12408f] to-[#050f2e] p-4 sm:p-6">
      <RoadmapProgressSummaryCard
        completedSteps={progressSummary?.completed_steps ?? 0}
        totalSteps={progressSummary?.total_steps ?? 0}
        completedSections={progressSummary?.completed_sections ?? 0}
        totalSections={progressSummary?.total_sections ?? 0}
        completionPercent={progressSummary?.completion_percent ?? 0}
        completionStatus={progressSummary?.completion_status ?? "not_started"}
      />

      <div className="mt-4 grid min-h-0 flex-1 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.95fr)]">
      <section className="flex min-h-0 flex-col rounded-xl border border-white/15 bg-[#17295c] p-5 text-[#eef4ff]">
        <div className="flex items-center justify-between gap-2">
          <div>
            <button
              type="button"
              onClick={() => router.push("/features/roadmap")}
              className="rounded-full border border-white/25 px-3 py-1 text-[0.72rem] uppercase tracking-[0.07em] text-white/80"
            >
              Back to Roadmaps
            </button>
            <h1 className="m-0 mt-2 text-[1.8rem] leading-none text-[#eef4ff]">
              {roadmap?.title ?? "Roadmap"}
            </h1>
          </div>

          {progressSummary ? (
            <span className={`rounded-full border px-3 py-1 text-[0.73rem] uppercase tracking-[0.08em] ${statusChipClass(progressSummary.completion_status)}`}>
              {progressSummary.completion_status.replace("_", " ")}
            </span>
          ) : null}
        </div>

        {errorMessage ? (
          <div className="mt-3 rounded-xl border border-rose-200/30 bg-rose-200/10 px-4 py-3 text-[0.88rem] text-rose-100">
            {errorMessage}
          </div>
        ) : null}

        <div className="mt-4 min-h-0 flex-1">
          <RoadmapFlowchartCanvas
            roadmap={roadmap}
            progressBySectionId={progressBySectionId}
            selectedSectionId={selectedSection?.id ?? null}
            onSelectSection={handleSelectSection}
            disabled={Boolean(updatingStepId)}
            className="h-full min-h-[24rem] sm:min-h-[30rem]"
            emptyMessage={isLoading ? "Loading roadmap..." : "No steps available for this roadmap yet."}
          />
        </div>
      </section>

      <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
        <StepResourcePanel
          section={selectedSection}
          step={selectedStep}
          status={
            selectedStep
              ? progressByStepId[selectedStep.id]?.completion_status ?? "not_started"
              : "not_started"
          }
        />

        <RoadmapSectionChecklist
          roadmap={roadmap}
          selectedSectionId={selectedSection?.id ?? null}
          progressByStepId={progressByStepId}
          onToggleStep={handleToggleStep}
          onSelectStep={(stepId) => {
            void handleSelectStep(stepId);
          }}
          updatingStepId={updatingStepId}
        />

        <section className="rounded-2xl border border-white/15 bg-[#0f1f4d]/60 p-4 text-[#eef4ff]">
          <h3 className="m-0 text-[1rem]">Sections</h3>

          <ul className="m-0 mt-3 space-y-2 p-0">
            {sections.map((section) => {
              const sectionProgress = progressSummary?.sections.find(
                (item) => item.section_id === section.id,
              );
              const status = sectionProgress?.completion_status ?? "not_started";

              return (
                <li
                  key={section.id}
                  className="rounded-xl border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="m-0 text-[0.86rem]">{section.title}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[0.62rem] uppercase tracking-[0.07em] ${statusChipClass(status)}`}>
                      {status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="m-0 mt-1 text-[0.75rem] text-white/70">
                    {sectionProgress?.completed_steps ?? 0}/{section.steps.length} completed steps
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      </aside>
      </div>
    </section>
  );
}
