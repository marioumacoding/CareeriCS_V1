"use client";
import React, { useState, useEffect } from 'react';
import Interview from "@/components/ui/interview"; 

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [unlockedStepId, setUnlockedStepId] = useState(1);
  
  // --- States lel Quiz Logic ---
  const [isAnswered, setIsAnswered] = useState(false); // 3ashan n-lock el choices ba3d el egaba
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const assessmentSteps = [
    { id: 1, title: "Question 1", text: "Topic analysis", correct: 1 },
    { id: 2, title: "Question 2", text: "Technical skills", correct: 2 },
    { id: 3, title: "Question 3", text: "Problem solving", correct: 3 },
    { id: 4, title: "Question 4", text: "Experience level", correct: 4 },
    { id: 5, title: "Question 5", text: "Methodology", correct: 1 },
    { id: 6, title: "Question 6", text: "Tools & Frameworks", correct: 2 },
    { id: 7, title: "Question 7", text: "Final Assessment", correct: 3 },
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

  // Handle choice selection
  const handleChoiceClick = (choiceId: number) => {
    if (isAnswered) return; // My-enfash y-ghayar el egaba ba3d ma s-shaf el feedback
    setSelectedChoice(choiceId);
    setIsAnswered(true);
  };

  const handleNext = () => {
    if (isAnswered && currentQuestion < 7) {
      const nextQ = currentQuestion + 1;
      setCurrentQuestion(nextQ);
      if (nextQ > unlockedStepId) setUnlockedStepId(nextQ);
      
      // Reset states lel su'al el gdid
      setSelectedChoice(null); 
      setIsAnswered(false);
    }
  };

  const handleFinish = () => {
    if (isAnswered && currentQuestion === 7) {
      setIsCalculating(true);
    }
  };

  return (
    <Interview 
      questions={assessmentSteps}
      currentActiveId={currentQuestion} 
      unlockedStepId={unlockedStepId} 
      onQuestionClick={(id) => id <= unlockedStepId && (setCurrentQuestion(id), setSelectedChoice(null), setIsAnswered(false))}
      closeIconSrc="/auth/Close.svg"
      title="Test_001" 
    >
      <div style={{
        width: "100%", height: "100vh", display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "flex-start", position: "relative",
        padding: "10px 100px", boxSizing: "border-box",
      }}>
        
        {isCalculating ? (
          <div style={{ 
            display: "flex", flexDirection: "column", alignItems: "center", 
            justifyContent: "center", height: "80%", textAlign: "center", marginTop: "20px" 
          }}>
            <h2 style={{ color: "white", fontSize: "28px", fontFamily: "var(--font-nova-square)", marginBottom: "10px" }}>
              Our Model is calculating your score,
            </h2>
            <p style={{ color: "white", fontSize: "20px", opacity: 0.8, marginBottom: "40px" }}>
              Give us a moment
            </p>
            <div style={{ width: "300px", height: "300px" }}>
              <img src="/images/abstract-orb.png" alt="Calculating" style={{ width: "100%", height: "auto" }} />
            </div>
          </div>
        ) : (
          <div style={{ 
            width: "100%", maxWidth: "680px", marginTop: "30px", 
            display: "flex", flexDirection: "column", alignItems: "center" 
          }}>
            
            <h3 style={{ color: "white", fontSize: "24px", marginBottom: "35px", textAlign: "center", fontFamily: 'var(--font-nova-square)' }}>
              {currentQuestion}. {currentQData?.text}
            </h3>

            {/* --- Choices with Logic --- */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
              {[1, 2, 3, 4].map((choice) => {
                const isSelected = selectedChoice === choice;
                const isCorrect = currentQData?.correct === choice;
                
                // Color Styling Logic
                let bgColor = "white";
                let borderColor = "transparent";

                if (isAnswered) {
                  if (isCorrect) {
                    bgColor = "#dff98c"; // Green Background for Correct
                  } else if (isSelected && !isCorrect) {
                    bgColor = "#fd8686"; // Red Background for Wrong Choice
                  }
                } else if (isSelected) {
                  borderColor = "#D4FF47";
                }

                return (
                  <div key={choice} onClick={() => handleChoiceClick(choice)}
                    style={{
                      backgroundColor: bgColor, borderRadius: "15px", padding: "16px 25px", 
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      cursor: isAnswered ? "default" : "pointer", color: "#111827",
                      border: `3px solid ${borderColor}`,
                      transition: "0.2s ease",
                    }}>
                    <span style={{ fontSize: "17px", fontWeight: "500" }}>choice {choice}</span>
                    
                    {/* Icon feedback based on correct/wrong */}
                    <div style={{ width: "22px", height: "22px", borderRadius: "50%", border: "2px solid #111827", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {isAnswered && isCorrect ? (
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>✓</span>
                      ) : isAnswered && isSelected && !isCorrect ? (
                        <span style={{ fontSize: "12px", fontWeight: "bold" }}>✕</span>
                      ) : (
                        isSelected && <div style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#111827" }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* --- Navigation Buttons (Same Design) --- */}
            <div style={{ display: "flex", gap: "30px", marginTop: "35px", marginBottom: "30px" }}>
              
              <button 
                onClick={() => currentQuestion > 1 && (setCurrentQuestion(currentQuestion - 1), setIsAnswered(false))}
                disabled={currentQuestion === 1}
                style={{
                  display: "flex", alignItems: "center", backgroundColor: "#C1CBE6",
                  border: "none", borderRadius: "50px", padding: "5px 25px 5px 5px",
                  cursor: currentQuestion === 1 ? "not-allowed" : "pointer",
                  opacity: currentQuestion === 1 ? 0.5 : 1, transition: "0.3s"
                }}
              >
                <div style={{ width: "35px", height: "35px", backgroundColor: "white", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginRight: "15px" }}>
                  <img src="/auth/redo.svg" alt="prev" style={{ width: "18px" }} />
                </div>
                <span style={{ color: "#111827", fontWeight: "bold", fontSize: "16px", fontFamily: 'var(--font-nova-square)' }}>Previous</span>
              </button>

              {currentQuestion < 7 && (
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
                  <div style={{ 
                    width: "35px", height: "35px", backgroundColor: "white", borderRadius: "50%", 
                    display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(180deg)"
                  }}>
                    <img src="/auth/redo.svg" alt="next" style={{ width: "18px" }} />
                  </div>
                </button>
              )}
            </div>

            {/* --- Finish Button --- */}
            {currentQuestion === 7 && (
              <button 
                onClick={handleFinish}
                disabled={!isAnswered}
                style={{
                  width: "200px",
                  backgroundColor: "#D4FF47", border: "none", padding: "10px 0", borderRadius: "12px",
                  fontWeight: "800", fontSize: "16px", color: "#111827",
                  cursor: isAnswered ? "pointer" : "not-allowed",
                  opacity: isAnswered ? 1 : 0.4,
                  transition: "0.3s"
                }}>
                Finish
              </button>
            )}

          </div>
        )}
      </div>
    </Interview>
  );
}