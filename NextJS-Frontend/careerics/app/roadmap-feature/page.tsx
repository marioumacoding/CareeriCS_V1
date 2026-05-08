"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import RoadmapProgress from "@/components/ui/roadmapProgress";
import { StepFlow } from "@/components/ui/roadmap-flow";
import StepCheckbox from "@/components/ui/roadmapStepCheckbox";
import RoadmapResourceCard from "@/components/ui/roadmapResourceCard";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type { ApiResponse, RoadmapListItem, RoadmapProgressSummary, RoadmapRead } from "@/types";

type Skill = {
  id: string;
  text: string;
  checked: boolean;
};

type SectionResource = {
  title: string;
  url: string;
  resourceType: string;
};

type Section = {
  id: string;
  title: string;
  href: string;
  resources: SectionResource[];
  skills: Skill[];
  locked: boolean;
  lockReason: string | null;
};

type CachedApiRequest<T> = {
  expiresAt: number;
  promise: Promise<ApiResponse<T>>;
};

const ROADMAP_DETAILS_CACHE_TTL_MS = 60_000;

function normalizeRoadmapListPayload(payload: unknown): RoadmapListItem[] {
  if (Array.isArray(payload)) {
    return payload as RoadmapListItem[];
  }

  if (
    payload &&
    typeof payload === "object" &&
    "roadmaps" in payload &&
    Array.isArray((payload as { roadmaps: unknown }).roadmaps)
  ) {
    return (payload as { roadmaps: RoadmapListItem[] }).roadmaps;
  }

  return [];
}

function toSlug(text: string): string {
  return text.toLowerCase().replace(/\s+/g, "-");
}

