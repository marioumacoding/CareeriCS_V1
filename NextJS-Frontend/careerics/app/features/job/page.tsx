"use client";
import React, { useState } from 'react';
import BookmarkCard from '@/components/ui/BookmarkCard';
import ContinueCard from '@/components/ui/ContinueCard';
import TipCard from '@/components/ui/tipcard';
import LevelCard from '@/components/ui/LevelCard';
import RecentlyViewedCard from '@/components/ui/RecentlyViewedCard';
export default function JobHunt() {
  const [selectedCourse, setSelectedCourse] = useState("");

  // Array 3ashan el .map() matshtemsh
  const myCourses = [
    { title: "UI/UX Design Foundation", provider: "Google", completed: true },
    { title: "React Development", provider: "Meta", completed: false },
    { title: "backend Development", provider: "Meta", completed: true }
  ];

const recentlyJobs = [
  { id: 1, title: "Job Title 1", company: "by company name" },
  { id: 2, title: "Job Title 1", company: "by company name" },
  { id: 3, title: "Job Title 1", company: "by company name" },
  { id: 4, title: "Job Title 1", company: "by company name" },
  { id: 5, title: "Job Title 1", company: "by company name" },
];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(5, 1fr)",
      gridTemplateRows: "repeat(5,1fr)",
      gridColumnGap: "15px",
        gridRowGap: "15px",
        width:"100%",
        height:"100%",
        padding:"45px",
    }}>
      
      {/* Area 1: grid-area: 1 / 1 / 3 / 4 */}
      <div style={{ gridArea: "1 / 1 / 2 / 4" }}>
        <BookmarkCard />
      </div>

      {/* Area 2: grid-area: 1 / 4 / 3 / 6 */}
      <div style={{ gridArea: "1 / 4 / 2 / 6" }}>
        <ContinueCard />
      </div>

      {/* Area 3: grid-area: 3 / 1 / 5 / 6 */}
      <div style={{ gridArea: "2 / 1 / 4 / 6" }}>
        <TipCard 
           title="Tip of the day"
        description="Research the company and interviewers before your interview so you understand the company's goals and show how you fit."
        icon="/interview/Interview Tip.svg"
        />
      </div>

      {/* Area 4: grid-area: 5 / 1 / 7 / 3 */}
      <div style={{ gridArea: "4 / 1 / 6 / 3" }}>
        <LevelCard />
      </div>

      {/* Area 5: grid-area: 5 / 3 / 7 / 6 */}
  <div style={{ gridArea: "4 / 3 / 6 / 6" }}>
  <RecentlyViewedCard jobs={recentlyJobs} /> 
</div>

    </div>
  );
}