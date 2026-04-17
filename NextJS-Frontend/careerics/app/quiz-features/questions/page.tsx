"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Interview from "@/components/ui/interview";
import Link from "next/link"; 

// Types le-tanzim el data
interface QuestionData {
  id: number;
  title: string;
}

interface MatchData {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export default function RateYourLovePage() {
  // 1. Sidebar Steps
  const [sidebarSteps] = useState([
    { id: 1, title: "Hobby 1", text: "First hobby evaluation." },
    { id: 2, title: "Hobby 2", text: "Second hobby evaluation." },
    { id: 3, title: "Hobby 3", text: "Third hobby evaluation." },
    { id: 4, title: "Skill 1", text: "Technical skill check." },
    { id: 5, title: "Skill 2", text: "Soft skill check." },
    { id: 6, title: "Skill 3", text: "Leadership skill check." },
  ]);

  // 2. Data el cards (as'ela)
  const stepContent: { [key: number]: QuestionData[] } = {
    1: [{ id: 101, title: "Football" }, { id: 102, title: "Chess" }],
    2: [{ id: 201, title: "Reading" }, { id: 202, title: "Swimming" }, { id: 203, title: "Gaming" }],
    3: [{ id: 301, title: "Drawing" }],
    4: [{ id: 401, title: "React.js" }, { id: 402, title: "Next.js" }],
    5: [{ id: 501, title: "Teamwork" }, { id: 502, title: "Communication" }],
    6: [{ id: 601, title: "Project Mgmt" }, { id: 602, title: "Public Speaking" }],
  };

  // 3. Data el Results
  const [matchesData] = useState<MatchData[]>([
    {
      id: 1,
      title: "Backend",
      description: "Power applications with secure, scalable logic.",
      icon: "/Landing/Rectangle.svg",
    },
    {
      id: 2,
      title: "Frontend",
      description: "Build beautiful and responsive user interfaces.",
      icon: "/Landing/Rectangle.svg",
    },
    {
      id: 3,
      title: "DevOps",
      description: "Streamline deployment and cloud infrastructure.",
      icon: "/Landing/Rectangle.svg",
    },
  ]);

  const [currentActiveId, setCurrentActiveId] = useState(1);
  const [unlockedStepId, setUnlockedStepId] = useState(1);
  const [ratings, setRatings] = useState<{ [key: number]: number }>({});
  const [isFinished, setIsFinished] = useState(false);

  const handleRate = (qId: number, val: number) => {
    setRatings((prev) => ({ ...prev, [qId]: val }));
  };

  const handleNext = () => {
    if (currentActiveId < sidebarSteps.length) {
      const nextId = currentActiveId + 1;
      setCurrentActiveId(nextId);
      if (nextId > unlockedStepId) setUnlockedStepId(nextId);
    } else {
      setIsFinished(true);
    }
  };

  const currentCards = stepContent[currentActiveId] || [];

