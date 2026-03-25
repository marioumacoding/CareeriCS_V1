"use client";
import { CareersCard, RecentActivityCard, JourneyProgressCard, NextPhaseCard } from "@/components/ui/dashboardCards";

export default function HomePage() {
  const careerData = [
    { title: "Frontend", desc: "Build fast, responsive, interactive interfaces." },
    { title: "UI/UX", desc: "Design intuitive and user-focused experiences." },
    { title: "Backend", desc: "Power applications with secure, scalable logic." },
    { title: "full stack", desc: "Power applications with secure, scalable logic." },
  ];

  const activities = [
    { id: "CV-003", date: "created on 5/3/2026", type: "file" },
    { id: "CV-003", date: "created on 5/3/2026", type: "file" },
    { id: "Techh-003", date: "created on 5/3/2026", type: "file" },
    { id: "Test-005", topic: "UX Fundamentals", score: 50, type: "test" },
  ];

  return (
    <div style={{ width: "100%", height: "100vh", padding: "20px", boxSizing: "border-box" }}>
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.3fr 1.3fr 1.3fr 0.7fr 0.9fr", 
        gridTemplateRows: "1.4fr 1.4fr 0.7fr 0.9fr", 
        gridColumnGap: "10px",
        gridRowGap: "6px",
        height: "88%", 
        marginTop: "-60px",
        width: "100%"
      }}>
        <div style={{ gridArea: "1 / 1 / 3 / 4" }}>
          <CareersCard careers={careerData} />
        </div>
        <div style={{ gridArea: "1 / 4 / 3 / 6" }}>
          <RecentActivityCard activities={activities} />
        </div>
        <div style={{ gridArea: "3 / 1 / 5 / 2" }}>
          <JourneyProgressCard percentage={75} />
        </div>
        <div style={{ gridArea: "3 / 2 / 5 / 6" }}>
          <NextPhaseCard />
        </div>
      </div>
    </div>
  );
}