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
  unlockedStepId?: number; 
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
    <div style={{ display: "flex", width: "100%", height: "100%", position: "absolute", top: 0, left: 0}}>
      
      <aside style={{ 
        width: "320px", backgroundColor: "#b4b4b4", padding: "40px 20px", 
        display: "flex", flexDirection: "column", height: "100%", flexShrink: 0 
      }}>
        <h1 style={{ fontSize: "24px", color: "#1a1a1a", fontWeight: 700, marginBottom: "30px", fontFamily: 'var(--font-nova-square)' }}>
          {title}
        </h1>
        <hr style={{ 
          marginBottom: "2vh", 
          border: "none", 
          height: "1px", 
          backgroundColor: "var(--dark-blue)" 
        }}

        />
    <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none" }}>
          <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>
          
          <div className="no-scrollbar" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {questions.map((q) => {
              const isSelected = currentActiveId === q.id;

              const isLocked = unlockedStepId !== undefined ? q.id > unlockedStepId : false;
              const isPast = unlockedStepId !== undefined ? q.id < unlockedStepId : false;

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
                      {/* El icons hat-zhar bas law feeh logic lock (unlockedStepId msh undefined) */}
                      <span style={{ fontSize: "12px" }}>
                        {isLocked ? "🔒" : isPast ? "✅" : ""}
                      </span>
                     <img 
                        src="/auth/Back Arrow.svg" // Hot el path bta3 el sora bta3tak hna
                        alt="chevron"
                        style={{ 
                          width: "16px", // Zabat el size zay ma enta 3ayez
                          height: "auto",
                          transition: "transform 0.3s ease", 
                          transform: isSelected ? "rotate(180deg)" : "rotate(270deg)",
                          filter: "brightness(0) saturate(100%)"    // Ikhtiyari: law el sora soda w 3ayez t-ghayar lonha le ay haga tanya
                        }} 
                      />
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

      <main style={{ flex: 1, height: "100%", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {children}
      </main>
    </div>
  );
}