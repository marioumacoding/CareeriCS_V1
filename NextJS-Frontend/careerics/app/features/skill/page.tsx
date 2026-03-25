"use client";
import { useState } from "react"; 
import RootLayout from "@/app/features/layout";
import { LearningSkillsCard, PastTestsCard, MoreSkillsCard } from "@/components/ui/cvArchive";

export default function SkillAssessment() {
  const [selectedSkill, setSelectedSkill] = useState('UX Fundamentals');
  const [extraSelected, setExtraSelected] = useState('Problem Solving');

  const learningSkills = ["HTML", "CSS", "UX Fundamentals", "JavaScript", "Figma Basics"];
  
  const moreSkills = [
    "Problem Solving", "C++", "OOP Principles", "C#", "System Design", 
    "Machine Learning", "Data Analysis", "Python", "Deep Learning"
  ];

  const allPastTests = [
    { id: "005", title: "UX Fundamentals", score: 90 },
    { id: "004", title: "UX Fundamentals", score: 50 },
    { id: "003", title: "UX Fundamentals", score: 80 },
    { id: "002", title: "JavaScript Basics", score: 75 },
    { id: "001", title: "HTML/CSS Advanced", score: 95 },
    { id: "000", title: "CSS Layouts", score: 40 },
    { id: "999", title: "JavaScript Engine", score: 85 },
  ];


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
          selected={selectedSkill}
          onSelect={(skill: string) => setSelectedSkill(skill)}
          style={{ 
            gridArea: "1 / 1 / 3 / 5", 
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
          selected={extraSelected} 
          onSelect={(skill: string) => setExtraSelected(skill)}
          style={{ 
            gridArea: "3 / 3 / 5 / 5", 
            height: "100%",
          }}
        />
      </RootLayout>
    </div>
  );
}