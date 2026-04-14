"use client";
import { CareersCard, RecentActivityCard, JourneyProgressCard, NextPhaseCard, CurrentPhaseCard } from "@/components/ui/dashboardCards";

export default function HomePage() {
  const careerData = [
    { title: "Frontend Development", desc: "Build fast, responsive, interactive interfaces." },
    { title: "UI/UX Design", desc: "Design intuitive and user-focused experiences." },
    { title: "Backend Development", desc: "Power applications with secure, scalable logic." },
  ];

  const activities = [
    { id: "CV-003", date: "created on 5/3/2026", type: "file" },
    { id: "CV-003", date: "created on 5/3/2026", type: "file" },
    { id: "Techh-003", date: "created on 5/3/2026", type: "file" },
    { id: "Test-005", topic: "UX Fundamentals", score: 50, type: "test" },
  ];

  return (

    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        padding: "40px",
        display: "grid",
        gridTemplateColumns: "1.3fr 1.3fr 1.3fr 0.7fr 0.9fr",
        gridTemplateRows: "1.4fr 1.4fr 0.7fr 0.9fr",
        gridColumnGap: "25px",
        gridRowGap: "20px",
        
      }}
    >

      <CareersCard careers={careerData} style={{ gridArea: "1 / 1 / 3 / 4" }} />

      <RecentActivityCard activities={activities} style={{ gridArea: "1 / 4 / 3 / 6" }} />

      <JourneyProgressCard percentage={10} style={{ gridArea: "3 / 1 / 5 / 2" }} />

      <CurrentPhaseCard percentage={2} style={{ gridArea: "3 / 2 / 5 / 2" }} />
      
      <NextPhaseCard 
      style={{ gridArea: "3 / 3 / 5 / 6" }} 
      desc="bla bla bla bla bla bla bla bla bla blaaa bla bla bla"
      phaseNumber="4"
      />

    </div>
  );
}