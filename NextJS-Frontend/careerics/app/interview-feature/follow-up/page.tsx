"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InterviewLayout from '@/components/ui/interview';

export default function FollowUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryValue = searchParams.get('q');
  const currentQ = queryValue ? parseInt(queryValue) : 1;

  const questions = [
    { id: 1, text: "Where do you see yourself in 5 years?" },
    { id: 2, text: "What is your biggest professional achievement?" },
    { id: 3, text: "How do you handle conflict with a coworker?" },
    { id: 4, text: "Why are you looking to leave your current role?" },
    { id: 5, text: "How do you handle high-pressure situations?" },
    { id: 6, text: "What is your preferred work style?" },
    { id: 7, text: "Do you have any questions for us?" },
  ];

  const handleNextQuestion = () => {
    const nextQ = currentQ + 1;
    if (nextQ <= questions.length) {
      router.push(`/interview-feature/recording?q=${nextQ}`);
    } else {
      router.push('/interview-feature/complete');
    }
  };

  const handleFollowUp = () => {
    // Navigates directly to your followup-question page
    router.push(`/interview-feature/followup-question?q=${currentQ}`);
  };

  return (
    <InterviewLayout
      questions={questions.map((q) => ({ ...q, title: q.text }))}
      currentActiveId={currentQ}
      unlockedStepId={currentQ}
      onQuestionClick={() => {}} // Locked sidebar
      closeIconSrc="/interview/Close.svg"
      closeRoute="/features/interview"
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        textAlign: 'center',
        width: '100%',
        paddingBottom: '20px' 
      }}>
        
        {/* Updated Header - Static Text */}
        <h2 style={{ 
          color: 'white', 
          fontSize: '24px', 
          fontFamily: 'var(--font-nova-square)', 
          fontWeight: 400,
          lineHeight: '1.6',
          marginBottom: '40px' 
        }}>
          Our Model thinks your answer is a bit incomplete,<br />
          Would you like a followup question to enhance your answer?
        </h2>

        {/* AI Graphic - Always has the green glow now */}
        <div style={{ marginBottom: '40px' }}>
          <img 
            src="/interview/analyzing.svg" 
            alt="AI Analysis" 
            style={{ 
              width: '280px', 
              height: 'auto',
              filter: 'drop-shadow(0 0 20px rgba(212, 255, 71, 0.4))',
              transition: 'filter 0.5s ease'
            }} 
          />
        </div>

        {/* Button Container */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '15px', 
          width: '100%', 
          alignItems: 'center' 
        }}>
          
          {/* Primary Action */}
          <button 
            onClick={handleFollowUp}
            style={{
              backgroundColor: '#d4ff47', 
              color: '#1a1a1a',
              padding: '12px 60px',
              borderRadius: '14px',
              border: 'none',
              fontSize: '18px',
              fontFamily: 'var(--font-nova-square)',
              fontWeight: 600,
              width: '320px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            Answer Follow-up
          </button>

          {/* Secondary Action */}
          <button 
            onClick={handleNextQuestion}
            style={{
              backgroundColor: 'white', 
              color: 'black',
              padding: '12px 60px',
              borderRadius: '14px',
              border: '1px solid white',
              fontSize: '16px',
              fontFamily: 'var(--font-nova-square)',
              fontWeight: 400,
              width: '320px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              opacity: 0.9
            }}
          >
            Skip to Next Question
          </button>
        </div>
      </div>
    </InterviewLayout>
  );
}