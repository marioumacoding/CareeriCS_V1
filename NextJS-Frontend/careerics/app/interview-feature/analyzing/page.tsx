"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InterviewLayout from '@/components/ui/interview';

export default function AnalyzingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State to track if analysis is finished
  const [isFinished, setIsFinished] = useState(false);

  // Get the current question ID from the URL (default to 1)
  const currentQ = parseInt(searchParams.get('q') || '1');

  const questions = [
    { id: 1, text: "Where do you see yourself in 5 years?" },
    { id: 2, text: "What is your biggest professional achievement?" },
    { id: 3, text: "How do you handle conflict with a coworker?" },
    { id: 4, text: "Why are you looking to leave your current role?" },
    { id: 5, text: "How do you handle high-pressure situations?" },
    { id: 6, text: "What is your preferred work style?" },
    { id: 7, text: "Do you have any questions for us?" },
  ];

  // Effect to trigger the state change after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinished(true);
    }, 5000);

    return () => clearTimeout(timer); // Cleanup timer if component unmounts
  }, []);

  const handleNext = () => {
    if (currentQ < questions.length) {
      router.push(`/interview-feature/recording?q=${currentQ + 1}`);
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
        
        {/* Conditional Text Section */}
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
          
            }} 
          />
        </div>

        {/* Conditional Action Button */}
        <button 
          onClick={handleNext}
          disabled={!isFinished} // Optional: prevent clicking until analysis is done
          style={{
            backgroundColor: isFinished ? '#d4ff47' : '#BABABA', // Green when finished, Grey while analyzing
            color: '#1a1a1a',
            padding: '12px 60px',
            borderRadius: '14px',
            border: 'none',
            fontSize: '18px',
            fontFamily: 'var(--font-nova-square)',
            fontWeight: 600,
            cursor: isFinished ? 'pointer' : 'wait',
            transition: 'all 0.5s ease', // Smooth color transition
            opacity: isFinished ? 1 : 0.8
          }}
        >
          Next Question
        </button>
      </div>
    </InterviewLayout>
  );
}