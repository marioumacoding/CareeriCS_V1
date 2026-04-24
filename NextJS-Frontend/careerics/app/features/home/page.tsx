"use client";

import ChoiceCard from "@/components/ui/choice-card-home";
import { useEffect, useMemo, useState } from "react";
import { CareersCard, RecentActivityCard, JourneyProgressCard, NextPhaseCard, CurrentPhaseCard } from "@/components/ui/dashboardCards";
import { useAuth } from "@/providers/auth-provider";
import {
  getUnifiedBookmarks,
  UNIFIED_BOOKMARKS_UPDATED_EVENT,
} from "@/lib/unified-bookmarks";
import type { UnifiedBookmarkEntry } from "@/types";

type CareerCardItem = {
  title: string;
  desc: string;
  href?: string;
  buttonLabel?: string;
  tag?: string;
};

export default function HomePage() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [bookmarks, setBookmarks] = useState<UnifiedBookmarkEntry[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);
  const handleContinue = (career: any) => {
  setSelectedCareer(career.title)
};
const selectedBookmark = useMemo(() => {
  return bookmarks.find((b) => b.title === selectedCareer) || null;
}, [bookmarks, selectedCareer]);

const dashboardData = useMemo(() => {
  if (!selectedBookmark) {
    return {
      activities: [
        { id: "placeholder-1", date: "No activity yet", type: "file" },
      ],
      progress: 0,
      currentPhase: 0,
      nextPhase: 1,
      nextPhaseDesc: "Select a career or roadmap to see next phase details.",
    };
  }

  return {
    activities: selectedBookmark.activities ?? [
      { id: "placeholder-1", date: "No activity yet", type: "file" },
    ],

    progress: selectedBookmark.journeyProgressPercentage ?? 10,

    currentPhase: selectedBookmark.currentPhase ?? 1,

    nextPhase:
      selectedBookmark.nextPhase ??
      (selectedBookmark.currentPhase ? selectedBookmark.currentPhase + 1 : 2),

    nextPhaseDesc:
      selectedBookmark.nextPhaseDesc ??
      selectedBookmark.nextPhaseDescription ??
      "No next phase description available.",
  };
}, [selectedBookmark]);

useEffect(() => {
  if (bookmarks.length > 0 && !selectedCareer) {
    setSelectedCareer(bookmarks[0].title);
  }
}, [bookmarks]);

  const loadBookmarks = () => {
    if (isAuthLoading) {
      return;
    }

    setBookmarks(getUnifiedBookmarks(user?.id));
  };

  useEffect(() => {
    loadBookmarks();
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    const handleBookmarksUpdated = () => {
      loadBookmarks();
    };

    window.addEventListener(UNIFIED_BOOKMARKS_UPDATED_EVENT, handleBookmarksUpdated as EventListener);
    window.addEventListener("storage", handleBookmarksUpdated);

    return () => {
      window.removeEventListener(
        UNIFIED_BOOKMARKS_UPDATED_EVENT,
        handleBookmarksUpdated as EventListener,
      );
      window.removeEventListener("storage", handleBookmarksUpdated);
    };
  }, [isAuthLoading, user?.id]);

  const careerData: CareerCardItem[] = useMemo(() => {
    if (bookmarks.length > 0) {
      return bookmarks.map((bookmark) => {
        if (bookmark.kind === "roadmap") {
          return {
            title: bookmark.title,
            desc: bookmark.description || "Continue your roadmap journey.",
            selected: 0,
            href: `/journey?career=${encodeURIComponent(bookmark.title)}`,
            buttonLabel: "Continue",
          };
        }

        return {
          title: bookmark.title,
          desc: bookmark.description || `Match score: ${bookmark.score ?? 0}%`,
          href: `/journey?career=${encodeURIComponent(bookmark.title)}`,
          buttonLabel: "Continue",
          tag: "Career Suggestion",
        };
      });
    }

    return [
      {
        title: "No Bookmarks Yet",
        desc: "Save roadmap or career suggestions and they will appear here.",
        href: "/features/roadmap",
        buttonLabel: "Explore",
        type:"bookmark"
      },

    ];
  }, [bookmarks]);

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

      <CareersCard
        careers={careerData}
        style={{ gridArea: "1 / 1 / 3 / 4"}}
      >

        {careerData.map((career: any) => (
          <ChoiceCard
            key={career.title}
            isSelected={selectedCareer === career.title}
            title={career.title}
            image={`/landing/Rectangle.svg`}
            description={career.desc}
            buttonLabel={career.buttonLabel}
            blogPath={career.href}
            onClick={() => handleContinue(career)}
            type={career.type || ""}
          />
        ))}
      </CareersCard>


      <RecentActivityCard
  activities={dashboardData.activities}
  style={{ gridArea: "1 / 4 / 3 / 6" }}
/>

     <JourneyProgressCard
  percentage={dashboardData.progress}
  style={{ gridArea: "3 / 1 / 5 / 2" }}
/>

      <CurrentPhaseCard
  percentage={dashboardData.currentPhase}
  style={{ gridArea: "3 / 2 / 5 / 2" }}
/>

      <NextPhaseCard
  style={{ gridArea: "3 / 3 / 5 / 6" }}
  desc={dashboardData.nextPhaseDesc}
  phaseNumber={String(dashboardData.nextPhase)}
/>

    </div>
  );
}