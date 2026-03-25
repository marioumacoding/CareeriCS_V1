"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RootLayout from "@/app/features/layout";
import { LearningSkillsCard, PastTestsCard, MoreSkillsCard } from "@/components/ui/cvArchive";
import { useAuth } from "@/providers/auth-provider";
import { skillAssessmentService, skillsService } from "@/services";
import type { APIAssessmentSessionSummary, APISkill } from "@/types";

export default function SkillAssessment() {
  const router = useRouter();
  const { user } = useAuth();

  const [skills, setSkills] = useState<APISkill[]>([]);
  const [sessions, setSessions] = useState<APIAssessmentSessionSummary[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [extraSelectedSkillId, setExtraSelectedSkillId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    const loadData = async () => {
      setIsLoading(true);
      setError("");

      const skillsRes = await skillsService.listSkills();

      if (!alive) return;

      if (!skillsRes.success || !skillsRes.data) {
        setError(skillsRes.message || "Failed to load skills.");
        setIsLoading(false);
        return;
      }

      const loadedSkills = skillsRes.data;
      setSkills(loadedSkills);

      if (loadedSkills.length) {
        setSelectedSkillId((prev) => prev || loadedSkills[0].id);
        setExtraSelectedSkillId((prev) => prev || loadedSkills[Math.min(1, loadedSkills.length - 1)].id);
      }

      if (user?.id) {
        const sessionsRes = await skillAssessmentService.getUserSessions(user.id);
        if (alive && sessionsRes.success && sessionsRes.data) {
          setSessions(sessionsRes.data);
        }
      } else {
        setSessions([]);
      }

      setIsLoading(false);
    };

    loadData();

    return () => {
      alive = false;
    };
  }, [user?.id]);

  const skillById = useMemo(() => {
    const map = new Map<string, APISkill>();
    for (const skill of skills) map.set(skill.id, skill);
    return map;
  }, [skills]);

  const learningSkillObjects = useMemo(
    () => skills.slice(0, Math.min(6, skills.length)),
    [skills],
  );

  const moreSkillObjects = useMemo(
    () => skills.slice(Math.min(6, skills.length)),
    [skills],
  );

  const learningSkills = learningSkillObjects.map((s) => s.skill_name);
  const moreSkills = moreSkillObjects.map((s) => s.skill_name);

  const selectedLearningName = skillById.get(selectedSkillId)?.skill_name || "";
  const selectedMoreName = skillById.get(extraSelectedSkillId)?.skill_name || "";

  const allPastTests = useMemo(
    () => sessions
      .filter((session) => session.status === "submitted")
      .slice(0, 20)
      .map((session) => ({
        id: session.id.slice(0, 8),
        title: skillById.get(session.skill_id)?.skill_name || "Unknown skill",
        score: session.score,
      })),
    [sessions, skillById],
  );

  const selectedSkill = selectedSkillId || extraSelectedSkillId;

  const handleStartAssessment = () => {
    if (!user?.id || !selectedSkill) return;

    setIsStarting(true);
    const selectedSkillName = skillById.get(selectedSkill)?.skill_name || "Selected Skill";

    const params = new URLSearchParams({
      skillId: selectedSkill,
      skillName: selectedSkillName,
      numQuestions: "7",
    });

    const inProgressSession = sessions.find(
      (session) => session.skill_id === selectedSkill && session.status === "in_progress",
    );
    if (inProgressSession) {
      params.set("sessionId", inProgressSession.id);
    }

    router.push(`/skill-feature/questions?${params.toString()}`);
    setIsStarting(false);
  };


  return (
    <div style={{ width: "100%", height: "100vh", padding: "20px", boxSizing: "border-box" }}>
      <RootLayout
        style={{
          display: "grid",
          gridTemplateColumns: "0.8fr 0.8fr 1.7fr 1.7fr",
          gridTemplateRows: "min-content min-content 1fr 1fr",
          gridColumnGap: "15px",
          gridRowGap: "15px",
          height: "100%",
          width: "100%",
        }}
      >
        {/* Learning Card - Selection hayghayar shaklo hwa bas */}
        <LearningSkillsCard 
          skills={learningSkills}
          selected={selectedLearningName}
          onSelect={(skillName: string) => {
            const selected = learningSkillObjects.find((skill) => skill.skill_name === skillName);
            if (selected) setSelectedSkillId(selected.id);
          }}
          style={{
            gridArea: "1 / 1 / 2 / 5",
            padding: "20px 30px",
            minHeight: "fit-content",
            transition: "all 0.3s ease"
          }}
        />

        {/* Past Tests - Dlw2ty hay-render el list kamla static mesh hay-tt'asar bel select */}
        <PastTestsCard 
          tests={allPastTests} 
          style={{ 
            gridArea: "3 / 1 / 5 / 3", 
            height: "100%",
            transition: "transform 0.3s ease",
          }}
        />

        <MoreSkillsCard 
          skills={moreSkills}
          selected={selectedMoreName} 
          onSelect={(skillName: string) => {
            const selected = moreSkillObjects.find((skill) => skill.skill_name === skillName);
            if (selected) setExtraSelectedSkillId(selected.id);
          }}
          style={{ 
            gridArea: "3 / 3 / 5 / 5", 
            height: "100%",
          }}
        />

        <div
          style={{
            gridArea: "2 / 1 / 3 / 5",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "10px",
            paddingRight: "4px",
          }}
        >
          {error ? (
            <p style={{ color: "#ffd3d3", fontSize: "13px", margin: 0 }}>{error}</p>
          ) : null}
          {isLoading ? (
            <p style={{ color: "#c1cbe6", fontSize: "13px", margin: 0 }}>Loading skills...</p>
          ) : null}
          <button
            type="button"
            onClick={handleStartAssessment}
            disabled={!selectedSkill || isLoading || isStarting || !user?.id}
            style={{
              border: "none",
              borderRadius: "12px",
              padding: "12px 18px",
              backgroundColor: "#E6FFB2",
              color: "#111827",
              fontWeight: 800,
              cursor: !selectedSkill || isLoading || isStarting || !user?.id ? "not-allowed" : "pointer",
              opacity: !selectedSkill || isLoading || isStarting || !user?.id ? 0.6 : 1,
            }}
          >
            {isStarting ? "Opening..." : "Start Assessment"}
          </button>
        </div>
      </RootLayout>
    </div>
  );
}