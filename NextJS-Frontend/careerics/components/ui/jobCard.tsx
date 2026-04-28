"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface JobProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  description: string;
  responsibilities?: string;
  requirements?: string;
  niceToHave?: string;
  skills?: string;
}

const JobCard: React.FC<JobProps> = (job) => {
  const router = useRouter();
  const [bookmarked, setBookmarked] = useState(false);

  const handleCardClick = () => {
    localStorage.setItem('selectedJob', JSON.stringify(job));
    router.push("/job-features/details");
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    setBookmarked((prev) => !prev);
  };

  return (
    <div
      onClick={handleCardClick}
      style={{
        backgroundColor: "#b8b8b8",
        borderRadius: "15px",
        padding: "20px 30px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        position: "relative",
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "'Nova Square', sans-serif",
        cursor: "pointer",
        transition: "0.2s ease",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#c5c5c5a9")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#b8b8b8")}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h3 style={{ margin: 0, fontSize: "1.4rem", fontWeight: "100", color: "#000" }}>
            {job.title}
          </h3>
          <div style={{ marginTop: "8px" }}>
            <p style={{ margin: 0, fontSize: "1rem", color: "#000", opacity: 0.8 }}>{job.company}</p>
            <p style={{ margin: "4px 0 0 0", fontSize: "0.9rem", color: "#000", opacity: 0.6 }}>{job.location}</p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: "100", color: "#000" }}>{job.salary}</span>
          <div
            onClick={handleBookmark}
            style={{ cursor: "pointer", transition: "transform 0.15s ease" }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.15)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            {bookmarked ? (
              // Filled bookmark
              <svg width="25" height="25" viewBox="0 0 24 24" fill="#000" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3C5 2.44772 5.44772 2 6 2H18C18.5523 2 19 2.44772 19 3V21L12 17.5L5 21V3Z" />
              </svg>
            ) : (
              // Outline bookmark
              <svg width="25" height="25" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 3C5 2.44772 5.44772 2 6 2H18C18.5523 2 19 2.44772 19 3V21L12 17.5L5 21V3Z"
                  stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}>
        {job.tags.map((tag, index) => (
          <div key={index} style={{
            backgroundColor: "#444444",
            color: "white",
            padding: "6px 20px",
            borderRadius: "20px",
            fontSize: "0.75rem",
          }}>
            {tag}
          </div>
        ))}
      </div>
    </div>
  );
};

export default JobCard;