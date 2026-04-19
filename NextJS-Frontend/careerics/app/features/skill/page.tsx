"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import RootLayout from "@/app/features/layout";
import SkillFilters, {
  type SkillFilterTrackOption,
  type SkillFilterType,
} from "@/components/ui/SkillFilters";
import { LearningSkillsCard, MoreSkillsCard, PastTestsCard } from "@/components/ui/cvArchive";
import SkillConfirmPopup from "@/components/ui/skillConfirmPopup";
import {
  getUnifiedBookmarks,
  MAX_UNIFIED_BOOKMARKS,
  UNIFIED_BOOKMARKS_UPDATED_EVENT,
} from "@/lib/unified-bookmarks";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService, skillAssessmentService, skillsService } from "@/services";
import type {
  ApiResponse,
  APIAssessmentSessionSummary,
  APIAssessmentSessionType,
  APISkill,
  CurrentRoadmapLearning,
  RoadmapListItem,
  RoadmapRead,
} from "@/types";

type AssessmentTarget = {
  id: string;
  label: string;
  sessionType: APIAssessmentSessionType;
  sectionId?: string;
  isCurrent?: boolean;
};

type TrackSelectionSource = "current" | "session" | "progress" | "persisted" | "default";
type CachedApiRequest<T> = {
  expiresAt: number;
  promise: Promise<ApiResponse<T>>;
};

const LAST_ACTIVE_ROADMAP_STORAGE_KEY = "roadmap:last-active-id";
const GENERAL_SKILLS_TRACK_ID = "__general-skills__";
const GENERAL_SKILLS_TRACK_LABEL = "General Skills";
const CURRENT_LEARNING_CACHE_TTL_MS = 15_000;
const ROADMAP_DETAILS_CACHE_TTL_MS = 60_000;

