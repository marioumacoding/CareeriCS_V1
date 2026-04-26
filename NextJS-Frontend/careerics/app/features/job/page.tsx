"use client";
import React, { useState } from 'react';
import BookmarkCard from '@/components/ui/BookmarkCard';
import ContinueCard from '@/components/ui/ContinueCard';
import TipCard from '@/components/ui/tipcard';
import LevelCard from '@/components/ui/LevelCard';
import RecentlyViewedCard from '@/components/ui/RecentlyViewedCard';
import { CardsContainer } from '@/components/ui/cards-container';
import { ActivityCard } from '@/components/ui/activity-card';
import { RectangularCard } from '@/components/ui/rectangular-card';
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
      gridTemplateColumns: "1fr 2fr repeat(2, 1fr)",
      gridTemplateRows: "repeat(3,1fr)",
      gridColumnGap: "15px",
      gridRowGap: "15px",
      width: "100%",
      height: "100%",
      padding: "45px",
    }}>

      {/* Area 1: grid-area: 1 / 1 / 3 / 4 */}
      <div style={{ gridArea: "1 / 1 / 2 / 3" }}>
        <BookmarkCard />
      </div>

      {/* Area 2: grid-area: 1 / 4 / 3 / 6 */}
      <div style={{ gridArea: "1 / 3 / 2 / 5" }}>
        <ContinueCard />
      </div>

      {/* Area 3: grid-area: 3 / 1 / 5 / 6 */}
      <div style={{ gridArea: "2 / 1 / 3 / 5" }}>
        <TipCard
          title="Tip of the day"
          description="Research the company and interviewers before your interview so you understand the company's goals and show how you fit."
          icon="/interview/Interview Tip.svg"
        />
      </div>

      {/* Area 4: grid-area: 5 / 1 / 7 / 3 */}
      <div style={{ gridArea: "3 / 1 / 4 / 2" }}>
        <LevelCard />
      </div>

      {/* Area 5: grid-area: 5 / 3 / 7 / 6 */}
      <CardsContainer
        style={{ gridArea: "3 / 2 / 4 / 5", backgroundColor: "var(--dark-blue)" }}
        Title='Recently Viewed'
        variant='horizontal'
        centerTitle
      >
        {recentlyJobs.map((item) => (
          <RectangularCard
            key={item.id}
            Title={item.title}
            isSubtextVisible
            subtext={item.company}
            font='nova'
            style={{height:"fit-content"}}
          />
        ))
        }

      </CardsContainer>

    </div>
  );
}