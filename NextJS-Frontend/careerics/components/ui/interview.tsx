"use client";
import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  title: string;
  text: string;
}

interface InterviewLayoutProps {
  questions: Question[];
  currentActiveId: number;
  unlockedStepId: number;
  onQuestionClick: (id: number) => void;
  closeIconSrc: string;
  children: ReactNode;
  label?: string;
  title?: string; 
}

export default function InterviewLayout({
  questions,
  currentActiveId,
  unlockedStepId,
  onQuestionClick,
  closeIconSrc,
  children,
  label = "Question",
  title = "CV Builder", // El default title law maba3atsh haga
}: InterviewLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "linear-gradient(180deg, #142143 0%, black 100%)", overflow: "hidden" }}>
      {/* SIDEBAR */}
      <aside style={{ width: "320px", backgroundColor: "#b4b4b4", padding: "40px 20px", display: "flex", flexDirection: "column" }}>
        
        {/* --- Dalo2ti bey-esta5dem el 'title' prop badal el fixed text --- */}
        <h1 style={{ fontSize: "24px", color: "#1a1a1a", fontWeight: 700, marginBottom: "30px" }}>
          {title}
        </h1>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {questions.map((q) => {
            const isSelected = currentActiveId === q.id;
            const isLocked = q.id > unlockedStepId;
            const isPast = q.id < unlockedStepId;

            return (
              <div 
                key={q.id} 
                onClick={() => onQuestionClick(q.id)}
                style={{
                  padding: "16px 18px",
                  borderRadius: "14px",
                  backgroundColor: isSelected ? "#d4ff47" : "rgba(0,0,0,0.05)",
                  cursor: isPast ? "default" : "pointer",
                  marginBottom: "10px",
                  transition: "all 0.3s ease",
                  opacity: isPast ? 0.5 : 1, 
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", color: "#1a1a1a", fontWeight: 600 }}>
                  <span style={{ fontSize: "14px" }}>{label} {q.id}: {q.title}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <span style={{ fontSize: "12px" }}>{isLocked ? "🔒" : isPast ? "✅" : ""}</span>
                    <span style={{ 
                      transition: "transform 0.3s", 
                      transform: isSelected ? "rotate(180deg)" : "rotate(0deg)" 
                    }}>▼</span>
                  </div>
                </div>

                <div style={{ 
                  maxHeight: isSelected ? "150px" : "0px", 
                  overflow: "hidden", 
                  transition: "all 0.3s ease",
                  fontSize: "13px",
                  marginTop: isSelected ? "10px" : "0px",
                  borderTop: isSelected ? "1px solid rgba(0,0,0,0.1)" : "none",
                  paddingTop: isSelected ? "10px" : "0px",
                  color: "#333"
                }}>
                  {q.text}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <button onClick={() => router.push('/')} style={{ position: "absolute", top: "30px", right: "30px", background: "none", border: "none", cursor: "pointer", zIndex: 10 }}>
          <img src={closeIconSrc} alt="close" style={{ width: "24px" }} />
        </button>

        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {children}
        </div>
      </main>
    </div>
  );
}