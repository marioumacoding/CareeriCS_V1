"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import RootLayout from "@/app/features/layout";
import SkillFilters, {
  type SkillFilterTrackOption,
  type SkillFilterType,
} from "@/components/ui/SkillFilters";
import { LearningSkillsCard, MoreSkillsCard, PastTestsCard } from "@/components/ui/cvArchive";
import SkillConfirmPopup from "@/components/ui/skillConfirmPopup";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService, skillAssessmentService, skillsService } from "@/services";
import type {
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

const LAST_ACTIVE_ROADMAP_STORAGE_KEY = "roadmap:last-active-id";

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
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedLearningTargetId, setSelectedLearningTargetId] = useState("");
  const [selectedMoreSkillId, setSelectedMoreSkillId] = useState("");

  const [pendingTarget, setPendingTarget] = useState<AssessmentTarget | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

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
        setIsLoading(false);
        return;
      }

      const tracks = normalizeRoadmapListPayload(roadmapsRes.data);
      const resolvedSessions = sessionsRes.success && sessionsRes.data ? sessionsRes.data : [];
      setSkills(skillsRes.data);
      setRoadmapTracks(tracks);
      setSessions(resolvedSessions);

      if (!tracks.length) {
        setSelectedTrackId("");
        setTrackHelperText("");
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
        const currentRes = await roadmapService.getCurrentRoadmapLearning(user.id);
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
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    if (!selectedTrackId || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(LAST_ACTIVE_ROADMAP_STORAGE_KEY, selectedTrackId);
  }, [selectedTrackId]);

  const handleTrackChange = (trackId: string) => {
    setSelectedTrackId(trackId);
    setTrackHelperText("");
  };

  useEffect(() => {
    let alive = true;

    const loadTrackContext = async () => {
      if (!selectedTrackId) {
        setSelectedRoadmap(null);
        setCurrentLearning(null);
        setSelectedSectionId("");
        setSelectedLearningTargetId("");
        return;
      }

      const roadmapRes = await roadmapService.getRoadmapById(selectedTrackId);
      if (!alive) {
        return;
      }

      if (!roadmapRes.success || !roadmapRes.data) {
        setSelectedRoadmap(null);
        setCurrentLearning(null);
        setSelectedSectionId("");
        setSelectedLearningTargetId("");
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

      const currentRes = await roadmapService.getCurrentRoadmapLearning(user.id, selectedTrackId);
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

        if (selectedSkillType === "general") {
          setSelectedLearningTargetId(resolvedSectionId);
        } else {
          setSelectedLearningTargetId(current.step_id || "");
        }
      } else {
        setCurrentLearning(null);
        setSelectedSectionId((prev) => {
          if (prev && sections.some((section) => section.id === prev)) {
            return prev;
          }
          return fallbackSectionId;
        });
        setSelectedLearningTargetId("");
      }
    };

    void loadTrackContext();

    return () => {
      alive = false;
    };
  }, [selectedTrackId, selectedSkillType, user?.id]);

  const skillById = useMemo(() => {
    const map = new Map<string, APISkill>();
    for (const skill of skills) {
      map.set(skill.id, skill);
    }
    return map;
  }, [skills]);

  const trackOptions: SkillFilterTrackOption[] = useMemo(
    () => roadmapTracks.map((track) => ({ id: track.id, title: track.title })),
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

  const learningTargets = useMemo<AssessmentTarget[]>(() => {
    if (selectedSkillType === "general") {
      return sortedSections.map((section) => ({
        id: section.id,
        label: section.title,
        sessionType: "section",
      }));
    }

    return sortedSections.flatMap((section) => {
      return section.steps
        .slice()
        .sort((a, b) => a.order - b.order)
        .map((step) => ({
          id: step.id,
          label: step.title,
          sessionType: "step" as const,
          sectionId: section.id,
          isCurrent: currentLearning?.step_id === step.id,
        }));
    });
  }, [currentLearning?.step_id, selectedSkillType, sortedSections]);

  useEffect(() => {
    if (!learningTargets.length) {
      setSelectedLearningTargetId("");
      return;
    }

    if (selectedSkillType === "general") {
      const preferred = selectedSectionId || learningTargets[0].id;
      setSelectedLearningTargetId(preferred);
      return;
    }

    const currentStepId = currentLearning?.step_id || "";
    if (currentStepId && learningTargets.some((target) => target.id === currentStepId)) {
      setSelectedLearningTargetId(currentStepId);
      return;
    }

    if (!learningTargets.some((target) => target.id === selectedLearningTargetId)) {
      setSelectedLearningTargetId(learningTargets[0].id);
    }
  }, [currentLearning?.step_id, learningTargets, selectedLearningTargetId, selectedSectionId, selectedSkillType]);

  const learningItems = useMemo(
    () => learningTargets.map((target) => ({
      id: target.id,
      label: target.label,
      isCurrent: target.isCurrent,
    })),
    [learningTargets],
  );

  const moreSkills = useMemo(() => skills.map((skill) => skill.skill_name), [skills]);

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

    if (target.sessionType === "section") {
      setSelectedSectionId(target.id);
    } else if (target.sessionType === "step" && target.sectionId) {
      setSelectedSectionId(target.sectionId);
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
            disabled={isLoading || !trackOptions.length}
            trackHelperText={trackHelperText}
          />
        </div>

        <div
          style={{
            gridArea: "1 / 3 / 3 / 6",
            alignSelf: "stretch",
            display: "flex",
            paddingTop: "2vh",
          }}
        >
          <LearningSkillsCard
            title={
              selectedSkillType === "general"
                ? "General topics you are currently learning"
                : "Specific skills from your roadmap"
            }
            items={learningItems}
            selectedId={selectedLearningTargetId}
            focusedId={
              selectedSkillType === "specific"
                ? (currentLearning?.step_id || selectedLearningTargetId)
                : selectedLearningTargetId
            }
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
              const selected = skills.find((skill) => skill.skill_name === skillName);
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