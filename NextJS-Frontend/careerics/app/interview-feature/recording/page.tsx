"use client";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import InterviewLayout from "@/components/ui/interview";
import InterviewContainer from "@/components/ui/interview-card";

export default function RecordingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. Data Definitions
  const questions = [
    { id: 1, title: "Future Goals", text: "Where do you see yourself in 5 years?" },
    { id: 2, title: "Achievement", text: "What is your biggest professional achievement?" },
    { id: 3, title: "Conflict", text: "How do you handle conflict with a coworker?" },
    { id: 4, title: "Transitions", text: "Why are you looking to leave your current role?" },
    { id: 5, title: "Pressure", text: "How do you handle high-pressure situations?" },
    { id: 6, title: "Work Style", text: "What is your preferred work style?" },
    { id: 7, title: "Closing", text: "Do you have any questions for us?" },
  ];

  // 2. State Management
  // activeId: Controls which tab is expanded in the sidebar (the "Peek")
  const [activeId, setActiveId] = useState(1);
  // unlockedId: Controls which question is actually being recorded on screen (the "Sticky")
  const [unlockedId, setUnlockedId] = useState(1); 
  
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // STICKY LOGIC: Always find the text for the UNLOCKED ID, not the Active ID
  const currentQuestionText = questions.find((q) => q.id === unlockedId)?.text || "";

  // Sync state with URL on initial load
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      const parsedQ = parseInt(q);
      setUnlockedId(parsedQ);
      setActiveId(parsedQ);
    }
  }, [searchParams]);

  // 3. Timer Logic
  useEffect(() => {
    if (status === "recording") {
      timerRef.current = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status]);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, "0");
    const secs = (s % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  // 4. Action Handlers
  const handleCameraToggle = () => {
    // Logic: User can only record if they aren't "peeking" at another question in the sidebar
    if (activeId !== unlockedId) return;

    if (status === "idle" || status === "stopped") setStatus("recording");
    else setStatus("stopped");
  };

  const handleReset = () => {
    if (activeId !== unlockedId) return;
    setStatus("idle");
    setSeconds(0);
  };

  const handleSidebarClick = (targetId: number) => {
    // Prevent going back to completed questions
    if (targetId < unlockedId) return;

    // EXPAND Logic: Update activeId so the sidebar accordion opens
    // Note: We do NOT update unlockedId here, so the main screen stays sticky
    setActiveId(targetId);
  };

  const handleSubmit = () => {
    // Only allow submit if we are on the current question and have recorded something
    if (seconds > 0 && activeId === unlockedId) {
      if (unlockedId === questions.length) {
        router.push(`/interview-feature/last-analysis?q=${unlockedId}`);
      } else {
        router.push(`/interview-feature/analyzing?q=${unlockedId}`);
      }
    }
  };

  // 5. UI Controls
  const isPeeking = activeId !== unlockedId;

  const controls = (
    <div style={{ 
      display: "flex", 
      alignItems: "center", 
      gap: "80px",
      opacity: isPeeking ? 0.3 : 1, // Dim controls if looking at a future question
      pointerEvents: isPeeking ? "none" : "auto" 
    }}>
      <img
        src={status === "idle" ? "/interview/Record.svg" : status === "recording" ? "/interview/Pause.svg" : "/interview/Play.svg"}
        alt="Control"
        style={{ width: "60px", cursor: "pointer" }}
        onClick={handleCameraToggle}
      />
      <span style={{ fontSize: "40px", color: "white", fontFamily: "var(--font-nova-square)", minWidth: "120px", textAlign: "center" }}>
        {formatTime(seconds)}
      </span>
      <img 
        src="/interview/Retake.svg" 
        alt="Reset" 
        style={{ width: "45px", cursor: "pointer" }} 
        onClick={handleReset} 
      />
    </div>
  );

  return (
    <InterviewLayout 
      questions={questions} 
      currentActiveId={activeId}    // For Sidebar Expansion
      unlockedStepId={unlockedId}   // For Sidebar Lock Icons
      onQuestionClick={handleSidebarClick}
      closeIconSrc="/interview/Close.svg"
    >
      <InterviewContainer
        // STICKY TITLE: Always shows the unlocked question
        questionTitle={`${unlockedId}. ${currentQuestionText}`}
        videoContent={
          <div style={{ color: "white", fontSize: "18px", textAlign: "center" }}>
            {isPeeking ? (
              <div style={{ color: "#d4ff47", fontWeight: "bold" }}>
                <p>Peeking at Question {activeId}</p>
                <p style={{ fontSize: "14px", color: "white", opacity: 0.7 }}>
                  Click "Question {unlockedId}" in sidebar to resume recording.
                </p>
              </div>
            ) : (
              status === "recording" ? "● Recording..." : "Ready to record"
            )}
          </div>
        }
        controlsContent={controls}
        actionButton={
          <button
            onClick={handleSubmit}
            disabled={isPeeking || seconds === 0}
            style={{
              background: "#d4ff47",
              padding: "15px 100px",
              borderRadius: "15px",
              border: "none",
              fontWeight: "bold",
              fontSize: "18px",
              cursor: (isPeeking || seconds === 0) ? "not-allowed" : "pointer",
              opacity: (isPeeking || seconds === 0) ? 0.5 : 1,
              color: "#1a1a1a"
            }}
          >
            Submit
          </button>
        }
      />
    </InterviewLayout>
  );
}