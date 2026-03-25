"use client";
import React, { useState, useEffect } from 'react';
import Interview from "@/components/ui/interview"; 

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [expandedId, setExpandedId] = useState(1); // Dah lel sidebar expansion bas
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [unlockedStepId, setUnlockedStepId] = useState(1);
  
  const [isAnswered, setIsAnswered] = useState(false); 
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false); 
  const [score, setScore] = useState(0); 
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({}); 

  const assessmentSteps = [
    { id: 1, title: "", text: "Topic analysis", correct: 1 },
    { id: 2, title: "", text: "Technical skills", correct: 2 },
    { id: 3, title: "", text: "Problem solving", correct: 3 },
    { id: 4, title: "", text: "Experience level", correct: 4 },
    { id: 5, title: "", text: "Methodology", correct: 1 },
    { id: 6, title: "", text: "Tools & Frameworks", correct: 2 },
    { id: 7, title: "", text: "Final Assessment", correct: 3 },
  ];

  const currentQData = assessmentSteps.find(q => q.id === currentQuestion);

  useEffect(() => {
    if (isCalculating) {
      const timer = setTimeout(() => {
        setIsCalculating(false);
        setShowResult(true); 
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isCalculating]);

  const handleChoiceClick = (choiceId: number) => {
    if (isReviewing) return; 
    setSelectedChoice(choiceId);
    setIsAnswered(true);
    setUserAnswers(prev => ({ ...prev, [currentQuestion]: choiceId }));
  };

  const handleNext = () => {
    if (currentQuestion < 7) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      setExpandedId(nextQ); // El sidebar yemshi ma3 el content fl Next
      if (nextQ > unlockedStepId) setUnlockedStepId(nextQ);
      
      const storedAnswer = userAnswers[nextQ];
      setSelectedChoice(storedAnswer || null);
      setIsAnswered(!!storedAnswer);
    }
  };

  const handleFinish = () => {
    if (isAnswered && currentQuestion === 7) {
      let finalScore = 0;
      assessmentSteps.forEach(q => {
        if (userAnswers[q.id] === q.correct) finalScore++;
      });
      setScore(finalScore);
      setIsCalculating(true);
    }
  };

  const handleViewDetails = () => {
    setIsReviewing(true);
    setShowResult(false);
    setCurrentQuestion(1); 
    setExpandedId(1);
    setSelectedChoice(userAnswers[1]);
    setIsAnswered(true);
  };

  const percentage = Math.round((score / assessmentSteps.length) * 100);

  return (
    <Interview 
      // Mapping text to title for sidebar header
      questions={assessmentSteps.map(q => ({ ...q, title: q.text }))}
      currentActiveId={expandedId} // Control sidebar expansion
      unlockedStepId={unlockedStepId} 
      onQuestionClick={(id) => {
        // ALWAYS expand the clicked question in sidebar
        setExpandedId(id);

        // ONLY change the main quiz content if the question is unlocked
        if (id <= unlockedStepId) {
          setCurrentQuestion(id);
          const stored = userAnswers[id];
          setSelectedChoice(stored || null);
          setIsAnswered(!!stored);
        }
        // Law locked, el setExpandedId haykhalli el sidebar yeftha bas el content hayfdal sabet
      }}
      closeIconSrc="/auth/Close.svg"
      title="Test_001" 
    >
      <div style={{
        width: "100%", height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", position: "relative",
        padding: "10px 100px", boxSizing: "border-box",
      }}>
        
        {showResult ? (
          /* --- RESULT SCREEN --- */
          <div style={{ display: "flex", width: "100%", maxWidth: "900px", justifyContent: "space-between", alignItems: "center", gap: "50px" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
              <h2 style={{ color: "white", fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "40px" }}>Your Got</h2>
              <div style={{ position: "relative", width: "200px", height: "200px" }}>
                <svg width="200" height="200" style={{ transform: "rotate(-90deg)" }}>
                  <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="15" />
                  <circle 
                    cx="100" cy="100" r="90" fill="none" stroke="#D4FF47" strokeWidth="15" 
                    strokeDasharray="565" strokeDashoffset={565 - (565 * percentage) / 100}
                    strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "40px", fontWeight: "800", fontFamily: "var(--font-nova-square)" }}>
                  {percentage}%
                </div>
              </div>
              <button onClick={handleViewDetails} style={{ marginTop: "60px", width: "100%", maxWidth: "250px", backgroundColor: "#B8EF46", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", color: "#111827" }}>
                View Details
              </button>
            </div>

            <div style={{ width: "2px", height: "300px", backgroundColor: "rgba(255,255,255,0.2)" }}></div>

            <div style={{ flex: 1, color: "white" }}>
              <h2 style={{ fontSize: "32px", fontFamily: "var(--font-nova-square)", marginBottom: "15px" }}>Your Proficiency Level</h2>
              <h1 style={{ fontSize: "56px", color: "#D4FF47", fontWeight: "500", marginBottom: "20px", fontFamily: "var(--font-nova-square)" }}>
                {percentage >= 80 ? "Advanced" : percentage >= 50 ? "Intermediate" : "Beginner"}
              </h1>
              <p style={{ fontSize: "18px", opacity: 0.8, lineHeight: "1.6", marginBottom: "40px" }}>
                Assessment complete. You can now review each question to see the correct answers.
              </p>
              <button onClick={() => window.location.reload()} style={{ width: "100%", maxWidth: "250px", backgroundColor: "#C1CBE6", border: "none", padding: "12px", borderRadius: "12px", fontWeight: "bold", fontSize: "16px", cursor: "pointer", color: "#111827" }}>
                Retake Assessment
              </button>
            </div>
          </div>

        ) : isCalculating ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <h2 style={{ color: "white", fontSize: "28px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>Our Model is calculating your score,</h2>
            <p style={{ color: "white", fontSize: "20px", opacity: 0.8, marginBottom: "40px" }}>Give us a moment</p>
            <div style={{ width: "300px", height: "300px" }}><img src="/interview/analyzing.svg" alt="Calculating" style={{ width: "100%", height: "auto" }} /></div>
          </div>

        ) : (
          <div style={{ width: "100%", maxWidth: "680px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h3 style={{ color: "white", fontSize: "24px", marginBottom: "35px", textAlign: "center", fontFamily: 'var(--font-nova-square)' }}>
              {currentQuestion}. {currentQData?.text}
            </h3>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3, 4].map((choice) => {
                const isSelected = selectedChoice === choice;
                const isCorrect = currentQData?.correct === choice;
                let bgColor = "white";
                if (isReviewing) {
                  if (isCorrect) bgColor = "#dff98c"; 
                  else if (isSelected && !isCorrect) bgColor = "#fd8686"; 
                }
                return (
                  <div key={choice} onClick={() => handleChoiceClick(choice)}
                    style={{
                      backgroundColor: bgColor, borderRadius: "15px", padding: "16px 25px", 
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: (isReviewing) ? "default" : "pointer", color: "#111827",
                      transition: "0.2s ease",
                    }}>
                    <span style={{ fontSize: "17px", fontWeight: "500" }}>choice {choice}</span>
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "2px solid #111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isReviewing && isCorrect ? (
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>✓</span>
                      ) : isReviewing && isSelected && !isCorrect ? (
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>✕</span>
                      ) : (
                        isSelected && <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#111827" }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: "flex", gap: "30px", marginTop: "35px", marginBottom: "30px" }}>
              <button 
                onClick={() => {
                  const prevQ = currentQuestion - 1;
                  if (prevQ >= 1) {
                    setCurrentQuestion(prevQ);
                    setExpandedId(prevQ);
                    const stored = userAnswers[prevQ];
                    setSelectedChoice(stored || null);
                    setIsAnswered(!!stored);
                  }
                }}
                disabled={currentQuestion === 1}
                style={{
                  display: "flex", alignItems: "center", backgroundColor: "#C1CBE6",
                  border: "none", borderRadius: "50px", padding: "5px 25px 5px 5px",
                  cursor: currentQuestion === 1 ? "not-allowed" : "pointer",
                  opacity: currentQuestion === 1 ? 0.5 : 1, transition: "0.3s"
                }}
              >
                <div style={{ width: "35px", height: "35px", backgroundColor: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "15px" }}><img src="/auth/redo.svg" alt="prev" style={{ width: "18px" }} /></div>
                <span style={{ color: "#111827", fontWeight: "bold", fontSize: "16px", fontFamily: 'var(--font-nova-square)' }}>Previous</span>
              </button>

              {currentQuestion < 7 ? (
                <button 
                  onClick={handleNext} 
                  disabled={!isAnswered}
                  style={{ 
                    display: "flex", alignItems: "center", backgroundColor: "#E6FFB2",
                    border: "none", borderRadius: "50px", padding: "5px 5px 5px 25px",
                    cursor: !isAnswered ? "not-allowed" : "pointer",
                    opacity: !isAnswered ? 0.5 : 1, transition: "0.3s"
                  }}
                >
                  <span style={{ color: "#111827", fontWeight: "bold", fontSize: "16px", fontFamily: 'var(--font-nova-square)', marginRight: "15px" }}>Next</span>
                  <div style={{ width: "35px", height: "35px", backgroundColor: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(180deg)" }}><img src="/auth/redo.svg" alt="next" style={{ width: "18px" }} /></div>
                </button>
              ) : (
                !isReviewing && (
                  <button onClick={handleFinish} disabled={!isAnswered} style={{ width: "200px", backgroundColor: "#B8EF46", border: "none", padding: "10px 0", borderRadius: "12px", fontWeight: "800", fontSize: "16px", color: "#111827", opacity: isAnswered ? 1 : 0.4, cursor: isAnswered ? "pointer" : "not-allowed" }}>Finish</button>
                )
              )}
            </div>
            
            {isReviewing && (
              <button onClick={() => setShowResult(true)} style={{ color: "white", background: "none", border: "1px solid white", padding: "8px 20px", borderRadius: "8px", cursor: "pointer", opacity: 0.7 }}>Back to Results</button>
            )}
          </div>
        )}
      </div>
    </Interview>
  );
}