/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { usePathname } from "next/navigation";

const Header = () => {
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
    <header 
      style={{ 
        display: "flex", 
        width: "100%", 
        height: "10vh", 
        minHeight: "70px",
        maxHeight: "100px",
        position: "relative", // Changed from sticky to relative for better alignment inside the box
        zIndex: 50,
      }}
    >
      {/* LEFT SECTION: ELASTIC GREY TAB */}
      <div 
        style={{ 
          position: "relative", 
          height: "100%",
          display: "inline-flex",
          alignItems: "center",
          backgroundImage: "url('/Grey Header.svg')",
          backgroundSize: "100% 100%", 
          backgroundRepeat: "no-repeat",
          whiteSpace: "nowrap",
        }}
      >
        <h1 style={{ 
            margin: 0, 
            fontSize: "clamp(1.5rem, 2vw, 2.2rem)",
            fontFamily: "var(--font-nova-square)", 
            paddingLeft: "1.5rem",
            paddingRight: "9rem",
            paddingTop: "0.5rem",
            paddingBottom: "1rem",    
            color: "#000" 
          }}>
          {current.title}
        </h1>
      </div>

      {/* RIGHT SECTION: FILLER BLUE PILL */}
      <div style={{ 
        position: "relative", 
        height: "70%", 
        marginTop: "0", 
        flex: 1, 
        marginLeft: "-9rem", 
        display: "flex", 
        alignItems: "center" 
      }}>
        <img src="/Blue Header.svg" alt="" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "fill", zIndex: -1 }} />
        <div style={{ 
            width: "100%", 
            textAlign: "center", 
            color: "#fff", 
            fontSize: "1.5rem", 
            fontFamily: "var(--font-nova-square)",
            paddingLeft: "20px" 
          }}>
          {current.subtitle}
        </div>
      </div>
    </header>
  );
};

export default Header;