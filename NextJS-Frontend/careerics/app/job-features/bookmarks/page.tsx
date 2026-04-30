"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import JobCard from "@/components/ui/jobCard";
import JobDetailsCard from "@/components/ui/JobDetailsCard";
import {
  clearPersistedSelectedJobId,
  mapApiJobToUiModel,
  persistSelectedJobId,
  readPersistedSelectedJobId,
} from "@/lib/jobs";
import { useAuth } from "@/providers/auth-provider";
import { jobService } from "@/services";
import type { JobUiModel } from "@/types";

export default function BookmarkedJobs() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const routeJobId = searchParams.get("jobId");

  const [jobs, setJobs] = useState<JobUiModel[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [bookmarkingJobId, setBookmarkingJobId] = useState<string | null>(null);

  const lastViewedJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let isActive = true;

    const loadSavedJobs = async () => {
      setIsLoading(true);
      setError(null);

      if (!user?.id) {
        setJobs([]);
        setIsLoading(false);
        setError("Please sign in to view your saved jobs.");
        return;
      }

      const response = await jobService.getAllSavedJobs(user.id);
      if (!isActive) {
        return;
      }

      if (response.success) {
        setJobs(response.data.map(mapApiJobToUiModel));
      } else {
        setJobs([]);
        setError(response.message ?? "We could not load your saved jobs.");
      }

      setIsLoading(false);
    };

    void loadSavedJobs();

    return () => {
      isActive = false;
    };
  }, [isAuthLoading, user?.id]);

  useEffect(() => {
    if (!jobs.length) {
      setSelectedJobId(null);
      return;
    }

    if (selectedJobId && jobs.some((job) => job.id === selectedJobId)) {
      return;
    }

    if (!routeJobId) {
      return;
    }

    if (jobs.some((job) => job.id === routeJobId)) {
      setSelectedJobId(routeJobId);
    }
  }, [jobs, routeJobId, selectedJobId]);

  useEffect(() => {
    if (!selectedJobId) {
      if (routeJobId) {
        const nextParams = new URLSearchParams(searchParamsString);
        nextParams.delete("jobId");
        const query = nextParams.toString();
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      }

      return;
    }

    persistSelectedJobId(selectedJobId);

    if (routeJobId === selectedJobId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParamsString);
    nextParams.set("jobId", selectedJobId);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [pathname, routeJobId, router, searchParamsString, selectedJobId]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === selectedJobId) ?? null,
    [jobs, selectedJobId],
  );

  useEffect(() => {
    if (!user?.id || !selectedJob?.id || lastViewedJobIdRef.current === selectedJob.id) {
      return;
    }

    lastViewedJobIdRef.current = selectedJob.id;
    void jobService.markJobViewed(selectedJob.id, user.id);
  }, [selectedJob?.id, user?.id]);

  const filteredJobs = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    if (!normalizedSearch) {
      return jobs;
    }

    return jobs.filter((job) => (
      job.title.toLowerCase().includes(normalizedSearch)
      || job.company.toLowerCase().includes(normalizedSearch)
    ));
  }, [jobs, searchTerm]);

  const updateSingleJob = (jobId: string, updater: (job: JobUiModel) => JobUiModel) => {
    setJobs((currentJobs) => currentJobs.map((job) => (
      job.id === jobId ? updater(job) : job
    )));
  };

  const handleBookmarkToggle = async (job: JobUiModel) => {
    if (!user?.id) {
      setError("Please sign in to manage saved jobs.");
      return;
    }

    setBookmarkingJobId(job.id);
    const response = await jobService.unsaveJob(job.id, user.id);

    if (response.success) {
      jobService.invalidateJobList(user.id);
      setJobs((currentJobs) => currentJobs.filter((currentJob) => currentJob.id !== job.id));

      if (selectedJobId === job.id) {
        clearPersistedSelectedJobId();
        setSelectedJobId(null);
      }
    } else {
      setError(response.message ?? "We could not update this bookmark.");
    }

    setBookmarkingJobId(null);
  };

  const handleApply = async () => {
    if (!selectedJob || !user?.id || Boolean(selectedJob.applicationStatus)) {
      return;
    }

    // Open external job URL in a new tab if available (user action)
    try {
      if (selectedJob.jobUrl && typeof window !== "undefined") {
        window.open(selectedJob.jobUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      // ignore popup errors and continue
    }

    setIsApplying(true);
    const response = await jobService.applyToJob(selectedJob.id, user.id);

    if (response.success) {
      jobService.invalidateJobList(user.id);
      updateSingleJob(selectedJob.id, (currentJob) => ({
        ...currentJob,
        applicationStatus: response.data.status,
        appliedAt: response.data.applied_at,
      }));
    } else {
      setError(response.message ?? "We could not submit your application.");
    }

    setIsApplying(false);
  };

  const handleCloseDetails = () => {
    setSelectedJobId(null);
    clearPersistedSelectedJobId();

    const nextParams = new URLSearchParams(searchParamsString);
    nextParams.delete("jobId");
    const query = nextParams.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  };

  const renderBookmarkCards = () => {
    if (isLoading) {
      return <p style={{ color: "white", margin: 0, paddingLeft: "20px" }}>Loading jobs...</p>;
    }

    if (!filteredJobs.length) {
      return <p style={{ color: "white", margin: 0, paddingLeft: "20px" }}>No bookmarked jobs found.</p>;
    }

    return filteredJobs.map((job) => (
      <div key={job.id} onClick={() => setSelectedJobId(job.id)} style={{ cursor: "pointer" }}>
        <JobCard
          {...job}
          isBookmarked={job.isSaved}
          isBookmarkLoading={bookmarkingJobId === job.id}
          onBookmarkToggle={() => handleBookmarkToggle(job)}
        />
      </div>
    ));
  };

  const renderDefaultGrid = () => (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "10px",
      paddingRight: "20px",
      width: "100%",
      boxSizing: "border-box",
      paddingBottom: "10vh",
      overflowY: "auto",
      scrollbarWidth: "none",
    }}>
      {renderBookmarkCards()}
    </div>
  );

  const renderSelectedLayout = () => (
    <div style={{ display: "flex", gap: "20px", height: "calc(100vh - 200px)" }}>
      <div style={{
        width: "520px",
        height: "110%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        gap: "20px",
        top: "0",
        overflowY: "auto",
        paddingRight: "30px",
        scrollbarWidth: "none",
        zIndex: 5,
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {renderBookmarkCards()}
        </div>
      </div>

      <div style={{
        width: "1.5px",
        backgroundColor: "rgb(255,255,255)",
        height: "100%",
        alignSelf: "center",
        flexShrink: 0,
        position: "relative",
        top: "0",
      }} />

      <div style={{
        flex: 1,
        height: "99%",
        width: "100%",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: "220px",
        paddingRight: "0px",
        minWidth: 0,
        position: "relative",
        zIndex: 1,
        top: "2vh",
        display: "flex",
        scrollbarWidth: "none",
      }}>
        <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          {selectedJob && (
            <JobDetailsCard
              jobData={selectedJob}
              onApply={handleApply}
              isApplying={isApplying}
              actionLabel="Apply"
              isApplyDisabled={Boolean(selectedJob.applicationStatus)}
            />
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{
      padding: "0 40px",
      height: "100vh",
      overflowY: "auto",
      overflowX: "hidden",
      boxSizing: "border-box",
      scrollbarWidth: "none",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        paddingTop: selectedJob ? "5vh" : "12vh",
        marginBottom: "1vh",
        position: "relative",
        left: "20px",
        top: 0,
        zIndex: 1,
        paddingBottom: "20px",
      }}>
        <h2 style={{ color: "white", fontFamily: "Nova Square", fontSize: "2.5rem", margin: 0 }}>
          Bookmarked Jobs
        </h2>

        {!selectedJob && (
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Search By Job Title"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              style={{
                backgroundColor: "transparent",
                border: "1px solid white",
                borderRadius: "25px",
                color: "white",
                width: "400px",
                height: "40px",
                padding: "0 45px 0 15px",
                outline: "none",
                fontFamily: "Nova Square",
              }}
            />
            <img
              src="/global/search.svg"
              alt="search"
              style={{
                position: "absolute",
                right: "15px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "30px",
                pointerEvents: "none",
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <p style={{ color: "#ffb4b4", paddingLeft: "20px", marginTop: 0 }}>
          {error}
        </p>
      )}

      {selectedJob ? renderSelectedLayout() : renderDefaultGrid()}
    </div>
  );
}
