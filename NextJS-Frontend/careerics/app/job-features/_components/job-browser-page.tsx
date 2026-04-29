"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import JobCard from "@/components/ui/jobCard";
import JobDetailsCard from "@/components/ui/JobDetailsCard";
import {
  buildFilterOptions,
  filterJobs,
  getApplicationButtonLabel,
  persistSelectedJobId,
  readPersistedSelectedJobId,
  sortJobs,
  mapApiJobToUiModel,
} from "@/lib/jobs";
import { useAuth } from "@/providers/auth-provider";
import { jobService } from "@/services";
import type {
  JobFilterOption,
  JobSortOption,
  JobUiModel,
} from "@/types";

type JobBrowserMode = "all" | "applications";

interface JobBrowserPageProps {
  mode: JobBrowserMode;
}

interface DropdownProps {
  placeholder?: string;
  options: JobFilterOption[];
  value: string;
  onChange: (id: string) => void;
  triggerColor?: string;
}

const DropdownMenu = ({
  placeholder = "Select",
  options,
  value,
  onChange,
  triggerColor = "rgba(255,255,255,0.5)",
}: DropdownProps) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel = options.find((option) => option.id === value)?.title ?? placeholder;

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "fit-content", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          height: "34px",
          padding: "0 14px",
          borderRadius: "999px",
          border: `1.5px solid ${triggerColor}`,
          backgroundColor: "#C1CBE6",
          color: "#000000",
          fontSize: "0.78rem",
          cursor: "pointer",
          whiteSpace: "nowrap",
          outline: "none",
          width: "fit-content",
          transition: "background 0.2s",
        }}
      >
        <span>{selectedLabel}</span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
            flexShrink: 0,
          }}
        >
          <path
            d="M1 3L5 7L9 3"
            stroke={triggerColor}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            width: "fit-content",
            minWidth: "100%",
            backgroundColor: "#111827",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: "12px",
            overflow: "hidden",
            zIndex: 100,
            maxHeight: "260px",
            overflowY: "auto",
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(255,255,255,0.15) transparent",
            boxShadow: "0 8px 28px rgba(0,0,0,0.5)",
            animation: "ddIn 0.15s ease",
          }}
        >
          <style>{`@keyframes ddIn { from { opacity:0; transform:translateY(-5px) } to { opacity:1; transform:translateY(0) } }`}</style>
          {options.map((option) => {
            const isActive = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  width: "100%",
                  padding: "9px 14px",
                  backgroundColor: isActive ? "rgba(197,255,65,0.1)" : "transparent",
                  color: isActive ? "#C5FF41" : "rgba(255,255,255,0.85)",
                  fontSize: "0.8rem",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  whiteSpace: "nowrap",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(event) => {
                  if (!isActive) {
                    event.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)";
                  }
                }}
                onMouseLeave={(event) => {
                  if (!isActive) {
                    event.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span>{option.title}</span>
                {isActive && (
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{ marginLeft: "10px", flexShrink: 0 }}
                  >
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="#C5FF41"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface SortLinkProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const SortLink = ({ label, isActive, onClick }: SortLinkProps) => {
  const [hover, setHover] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: "none",
        border: "none",
        padding: "2px 0",
        cursor: "pointer",
        color: isActive ? "#C5FF41" : hover ? "#C5FF41" : "white",
        fontSize: "0.85rem",
        fontWeight: isActive ? 600 : 400,
        transition: "color 0.2s",
        outline: "none",
        position: "relative",
      }}
    >
      {label}
      <span
        style={{
          position: "absolute",
          bottom: "-2px",
          left: 0,
          width: isActive ? "100%" : "0%",
          height: "1.5px",
          backgroundColor: "#C5FF41",
          transition: "width 0.25s ease",
          borderRadius: "2px",
          display: "block",
        }}
      />
    </button>
  );
};

export default function JobBrowserPage({ mode }: JobBrowserPageProps) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const routeJobId = searchParams.get("jobId");

  const [jobs, setJobs] = useState<JobUiModel[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort] = useState<JobSortOption>("relevance");
  const [location, setLocation] = useState("all");
  const [jobType, setJobType] = useState("all");
  const [level, setLevel] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [bookmarkingJobId, setBookmarkingJobId] = useState<string | null>(null);

  const lastViewedJobIdRef = useRef<string | null>(null);

  const uniqueJobs = useMemo(() => {
    const jobsById = new Map<string, JobUiModel>();

    for (const job of jobs) {
      if (!jobsById.has(job.id)) {
        jobsById.set(job.id, job);
      }
    }

    return Array.from(jobsById.values());
  }, [jobs]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    let isActive = true;

    const loadJobs = async () => {
      setIsLoading(true);
      setError(null);

      if (mode === "applications" && !user?.id) {
        setJobs([]);
        setIsLoading(false);
        setError("Please sign in to view your applications.");
        return;
      }

      const response = mode === "applications" && user?.id
        ? await jobService.getAllUserApplications(user.id)
        : await jobService.getAllJobs(user?.id);

      if (!isActive) {
        return;
      }

      if (response.success) {
        setJobs(response.data.map(mapApiJobToUiModel));
      } else {
        setJobs([]);
        setError(response.message ?? "We could not load jobs right now.");
      }

      setIsLoading(false);
    };

    void loadJobs();

    return () => {
      isActive = false;
    };
  }, [isAuthLoading, mode, user?.id]);

  const locationOptions = useMemo(
    () => buildFilterOptions(uniqueJobs.map((job) => job.locationFilterValue), "Location"),
    [uniqueJobs],
  );
  const typeOptions = useMemo(
    () => buildFilterOptions(uniqueJobs.map((job) => job.employmentType), "Job type"),
    [uniqueJobs],
  );
  const levelOptions = useMemo(
    () => buildFilterOptions(uniqueJobs.map((job) => job.careerLevel), "Experience level"),
    [uniqueJobs],
  );

  const filteredJobs = useMemo(() => {
    const filtered = filterJobs(uniqueJobs, {
      searchQuery,
      location,
      jobType,
      level,
    });

    return sortJobs(filtered, activeSort);
  }, [activeSort, jobType, level, location, searchQuery, uniqueJobs]);

  useEffect(() => {
    if (!uniqueJobs.length) {
      setSelectedJobId(null);
      return;
    }

    if (selectedJobId && uniqueJobs.some((job) => job.id === selectedJobId)) {
      return;
    }

    const storedJobId = readPersistedSelectedJobId();
    const candidateIds = [
      routeJobId,
      storedJobId,
      uniqueJobs[0]?.id,
    ];

    const nextSelectedJobId = candidateIds.find(
      (candidate) => candidate && uniqueJobs.some((job) => job.id === candidate),
    ) ?? uniqueJobs[0].id;

    if (nextSelectedJobId !== selectedJobId) {
      setSelectedJobId(nextSelectedJobId);
    }
  }, [routeJobId, selectedJobId, uniqueJobs]);

  useEffect(() => {
    if (!selectedJobId) {
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
    () => uniqueJobs.find((job) => job.id === selectedJobId) ?? null,
    [selectedJobId, uniqueJobs],
  );

  useEffect(() => {
    if (!user?.id || !selectedJob?.id || lastViewedJobIdRef.current === selectedJob.id) {
      return;
    }

    lastViewedJobIdRef.current = selectedJob.id;
    void jobService.markJobViewed(selectedJob.id, user.id);
  }, [selectedJob?.id, user?.id]);

  const updateSingleJob = (jobId: string, updater: (job: JobUiModel) => JobUiModel) => {
    setJobs((currentJobs) => currentJobs.map((job) => (
      job.id === jobId ? updater(job) : job
    )));
  };

  const handleBookmarkToggle = async (job: JobUiModel) => {
    if (!user?.id) {
      setError("Please sign in to save jobs.");
      return;
    }

    setBookmarkingJobId(job.id);
    const response = job.isSaved
      ? await jobService.unsaveJob(job.id, user.id)
      : await jobService.saveJob(job.id, user.id);

    if (response.success) {
      jobService.invalidateJobList(user.id);
      updateSingleJob(job.id, (currentJob) => ({
        ...currentJob,
        isSaved: !currentJob.isSaved,
        savedAt: currentJob.isSaved ? null : new Date().toISOString(),
      }));
    } else {
      setError(response.message ?? "We could not update your saved jobs.");
    }

    setBookmarkingJobId(null);
  };

  const handleApply = async () => {
    if (!selectedJob || !user?.id || selectedJob.applicationStatus) {
      return;
    }

    // If a job URL exists, open it in a new tab immediately (user action)
    try {
      if (selectedJob.jobUrl && typeof window !== "undefined") {
        window.open(selectedJob.jobUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      // ignore popup errors and continue to apply
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

  const renderLeftPanelContent = () => {
    if (isLoading) {
      return <p style={{ color: "white", opacity: 0.8, margin: 0 }}>Loading jobs...</p>;
    }

    if (!filteredJobs.length) {
      return <p style={{ color: "white", opacity: 0.8, margin: 0 }}>No jobs match your filters yet.</p>;
    }

    return filteredJobs.map((job) => (
      <div
        key={job.id}
        style={{ width: "100%", cursor: "pointer" }}
      >
        <JobCard
          {...job}
          disableNavigation
          onSelect={() => setSelectedJobId(job.id)}
          isBookmarked={job.isSaved}
          isBookmarkLoading={bookmarkingJobId === job.id}
          onBookmarkToggle={() => handleBookmarkToggle(job)}
        />
      </div>
    ));
  };

  return (
    <div style={{
      display: "flex",
      height: "100%",
      padding: "40px",
      paddingLeft: "100px",
      boxSizing: "border-box",
      overflow: "auto",
      scrollbarWidth: "none",
      position: "relative",
      paddingBottom: "10px",
      paddingTop: "0px",
    }}>
      <div style={{
        width: "480px",
        height: "110%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        gap: "20px",
        top: "10vh",
        overflowY: "auto",
        paddingRight: "60px",
        scrollbarWidth: "none",
        zIndex: 5,
      }}>
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder="Search By Job Title"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            style={{
              width: "100%",
              padding: "12px 20px",
              borderRadius: "25px",
              border: "1.5px solid white",
              backgroundColor: "transparent",
              color: "white",
              fontSize: "1rem",
              outline: "none",
              boxSizing: "border-box",
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
              width: "35px",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: "8px", zIndex: 10, flexWrap: "wrap" }}>
          <DropdownMenu
            placeholder="Location"
            options={locationOptions}
            value={location}
            onChange={setLocation}
          />
          <DropdownMenu
            placeholder="Job Type"
            options={typeOptions}
            value={jobType}
            onChange={setJobType}
          />
          <DropdownMenu
            placeholder="Experience Level"
            options={levelOptions}
            value={level}
            onChange={setLevel}
          />
        </div>

        <div style={{ display: "flex", gap: "10px", fontSize: "0.85rem", color: "white", alignItems: "center" }}>
          <span style={{ opacity: 0.7, flexShrink: 0 }}>Sort By:</span>
          <SortLink label="Relevance" isActive={activeSort === "relevance"} onClick={() => setActiveSort("relevance")} />
          <span style={{ opacity: 0.4 }}>-</span>
          <SortLink label="Date Posted" isActive={activeSort === "date"} onClick={() => setActiveSort("date")} />
          <span style={{ opacity: 0.4 }}>-</span>
          <SortLink label="Resume Match" isActive={activeSort === "match"} onClick={() => setActiveSort("match")} />
        </div>

        {error && (
          <p style={{ color: "#ffb4b4", margin: 0 }}>
            {error}
          </p>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {renderLeftPanelContent()}
        </div>
      </div>

      <div style={{
        width: "1.5px",
        backgroundColor: "rgb(255,255,255)",
        height: "100%",
        alignSelf: "center",
        flexShrink: 0,
        position: "relative",
        top: "100px",
      }} />

      <div style={{
        flex: 1,
        height: "99%",
        width: "100%",
        justifyContent: "center",
        alignItems: "flex-start",
        paddingLeft: "120px",
        paddingRight: "20px",
        minWidth: 0,
        position: "relative",
        zIndex: 1,
        top: "10vh",
        display: "flex",
        scrollbarWidth: "none",
      }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
          {selectedJob ? (
            <JobDetailsCard
              jobData={selectedJob}
              onApply={handleApply}
              isApplying={isApplying}
              actionLabel={getApplicationButtonLabel(selectedJob)}
              isApplyDisabled={Boolean(selectedJob.applicationStatus)}
            />
          ) : (
            <div style={{ color: "white", paddingTop: "60px" }}>
              No job selected yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
