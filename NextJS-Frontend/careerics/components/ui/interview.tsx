"use client";
import React, { ReactNode, useState, useEffect } from "react";


// Define the shape of a single question
interface Question {
  id: number;
  text: string;
}

interface InterviewLayoutProps {
  questions: Question[];
  currentActiveId: number;
  onQuestionClick: (id: number) => void; // This was missing
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
  
  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", background: "linear-gradient(180deg, #142143 0%, black 100%)" }}>
      <aside style={{ width: "320px", backgroundColor: "#b4b4b4", padding: "40px 20px", display: "flex", flexDirection: "column" }}>
        {/* Header Section */}
        <div style={{ marginBottom: "30px", color: "#1a1a1a" }}>
          <h1 style={{ fontSize: "24px", margin: 0, fontWeight: 700 }}>HR Session</h1>
          <p style={{ fontSize: "20px", margin: 0, fontWeight: 300 }}>001</p>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {questions.map((q, index) => {
            const isExpanded = currentActiveId === q.id;
            return (
              <div key={q.id}>
                <div 
                  onClick={() => onQuestionClick(q.id)} // Calls the function passed from the page
                  style={{
                    padding: "16px 18px",
                    borderRadius: "14px",
                    backgroundColor: isExpanded ? "#d4ff47" : "transparent",
                    cursor: "pointer",
                    transition: "0.3s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, color: "#1a1a1a" }}>
                    <span>Question {q.id}</span>
                    <span style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "0.3s" }}>▼</span>
                  </div>
                  <div style={{ 
                    maxHeight: isExpanded ? "60px" : "0px", 
                    overflow: "hidden", 
                    fontSize: "11px", 
                    marginTop: isExpanded ? "8px" : "0px", 
                    opacity: 0.7,
                    color: "#1a1a1a"
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
        {children}
      </main>
    </div>
  );
}