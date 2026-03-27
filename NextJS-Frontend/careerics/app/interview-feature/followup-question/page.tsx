"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import InterviewLayout from "@/components/ui/interview";
import InterviewContainer from "@/components/ui/interview-card";

export default function FollowUpRecordingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Data Definitions
  const questions = [
    { id: 1, text: "Where do you see yourself in 5 years?" },
    { id: 2, text: "What is your biggest professional achievement?" },
    { id: 3, text: "How do you handle conflict with a coworker?" },
    { id: 4, text: "Why are you looking to leave your current role?" },
    { id: 5, text: "How do you handle high-pressure situations?" },
    { id: 6, text: "What is your preferred work style?" },
    { id: 7, text: "Do you have any questions for us?" },
  ];

  // 2. State Management
  const [activeId, setActiveId] = useState(1);
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync activeId with URL ?q=
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      const newId = parseInt(q);
      setActiveId(newId);
      setStatus("idle");
      setSeconds(0);
    }
  }, [searchParams]);

  const currentQuestionText = questions.find((q) => q.id === activeId)?.text || "";

  // 3. Timer Logic
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // 4. Action Handlers
  const handleCameraToggle = () => {
    if (status === "idle" || status === "stopped") setStatus("recording");
    else setStatus("stopped");
  };

  const handleReset = () => {
    setStatus("idle");
    setSeconds(0);
  };

  const handleSubmit = () => {
    if (seconds > 0) {
      // After follow-up is submitted, we go back to analyzing (or your results page)
      router.push(`/interview-feature/analyzing?q=${activeId}`);
    }
  };

  const handleSidebarClick = (targetId: number) => {
    // Locked logic: user cannot navigate during follow-up
    if (targetId === activeId) return;
    console.log("Navigation is locked during follow-up.");
  };

  // 5. UI Snippets
  const controls = (
    <div style={{ display: "flex", alignItems: "center", gap: "80px" }}>
      <img
        src={
          status === "idle"
            ? "/interview/Record.svg"
            : status === "recording"
            ? "/interview/Pause.svg"
            : "/interview/Play.svg"
        }
        alt="Control"
        style={{ width: "60px", cursor: "pointer" }}
        onClick={handleCameraToggle}
      />

      <span
        style={{
          fontSize: "40px",
          fontWeight: 500,
          color: "white",
          minWidth: "120px",
          textAlign: "center",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        {formatTime(seconds)}
      </span>

      <img
        src="/interview/Retake.svg"
        alt="Reset"
        style={{
          width: "45px",
          cursor: status === "idle" ? "not-allowed" : "pointer",
          opacity: status === "idle" ? 0.3 : 1,
        }}
        onClick={handleReset}
      />
    </div>
  );

  return (
    <InterviewLayout 
      questions={questions.map((q) => ({ ...q, title: q.text }))}
      currentActiveId={activeId} 
      unlockedStepId={activeId}
      onQuestionClick={handleSidebarClick} 
      closeIconSrc="/interview/Close.svg"
      closeRoute="/features/interview"
    >
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* Main Title Section with Follow-up subtext */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
             <h2 style={{ 
                color: 'white', 
                fontSize: '28px', 
                fontFamily: 'var(--font-nova-square)', 
                margin: '0 0 5px 0', 
                fontWeight: 300
             }}>
                {activeId}. {currentQuestionText}
             </h2>
             <p style={{ 
                color: '#ffffff', // Signature green for emphasis
                fontSize: '28px', 
                fontFamily: 'var(--font-nova-square)', 
                margin: '0 0 5px 0', 
                fontWeight: 300
             }}>
                followup: tell us more about your future plans.
             </p>
        </div>

        <InterviewContainer
          // Pass null or empty string to questionTitle because we rendered it custom above
          questionTitle="" 
          videoContent={
            <div style={{ color: "#666", fontSize: "20px", fontFamily: "jura" }}>
              {status === "recording"
                ? " Recording..."
                : status === "stopped"
                ? "⏸ Paused"
                : ""}
            </div>
          }
          controlsContent={controls}
          actionButton={
            <button
              onClick={handleSubmit}
              style={{
                background: "#d4ff47",
                padding: "15px 100px",
                borderRadius: "15px",
                border: "none",
                fontWeight: "bold",
                fontSize: "18px",
                fontFamily: "var(--font-nova-square)",
                cursor: seconds > 0 ? "pointer" : "not-allowed",
                opacity: seconds > 0 ? 1 : 0.5,
                transition: "0.3s",
                color: "#1a1a1a"
              }}
            >
              Submit Follow-up
            </button>
          }
        />
      </div>
    </InterviewLayout>
  );
}