  // --- CONDITION 1: INTERVIEW QUIZ ---
  if (!isFinished) {
    return (
      <Interview
        questions={sidebarSteps}
        currentActiveId={currentActiveId}
        unlockedStepId={unlockedStepId}
        onQuestionClick={(id) => setCurrentActiveId(id)}
        title="Rate Your Love"
        label="Step"
      >
        <div style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "4vh 4vw",
          boxSizing: "border-box",
          gap: "3vh",
        }}>
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            gap: "2vh", 
            justifyContent: "center",
            overflowY: "auto" 
          }}>
            {currentCards.map((q) => (
              <div 
                key={q.id}
                style={{
                  backgroundColor: "#222939",
                  borderRadius: "4vh",
                  padding: "4vh 2vw",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "2.5vh",
                  border: "0.1vh solid rgba(255, 255, 255, 0.03)"
                }}
              >
                <p style={{ color: "#D1D5DB", fontSize: "2.2vh", fontFamily: "var(--font-nova-square)", margin: 0 }}>
                  Do you enjoy {q.title} Question?
                </p>

                <div style={{ display: "flex", alignItems: "center", gap: "2.5vw" }}>
                  <span style={{ color: "#FFB2B2", fontSize: "2.2vh", fontWeight: "600" }}>Strongly Disagree</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "1.8vw" }}>
                    {[1, 2, 3, 4, 5].map((val) => {
                      const sizes = ["5vh", "4vh", "2.8vh", "4vh", "5vh"];
                      const isSelected = ratings[q.id] === val;
                      return (
                        <div
                          key={val}
                          onClick={() => handleRate(q.id, val)}
                          style={{
                            width: sizes[val - 1],
                            height: sizes[val - 1],
                            borderRadius: "50%",
                            backgroundColor: isSelected ? "#B8EF46" : "#6B7280",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            transform: isSelected ? "scale(1.1)" : "scale(1)"
                          }}
                        />
                      );
                    })}
                  </div>
                  <span style={{ color: "#E6FFB2", fontSize: "2.2vh", fontWeight: "600" }}>Strongly Agree</span>
                </div>
              </div>
            ))}
          </div>

            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <Button 
                onClick={handleNext}
                style={{
                alignSelf: "flex-end",    // De hat-khaleeh yerooh ymeen f makanoh
                backgroundColor: "#B8EF46", 
                color: "#000", 
                padding: "1.5vh 5vw",   
                borderRadius: "1.2vh", 
                fontSize: "2.2vh",
                fontWeight: "800",
                height: "auto",
                minWidth: "15vw"
                }}
            >
                {currentActiveId === sidebarSteps.length ? "Finish" : "Next"}
            </Button>
            </div>
        </div>
      </Interview>
    );
  }

  // --- CONDITION 2: BEST MATCHES RESULTS ---
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "8vh" }}>
      <h1 style={{ color: "#fff", fontSize: "5vh", fontFamily: "var(--font-nova-square)" }}>
        Your Best Matches Are
      </h1>

      <div style={{ display: "flex", gap: "2vw" }}>
        {matchesData.map((item) => (
          <div 
            key={item.id} 
            style={{ 
              width: "18vw",
              backgroundColor: "#1C427B", 
              borderRadius: "3vh", 
              padding: "8vh 1.5vw 6vh 1.5vw",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
              position: "relative" 
            }}
          >
            <img 
              src="/Landing/bookmark.svg" 
              alt="bookmark" 
              style={{ 
                width: "5vh", 
                height: "5vh",
                position: "absolute",
                top: "2.5vh",
                right: "1.5vw",
                objectFit: "contain" 
              }} 
            />

            <img 
              src={item.icon} 
              alt={item.title} 
              style={{ width: "15vh", height: "auto", alignSelf: "flex-start" }} 
            />

            <h2 style={{ color: "#fff", fontSize: "3vh", margin: 0, fontFamily: "var(--font-nova-square)" }}>
              {item.title}
            </h2>
            
            <p style={{ color: "#A0AEC0", fontSize: "1.9vh", margin: 0, lineHeight: "1.4" }}>
              {item.description}
            </p>

            {/* Link dynamic le-page el blog */}
            <Link href={`/quiz-features/blog?jobTitle=${encodeURIComponent(item.title)}`} style={{ textDecoration: "none" }}>
              <Button style={{ 
                backgroundColor: "#C1CBE6", 
                color: "#000000", 
                padding: "2vh 2vw", 
                height: "6vh",
                width: "100%", 
                borderRadius: "1vh",
                marginTop: "1vh",
                fontSize: "2vh",
                minHeight: "0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                Learn More
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "2vw" }}>
        <Button 
          onClick={() => { setIsFinished(false); setCurrentActiveId(1); }} 
          style={{ backgroundColor: "#C3D1F0", color: "#000", padding: "1vh 4vw", borderRadius: "1.5vh", height: "auto", fontWeight: "800" }}
        >
          Redo Quiz
        </Button>

        {/* Link le-home page */}
        <Link href="/" style={{ textDecoration: "none" }}>
          <Button 
            style={{ 
              backgroundColor: "#B8EF46", 
              color: "#000", 
              padding: "0 3vw",           
              height: "6vh",              
              borderRadius: "1.5vh",
              fontSize: "2vh",
              fontWeight: "800",
              display: "flex",           
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",       
              width: "fit-content",      
            }}
          >
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}