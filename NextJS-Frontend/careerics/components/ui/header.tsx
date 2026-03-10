/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import { usePathname } from "next/navigation";

const Header = () => {
  const pathname = usePathname();

  // 1. Move the text config here
  const pageConfig: Record<string, { title: string; subtitle: string }> = {
    "/features/home": { title: "Home", subtitle: "Welcome to CareeriCS" },
    "/features/interview": { title: "Interview Mock-ups", subtitle: "Practice makes perfect..." },
    "/features/roadmap": { title: "Roadmap", subtitle: "Your career journey" },
    "/features/career": { title: "Career Exploration", subtitle: "Find your path" },
    // Add others as you build them
  };

  // 2. Get the current text or use a default
  const current = pageConfig[pathname] || { title: "CareeriCS", subtitle: "Loading..." };

  return (
    <header 
      style={{ 
        display: "flex", 
        width: "100%", 
        height: "10vh", 
        minHeight: "70px",
        maxHeight: "100px",
        position: "sticky", 
        top: 0,
        zIndex: 50,
      }}
    >
      {/* LEFT SECTION: ELASTIC GREY TAB */}
      <div 
        style={{ 
          position: "relative", 
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 70px 0 40px", 
          backgroundImage: "url('/Grey Header.svg')",
          backgroundSize: "100% 100%", 
          backgroundRepeat: "no-repeat",
          whiteSpace: "nowrap",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "2rem", fontFamily: "var(--font-nova-square)", color: "#000" }}>
          {current.title}
        </h1>
      </div>

      {/* RIGHT SECTION: FILLER BLUE PILL */}
      <div style={{ position: "relative", height: "100%", flex: 1, marginLeft: "-40px", display: "flex", alignItems: "center" }}>
        <img src="/Blue Header.svg" alt="" style={{ position: "absolute", width: "100%", height: "100%", objectFit: "fill", zIndex: -1 }} />
        <div style={{ width: "100%", textAlign: "center", color: "#fff", fontSize: "1.4rem", fontFamily: "var(--font-jura)", paddingLeft: "40px" }}>
          {current.subtitle}
        </div>
      </div>
    </header>
  );
};

export default Header;