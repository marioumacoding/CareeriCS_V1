"use client";
import React, { useState, useRef, useEffect } from 'react';
import JobCard from '@/components/ui/jobCard';
import JobDetailsCard from '@/components/ui/JobDetailsCard';

const MOCK_JOBS = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Google",
    location: "Maadi, Cairo",
    salary: "E£ 40-50K",
    tags: ["Full Time", "Remote", "Senior"],
    description: "Looking for a React expert to build the next generation of search interfaces.",
    responsibilities: "Build high-quality UI components, collaborate with designers...",
    requirements: "3+ years of React experience, Strong CSS skills...",
    niceToHave: "Experience with Next.js and Tailwind...",
    skills: "React, TypeScript, Framer Motion"
  },
  {
    id: "2",
    title: "Software Engineer",
    company: "Planning Engineer FZE",
    location: "New Cairo, Egypt",
    salary: "E£ 25-35K",
    tags: ["Full Time", "On-Site", "Junior"],
    description: "Join our team to develop construction management software.",
    responsibilities: "Develop API endpoints, maintain existing codebase...",
    requirements: "Strong understanding of JavaScript/TypeScript...",
    niceToHave: "Basic understanding of Docker...",
    skills: "Node.js, PostgreSQL, TypeScript"
  },
  {
    id: "3",
    title: "Software Engineer",
    company: "Planning Engineer FZE",
    location: "New Cairo, Egypt",
    salary: "E£ 25-35K",
    tags: ["Full Time", "On-Site", "Entry-Level"],
    description: "Join our team to develop construction management software.",
    responsibilities: "Develop API endpoints, maintain existing codebase...",
    requirements: "Strong understanding of JavaScript/TypeScript...",
    niceToHave: "Basic understanding of Docker...",
    skills: "Node.js, PostgreSQL, TypeScript"
  },
  {
    id: "4",
    title: "Software Engineer",
    company: "Planning Engineer FZE",
    location: "New Cairo, Egypt",
    salary: "E£ 25-35K",
    tags: ["Full Time", "On-Site", "Junior"],
    description: "Join our team to develop construction management software.",
    responsibilities: "Develop API endpoints, maintain existing codebase...",
    requirements: "Strong understanding of JavaScript/TypeScript...",
    niceToHave: "Basic understanding of Docker...",
    skills: "Node.js, PostgreSQL, TypeScript"
  },
];

const LOCATION_OPTIONS = [
  { id: "all",       title: "Location" },
  { id: "Maadi",     title: "Maadi" },
  { id: "New Cairo", title: "New Cairo" },
  { id: "Remote",    title: "Remote" },
];

const TYPE_OPTIONS = [
  { id: "all",       title: "Job type" },
  { id: "Full Time", title: "Full Time" },
  { id: "Contract",  title: "Contract" },
];

const LEVEL_OPTIONS = [
  { id: "all",         title: " Experience level" },
  { id: "Junior",      title: "Junior" },
  { id: "Entry-Level", title: "Entry-Level" },
  { id: "Senior",      title: "Senior" },
];

interface DropdownOption { id: string; title: string; }

interface DropdownProps {
  placeholder?: string;
  options: DropdownOption[];
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

