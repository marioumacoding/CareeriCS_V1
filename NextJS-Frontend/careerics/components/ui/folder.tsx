"use client";
import React from "react";
import { usePathname } from "next/navigation";

const Folder = () => {
  const pathname = usePathname();
  const pageConfig: Record<string, { title: string; subtitle: string }> = {
   "/features/home": { title: "Home", subtitle: "Welcome to CareeriCS" },
    "/features/career": { title: "Career Exploration", subtitle: "Find your path" },
    "/features/courses": { title: "Courses Hub", subtitle: "Expand your knowledge" },
    "/features/roadmap": { title: "Roadmaps", subtitle: "Clarity in every step" },
    "/features/skill": { title: "Skill Assessment", subtitle: "Discover where you stand" },
    "/features/cv": { title: "CV Crafting", subtitle: "Turn experience into impact" },
    "/features/interview": { title: "Interview Preparation", subtitle: "Practice makes perfect" },
    "/features/job": { title: "Job Search", subtitle: "Your next opportunity is waiting" },
  };
  
  const current = pageConfig[pathname] || { title: "CareeriCS", subtitle: "Loading..." };

 return (
    <div style={{ 
      position: "relative", 
      width: "100%", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column" 
    }}>
    
      <svg 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none" 
        style={{ 
          position: "absolute", 
          top: 0, 
          left: 0, 
          width: "100%", 
          height: "100%", 
          zIndex: 0 
        }}
      >
      
        <path 
          d= "M0,950 L0,30 Q0,0 50,0 L350,0 Q400,0 410,50 L450,100 Q470,120,520,120 L950,120 Q1000,120 1000,160 L1000,960 Q1000,1000 960,1000 L40,1000 Q0,1000 0,960 Z"
          fill="var(--bg-grey)" 
        />
        
        <path 
          d="M440,60 Q460,70 500,70 L960,70 Q1000,70 1000,50 L1000,20 Q1000,0 980,0 L520,0 Q480,0 460,35 Z" 
          fill="var(--meduim-blue)" 
        />
      </svg>

      <div id="folder-content" style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      
        <header style={{ height: "10%", display: "flex", width: "100%", minHeight: "60px", fontFamily: "var(--font-nova-square)" }}>

          <div id="feature-title" style={{ width: "40%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <h1 style={{ margin: 0, fontSize: "clamp(1rem, 1.8vw, 2.2rem)", }}>
              {current.title}
            </h1>
          </div>

          <div id="feature-tagline" style={{ width: "60%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p style={{ margin: 0, color: "white", fontSize: "clamp(0.8rem, 1.7vw, 1.5rem)", textAlign: "center", paddingRight: "20px" }}>
              {current.subtitle}
            </p>
          </div>
        </header>

        
      </div>
    </div>
  );
};

export default Folder;