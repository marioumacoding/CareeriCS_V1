"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InterviewLayout from '@/components/ui/interview';

export default function AnalyzingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // 1. Get the current question ID from the URL (default to 1)
  // We use searchParams.get('q') directly to ensure it stays in sync with the URL
  const queryValue = searchParams.get('q');
  const currentQ = queryValue ? parseInt(queryValue) : 1;

  const [isFinished, setIsFinished] = useState(false);

  const questions = [
    { id: 1, text: "Where do you see yourself in 5 years?" },
    { id: 2, text: "What is your biggest professional achievement?" },
    { id: 3, text: "How do you handle conflict with a coworker?" },
    { id: 4, text: "Why are you looking to leave your current role?" },
    { id: 5, text: "How do you handle high-pressure situations?" },
    { id: 6, text: "What is your preferred work style?" },
    { id: 7, text: "Do you have any questions for us?" },
  ];

  // 2. Reset and start timer whenever the question ID (currentQ) changes
  useEffect(() => {
    setIsFinished(false); // Reset the button/text state for the new question

    const timer = setTimeout(() => {
      setIsFinished(true);
    }, 5000);

    return () => clearTimeout(timer); 
  }, [currentQ]); 

  // 3. Updated Navigation Logic
  const handleNext = () => {
    const nextQ = currentQ + 1;

    if (nextQ <= questions.length) {
      // Navigate to recording page with the INCREMENTED ID
      console.log("Navigating to Question:", nextQ); // Debug check
      router.push(`/interview-feature/recording?q=${nextQ}`);
    } else {
      router.push('/interview-feature/complete');
    }
  };

  return (
    <InterviewLayout
      questions={questions}
      currentActiveId={currentQ}
      onQuestionClick={(id: number) => router.push(`/interview-feature/recording?q=${id}`)}
      closeIconSrc="/interview/Close.svg"
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        paddingBottom: '40px' 
      }}>
        
        <h2 style={{ 
          color: 'white', 
          fontSize: '24px', 
          fontFamily: 'var(--font-nova-square)', 
          fontWeight: 400,
          lineHeight: '1.6',
          marginBottom: '50px' 
        }}>
          {isFinished ? (
            <>
              Our Model has finished the analysis,<br />
              Ready for the next question?
            </>
          ) : (
            <>
              Our Model is analyzing your answers,<br />
              Give us a moment
            </>
          )}
        </h2>

        <div style={{ marginBottom: '60px' }}>
          <img 
            src="/interview/analyzing.svg" 
            alt="AI Analysis" 
            style={{ 
              width: '300px', 
              height: 'auto',
              filter: isFinished 
                ? 'drop-shadow(0 0 20px rgba(212, 255, 71, 0.4))' 
                : 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.3))',
              transition: 'filter 0.5s ease'
            }} 
          />
        </div>

        <button 
          onClick={handleNext}
          disabled={!isFinished} 
          style={{
            backgroundColor: isFinished ? '#d4ff47' : '#BABABA', 
            color: '#1a1a1a',
            padding: '12px 60px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '18px',
            fontFamily: 'var(--font-nova-square)',
            fontWeight: 600,
            cursor: isFinished ? 'pointer' : 'wait',
            transition: 'all 0.5s ease',
            opacity: isFinished ? 1 : 0.8
          }}
        >
          Next Question
        </button>
      </div>
    </InterviewLayout>
  );
}