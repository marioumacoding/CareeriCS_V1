"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

// 1. El interface dlw2ti fiha kol el data (Placeholders)
interface JobProps {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  tags: string[];
  // El sections elly enta 3ayezha dynamic f el details page
  description: string;
  responsibilities?: string;
  requirements?: string;
  niceToHave?: string;
  skills?: string;
}

const JobCard: React.FC<JobProps> = (job) => {
  const router = useRouter();

  const handleCardClick = () => {

    
    localStorage.setItem('selectedJob', JSON.stringify(job)); 
    router.push("/job-features/details"); 
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
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#c5c5c5a9"}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#b8b8b8"}
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
            style={{ cursor: "pointer" }}
            onClick={(e) => {
               e.stopPropagation();
               console.log("Saved!");
            }}
          >
            <img 
              src="/landing/bookmark.svg" 
              alt="bookmark"
              style={{ width: "25px", height: "auto", filter: "brightness(0)" }} 
            />
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