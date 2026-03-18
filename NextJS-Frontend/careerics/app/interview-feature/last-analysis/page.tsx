"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import InterviewLayout from '@/components/ui/interview';
import InterviewContainer from '@/components/ui/interview-card';

export default function PreparingAnalysisPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryValue = searchParams.get('q');
  const currentQ = queryValue ? parseInt(queryValue) : 7;

  const [showHighlights, setShowHighlights] = useState(false);

  const questions = [
    { id: 1, text: "Where do you see yourself in 5 years?" },
    { id: 2, text: "What is your biggest professional achievement?" },
    { id: 3, text: "How do you handle conflict with a coworker?" },
    { id: 4, text: "Why are you looking to leave your current role?" },
    { id: 5, text: "How do you handle high-pressure situations?" },
    { id: 6, text: "What is your preferred work style?" },
    { id: 7, text: "Do you have any questions for us?" },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHighlights(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  // 1. Initial Analyzing State
  if (!showHighlights) {
    return (
      <InterviewLayout
        questions={questions}
        currentActiveId={currentQ}
        onQuestionClick={() => {}}
        closeIconSrc="/interview/Close.svg"
      >
       <div style={{ 
  textAlign: 'center', 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'flex-start', 
  paddingTop: '10vh',           
  height: '100%'                
}}>
  <h2 style={{ 
    color: 'white', 
    fontSize: '24px', 
    fontFamily: 'var(--font-nova-square)', 
    marginBottom: '100px',     
    maxWidth: '600px' 
  }}>
    Our Model is preparing the full analysis,<br /> Give us a moment
  </h2>
  
  <img 
    src="/interview/analyzing.svg" 
    alt="Analyzing..."
    style={{ 
      width: '300px', 
      filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))' 
    }} 
  />
</div>
      </InterviewLayout>
    );
  }

  // 2. Final Highlights State
  return (
    <InterviewLayout
      questions={questions}
      currentActiveId={currentQ}
      onQuestionClick={() => {}}
      closeIconSrc="/interview/Close.svg"
    >
      <div style={{ 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        padding: '0 40px' 
      }}>
        {/* Title Section */}
        <div style={{ textAlign: 'left', width: '100%', maxWidth: '850px', marginBottom: '30px' }}>
          <h2 style={{ color: 'white', fontSize: '24px', fontFamily: 'var(--font-nova-square)', margin: '0 0 10px 0' }}>
            Ready to see your interview highlights?
          </h2>
          <p style={{ color: 'white', fontSize: '18px', fontFamily: 'var(--font-nova-square)', opacity: 0.9, margin: 0 }}>
            Download the analysis below.
          </p>
        </div>

        {/* The Container */}
        <InterviewContainer
          questionTitle=""
          videoBoxStyle={{ 
            background: 'rgba(186.35, 186.35, 186.35, 0.50)', 
            width: '76%', 
            height: '390px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}
          videoContent={
            <div style={{ display: 'flex', alignItems: 'center', gap: '60px', padding: '20px', backgroundColor: "transparent" }}>
              {/* Internal White Preview Box */}
              <div style={{ 
                width: '220px', 
                height: '310px', 
                backgroundColor: 'white', 
                borderRadius: '30px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
              }} />

              {/* Download Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
                <button style={{
                  backgroundColor: '#d4ff47',
                  color: '#1a1a1a',
                  border: 'none',
                  padding: '14px 40px',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  width: '260px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-nova-square)',
                  fontSize: '16px'
                }}>
                  Download
                </button>
                
                <span style={{ color: 'white', fontSize: '14px', opacity: 0.8, fontFamily: 'var(--font-nova-square)' }}>or</span>

                <button style={{
                  backgroundColor: 'white',
                  color: '#1a1a1a',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '260px',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 600
                }}>
                  <img src="/interview/drive.svg" style={{ width: '20px' }} alt="Drive" />
                  Open with Google Drive
                </button>
              </div>
            </div>
          }
          style={{ background: 'transparent' }}
        />

        {/* Bottom Navigation Buttons */}
        <div style={{ display: 'flex', gap: '40px', marginTop: '60px' }}>
          <button 
            onClick={() => router.push('/interview-feature/recording?q=1')}
            style={{
              backgroundColor: '#d4ff47',
              color: 'black',
              padding: '14px 60px',
              borderRadius: '15px',
              border: 'none',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-nova-square)'
            }}
          >
            Practice more
          </button>
          <button 
            onClick={() => router.push('/')}
            style={{
              backgroundColor: '#CBD5E1', 
              color: 'black',
              padding: '14px 60px',
              borderRadius: '15px',
              border: 'none',
              fontWeight: 700,
              fontSize: '16px',
              cursor: 'pointer',
              fontFamily: 'var(--font-nova-square)'
            }}
          >
            Go back to home
          </button>
        </div>
      </div>
    </InterviewLayout>
  );
}