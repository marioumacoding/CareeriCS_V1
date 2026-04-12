"use client";
import React, { ReactNode } from "react";

interface Question {
  id: number;
  title: string;
  text: string;
}

interface SidebarLogicProps {
  questions: Question[];
  currentActiveId: number;
  unlockedStepId: number;
  onQuestionClick: (id: number) => void;
  label?: string;
  title?: string;
  children?: ReactNode;
}

export default function SidebarLogicOnly({
  questions,
  currentActiveId,
  unlockedStepId,
  onQuestionClick,
  label = "Question",
  title = "Skill Assessment",
  children,
}: SidebarLogicProps) {
  return (
    /* 1. Outer Wrap: display flex we height 100% ashan yemsik el sidebar */
    <div style={{ 
      display: "flex", 
      width: "100%", 
      height: "100%", // Fill el container el kbeer
      position: "absolute", // Ashan y-fit el parent layout bel-zabt
      top: 0,
      left: 0,
    }}>
      
      <aside style={{ 
        width: "320px", 
        backgroundColor: "#b4b4b4", 
        padding: "40px 20px", 
        display: "flex", 
        flexDirection: "column",
        height: "100%", 
        flexShrink: 0,
      }}>
        <h1 style={{ 
          fontSize: "24px", 
          color: "#1a1a1a", 
          fontWeight: 700, 
          marginBottom: "30px",
          fontFamily: 'var(--font-nova-square)' 
        }}>
          {title}
        </h1>

        <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          
          <div className="no-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {questions.map((q) => {
              const isSelected = currentActiveId === q.id;
              const isLocked = q.id > unlockedStepId;
              const isPast = q.id < unlockedStepId;

              return (
                <div 
                  key={q.id} 
                  onClick={() => !isLocked && onQuestionClick(q.id)}
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    backgroundColor: isSelected ? "#d4ff47" : "rgba(0,0,0,0.05)",
                    cursor: isLocked ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    opacity: isLocked ? 0.4 : 1,
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
                    color: "#333"
                  }}>
                    {q.text}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* 3. Main Content Area */}
      <main style={{ 
        flex: 1, 
        height: "100%", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative"
      }}>
        {children}
      </main>
    </div>
  );
}