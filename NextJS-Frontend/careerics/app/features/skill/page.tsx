"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import RootLayout from "@/app/features/layout";
import { LearningSkillsCard, PastTestsCard, MoreSkillsCard } from "@/components/ui/cvArchive";
import SkillConfirmPopup from "@/components/ui/skillConfirmPopup";
import { useAuth } from "@/providers/auth-provider";
import { skillAssessmentService, skillsService } from "@/services";
import type { APIAssessmentSessionSummary, APISkill } from "@/types";
import { Button } from "@/components/ui/button";
import SkillFilters from "@/components/ui/SkillFilters";

export default function SkillAssessment() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [skills, setSkills] = useState<APISkill[]>([]);
  const [sessions, setSessions] = useState<APIAssessmentSessionSummary[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>("");
  const [extraSelectedSkillId, setExtraSelectedSkillId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [pendingSkillId, setPendingSkillId] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
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
        setSelectedSkillId((prev) => prev || "");
        setExtraSelectedSkillId((prev) => prev || "");
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
  const pendingSkillName = skillById.get(pendingSkillId)?.skill_name || "";

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

  const handleStartAssessment = (skillId: string) => {
    if (!user?.id || !skillId) return;

    setIsStarting(true);
    const selectedSkillName = skillById.get(skillId)?.skill_name || "Selected Skill";

    const learningMatch = learningSkillObjects.find((skill) => skill.id === skillId);
    if (learningMatch) {
      setSelectedSkillId(skillId);
      setExtraSelectedSkillId("");
    } else {
      setSelectedSkillId("");
      setExtraSelectedSkillId(skillId);
    }

    const params = new URLSearchParams({
      skillId,
      skillName: selectedSkillName,
      numQuestions: "7",
    });

    const inProgressSession = sessions.find(
      (session) => session.skill_id === skillId && session.status === "in_progress",
    );
    if (inProgressSession) {
      params.set("sessionId", inProgressSession.id);
    }

    setIsConfirmOpen(false);
    router.push(`/skill-feature/questions?${params.toString()}`);
    setIsStarting(false);
  };

  const handleSkillClick = (skillId: string) => {
    if (isAuthLoading || !user?.id || isLoading || isStarting) {
      return;
    }

    setPendingSkillId(skillId);
    setIsConfirmOpen(true);
  };


return (
    <div style={{ 
      width: "100vw", 
      height: "100vh", 
      padding: "2vh 2vw", 
      boxSizing: "border-box", 
      backgroundColor: "#000", 
      overflow: "hidden" 
    }}>
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
          zIndex: 1
        }}
      >
        {/* 1. Track & Skill Type Card (div1) */}
        <div style={{ 
          gridArea: "2/ 1 / 2 / 3", 
          backgroundColor: "#1C427B", 
          borderRadius: "2vh", 
          padding: "3vh 2vw",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignSelf: "stretch",
          boxSizing: "border-box"
        }}>
          {/* Your new component replaces the inline logic */}
          <SkillFilters />
        </div>

    {/* 2. Learning Card (div2) */}
          <div style={{ 
            gridArea: "1 / 3 / 3 / 6", 
            alignSelf: "stretch",
            display: "flex",
            paddingTop: "2vh",
            
          }}>
            <LearningSkillsCard 
              skills={learningSkills}
              selected={selectedLearningName}
              onSelect={(skillName: string) => {
                const selected = learningSkillObjects.find((skill) => skill.skill_name === skillName);
                if (selected) { handleSkillClick(selected.id); }
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

        {/* 3. More Skills Card (div3) */}
        <div style={{ 
          gridArea: "3 / 1 / 8 / 4", 
          alignSelf: "stretch" 
        }}>
          <MoreSkillsCard 
            skills={moreSkills}
            selected={selectedMoreName} 
            onSelect={(skillName: string) => {
              const selected = moreSkillObjects.find((skill) => skill.skill_name === skillName);
              if (selected) { handleSkillClick(selected.id); }
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

        {/* 4. Past Tests Card (div4) */}
        <div style={{ 
          gridArea: "3 / 4 / 8 / 6", 
          alignSelf: "stretch" 
        }}>
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

      {/* Confirmation Popup */}
      {isConfirmOpen && pendingSkillName && (
        <SkillConfirmPopup
          skillName={pendingSkillName}
          isLoading={isStarting}
          onCancel={() => {
            if (!isStarting) {
              setIsConfirmOpen(false);
              setPendingSkillId("");
            }
          }}
          onConfirm={() => handleStartAssessment(pendingSkillId)}
        />
      )}
    </div>
  );
}