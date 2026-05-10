"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import JourneyTree from "@/components/ui/journey-tree";
import { RectangularCard } from "@/components/ui/rectangular-card";
import { useJourneyPhase } from "@/hooks/use-journey-phase";
import { useAuth } from "@/providers/auth-provider";
import { buildJourneyPhaseHref } from "@/lib/journey";
import { mapApiJobToUiModel } from "@/lib/jobs";
import { jobService, roadmapService } from "@/services";

type Level = "Entry" | "Junior" | "Senior";

type LevelData = {
  salary: string;
  demand: string;
  demandColor: string;
  responsibilities: string[];
  fit: string[];
};

const LEVELS: Level[] = ["Entry", "Junior", "Senior"];

const DEFAULT_LEVEL_DATA: LevelData = {
  salary: "Not available yet",
  demand: "Unknown",
  demandColor: "#C1CBE6",
  responsibilities: [],
  fit: [],
};

function splitSentences(value: string): string[] {
  return value
    .split(/[.\n]/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeDemand(count: number): { label: string; color: string } {
  if (count <= 0) {
    return { label: "Unknown", color: "#C1CBE6" };
  }

  if (count <= 4) {
    return { label: "Low", color: "#FFBC6A" };
  }

  if (count <= 12) {
    return { label: "Medium", color: "#FFF47C" };
  }

  return { label: "High", color: "var(--light-green)" };
}

function resolveLevelBucket(careerLevel?: string | null): Level {
  const normalized = (careerLevel || "").toLowerCase();

  if (
    normalized.includes("senior") ||
    normalized.includes("lead") ||
    normalized.includes("principal") ||
    normalized.includes("staff")
  ) {
    return "Senior";
  }

  if (
    normalized.includes("junior") ||
    normalized.includes("mid") ||
    normalized.includes("associate")
  ) {
    return "Junior";
  }

  return "Entry";
}

function collectJobResponsibilities(text?: string | null): string[] {
  return splitSentences(text || "")
    .map((item) => item.replace(/^[•\-–\s]+/g, "").trim())
    .filter(Boolean);
}

export default function JourneyCrosspathsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState<Level>("Entry");
  const [skills, setSkills] = useState<string[]>([]);
  const [levelData, setLevelData] = useState<Record<Level, LevelData>>({
    Entry: DEFAULT_LEVEL_DATA,
    Junior: DEFAULT_LEVEL_DATA,
    Senior: DEFAULT_LEVEL_DATA,
  });
  const [isLoadingData, setIsLoadingData] = useState(false);

  const {
    selectedTrack,
    maxReached,
    isLoadingTracks,
    trackError,
  } = useJourneyPhase(1);

  

  useEffect(() => {
    let alive = true;

    const loadTrackDetails = async () => {
      if (!selectedTrack) {
        setSkills([]);
        setLevelData({
          Entry: DEFAULT_LEVEL_DATA,
          Junior: DEFAULT_LEVEL_DATA,
          Senior: DEFAULT_LEVEL_DATA,
        });
        return;
      }

      setIsLoadingData(true);

      const [roadmapResponse, jobsResponse] = await Promise.all([
        selectedTrack.roadmapId
          ? roadmapService.getRoadmapById(selectedTrack.roadmapId)
          : Promise.resolve({ success: false, data: null, message: "" }),
        jobService.searchJobs({
          query: selectedTrack.title,
          limit: 40,
          userId: user?.id ?? undefined,
          sort: "match",
        }),
      ]);

      if (!alive) {
        return;
      }

      const roadmap = roadmapResponse.success ? roadmapResponse.data : null;
      const jobs = jobsResponse.success ? jobsResponse.data?.jobs.map(mapApiJobToUiModel) || [] : [];

      const skillsFromRoadmap = (roadmap?.sections || [])
        .slice()
        .sort((left, right) => left.order - right.order)
        .map((section) => section.title)
        .filter(Boolean)
        .slice(0, 3);

      setSkills(skillsFromRoadmap.length ? skillsFromRoadmap : ["Learning Path", "Core Skills", "Career Growth"]);

      const bucketedJobs: Record<Level, typeof jobs> = {
        Entry: [],
        Junior: [],
        Senior: [],
      };

      for (const job of jobs) {
        bucketedJobs[resolveLevelBucket(job.careerLevel)].push(job);
      }

      const fitFromDescription = splitSentences(selectedTrack.description || "").slice(0, 5);
      const fitFallback = [
        `You enjoy solving real ${selectedTrack.title.toLowerCase()} challenges.`,
        "You like structured learning paths and measurable progress.",
        "You are ready to build practical projects and iterate fast.",
        "You can grow through feedback from assessments and interviews.",
        "You want a long-term path from learning to hiring.",
      ];
      const fitLines = fitFromDescription.length ? fitFromDescription : fitFallback;

      const fallbackResponsibilities = (roadmap?.sections || [])
        .slice()
        .sort((left, right) => left.order - right.order)
        .flatMap((section) => section.steps.slice().sort((left, right) => left.order - right.order))
        .map((step) => step.title)
        .filter(Boolean)
        .slice(0, 6);

      const nextLevelData: Record<Level, LevelData> = {
        Entry: DEFAULT_LEVEL_DATA,
        Junior: DEFAULT_LEVEL_DATA,
        Senior: DEFAULT_LEVEL_DATA,
      };

      for (const level of LEVELS) {
        const levelJobs = bucketedJobs[level].length ? bucketedJobs[level] : jobs;
        const firstSalary = levelJobs.find((job) => job.salary)?.salary || "Not available yet";
        const demand = normalizeDemand(levelJobs.length);

        const responsibilities = Array.from(
          new Set(
            levelJobs
              .flatMap((job) => [
                ...collectJobResponsibilities(job.responsibilities),
                ...collectJobResponsibilities(job.requirements),
                ...collectJobResponsibilities(job.description),
              ])
              .filter(Boolean),
          ),
        ).slice(0, 6);

        nextLevelData[level] = {
          salary: firstSalary,
          demand: demand.label,
          demandColor: demand.color,
          responsibilities: responsibilities.length ? responsibilities : fallbackResponsibilities,
          fit: fitLines,
        };
      }

      setLevelData(nextLevelData);
      setIsLoadingData(false);
    };

    void loadTrackDetails();

    return () => {
      alive = false;
    };
  }, [selectedTrack, user?.id]);

  const currentLevelData = useMemo(() => {
    return levelData[selectedLevel] || DEFAULT_LEVEL_DATA;
  }, [levelData, selectedLevel]);

  // Delay render until all data is ready
  if (isLoadingTracks || isLoadingData || !selectedTrack) {
    return (
      <JourneyTree
        current={1}
        maxReached={1}
        renderContent={() => (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontSize: "1rem",
                  marginBottom: "1rem",
                  opacity: 0.8,
                }}
              >
                Loading your career path...
              </div>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  border: "2px solid #4A5FC1",
                  borderTop: "2px solid transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto",
                }}
              />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          </div>
        )}
      />
    );
  }

  if (!selectedTrack && !isLoadingTracks) {
    return (
      <JourneyTree
        current={1}
        maxReached={1}
        renderContent={() => (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              color: "white",
              padding: "40px",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            <h1 style={{ fontSize: "1.6rem", margin: 0 }}>No Career Track Selected</h1>
            <p style={{ margin: 0, color: "#C1CBE6", maxWidth: "60ch" }}>
              Start by taking the career quiz or selecting a saved track from Home, then continue your Journey.
            </p>
            <button
              type="button"
              onClick={() => router.push("/features/career")}
              style={{
                border: "none",
                borderRadius: "2vh",
                backgroundColor: "var(--light-green)",
                color: "black",
                padding: "0.9rem 1.6rem",
                fontFamily: "var(--font-nova-square)",
                cursor: "pointer",
              }}
            >
              Go To Career Exploration
            </button>
          </div>
        )}
      />
    );
  }

  const nextPhase = maxReached < 5
    ? maxReached + 1
    : maxReached;  

  return (
    <JourneyTree
      current={1}
      maxReached={nextPhase}
      resolvePhasePath={(phase) => buildJourneyPhaseHref(phase, selectedTrack?.id)}
      renderContent={() => (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            padding: "40px",
            gridTemplateColumns: "repeat(2,1fr)",
            gridTemplateRows: "1fr",
            gridColumnGap: "1rem",
            color: "white",
            textAlign: "left",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "2rem",
            }}
          >
            <div>
              <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                {selectedTrack?.title || "Career Track"}
              </h1>
              <p style={{ color: "lightgrey", margin: 0 }}>
                {selectedTrack?.description || "Track details are loading..."}
              </p>
              {selectedTrack?.score !== null && selectedTrack?.score !== undefined ? (
                <p style={{ color: "var(--light-green)", marginTop: "0.5rem", marginBottom: 0 }}>
                  Match score: {Math.round(selectedTrack.score)}%
                </p>
              ) : null}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                width: "fit-content",
                gap: "1rem",
              }}
            >
              {skills.map((skill) => (
                <RectangularCard
                  key={skill}
                  style={{ width: "100%" }}
                  theme="dark"
                  Title={skill}
                />
              ))}
            </div>

            <div>
              <h1 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                Key Responsibilities
              </h1>

              {isLoadingData ? (
                <p style={{ color: "lightgrey" }}>Loading track responsibilities...</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(1, 1fr)",
                    width: "fit-content",
                    gap: "1rem",
                  }}
                >
                  {currentLevelData.responsibilities.length ? (
                    currentLevelData.responsibilities.map((responsibility, index) => (
                      <p key={`${responsibility}-${index}`} style={{ color: "lightgrey", margin: 0 }}>
                        • {responsibility}
                      </p>
                    ))
                  ) : (
                    <p style={{ color: "lightgrey", margin: 0 }}>
                      No detailed responsibilities are available for this track yet.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "2rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                width: "fit-content",
                gap: "1rem",
              }}
            >
              {LEVELS.map((level) => (
                <RectangularCard
                  style={{ width: "100%" }}
                  key={level}
                  font="jura"
                  theme="light"
                  Title={level === "Entry" ? "Entry Level" : level}
                  selected={selectedLevel === level}
                  selectable
                  onSelect={() => setSelectedLevel(level)}
                />
              ))}
            </div>

            <div
              style={{
                width: "100%",
                height: "fit-content",
                display: "flex",
                justifyContent: "flex-start",
                alignItems: "center",
                gap: "5rem",
              }}
            >
              <div>
                <h1 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Salary Range</h1>
                <h1 style={{ fontSize: "1.5rem", color: "lightgrey", margin: 0 }}>
                  {currentLevelData.salary}
                </h1>
              </div>

              <div>
                <h1 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Market Demand</h1>
                <h1 style={{ fontSize: "1.5rem", color: currentLevelData.demandColor, margin: 0 }}>
                  {currentLevelData.demand}
                </h1>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                height: "100%",
                backgroundColor: "var(--medium-blue)",
                borderRadius: "4vh",
                padding: "2rem",
              }}
            >
              <h1 style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
                This Would Fit You If
              </h1>

              {(isLoadingTracks || isLoadingData) && !currentLevelData.fit.length ? (
                <p style={{ color: "lightgrey" }}>Loading fit profile...</p>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(1, 1fr)",
                    width: "fit-content",
                    gap: "1rem",
                  }}
                >
                  {currentLevelData.fit.map((fitReason, index) => (
                    <p key={`${fitReason}-${index}`} style={{ color: "lightgrey", margin: 0 }}>
                      • {fitReason}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {trackError ? (
              <p style={{ margin: 0, color: "#FFD3D3" }}>
                {trackError}
              </p>
            ) : null}
          </div>
        </div>
      )}
    />
  );
}
