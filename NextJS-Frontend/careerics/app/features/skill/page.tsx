"use client";
import { useState, useMemo } from "react";
import RootLayout from "@/app/features/layout";
import { LearningSkillsCard, PastTestsCard, MoreSkillsCard } from "@/components/ui/cvArchive";

export default function SkillAssessment() {
  // 1. State management le interactivity
  const [selectedSkill, setSelectedSkill] = useState('UX Fundamentals');
  // State tanya khassa bel "More Skills" card ashan el selection bta3ha may-darabsh f elly fo2
  const [extraSelected, setExtraSelected] = useState('Problem Solving');

  const learningSkills = ["HTML", "CSS", "UX Fundamentals", "JavaScript", "Figma Basics"];
  
  const moreSkills = [
    "Problem Solving", "C++", "OOP Principles", "C#", "System Design", 
    "Machine Learning", "Data Analysis", "Python", "Deep Learning"
  ];

  const allPastTests = [
    { id: "005", title: "UX Fundamentals", score: 90 },
    { id: "004", title: "UX Fundamentals", score: 50 },
    { id: "003", title: "UX Fundamentals", score: 10 },
    { id: "002", title: "JavaScript Basics", score: 75 },
    { id: "001", title: "HTML/CSS Advanced", score: 95 },
    { id: "000", title: "CSS Layouts", score: 40 },
    { id: "999", title: "JavaScript Engine", score: 85 },
  ];

  // 2. Dynamic Filtering: El card hat-change content lma t-click fo2
  const filteredTests = useMemo(() => {
    return allPastTests.filter(test => 
      test.title.toLowerCase().includes(selectedSkill.toLowerCase()) || 
      (selectedSkill === "HTML" && test.title.includes("HTML"))
    );
  }, [selectedSkill]);

  return (
    <div style={{ width: "100%", height: "100vh", padding: "20px", boxSizing: "border-box" }}>
      <RootLayout
        style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1.2fr 1.5fr 1.5fr", 
          gridTemplateRows: "min-content min-content 1fr 1fr", 
          gridColumnGap: "15px",
          gridRowGap: "15px",
          height: "100%", 
          width: "100%",
        }}
      >
        {/* Learning Card - Interactive Select */}
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

        {/* Past Tests - Dynamic Content based on selection */}
        <PastTestsCard 
          tests={filteredTests.length > 0 ? filteredTests : allPastTests.slice(0, 4)}
          style={{ 
            gridArea: "3 / 1 / 5 / 3", 
            height: "80%",
            transition: "transform 0.3s ease",
          }}
        />

        {/* More Skills - Zawedna el selected we onSelect ashan el error yerou7 */}
        <MoreSkillsCard 
          skills={moreSkills}
          selected={extraSelected} 
          onSelect={(skill: string) => setExtraSelected(skill)}
          style={{ 
            gridArea: "3 / 3 / 5 / 5", 
            height: "77%",
          }}
        />
      </RootLayout>
    </div>
  );
}