"use client";
import React, { useState } from 'react';
import JobCard from '@/components/ui/jobCard';
import JobDetailsCard from '@/components/ui/JobDetailsCard';

// 1. Placeholder Data - 4 Jobs b-data kamla
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
    title: "UI/UX Designer",
    company: "Figma",
    location: "Remote",
    salary: "E£ 30-40K",
    tags: ["Contract", "Remote", "Mid-Level"],
    description: "Help us design the future of design tools.",
    responsibilities: "Create high-fidelity prototypes, conduct user research...",
    requirements: "Strong portfolio showcasing UI work, proficiency in Figma...",
    niceToHave: "Basic knowledge of HTML/CSS...",
    skills: "Figma, Prototyping, Design Systems"
  },
  {
    id: "4",
    title: "Backend Architect",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$120-150K",
    tags: ["Full Time", "On-site", "Expert"],
    description: "Architecting global-scale distributed systems.",
    responsibilities: "Design system architecture, lead backend engineers.mmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmm..",
    requirements: "8+ years of experience, expertise in Java/Go...",
    niceToHave: "Previous experience in E-commerce at scale...",
    skills: "Java, AWS, Microservices"
  }
];

const JobDetailsPage = () => {
  // LOGIC: State masaka el job elly m-e5taryno dlw2ti
  const [selectedJob, setSelectedJob] = useState(MOCK_JOBS[0]);

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
      
      {/* 1. Left Sidebar - EL DESIGN BETA3AK ZAY MA HWA */}
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
        zIndex: 1 
      }}>
        <h2 style={{ color: "white", fontFamily: "'Nova Square'", fontSize: "2rem", marginBottom: "10px" }}>
          Bookmarked Jobs
        </h2>

        {/* LOGIC: Loop & Click */}
        {MOCK_JOBS.map((job) => (
          <div 
            key={job.id} 
            onClick={() => setSelectedJob(job)} // Logic taghyir el details
            style={{ width: "100%", cursor: "pointer" }}
          >
            <JobCard {...job} />
          </div>
        ))}
      </div>

      {/* 2. Divider Line - DESIGN BETA3AK */}
      <div style={{ 
        width: "1.5px", 
        backgroundColor: "rgb(255, 255, 255)", 
        height: "100%", 
        alignSelf: "center",
        flexShrink: 0,
        position: "relative", 
        top: "100px", 
      }} />

      {/* 3. Right Details - DESIGN BETA3AK */}
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
          {/* LOGIC: Pass el Selected Job */}
          <JobDetailsCard jobData={selectedJob} />
        </div>
      </div>

    </div>
  );
};

export default JobDetailsPage;