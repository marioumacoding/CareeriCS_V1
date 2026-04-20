"use client";
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

  const defaultCareerData: CareerCardItem[] = [
    { title: "Frontend", desc: "Build fast, responsive, interactive interfaces." },
    { title: "UI/UX", desc: "Design intuitive and user-focused experiences." },
    { title: "Backend", desc: "Power applications with secure, scalable logic." },
    { title: "Full Stack", desc: "Build end-to-end products from UI to APIs." },
  ];

  const [bookmarks, setBookmarks] = useState<UnifiedBookmarkEntry[]>([]);

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
      },
      ...defaultCareerData,
    ];
  }, [bookmarks]);

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