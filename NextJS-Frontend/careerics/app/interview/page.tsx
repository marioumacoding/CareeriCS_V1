'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, X, VideoIcon, Trash2 } from 'lucide-react'

const QUESTIONS = [
  'Where do you see yourself in 5 years?',
  'What are your greatest strengths?',
  'Tell us about a challenge you overcame',
  'How do you handle teamwork?',
  'What motivates you?',
  'Describe your ideal work environment',
  'Why do you want to work with us?',
]

export default function HRSession() {
  const router = useRouter()
  const [activeIndex, setActiveIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const activeQuestion = useMemo(() => QUESTIONS[activeIndex], [activeIndex])

  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth < 768)
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  const handleClose = useCallback(() => {
    router.back()
  }, [router])

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000',
        padding: isMobile ? '8px' : '12px',
      }}
    >
      <div
        style={{
          minHeight: isMobile ? 'calc(100vh - 16px)' : 'calc(100vh - 24px)',
          borderRadius: isMobile ? '18px' : '32px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          background: 'linear-gradient(135deg, var(--dark-blue) 0%, var(--bg-color) 100%)',
        }}
      >
      {/* ───── SIDEBAR ───── */}
      <aside
        style={{
          width: isMobile ? '100%' : '360px',
          minWidth: isMobile ? '100%' : '360px',
          maxHeight: isMobile ? '42vh' : '100%',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-grey)',
          padding: isMobile ? '16px' : '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '16px' : '24px',
        }}
      >
        {/* Header */}
        <div>
          <h1 style={{ fontSize: isMobile ? '20px' : '32px', color: '#000', margin: 0, fontWeight: 700 }}>
            Interview Session
          </h1>
          <p style={{ fontSize: isMobile ? '12px' : '16px', color: '#3f3f46', margin: '4px 0 0', fontWeight: 600 }}>
            001
          </p>
          <div style={{ height: '1px', backgroundColor: '#71717a', marginTop: '14px' }} />
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {QUESTIONS.map((question, index) => {
            const isActive = activeIndex === index
            return (
              <div key={index}>
                <button
                  onClick={() => setActiveIndex(index)}
                  style={{
                    width: '100%',
                    border: 'none',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    padding: isMobile ? '10px 12px' : '12px 16px',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background-color 0.2s',
                    backgroundColor: isActive ? 'var(--primary-green)' : 'transparent',
                    color: isActive ? '#000' : '#333',
                  }}
                >
                  <div>
                    <p style={{ fontSize: isMobile ? '13px' : '15px', fontWeight: 700, margin: 0 }}>
                      Question {index + 1}
                    </p>
                    {isActive && (
                      <p style={{ fontSize: isMobile ? '10px' : '12px', margin: '4px 0 0', opacity: 0.85 }}>
                        {question}
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    size={18}
                    style={{
                      transition: 'transform 0.2s',
                      transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}
                  />
                </button>
                {!isActive && <div style={{ height: '1px', backgroundColor: '#71717a', marginTop: '8px' }} />}
              </div>
            )
          })}
        </div>
      </aside>

      {/* ───── MAIN CONTENT ───── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          minHeight: isMobile ? '58vh' : '0',
          padding: isMobile ? '16px' : '28px',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: isMobile ? '14px' : '24px',
            right: isMobile ? '14px' : '24px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '9999px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Close session"
        >
          <X size={20} color="white" />
        </button>

        {/* Question Title */}
        <h2
          style={{
            fontSize: isMobile ? '24px' : '42px',
            fontWeight: 300,
            color: 'rgba(255, 255, 255, 0.9)',
            marginTop: isMobile ? '6px' : '12px',
            marginBottom: 0,
            paddingRight: '48px',
            lineHeight: 1.2,
          }}
        >
          {activeIndex + 1}. {activeQuestion}
        </h2>

        {/* Video Preview Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '12px 0' : '24px 0',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : '640px',
              aspectRatio: '16 / 9',
              borderRadius: isMobile ? '16px' : '24px',
              backgroundColor: 'var(--bg-grey)',
            }}
          />
        </div>

        {/* Controls */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isMobile ? '20px' : '48px',
            paddingBottom: isMobile ? '8px' : '20px',
          }}
        >
          {/* Video Button */}
          <button
            onClick={() => console.info('[Interview] Record clicked', { question: activeQuestion })}
            style={{
              width: isMobile ? '46px' : '56px',
              height: isMobile ? '46px' : '56px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            aria-label="Start recording"
          >
            <VideoIcon size={22} color="#dc2626" />
          </button>

          {/* Timer */}
          <span
            style={{
              color: '#fff',
              fontFamily: 'monospace',
              fontSize: isMobile ? '22px' : '30px',
              letterSpacing: '2px',
            }}
          >
            00:03
          </span>

          {/* Delete Button */}
          <button
            onClick={() => console.info('[Interview] Delete clicked', { question: activeQuestion })}
            style={{
              width: isMobile ? '46px' : '56px',
              height: isMobile ? '46px' : '56px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
            aria-label="Delete response"
          >
            <Trash2 size={22} color="#dc2626" />
          </button>
        </div>
      </main>
      </div>
    </div>
  )
}
