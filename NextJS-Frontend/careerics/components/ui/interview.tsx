"use client";
import React, { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Question {
  id: number;
  text: string;
}

interface InterviewLayoutProps {
  questions: Question[];
  currentActiveId: number;
  onQuestionClick: (id: number) => void;
  closeIconSrc: string;
  children: ReactNode;
}

export default function InterviewLayout({
  questions,
  currentActiveId,
  onQuestionClick,
  closeIconSrc,
  children,
}: InterviewLayoutProps) {
  const router = useRouter();

  // Global Scroll Lock
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
      document.documentElement.style.overflow = "auto";
    };
  }, []);

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh", 
      width: "100vw", 
      background: "linear-gradient(180deg, #142143 0%, black 100%)",
      overflow: "hidden" 
    }}>
      <aside style={{ 
        width: "320px", 
        backgroundColor: "#b4b4b4", 
        padding: "40px 20px", 
        display: "flex", 
        flexDirection: "column" 
      }}>
        <div style={{ marginBottom: "30px", color: "#1a1a1a" }}>
          <h1 style={{ fontSize: "24px", margin: 0, fontWeight: 700 }}>HR Session</h1>
          <p style={{ fontSize: "20px", margin: 0, fontWeight: 300 }}>001</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {questions.map((q, index) => {
            const isCurrent = currentActiveId === q.id;
            
            // --- STRICT LOCK LOGIC ---
            // If the ID is NOT the current one, it is unclickable (Locked)
            const isDisabled = q.id !== currentActiveId;
            const isPast = q.id < currentActiveId;

            return (
              <div key={q.id}>
                <div 
                  // Clicking ONLY works if it's the current question
                  onClick={() => !isDisabled && onQuestionClick(q.id)} 
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    backgroundColor: isCurrent ? "#d4ff47" : "transparent",
                    // Disable cursor for anything that isn't the current question
                    cursor: isDisabled ? "not-allowed" : "pointer",
                    // Dim both past and future questions
                    opacity: isDisabled ? 0.4 : 1, 
                    transition: "0.3s all ease"
                  }}
                >
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center",
                    fontWeight: 600, 
                    color: "#1a1a1a" 
                  }}>
                    <span>Question {q.id}</span>
                    <span style={{ fontSize: "14px" }}>
                      {isPast ? "✅" : isCurrent ? "▼" : "🔒"} 
                    </span>
                  </div>
                  
                  <div style={{ 
                    maxHeight: isCurrent ? "80px" : "0px", 
                    overflow: "hidden", 
                    fontSize: "12px", 
                    marginTop: isCurrent ? "8px" : "0px", 
                    opacity: 0.8,
                    color: "#1a1a1a",
                    transition: "0.3s ease",
                    lineHeight: "1.4"
                  }}>
                    {q.text}
                  </div>
                </div>

                {index < questions.length - 1 && (
                  <div style={{ height: "1px", backgroundColor: "rgba(0,0,0,0.1)", margin: "8px 10px" }} />
                )}
              </div>
            );
          })}
        </div>
      </aside>

      <main style={{ flex: 1, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <button 
          style={{ position: "absolute", top: "30px", right: "30px", background: "none", border: "none", cursor: "pointer" }}
          onClick={() => router.push('/')}
        >
          <img src={closeIconSrc} alt="close" style={{ width: "28px" }} />
        </button>
        
        {children}
      </main>
    </div>
  );
}