export default function RoadmapFeaturePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: isAuthLoading } = useAuth();

  const roadmapParam = searchParams.get("roadmap") || "";
  const stepParam = searchParams.get("step") || "";

  const [roadmapList, setRoadmapList] = useState<RoadmapListItem[]>([]);
  const [roadmap, setRoadmap] = useState<RoadmapRead | null>(null);
  const [progress, setProgress] = useState<RoadmapProgressSummary | null>(null);
  const [localStepCompletion, setLocalStepCompletion] = useState<Record<string, boolean>>({});
  const [selectedSectionPreferenceId, setSelectedSectionPreferenceId] = useState("");
  const [sectionAccessMessage, setSectionAccessMessage] = useState<string | null>(null);

  const inFlightStepIdsRef = useRef<Set<string>>(new Set());
  const roadmapByIdCacheRef = useRef<Map<string, CachedApiRequest<RoadmapRead>>>(new Map());

  const activeRoadmapId = useMemo(() => {
    if (!roadmapList.length) {
      return "";
    }

    const requestedRoadmapIdExists = roadmapList.some((item) => item.id === roadmapParam);
    if (requestedRoadmapIdExists) {
      return roadmapParam;
    }

    return roadmapList[0]?.id || "";
  }, [roadmapList, roadmapParam]);

  const getRoadmapByIdCached = useCallback((roadmapId: string) => {
    const now = Date.now();
    const cached = roadmapByIdCacheRef.current.get(roadmapId);
    if (cached && cached.expiresAt > now) {
      return cached.promise;
    }

    const requestPromise = roadmapService.getRoadmapById(roadmapId).then((response) => {
      if (!response.success) {
        roadmapByIdCacheRef.current.delete(roadmapId);
      }
      return response;
    });

    roadmapByIdCacheRef.current.set(roadmapId, {
      expiresAt: now + ROADMAP_DETAILS_CACHE_TTL_MS,
      promise: requestPromise,
    });

    return requestPromise;
  }, []);

  useEffect(() => {
    let alive = true;

    const loadRoadmaps = async () => {
      const response = await roadmapService.listRoadmaps();
      if (!alive) {
        return;
      }

      if (!response.success) {
        setRoadmapList([]);
        return;
      }

      setRoadmapList(normalizeRoadmapListPayload(response.data));
    };

    void loadRoadmaps();

    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;

    const loadRoadmap = async () => {
      if (!activeRoadmapId) {
        setRoadmap(null);
        return;
      }

      const response = await getRoadmapByIdCached(activeRoadmapId);
      if (!alive) {
        return;
      }

      if (!response.success || !response.data) {
        setRoadmap(null);
        return;
      }

      setRoadmap(response.data);
      setSectionAccessMessage(null);
    };

    void loadRoadmap();

    return () => {
      alive = false;
    };
  }, [activeRoadmapId, getRoadmapByIdCached]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let alive = true;

    const loadProgress = async () => {
      if (!user?.id || !activeRoadmapId) {
        setProgress(null);
        return;
      }

      const response = await roadmapService.getRoadmapProgress(activeRoadmapId, user.id);
      if (!alive) {
        return;
      }

      if (!response.success || !response.data) {
        setProgress(null);
        return;
      }

      setProgress(response.data);
      setLocalStepCompletion({});
    };

    void loadProgress();

    return () => {
      alive = false;
    };
  }, [activeRoadmapId, isAuthLoading, user?.id]);

  const orderedSections = useMemo(
    () => roadmap?.sections.slice().sort((a, b) => a.order - b.order) || [],
    [roadmap],
  );

  const progressSectionsById = useMemo(() => {
    const map = new Map<string, RoadmapProgressSummary["sections"][number]>();
    for (const section of progress?.sections || []) {
      map.set(section.section_id, section);
    }
    return map;
  }, [progress?.sections]);

  const progressByStepId = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const section of progress?.sections || []) {
      for (const step of section.steps) {
        map.set(step.step_id, step.completion_status === "completed");
      }
    }
    return map;
  }, [progress]);

  const sections = useMemo<Section[]>(() => {
    return orderedSections.map((section, index) => {
      const rawResources = section.steps
        .slice()
        .sort((a, b) => a.order - b.order)
        .flatMap((step) => step.resources || [])
        .map((resource) => {
          const title = String(resource.title || "").trim();
          const url = String(resource.url || "").trim();
          const resourceType = String(resource.resourceType || "resource").trim();

          return {
            title: title || (url ? "Resource Link" : "Resource"),
            url,
            resourceType: resourceType || "resource",
          };
        })
        .filter((resource) => resource.title || resource.url);

      const resources: SectionResource[] = [];
      const seenResourceKeys = new Set<string>();

      for (const resource of rawResources) {
        const key = `${resource.url}|${resource.title}`;
        if (seenResourceKeys.has(key)) {
          continue;
        }

        seenResourceKeys.add(key);
        resources.push(resource);
      }

      const skills = section.steps
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((step) => {
          const backendValue = progressByStepId.get(step.id) || false;
          const checked = step.id in localStepCompletion ? localStepCompletion[step.id] : backendValue;

          return {
            id: step.id,
            text: step.title,
            checked,
          };
        });

      const previousIncompleteSection = orderedSections
        .slice(0, index)
        .find((previousSection) => {
          const previousProgress = progressSectionsById.get(previousSection.id);
          return previousProgress?.completion_status !== "completed";
        });

      const hasExistingProgress = (progressSectionsById.get(section.id)?.steps || []).some((step) => {
        return step.completion_status !== "not_started";
      });

      const locked = Boolean(previousIncompleteSection) && !hasExistingProgress;
      const lockReason = locked && previousIncompleteSection
        ? `Complete "${previousIncompleteSection.title}" before opening "${section.title}".`
        : null;

      return {
        id: section.id,
        title: section.title,
        href: section.id,
        resources,
        skills,
        locked,
        lockReason,
      };
    });
  }, [localStepCompletion, orderedSections, progressByStepId, progressSectionsById]);

  const firstUnlockedSectionId = useMemo(() => {
    return sections.find((section) => !section.locked)?.id || sections[0]?.id || "";
  }, [sections]);

  const requestedSection = useMemo(() => {
    if (!sections.length) {
      return null;
    }

    if (selectedSectionPreferenceId) {
      return sections.find((section) => section.id === selectedSectionPreferenceId) || null;
    }

    const normalizedStepParam = stepParam.trim().toLowerCase();
    if (normalizedStepParam) {
      return sections.find(
        (section) =>
          section.id.toLowerCase() === normalizedStepParam ||
          toSlug(section.title) === normalizedStepParam,
      ) || null;
    }

    return sections[0];
  }, [sections, selectedSectionPreferenceId, stepParam]);

  const selectedSectionId = useMemo(() => {
    if (!sections.length) {
      return "";
    }

    if (!requestedSection) {
      return firstUnlockedSectionId;
    }

    if (requestedSection.locked) {
      return firstUnlockedSectionId;
    }

    return requestedSection.id;
  }, [firstUnlockedSectionId, requestedSection, sections]);

  const selectedIndex = useMemo(() => {
    return Math.max(
      0,
      sections.findIndex((section) => section.id === selectedSectionId),
    );
  }, [sections, selectedSectionId]);

  const selectedSection = sections[selectedIndex] || sections[0] || null;
  const lockedSectionMessage =
    requestedSection?.locked && requestedSection.id !== selectedSectionId
      ? requestedSection.lockReason || "Complete the previous section first to unlock this one."
      : null;
  const activeSectionAccessMessage = sectionAccessMessage || lockedSectionMessage;

  const handleSectionSelect = useCallback(
    (index: number) => {
      const nextSection = sections[index];
      if (!nextSection) {
        return;
      }

      if (nextSection.locked) {
        setSectionAccessMessage(
          nextSection.lockReason || "Complete the previous section first to unlock this one.",
        );
        return;
      }

      setSectionAccessMessage(null);
      setSelectedSectionPreferenceId(nextSection.id);
    },
    [sections],
  );

  useEffect(() => {
    if (!selectedSection || !activeRoadmapId) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set("roadmap", activeRoadmapId);
    params.set("step", selectedSection.id);

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`?${nextQuery}`, { scroll: false });
    }
  }, [activeRoadmapId, router, searchParams, selectedSection]);

  const toggleSkill = async (skillIndex: number) => {
    if (!selectedSection || !activeRoadmapId) {
      return;
    }

    if (selectedSection.locked) {
      setSectionAccessMessage(
        selectedSection.lockReason || "Complete the previous section first to unlock this one.",
      );
      return;
    }

    const step = selectedSection.skills[skillIndex];
    if (!step) {
      return;
    }

    if (inFlightStepIdsRef.current.has(step.id)) {
      return;
    }

    const previousChecked = step.checked;
    const nextChecked = !previousChecked;

    setSectionAccessMessage(null);
    setLocalStepCompletion((previous) => ({
      ...previous,
      [step.id]: nextChecked,
    }));

    if (!user?.id) {
      return;
    }

    inFlightStepIdsRef.current.add(step.id);

    const response = await roadmapService.upsertStepProgress(activeRoadmapId, user.id, step.id, {
      completion_status: nextChecked ? "completed" : "not_started",
    });

    inFlightStepIdsRef.current.delete(step.id);

    if (!response.success || !response.data) {
      setLocalStepCompletion((previous) => ({
        ...previous,
        [step.id]: previousChecked,
      }));
      setSectionAccessMessage(response.message || "Unable to update progress right now.");
      return;
    }

    setProgress(response.data);
    setLocalStepCompletion((previous) => {
      const next = { ...previous };
      delete next[step.id];
      return next;
    });
  };

  const steps = useMemo(
    () =>
      sections.map((section) => ({
        label: section.title,
        href: section.href,
      })),
    [sections],
  );

  const lockedStepIndexes = useMemo(() => {
    return sections.reduce<number[]>((indexes, section, index) => {
      if (section.locked) {
        indexes.push(index);
      }
      return indexes;
    }, []);
  }, [sections]);

  const completedSections = progress?.completed_sections || 0;
  const totalSections = progress?.total_sections || sections.length;
  const completedSteps = progress?.completed_steps || 0;
  const totalSteps = progress?.total_steps || sections.reduce((sum, section) => sum + section.skills.length, 0);
  const currentSectionCompletedSteps = selectedSection?.skills.filter((skill) => skill.checked).length || 0;
  const currentSectionTotalSteps = selectedSection?.skills.length || 0;
  const roadmapHeading = roadmap?.title ? `${roadmap.title} Roadmap` : "Loading roadmap...";

  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        height: "100%",
        padding: "1rem",
        flexDirection: "column",
        overflow: "clip",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "0.45rem", marginBottom: "1rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            color: "white",
            margin: 0,
          }}
        >
          {roadmapHeading}
        </h1>

        {activeSectionAccessMessage ? (
          <p style={{ margin: 0, color: "#FFD3D3", fontSize: "0.95rem" }}>
            {activeSectionAccessMessage}
          </p>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          width: "100%",
          minHeight: 0,
          overflow: "hidden",
          flex: 1,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", width: "70%" }}>
          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
            <RoadmapProgress
              text="Sections Completed"
              done={String(completedSections)}
              total={String(totalSections)}
            />
            <RoadmapProgress
              text="Total Steps Completed"
              done={String(completedSteps)}
              total={String(totalSteps)}
            />
            <RoadmapProgress
              text="Current Steps Completed"
              done={String(currentSectionCompletedSteps)}
              total={String(currentSectionTotalSteps)}
            />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              overflowY: "auto",
              scrollbarWidth: "none",
            }}
          >
            <StepFlow
              steps={steps}
              selectedIndex={selectedIndex}
              lockedStepIndexes={lockedStepIndexes}
              onSelect={handleSectionSelect}
              isNavigatable={false}
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "1rem 2rem",
            backgroundColor: "var(--medium-grey)",
            borderRadius: "4vh",
            width: "30%",
            marginLeft: "2rem",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <h2 style={{ fontSize: "1.5rem", color: "white", marginBottom: "1rem" }}>
            {selectedSection?.title || "Section"}
          </h2>

          <div
            style={{
              height: "0.1rem",
              backgroundColor: "white",
              width: "100%",
              marginBottom: "1rem",
            }}
          />

          <div
            className="section-scroll-box"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              minHeight: 0,
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              paddingRight: "0.2rem",
            }}
          >
            {Boolean(selectedSection?.resources.length) && (
              <div
                style={{
                  width: "100%",
                  marginBottom: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.7rem",
                }}
              >
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "white",
                    fontFamily: "var(--font-nova-square)",
                  }}
                >
                  Resources:
                </p>
                {selectedSection?.resources.map((resource) => {
                  const key = `${resource.url}|${resource.title}|${resource.resourceType}`;

                  return (
                    <RoadmapResourceCard
                      key={key}
                      resourceType={resource.resourceType}
                      title={resource.title}
                      url={resource.url}
                    />
                  );
                })}
                <div
                  style={{
                    height: "0.1rem",
                    backgroundColor: "white",
                    width: "100%",
                  }}
                />
              </div>
            )}

            {selectedSection?.skills?.length > 0 ? (
              <p
                style={{
                  margin: "0 0 1rem 0",
                  fontSize: "1.1rem",
                  color: "white",
                  fontFamily: "var(--font-nova-square)",
                }}
              >
                Topics to cover:
              </p>
            ) : null}

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
              }}
            >
              {(selectedSection?.skills || []).map((skill, index) => (
                <StepCheckbox
                  key={skill.id}
                  text={skill.text}
                  isChecked={skill.checked}
                  disabled={Boolean(selectedSection?.locked)}
                  onToggle={() => {
                    void toggleSkill(index);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .section-scroll-box::-webkit-scrollbar {
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