  const selectedLabel = options.find((o) => o.id === value)?.title ?? placeholder;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", width: "fit-content", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          height: "34px",
          padding: "0 14px",
          borderRadius: "999px",
          border: `1.5px solid ${triggerColor}`,
          backgroundColor: open ? "#C1CBE6" : "transparent",
          color: "white",
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
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s", flexShrink: 0 }}
        >
          <path d="M1 3L5 7L9 3" stroke={triggerColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div style={{
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
        }}>
          <style>{`@keyframes ddIn { from { opacity:0; transform:translateY(-5px) } to { opacity:1; transform:translateY(0) } }`}</style>
          {options.map((opt) => {
            const isActive = opt.id === value;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => { onChange(opt.id); setOpen(false); }}
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
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"; }}
              >
                <span>{opt.title}</span>
                {isActive && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginLeft: "10px", flexShrink: 0 }}>
                    <path d="M2 6L5 9L10 3" stroke="#C5FF41" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
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
      <span style={{
        position: "absolute",
        bottom: "-2px",
        left: 0,
        width: isActive ? "100%" : "0%",
        height: "1.5px",
        backgroundColor: "#C5FF41",
        transition: "width 0.25s ease",
        borderRadius: "2px",
        display: "block",
      }} />
    </button>
  );
};

type SortOption = "relevance" | "date" | "match";

const JobDetailsPage = () => {
  const [selectedJob, setSelectedJob] = useState(MOCK_JOBS[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSort, setActiveSort]   = useState<SortOption>("relevance");
  const [location, setLocation]       = useState("all");
  const [jobType, setJobType]         = useState("all");
  const [level, setLevel]             = useState("all");

  const filteredJobs = MOCK_JOBS.filter(job => {
    const matchesSearch   = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLocation = location === "all" || job.location.includes(location);
    const matchesType     = jobType  === "all" || job.tags.includes(jobType);
    const matchesLevel    = level    === "all" || job.tags.includes(level);
    return matchesSearch && matchesLocation && matchesType && matchesLevel;
  });

  return (
    <div style={{
      display: "flex",
      height: "100%",
      padding: "40px",
      boxSizing: "border-box",
      overflow: "auto",
      scrollbarWidth: "none",
      position: "relative",
      paddingBottom: "10px",
      paddingTop: "0px",
    }}>

      {/* Left Sidebar */}
      <div style={{
        width: "380px",
        height: "110%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        gap: "20px",
        top: "10vh",
        overflowY: "auto",
        paddingRight: "30px",
        scrollbarWidth: "none",
        zIndex: 5,
      }}>

        {/* Search */}
        <div style={{ position: "relative", width: "100%" }}>
          <input
            type="text"
            placeholder="Search By Job Title"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
          <img src="/cv/search.svg" alt="search" style={{ position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", width: "35px" }} />
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: "8px", zIndex: 10, flexWrap: "wrap" }}>
          <DropdownMenu placeholder="Location"         options={LOCATION_OPTIONS} value={location} onChange={setLocation} />
          <DropdownMenu placeholder="Job Type"         options={TYPE_OPTIONS}     value={jobType}  onChange={setJobType} />
          <DropdownMenu placeholder="Experience Level" options={LEVEL_OPTIONS}    value={level}    onChange={setLevel} />
        </div>

        {/* Sort By */}
        <div style={{ display: "flex", gap: "10px", fontSize: "0.85rem", color: "white", alignItems: "center" }}>
          <span style={{ opacity: 0.7, flexShrink: 0 }}>Sort By:</span>
          <SortLink label="Relevance"    isActive={activeSort === "relevance"} onClick={() => setActiveSort("relevance")} />
          <span style={{ opacity: 0.4 }}>—</span>
          <SortLink label="Date Posted"  isActive={activeSort === "date"}      onClick={() => setActiveSort("date")} />
          <span style={{ opacity: 0.4 }}>—</span>
          <SortLink label="Resume Match" isActive={activeSort === "match"}     onClick={() => setActiveSort("match")} />
        </div>

        {/* Job List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              onClickCapture={(e) => { e.preventDefault(); e.stopPropagation(); setSelectedJob(job); }}
              style={{ width: "100%", cursor: "pointer" }}
            >
              <JobCard {...job} />
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{
        width: "1.5px",
        backgroundColor: "rgb(255,255,255)",
        height: "100%",
        alignSelf: "center",
        flexShrink: 0,
        position: "relative",
        top: "100px",
      }} />

      {/* Right Details */}
      <div style={{
        flex: 1,
        height: "99%",
        width: "100%",
        justifyContent: "stretch",
        alignSelf: "center",
        paddingLeft: "40px",
        position: "relative",
        zIndex: 1,
        top: "10vh",
        display: "flex",
        scrollbarWidth: "none",
      }}>
        <div style={{ width: "120%" }}>
          <JobDetailsCard jobData={selectedJob} />
        </div>
      </div>

    </div>
  );
};

export default JobDetailsPage;