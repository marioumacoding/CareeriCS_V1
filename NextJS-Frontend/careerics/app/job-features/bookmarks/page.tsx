"use client";
import React, { useState } from 'react';
import JobCard from '@/components/ui/jobCard'; 

// 1. El MOCK_DATA (Lazem t-koun nafs el structure 3ashan lama troo7 lel details ma-t-darabsh)
const MOCK_JOBS = [
  {
    id: "1",
    title: "Frontend Developer",
    company: "Google",
    location: "Maadi, Cairo",
    salary: "E£ 40-50K",
    tags: ["Full Time", "Remote", "Senior"],
    description: "Looking for a React expert...",
    responsibilities: "Build high-quality UI components...",
    requirements: "3+ years of React experience...",
    niceToHave: "Experience with Next.js...",
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
    responsibilities: "Develop API endpoints...",
    requirements: "Strong understanding of JS...",
    niceToHave: "Docker knowledge...",
    skills: "Node.js, PostgreSQL"
  },
  {
    id: "3",
    title: "UI/UX Designer",
    company: "Figma",
    location: "Remote",
    salary: "E£ 30-40K",
    tags: ["Contract", "Remote", "Mid-Level"],
    description: "Help us design the future of design tools.",
    responsibilities: "Create prototypes...",
    requirements: "Portfolio showcasing UI work...",
    niceToHave: "HTML/CSS basics...",
    skills: "Figma, Prototyping"
  },
  {
    id: "4",
    title: "Backend Architect",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$120-150K",
    tags: ["Full Time", "On-site", "Expert"],
    description: "Architecting global-scale distributed systems.",
    responsibilities: "Design system architecture...",
    requirements: "8+ years of experience...",
    niceToHave: "AWS expertise...",
    skills: "Java, AWS, Microservices"
  },
  {
    id: "5",
    title: "Backend Architect",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$120-150K",
    tags: ["Full Time", "On-site", "Expert"],
    description: "Architecting global-scale distributed systems.",
    responsibilities: "Design system architecture...",
    requirements: "8+ years of experience...",
    niceToHave: "AWS expertise...",
    skills: "Java, AWS, Microservices"
  },
  {
    id: "6",
    title: "Backend Architect",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$120-150K",
    tags: ["Full Time", "On-site", "Expert"],
    description: "Architecting global-scale distributed systems.",
    responsibilities: "Design system architecture...",
    requirements: "8+ years of experience...",
    niceToHave: "AWS expertise...",
    skills: "Java, AWS, Microservices"
  },
  {
    id: "7",
    title: "Backend Architect",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$120-150K",
    tags: ["Full Time", "On-site", "Expert"],
    description: "Architecting global-scale distributed systems.",
    responsibilities: "Design system architecture...",
    requirements: "8+ years of experience...",
    niceToHave: "AWS expertise...",
    skills: "Java, AWS, Microservices"
  },
  {
    id: "8",
    title: "Backend Architect",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$120-150K",
    tags: ["Full Time", "On-site", "Expert"],
    description: "Architecting global-scale distributed systems.",
    responsibilities: "Design system architecture...",
    requirements: "8+ years of experience...",
    niceToHave: "AWS expertise...",
    skills: "Java, AWS, Microservices"
  },
  {
    id: "9",
    title: "Backend Architect",
    company: "Amazon",
    location: "Seattle, WA",
    salary: "$120-150K",
    tags: ["Full Time", "On-site", "Expert"],
    description: "Architecting global-scale distributed systems.",
    responsibilities: "Design system architecture...",
    requirements: "8+ years of experience...",
    niceToHave: "AWS expertise...",
    skills: "Java, AWS, Microservices"
  },

  ];

const BookmarkedJobs = () => {
  // Logic el Search (Optional bas hay-khalli el dunya dynamic fashkh)
  const [searchTerm, setSearchTerm] = useState("");

  const filteredJobs = MOCK_JOBS.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
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

      {/* Header Area */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        paddingTop: "14vh", 
        marginBottom: "1vh",
        position: "relative",
        left: "20px",
        top: 0, 
        zIndex: 1,
        paddingBottom: "20px",
      }}>
        <h2 style={{ color: "white", fontFamily: 'Nova Square', fontSize: "2.5rem", margin: 0 }}>
          Bookmarked Jobs
        </h2>
        
        <div style={{ position: "relative" }}>
           <input 
             type="text" 
             placeholder="Search By Job Title" 
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)} // Dynamic Search
             style={{ 
               backgroundColor: "transparent", 
               border: "1px solid white", 
               borderRadius: "25px", 
               color: "white", 
               width: "400px",
               height: "40px",
               padding: "0 45px 0 15px", 
               outline: "none",
               fontFamily: 'Nova Square'
             }} 
           />
           <img 
             src="/cv/search.svg" 
             alt="search"
             style={{ 
               position: "absolute", 
               right: "15px", 
               top: "50%", 
               transform: "translateY(-50%)",
               width: "30px", // Zabat el size sanna
               pointerEvents: "none"
             }} 
           />
        </div>
      </div>

      {/* Grid Container */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "10px", 
        paddingRight: "20px",
        width: "104%", // Khalleha 100% badal 105% 3ashan msh t-tala3 horizontal scroll
        boxSizing: "border-box",
        paddingBottom: "10vh",
      }}>
        {/* Render filtered jobs dynamic */}
        {filteredJobs.map((job) => (
          <JobCard 
            key={job.id}
            {...job} // Keda el JobCard hay-akhod kol el data (id, title, etc.)
          />        
        ))}
      </div>
    </div>
  );
};

export default BookmarkedJobs;