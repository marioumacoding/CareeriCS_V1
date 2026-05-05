"use client";
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BookmarkCard from "@/components/ui/BookmarkCard";
import ContinueCard from "@/components/ui/ContinueCard";
import TipCard from "@/components/ui/3ateyat";
import LevelCard from "@/components/ui/LevelCard";
import { CardsContainer } from "@/components/ui/cards-container";
import { RectangularCard } from "@/components/ui/rectangular-card";
import { buildJobDetailsHref, mapApiJobToUiModel } from "@/lib/jobs";
import { useAuth } from "@/providers/auth-provider";
import { jobService } from "@/services";
import type { JobUiModel } from "@/types";

import JourneyTree from "@/components/ui/journey-tree";

export default function JourneyPage() {

  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [savedCount, setSavedCount] = useState(0);
  const [applicationCount, setApplicationCount] = useState(0);
  const [recentlyViewedJobs, setRecentlyViewedJobs] = useState<JobUiModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let isActive = true;

    const loadDashboard = async () => {
      setIsLoading(true);

      if (!user?.id) {
        if (!isActive) {
          return;
        }

        setSavedCount(0);
        setApplicationCount(0);
        setRecentlyViewedJobs([]);
        setIsLoading(false);
        return;
      }

      const [savedResponse, applicationsResponse, recentResponse] = await Promise.all([
        jobService.getSavedJobs(user.id),
        jobService.getUserApplications(user.id),
        jobService.getRecentlyViewedJobs(user.id, { limit: 12 }),
      ]);

      if (!isActive) {
        return;
      }

      setSavedCount(savedResponse.success ? savedResponse.data.total : 0);
      setApplicationCount(applicationsResponse.success ? applicationsResponse.data.total : 0);
      setRecentlyViewedJobs(
        recentResponse.success
          ? recentResponse.data.jobs.map(mapApiJobToUiModel)
          : [],
      );
      setIsLoading(false);
    };

    void loadDashboard();

    return () => {
      isActive = false;
    };
  }, [isAuthLoading, user?.id]);

  const bookmarkDescription = useMemo(() => {
    if (!savedCount) {
      return "All of your saved jobs are here";
    }

    return `${savedCount} saved job${savedCount === 1 ? "" : "s"} waiting for you`;
  }, [savedCount]);

  const continueDescription = useMemo(() => {
    if (!applicationCount) {
      return "Your next opportunity awaits";
    }

    return `${applicationCount} application${applicationCount === 1 ? "" : "s"} already in motion`;
  }, [applicationCount]);

  return (
    <JourneyTree
      current={5}
      maxReached={5}
      renderContent={() => (
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
          <div style={{ gridArea: "1 / 1 / 2 / 3" }}>
            <BookmarkCard description={bookmarkDescription} />
          </div>

          <div style={{ gridArea: "1 / 3 / 2 / 5" }}>
            <ContinueCard description={continueDescription} />
          </div>

          <div style={{ gridArea: "2 / 1 / 3 / 5" }}>
            <TipCard
              title="Tip of the day"
              description="Research the company and interviewers before your interview so you understand the company's goals and show how you fit."
              icon="/global/tip.svg"
            />
          </div>

          <div style={{ gridArea: "3 / 1 / 4 / 2"}}>
            <LevelCard style={{ backgroundColor: "var(--medium-blue)"}}/>
          </div>

          <CardsContainer
            style={{ gridArea: "3 / 2 / 4 / 5", backgroundColor: "var(--medium-blue)" }}
            Title="Recently Viewed"
            variant="horizontal"
            centerTitle
          >
            {recentlyViewedJobs.length ? (
              recentlyViewedJobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => router.push(buildJobDetailsHref(job.id))}
                  style={{ cursor: "pointer" }}
                >
                  <RectangularCard
                    Title={job.title}
                    isSubtextVisible
                    subtext={job.company}
                    font="nova"
                    variant="radio"
                    style={{ height: "70%" }}
                  />
                </div>
              ))
            ) : !isLoading ? (
              <div style={{ display: "flex", alignItems: "center", color: "white", opacity: 0.8 }}>
                No recently viewed jobs yet.
              </div>
            ) : null}
          </CardsContainer>
        </div>
      )}
    />
  );
}