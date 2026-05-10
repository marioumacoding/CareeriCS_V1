"use client";
import React, { useState, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { fetchCareerBlogDetails, type CareerBlogDetails } from "@/lib/career-blog";

interface LevelContent {
  salary: string;
  demand: string;
  demandColor: string;
  responsibilities: string[];
  fitReason: string[];
}

function BlogContent() {
  const searchParams = useSearchParams();

  // Get career ID (trackId) and job title from URL
  const careerId = searchParams.get("trackId") || "";
  const jobTitle = searchParams.get("jobTitle") || "Job Title";

  const [activeLevel, setActiveLevel] = useState<"Entry" | "Junior" | "Senior">("Junior");
  const [careerDetails, setCareerDetails] = useState<CareerBlogDetails | null>(null);

  // Fetch career details when careerId or activeLevel changes
  useEffect(() => {
    if (!careerId) return;
    
    const loadCareerDetails = async () => {
      try {
        const response = await fetchCareerBlogDetails(careerId, activeLevel);
        if (response.success && response.data) {
          setCareerDetails(response.data);
        }
      } catch (err) {
        console.error("Error loading career details:", err);
      }
    };

    loadCareerDetails();
  }, [careerId, activeLevel]);

  // Fallback contentMap in case backend data is unavailable
  const fallbackContentMap: Record<"Entry" | "Junior" | "Senior", LevelContent> = {
    Entry: {
      salary: "E£ 10-15K",
      demand: "Low",
      demandColor: "#FFBC6A",
      responsibilities: ["bla bla bla bla", "bla bla bla bla bla bla", "bla bla bla bla", "bla bla bla bla bla bla", "bla bla bla bla", "bla bla bla bla bla bla"],
      fitReason: ["bla bla bla bla", "bla bla bla bla bla bla", "bla bla bla bla", "bla bla bla bla bla bla"],
    },
    Junior: {
      salary: "E£ 20-35K",
      demand: "Medium",
      demandColor: "#FFF47C",
      responsibilities: ["Junior task 1", "Junior task 2", "Junior task 3"],
      fitReason: ["Fit for junior 1", "Fit for junior 2"],
    },
    Senior: {
      salary: "E£ 50-80K+",
      demand: "High",
      demandColor: "#E6FFB2",
      responsibilities: ["Senior lead 1", "Senior lead 2"],
      fitReason: ["Expert level 1", "Expert level 2"],
    },
  };

  // Use fetched data or fallback
  const current = careerDetails?.[activeLevel] || fallbackContentMap[activeLevel];

  return (
    <div style={{ width: "100%", color: "#fff", fontFamily: "var(--font-nova-square)", padding: "10vh 3vw" }}>
      
      {/* --- TOP ROW: Title & Selectors --- */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6vh" }}>
        
        {/* Left Side: Title & Skills */}
        <div>
          <h1 style={{ fontSize: "4.8vh", margin: 0 }}>{jobTitle}</h1>
          <p style={{ color: "#9CA3AF", fontSize: "2.2vh", marginTop: "1vh" }}>Career Path Details</p>
          <div style={{ display: "flex", gap: "1vw", marginTop: "3vh" }}>
            
            {/* 4. Render el skills men el database */}
            {careerDetails?.[activeLevel]?.skills?.map((skill, index) => (
              <div 
                key={index} 
                style={{ 
                  backgroundColor: "#1E3A8A", 
                  color: "#fafbfd", 
                  padding: "1.2vh 2.5vw",
                  borderRadius: "1.2vh", 
                  fontSize: "1.8vh",
                  display: "flex", 
                  alignItems: "center",      
                  justifyContent: "center",   
                  textAlign: "center",
                  minWidth: "fit-content"
                }}
              >
                {skill.trim()}
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Levels & Info */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "5vh", marginRight: "2vw", paddingLeft: "20vw" }}>
          <div style={{ display: "flex", gap: "3vw", padding: "1vh", borderRadius: "4vh" }}>
            {(["Entry", "Junior", "Senior"] as const).map((level) => (
              <Button
                key={level}
                onClick={() => setActiveLevel(level)}
                style={{
                  backgroundColor: activeLevel === level ? "#E6FFB2" : "#C1CBE6",
                  color: "#142143",
                  borderRadius: "3vh",
                  padding: "2vh 2vw",
                  fontSize: "2vh",
                  fontWeight: "bold",
                  height: "6vh",
                  width: "10vw",
                  border: "none"
                }}
              >
                {level === "Entry" ? "Entry Level" : level}
              </Button>
            ))}
          </div>

          <div style={{ display: "flex", gap: "5vw", marginRight: "9vw" }}>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "2.9vh", margin: 0 }}>Salary Range</p>
              <p style={{ fontSize: "2.9vh", fontWeight: "bold", margin: 0 }}>{current.salary}</p>
            </div>
            <div style={{ textAlign: "left" }}>
              <p style={{ fontSize: "2.2vh", margin: 0 }}>Market Demand</p>
              <p style={{ fontSize: "3.8vh", fontWeight: "bold", color: current.demandColor, margin: 0 }}>{current.demand}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- BOTTOM ROW: Responsibilities & Fit Card --- */}
      <div style={{ display: "flex", gap: "5vw", alignItems: "flex-start" }}>
        
        {/* Key Responsibilities List */}
        <div style={{ flex: 1 }}>
          <h2 style={{ fontSize: "3.5vh", marginBottom: "4vh" }}>Key Responsibilities</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {current.responsibilities.map((item, i) => (
              <li key={i} style={{ color: "#D1D5DB", fontSize: "2.4vh", marginBottom: "2vh", display: "flex", alignItems: "center", gap: "1vw" }}>
                <span style={{ color: "#ffffff", fontSize: "2vh" }}>•</span> {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Dynamic Blue Card: This Would Fit You If */}
        <div style={{ 
          flex: 0.6, 
          backgroundColor: "#1C427B", 
          borderRadius: "4vh", 
          padding: "6vh 2vw",
          minHeight: "45vh",
        }}>
          <h2 style={{ fontSize: "3.5vh", marginBottom: "4vh" }}>This Would fit you if</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {current.fitReason.map((item, i) => (
              <li key={i} style={{ color: "#D1D5DB", fontSize: "2.4vh", marginBottom: "2vh", display: "flex", alignItems: "center", gap: "1vw" }}>
                <span style={{ color: "#ffffff", fontSize: "2vh" }}>•</span> {item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}

export default function JobDetailsPage() {
  return (
    <Suspense fallback={<div style={{ color: "white" }}>Loading...</div>}>
      <BlogContent />
    </Suspense>
  );
}