function normalizeEntityId(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

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

function normalizeSessionType(sessionType?: string | null): APIAssessmentSessionType {
  if (sessionType === "skill") {
    return "skills";
  }

  if (
    sessionType === "skills" ||
    sessionType === "roadmap" ||
    sessionType === "section" ||
    sessionType === "step"
  ) {
    return sessionType;
  }

  return "skills";
}

function doesSessionMatchTarget(
  session: APIAssessmentSessionSummary,
  target: AssessmentTarget,
): boolean {
  const type = normalizeSessionType(session.type);
  if (type !== target.sessionType) {
    return false;
  }

  if (type === "skills") {
    return session.skill_id === target.id;
  }

  if (type === "roadmap") {
    return session.roadmap_id === target.id;
  }

  if (type === "section") {
    return session.section_id === target.id;
  }

  return session.step_id === target.id;
}

function resolveSessionTitle(
  session: APIAssessmentSessionSummary,
  skillById: Map<string, APISkill>,
): string {
  const type = normalizeSessionType(session.type);
  if (type === "skills") {
    return skillById.get(session.skill_id || "")?.skill_name || "Skill Assessment";
  }

  if (type === "section") {
    return "General Topic";
  }

  if (type === "step") {
    return "Specific Skill";
  }

  return "Roadmap Assessment";
}

function normalizeTextForMatch(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitTextTokens(value: string): string[] {
  return normalizeTextForMatch(value)
    .split(" ")
    .filter((token) => token.length >= 4);
}

function doesSkillMatchContext(skillName: string, contextTexts: string[]): boolean {
  const normalizedSkill = normalizeTextForMatch(skillName);
  if (!normalizedSkill) {
    return false;
  }

  const skillTokens = splitTextTokens(normalizedSkill);
  if (!skillTokens.length) {
    return false;
  }

  return contextTexts.some((context) => {
    const normalizedContext = normalizeTextForMatch(context);
    if (!normalizedContext) {
      return false;
    }

    if (normalizedContext.includes(normalizedSkill) || normalizedSkill.includes(normalizedContext)) {
      return true;
    }

    const contextTokens = splitTextTokens(normalizedContext);
    if (!contextTokens.length) {
      return false;
    }

    return skillTokens.some((token) => contextTokens.includes(token));
  });
}

export default function SkillAssessment() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [skills, setSkills] = useState<APISkill[]>([]);
  const [sessions, setSessions] = useState<APIAssessmentSessionSummary[]>([]);
  const [roadmapTracks, setRoadmapTracks] = useState<RoadmapListItem[]>([]);
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [trackHelperText, setTrackHelperText] = useState("");
  const [selectedSkillType, setSelectedSkillType] = useState<SkillFilterType>("general");

  const [selectedRoadmap, setSelectedRoadmap] = useState<RoadmapRead | null>(null);
  const [currentLearning, setCurrentLearning] = useState<CurrentRoadmapLearning | null>(null);
  const [bookmarkedCurrentTargets, setBookmarkedCurrentTargets] = useState<AssessmentTarget[]>([]);
  const [bookmarkedTargetsHint, setBookmarkedTargetsHint] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedLearningTargetId, setSelectedLearningTargetId] = useState("");
  const [selectedMoreSkillId, setSelectedMoreSkillId] = useState("");

  const [pendingTarget, setPendingTarget] = useState<AssessmentTarget | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  const currentLearningRequestCacheRef =
    useRef<Map<string, CachedApiRequest<CurrentRoadmapLearning>>>(new Map());
  const roadmapByIdRequestCacheRef = useRef<Map<string, CachedApiRequest<RoadmapRead>>>(new Map());

  const isGeneralSkillsMode = selectedTrackId === GENERAL_SKILLS_TRACK_ID;

  const getCurrentLearningCached = useCallback((roadmapId?: string) => {
    if (!user?.id) {
      return Promise.resolve({
        data: null as unknown as CurrentRoadmapLearning,
        success: false,
        message: "Missing user id",
      });
    }

    const cacheKey = roadmapId ? `roadmap:${roadmapId}` : "roadmap:current";
    const now = Date.now();
    const cached = currentLearningRequestCacheRef.current.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.promise;
    }

    const requestPromise = roadmapService
      .getCurrentRoadmapLearning(user.id, roadmapId)
      .then((response) => {
        if (!response.success) {
          currentLearningRequestCacheRef.current.delete(cacheKey);
        }
        return response;
      });

    currentLearningRequestCacheRef.current.set(cacheKey, {
      expiresAt: now + CURRENT_LEARNING_CACHE_TTL_MS,
      promise: requestPromise,
    });

    return requestPromise;
  }, [user?.id]);

  const getRoadmapByIdCached = useCallback((roadmapId: string) => {
    const cacheKey = roadmapId;
    const now = Date.now();
    const cached = roadmapByIdRequestCacheRef.current.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return cached.promise;
    }

    const requestPromise = roadmapService.getRoadmapById(roadmapId).then((response) => {
      if (!response.success) {
        roadmapByIdRequestCacheRef.current.delete(cacheKey);
      }
      return response;
    });

    roadmapByIdRequestCacheRef.current.set(cacheKey, {
      expiresAt: now + ROADMAP_DETAILS_CACHE_TTL_MS,
      promise: requestPromise,
    });

    return requestPromise;
  }, []);

  useEffect(() => {
    currentLearningRequestCacheRef.current.clear();
    roadmapByIdRequestCacheRef.current.clear();
  }, [user?.id]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let alive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError("");

      const [skillsRes, roadmapsRes, sessionsRes] = await Promise.all([
        skillsService.listSkills(),
        roadmapService.listRoadmaps(),
        user?.id
          ? skillAssessmentService.getUserSessions(user.id)
          : Promise.resolve({ success: true, data: [] as APIAssessmentSessionSummary[] }),
      ]);

      if (!alive) {
        return;
      }

      if (!skillsRes.success || !skillsRes.data) {
        setError(skillsRes.message || "Failed to load skills.");
        setIsLoading(false);
        return;
      }

      if (!roadmapsRes.success) {
        setError(roadmapsRes.message || "Failed to load roadmap tracks.");
        setSkills(skillsRes.data);
        setSessions([]);
        setRoadmapTracks([]);
        setSelectedTrackId(GENERAL_SKILLS_TRACK_ID);
        setTrackHelperText("Roadmaps unavailable. Showing all skills from the database.");
        setIsLoading(false);
        return;
      }

      const tracks = normalizeRoadmapListPayload(roadmapsRes.data);
      const resolvedSessions = sessionsRes.success && sessionsRes.data ? sessionsRes.data : [];
      setSkills(skillsRes.data);
      setRoadmapTracks(tracks);
      setSessions(resolvedSessions);

      if (!tracks.length) {
        setSelectedTrackId(GENERAL_SKILLS_TRACK_ID);
        setTrackHelperText("No roadmap tracks found. Showing all skills from the database.");
        setIsLoading(false);
        return;
      }

      const trackIdByNormalizedId = new Map<string, string>();
      for (const track of tracks) {
        const trackId = String(track.id);
        trackIdByNormalizedId.set(normalizeEntityId(trackId), trackId);
      }

      const resolveTrackId = (candidate: unknown): string | null => {
        return trackIdByNormalizedId.get(normalizeEntityId(candidate)) ?? null;
      };

      let preferredTrackId = String(tracks[0].id);
      let resolvedPreferredTrack = false;
      let selectionSource: TrackSelectionSource = "default";

      if (user?.id) {
        const currentRes = await getCurrentLearningCached();
        if (alive && currentRes.success && currentRes.data?.roadmap_id) {
          const resolvedCurrentTrackId = resolveTrackId(currentRes.data.roadmap_id);
          if (resolvedCurrentTrackId) {
            preferredTrackId = resolvedCurrentTrackId;
            resolvedPreferredTrack = true;
            selectionSource = "current";
          }
        }
      }

      if (!resolvedPreferredTrack && resolvedSessions.length) {
        const sessionCandidates = resolvedSessions
          .filter((session) => normalizeSessionType(session.type) !== "skills")
          .sort((a, b) => {
            const aInProgress = a.status === "in_progress" ? 1 : 0;
            const bInProgress = b.status === "in_progress" ? 1 : 0;
            if (aInProgress !== bInProgress) {
              return bInProgress - aInProgress;
            }

            const aStartedAt = new Date(a.started_at).getTime() || 0;
            const bStartedAt = new Date(b.started_at).getTime() || 0;
            return bStartedAt - aStartedAt;
          });

        const matchedSession = sessionCandidates.find(
          (session) => !!resolveTrackId(session.roadmap_id),
        );

        if (matchedSession) {
          const resolvedSessionTrackId = resolveTrackId(matchedSession.roadmap_id);
          if (resolvedSessionTrackId) {
            preferredTrackId = resolvedSessionTrackId;
            resolvedPreferredTrack = true;
            selectionSource = "session";
          }
        }
      }

      if (!resolvedPreferredTrack && user?.id) {
        const progressRes = await roadmapService.getUserRoadmapsProgress(user.id);
        if (alive && progressRes.success && progressRes.data?.roadmaps?.length) {
          const rankedProgress = progressRes.data.roadmaps
            .slice()
            .sort((a, b) => {
              const aInProgress = a.completion_status === "in_progress" ? 1 : 0;
              const bInProgress = b.completion_status === "in_progress" ? 1 : 0;
              if (aInProgress !== bInProgress) {
                return bInProgress - aInProgress;
              }
              return b.completion_percent - a.completion_percent;
            });

          const fallbackRoadmap = rankedProgress.find((item) => !!resolveTrackId(item.roadmap_id));

          if (fallbackRoadmap) {
            const resolvedProgressTrackId = resolveTrackId(fallbackRoadmap.roadmap_id);
            if (resolvedProgressTrackId) {
              preferredTrackId = resolvedProgressTrackId;
              resolvedPreferredTrack = true;
              selectionSource = "progress";
            }
          }
        }
      }

      if (!resolvedPreferredTrack && typeof window !== "undefined") {
        const persistedRoadmapId = window.localStorage.getItem(LAST_ACTIVE_ROADMAP_STORAGE_KEY);
        const resolvedPersistedTrackId = resolveTrackId(persistedRoadmapId);
        if (resolvedPersistedTrackId) {
          preferredTrackId = resolvedPersistedTrackId;
            resolvedPreferredTrack = true;
          selectionSource = "persisted";
        }
      }

      if (!resolvedPreferredTrack) {
        selectionSource = "default";
      }

      setSelectedTrackId(preferredTrackId);

      if (selectionSource === "current" || selectionSource === "progress") {
        setTrackHelperText("Auto-selected from your current progress");
      } else if (selectionSource === "session") {
        setTrackHelperText("Auto-selected from your latest assessment track");
      } else if (selectionSource === "persisted") {
        setTrackHelperText("Auto-selected from your last active track");
      } else {
        setTrackHelperText("");
      }

      setIsLoading(false);
    };

    void loadData();

    return () => {
      alive = false;
    };
  }, [getCurrentLearningCached, isAuthLoading, user?.id]);

  useEffect(() => {
    if (
      !selectedTrackId ||
      selectedTrackId === GENERAL_SKILLS_TRACK_ID ||
      typeof window === "undefined"
    ) {
      return;
    }

    window.localStorage.setItem(LAST_ACTIVE_ROADMAP_STORAGE_KEY, selectedTrackId);
  }, [selectedTrackId]);

  const handleTrackChange = (trackId: string) => {
    setSelectedTrackId(trackId);
    if (trackId === GENERAL_SKILLS_TRACK_ID) {
      setTrackHelperText("General Skills mode: showing all skills from the database.");
      return;
    }

    setTrackHelperText("");
  };

  useEffect(() => {
    let alive = true;

    const loadTrackContext = async () => {
      if (!selectedTrackId || selectedTrackId === GENERAL_SKILLS_TRACK_ID) {
        setSelectedRoadmap(null);
        setCurrentLearning(null);
        setSelectedSectionId("");
        return;
      }

      const roadmapRes = await getRoadmapByIdCached(selectedTrackId);
      if (!alive) {
        return;
      }

      if (!roadmapRes.success || !roadmapRes.data) {
        setSelectedRoadmap(null);
        setCurrentLearning(null);
        setSelectedSectionId("");
        setError(roadmapRes.message || "Failed to load selected track roadmap.");
        return;
      }

      const roadmap = roadmapRes.data;
      setSelectedRoadmap(roadmap);

      const sections = roadmap.sections.slice().sort((a, b) => a.order - b.order);
      const fallbackSectionId = sections[0]?.id || "";

      if (!user?.id) {
        setCurrentLearning(null);
        setSelectedSectionId((prev) => {
          if (prev && sections.some((section) => section.id === prev)) {
            return prev;
          }
          return fallbackSectionId;
        });
        return;
      }

      const currentRes = await getCurrentLearningCached(selectedTrackId);
      if (!alive) {
        return;
      }

      if (currentRes.success && currentRes.data) {
        const current = currentRes.data;
        setCurrentLearning(current);

        const preferredSectionId = current.section_id || fallbackSectionId;
        const sectionExists = preferredSectionId
          ? sections.some((section) => section.id === preferredSectionId)
          : false;

        const resolvedSectionId = sectionExists ? preferredSectionId : fallbackSectionId;
        setSelectedSectionId(resolvedSectionId);
      } else {
        setCurrentLearning(null);
        setSelectedSectionId((prev) => {
          if (prev && sections.some((section) => section.id === prev)) {
            return prev;
          }
          return fallbackSectionId;
        });
      }
    };

    void loadTrackContext();

    return () => {
      alive = false;
    };
  }, [getCurrentLearningCached, getRoadmapByIdCached, selectedTrackId, user?.id]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let alive = true;

    const loadBookmarkedCurrentTargets = async () => {
      if (!user?.id) {
        setBookmarkedCurrentTargets([]);
        setBookmarkedTargetsHint("");
        return;
      }

      const unifiedRoadmapBookmarks = Array.from(
        new Map(
          getUnifiedBookmarks(user.id)
            .filter((entry) => entry.kind === "roadmap" && Boolean(entry.entity_id))
            .map((entry) => [normalizeEntityId(entry.entity_id), entry] as const),
        ).values(),
      );

      const unifiedRoadmapBookmarkById = new Map(
        unifiedRoadmapBookmarks.map((entry) => [normalizeEntityId(entry.entity_id), entry] as const),
      );

      const roadmapTitleById = new Map(
        roadmapTracks.map((track) => [normalizeEntityId(track.id), track.title] as const),
      );

      const mergedRoadmapIds: string[] = [];
      const mergedRoadmapIdSet = new Set<string>();

      const appendRoadmapId = (candidateRoadmapId: unknown) => {
        const roadmapId = String(candidateRoadmapId ?? "").trim();
        const normalizedRoadmapId = normalizeEntityId(roadmapId);
        if (!normalizedRoadmapId || mergedRoadmapIdSet.has(normalizedRoadmapId)) {
          return;
        }

        mergedRoadmapIdSet.add(normalizedRoadmapId);
        mergedRoadmapIds.push(roadmapId);
      };

      let sourceHint = "";

      const backendBookmarksResponse = await roadmapService.getUserRoadmapBookmarks(user.id);
      if (backendBookmarksResponse.success && backendBookmarksResponse.data?.bookmarks) {
        for (const bookmark of backendBookmarksResponse.data.bookmarks) {
          appendRoadmapId(bookmark.roadmap_id);
        }
      } else {
        sourceHint = "Backend bookmark sync is unavailable. Showing locally saved roadmap bookmarks.";
      }

      for (const bookmark of unifiedRoadmapBookmarks) {
        appendRoadmapId(bookmark.entity_id);
      }

      const roadmapIds = mergedRoadmapIds.slice(0, MAX_UNIFIED_BOOKMARKS);
      if (!roadmapIds.length) {
        setBookmarkedCurrentTargets([]);
        setBookmarkedTargetsHint(sourceHint || "No roadmap bookmarks found.");
        return;
      }

      const targetCandidates: AssessmentTarget[] = await Promise.all(
        roadmapIds.map(async (roadmapId): Promise<AssessmentTarget> => {
          const normalizedRoadmapId = normalizeEntityId(roadmapId);
          const fallbackRoadmapTitle =
            unifiedRoadmapBookmarkById.get(normalizedRoadmapId)?.title ||
            roadmapTitleById.get(normalizedRoadmapId) ||
            "Roadmap";

          const currentResponse = await getCurrentLearningCached(roadmapId);
          const current = currentResponse.success ? currentResponse.data : null;

          if (current?.step_id) {
            const roadmapTitle = current.roadmap_title || fallbackRoadmapTitle;
            const stepTitle = current.step_title?.trim();
            const displayLabel = stepTitle ? `${roadmapTitle}: ${stepTitle}` : roadmapTitle;

            return {
              id: current.step_id,
              label: displayLabel,
              sessionType: "step" as const,
              sectionId: current.section_id || undefined,
              isCurrent: true,
            };
          }

          const roadmapResponse = await getRoadmapByIdCached(roadmapId);
          const roadmap = roadmapResponse.success ? roadmapResponse.data : null;
          if (!roadmap) {
            return {
              id: roadmapId,
              label: fallbackRoadmapTitle,
              sessionType: "roadmap",
              isCurrent: false,
            };
          }

          const orderedSections = roadmap.sections.slice().sort((a, b) => a.order - b.order);
          const firstSection = orderedSections[0];
          const firstStep = firstSection?.steps
            ?.slice()
            .sort((a, b) => a.order - b.order)[0];

          if (!firstSection || !firstStep) {
            return {
              id: roadmapId,
              label: roadmap.title || fallbackRoadmapTitle,
              sessionType: "roadmap",
              isCurrent: false,
            };
          }

          return {
            id: firstStep.id,
            label: `${roadmap.title || fallbackRoadmapTitle}: ${firstStep.title}`,
            sessionType: "step" as const,
            sectionId: firstSection.id,
            isCurrent: false,
          };
        }),
      );

      if (!alive) {
        return;
      }

      setBookmarkedCurrentTargets(targetCandidates);

      if (!targetCandidates.length) {
        setBookmarkedTargetsHint(sourceHint || "No roadmap bookmarks found.");
        return;
      }

      if (sourceHint) {
        setBookmarkedTargetsHint(sourceHint);
        return;
      }

      if (!targetCandidates.some((target) => target.isCurrent)) {
        setBookmarkedTargetsHint("Showing starter steps for your bookmarked roadmaps.");
        return;
      }

      setBookmarkedTargetsHint("");
    };

    const handleBookmarksUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId?: string }>;
      const eventUserId = customEvent.detail?.userId;

      if (
        eventUserId &&
        user?.id &&
        eventUserId !== user.id &&
        eventUserId !== "guest"
      ) {
        return;
      }

      void loadBookmarkedCurrentTargets();
    };

    const handleStorage = (event: StorageEvent) => {
      if (!user?.id) {
        return;
      }

      const key = event.key || "";
      if (key && key !== `unified-bookmarks:${user.id}`) {
        return;
      }

      void loadBookmarkedCurrentTargets();
    };

    void loadBookmarkedCurrentTargets();

    if (typeof window !== "undefined") {
      window.addEventListener(UNIFIED_BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated);
      window.addEventListener("storage", handleStorage);
    }

    return () => {
      alive = false;
      if (typeof window !== "undefined") {
        window.removeEventListener(UNIFIED_BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated);
        window.removeEventListener("storage", handleStorage);
      }
    };
  }, [getCurrentLearningCached, getRoadmapByIdCached, isAuthLoading, roadmapTracks, user?.id]);

  const skillById = useMemo(() => {
    const map = new Map<string, APISkill>();
    for (const skill of skills) {
      map.set(skill.id, skill);
    }
    return map;
  }, [skills]);

  const trackOptions: SkillFilterTrackOption[] = useMemo(
    () => [
      { id: GENERAL_SKILLS_TRACK_ID, title: GENERAL_SKILLS_TRACK_LABEL },
      ...roadmapTracks.map((track) => ({ id: track.id, title: track.title })),
    ],
    [roadmapTracks],
  );

  const sortedSections = useMemo(
    () => selectedRoadmap?.sections.slice().sort((a, b) => a.order - b.order) || [],
    [selectedRoadmap],
  );

  useEffect(() => {
    if (!sortedSections.length) {
      return;
    }

    if (!selectedSectionId || !sortedSections.some((section) => section.id === selectedSectionId)) {
      setSelectedSectionId(sortedSections[0].id);
    }
  }, [selectedSectionId, sortedSections]);

  const selectedSection = useMemo(() => {
    if (!sortedSections.length) {
      return null;
    }
    return sortedSections.find((section) => section.id === selectedSectionId) || sortedSections[0];
  }, [selectedSectionId, sortedSections]);

  const learningTargets = useMemo<AssessmentTarget[]>(() => bookmarkedCurrentTargets, [bookmarkedCurrentTargets]);

  useEffect(() => {
    if (!learningTargets.length) {
      setSelectedLearningTargetId("");
      return;
    }

    if (!learningTargets.some((target) => target.id === selectedLearningTargetId)) {
      setSelectedLearningTargetId(learningTargets[0].id);
    }
  }, [learningTargets, selectedLearningTargetId]);

  const learningItems = useMemo(
    () => learningTargets.map((target) => ({
      id: target.id,
      label: target.label,
      isCurrent: target.isCurrent,
    })),
    [learningTargets],
  );

  const selectedStepForFilter = useMemo(() => {
    if (!selectedRoadmap || isGeneralSkillsMode) {
      return null;
    }

    const stepsById = new Map(
      sortedSections.flatMap((section) =>
        section.steps.map((step) => [step.id, { ...step, sectionId: section.id }] as const),
      ),
    );

    const currentStepId = currentLearning?.step_id || "";
    if (currentStepId && stepsById.has(currentStepId)) {
      return stepsById.get(currentStepId) || null;
    }

    const firstSectionStep = selectedSection?.steps.slice().sort((a, b) => a.order - b.order)[0];
    if (firstSectionStep) {
      return { ...firstSectionStep, sectionId: selectedSection?.id || "" };
    }

    const firstStep = sortedSections
      .flatMap((section) => section.steps.slice().sort((a, b) => a.order - b.order))
      .shift();
    if (!firstStep) {
      return null;
    }

    return { ...firstStep, sectionId: "" };
  }, [currentLearning?.step_id, isGeneralSkillsMode, selectedRoadmap, selectedSection, sortedSections]);

  const sectionContextTexts = useMemo(() => {
    if (!selectedSection) {
      return [] as string[];
    }

    const contextParts: string[] = [selectedSection.title];
    if (selectedSection.description) {
      contextParts.push(selectedSection.description);
    }

    for (const step of selectedSection.steps) {
      contextParts.push(step.title);
      if (step.description) {
        contextParts.push(step.description);
      }
    }

    return contextParts;
  }, [selectedSection]);

  const stepContextTexts = useMemo(() => {
    if (!selectedStepForFilter) {
      return [] as string[];
    }

    const contextParts: string[] = [selectedStepForFilter.title];
    if (selectedStepForFilter.description) {
      contextParts.push(selectedStepForFilter.description);
    }

    for (const resource of selectedStepForFilter.resources || []) {
      if (resource.title) {
        contextParts.push(resource.title);
      }
      if (resource.resourceType) {
        contextParts.push(resource.resourceType);
      }
    }

    return contextParts;
  }, [selectedStepForFilter]);

  const filteredSkills = useMemo(() => {
    if (isGeneralSkillsMode || !selectedRoadmap) {
      return skills;
    }

    const contextTexts = selectedSkillType === "general" ? sectionContextTexts : stepContextTexts;
    if (!contextTexts.length) {
      return skills;
    }

    const matched = skills.filter((skill) => doesSkillMatchContext(skill.skill_name, contextTexts));
    return matched.length ? matched : skills;
  }, [
    isGeneralSkillsMode,
    sectionContextTexts,
    selectedRoadmap,
    selectedSkillType,
    skills,
    stepContextTexts,
  ]);

  const moreSkills = useMemo(() => filteredSkills.map((skill) => skill.skill_name), [filteredSkills]);

  useEffect(() => {
    if (!selectedMoreSkillId) {
      return;
    }

    if (!filteredSkills.some((skill) => skill.id === selectedMoreSkillId)) {
      setSelectedMoreSkillId("");
    }
  }, [filteredSkills, selectedMoreSkillId]);

  const selectedMoreName = skillById.get(selectedMoreSkillId)?.skill_name || "";
  const pendingTargetName = pendingTarget?.label || "";

  const allPastTests = useMemo(
    () => sessions
      .filter((session) => session.status === "submitted")
      .slice(0, 20)
      .map((session) => ({
        id: session.id.slice(0, 8),
        title: resolveSessionTitle(session, skillById),
        score: session.score,
      })),
    [sessions, skillById],
  );

  const openConfirmForTarget = (target: AssessmentTarget) => {
    if (isAuthLoading || !user?.id || isLoading || isStarting) {
      return;
    }

    setSelectedLearningTargetId(target.id);
    setPendingTarget(target);
    setIsConfirmOpen(true);
  };

  const handleStartAssessment = (target: AssessmentTarget) => {
    if (!user?.id || !target.id) {
      return;
    }

    setIsStarting(true);

    const params = new URLSearchParams({
      targetId: target.id,
      targetName: target.label,
      sessionType: target.sessionType,
      numQuestions: "7",
    });

    if (target.sessionType === "skills") {
      params.set("skillId", target.id);
      params.set("skillName", target.label);
      setSelectedMoreSkillId(target.id);
    }

    const inProgressSession = sessions.find(
      (session) => session.status === "in_progress" && doesSessionMatchTarget(session, target),
    );
    if (inProgressSession) {
      params.set("sessionId", inProgressSession.id);
    }

    setIsConfirmOpen(false);
    setPendingTarget(null);
    router.push(`/skill-feature/questions?${params.toString()}`);
    setIsStarting(false);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        padding: "2vh 2vw",
        boxSizing: "border-box",
        backgroundColor: "#000",
        overflow: "hidden",
      }}
    >
      <RootLayout
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          columnGap: "1.5vw",
          rowGap: "1vh",
          height: "100%",
          width: "100%",
          borderRadius: "3vh",
          padding: "1vh 2vw",
          boxSizing: "border-box",
          marginTop: "0",
          zIndex: 1,
        }}
      >
        <div
          style={{
            gridArea: "2/ 1 / 2 / 3",
            backgroundColor: "#1C427B",
            borderRadius: "2vh",
            padding: "3vh 2vw",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignSelf: "stretch",
            boxSizing: "border-box",
          }}
        >
          <SkillFilters
            tracks={trackOptions}
            selectedTrackId={selectedTrackId}
            onTrackChange={handleTrackChange}
            skillType={selectedSkillType}
            onSkillTypeChange={setSelectedSkillType}
            disabled={isLoading}
            disableSkillTypeToggle={isGeneralSkillsMode}
            trackHelperText={trackHelperText}
          />
        </div>

        <div
          style={{
            gridArea: "1 / 3 / 3 / 6",
            alignSelf: "stretch",
            display: "flex",
            flexDirection: "column",
            paddingTop: "2vh",
          }}
        >
          <LearningSkillsCard
            title="Skill you are learning now"
            items={learningItems}
            selectedId={selectedLearningTargetId}
            focusedId={selectedLearningTargetId}
            onSelect={(targetId: string) => {
              const target = learningTargets.find((item) => item.id === targetId);
              if (target) {
                openConfirmForTarget(target);
              }
            }}
            style={{
              width: "100%",
              height: "75%",
              padding: "2vh 2vw",
              borderRadius: "2vh",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              backgroundColor: "#142143",
            }}
          />
          {bookmarkedTargetsHint ? (
            <p
              style={{
                marginTop: "0.8vh",
                marginLeft: "0.2vw",
                color: "#E6FFB2",
                fontSize: "0.82vw",
                fontWeight: 600,
              }}
            >
              {bookmarkedTargetsHint}
            </p>
          ) : null}
        </div>

        <div
          style={{
            gridArea: "3 / 1 / 8 / 4",
            alignSelf: "stretch",
          }}
        >
          <MoreSkillsCard
            skills={moreSkills}
            selected={selectedMoreName}
            onSelect={(skillName: string) => {
              const selected = filteredSkills.find((skill) => skill.skill_name === skillName);
              if (!selected) {
                return;
              }

              setSelectedMoreSkillId(selected.id);
              openConfirmForTarget({
                id: selected.id,
                label: selected.skill_name,
                sessionType: "skills",
              });
            }}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "2vh",
              boxSizing: "border-box",
              backgroundColor: "#142143",
            }}
          />
        </div>

        <div
          style={{
            gridArea: "3 / 4 / 8 / 6",
            alignSelf: "stretch",
          }}
        >
          <PastTestsCard
            tests={allPastTests}
            style={{
              height: "100%",
              width: "100%",
              borderRadius: "2vh",
              boxSizing: "border-box",
              backgroundColor: "#142143",
            }}
          />
        </div>
      </RootLayout>

      {error ? (
        <div
          style={{
            position: "fixed",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(127, 29, 29, 0.92)",
            color: "#fee2e2",
            padding: "10px 16px",
            borderRadius: "12px",
            zIndex: 1001,
            fontSize: "13px",
            maxWidth: "70vw",
          }}
        >
          {error}
        </div>
      ) : null}

      {isConfirmOpen && pendingTarget && (
        <SkillConfirmPopup
          skillName={pendingTargetName}
          isLoading={isStarting}
          onCancel={() => {
            if (!isStarting) {
              setIsConfirmOpen(false);
              setPendingTarget(null);
            }
          }}
          onConfirm={() => handleStartAssessment(pendingTarget)}
        />
      )}
    </div>
  );
}