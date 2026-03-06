'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, X, VideoIcon, Trash2, Loader2, Square } from 'lucide-react'
import { useTimer } from '@/hooks'
import { useAuth } from '@/providers/auth-provider'
import { interviewService } from '@/services'
import type { APIQuestion, APIFollowup } from '@/types'

// ── Per-question answer state ──
interface QuestionState {
  recorded: boolean
  submitting: boolean
  evaluating: boolean
  transcript: string | null
  feedback: string | null
  grade: number | null
  followup: APIFollowup | null
}

export default function HRSession() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  // ── layout ──
  const [isMobile, setIsMobile] = useState(false)

  // ── session ──
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [questions, setQuestions] = useState<APIQuestion[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [questionStates, setQuestionStates] = useState<Record<string, QuestionState>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ── recording ──
  const [recording, setRecording] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const activeQuestion = useMemo(() => questions[activeIndex], [questions, activeIndex])

  const timer = useTimer()

  // ── Responsive layout ──
  useEffect(() => {
    const updateLayout = () => setIsMobile(window.innerWidth < 768)
    updateLayout()
    window.addEventListener('resize', updateLayout)
    return () => window.removeEventListener('resize', updateLayout)
  }, [])

  // ── Init: create session + load questions ──
  useEffect(() => {
    let isMounted = true

    async function init() {
      if (isAuthLoading) return

      if (!user?.id) {
        if (isMounted) {
          setError('You need to sign in before starting an interview session')
          setLoading(false)
        }
        return
      }

      try {
        if (isMounted) {
          setLoading(true)
          setError(null)
        }

        const sessionRes = await interviewService.createSession({
          name: 'Interview Session',
          type: 'Behavioral',
          status: 'in_progress',
          user_id: user.id,
        })
        if (!sessionRes.success) throw new Error(sessionRes.message ?? 'Failed to create session')

        const questionsRes = await interviewService.getQuestionsByType('Behavioral')
        if (!questionsRes.success) throw new Error(questionsRes.message ?? 'Failed to load questions')

        if (isMounted) {
          setSessionId(sessionRes.data.id)
          setQuestions(questionsRes.data)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Initialization failed')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    init()

    return () => {
      isMounted = false
    }
  }, [user?.id, isAuthLoading])

  // ── Helpers to update per-question state ──
  const getQState = useCallback(
    (qId: string): QuestionState =>
      questionStates[qId] ?? {
        recorded: false,
        submitting: false,
        evaluating: false,
        transcript: null,
        feedback: null,
        grade: null,
        followup: null,
      },
    [questionStates],
  )

  const patchQState = useCallback(
    (qId: string, patch: Partial<QuestionState>) =>
      setQuestionStates((prev) => ({
        ...prev,
        [qId]: { ...prev[qId] ?? {
          recorded: false, submitting: false, evaluating: false,
          transcript: null, feedback: null, grade: null, followup: null,
        }, ...patch },
      })),
    [],
  )

  // ── Start recording ──
  const startRecording = useCallback(async () => {
    if (!activeQuestion) return
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }

      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' })
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = async () => {
        // Stop camera + mic tracks
        streamRef.current?.getTracks().forEach((t) => t.stop())
        if (videoRef.current) videoRef.current.srcObject = null

        if (chunksRef.current.length === 0) return

        const blob = new Blob(chunksRef.current, { type: 'video/webm' })
        await handleSubmitAnswer(blob)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setRecording(true)
      timer.reset()
      timer.start()
    } catch (err) {
      console.error('Could not start recording:', err)
    }
  }, [activeQuestion, timer])

  // ── Stop recording ──
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return
    mediaRecorderRef.current.stop()
    setRecording(false)
    timer.pause()
  }, [timer])

  // ── Toggle record button ──
  const handleRecordToggle = useCallback(() => {
    if (recording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [recording, startRecording, stopRecording])

  // ── Submit answer to API ──
  const handleSubmitAnswer = useCallback(
    async (blob: Blob) => {
      if (!sessionId || !activeQuestion) return
      const qId = activeQuestion.id

      patchQState(qId, { submitting: true })
      try {
        const submitRes = await interviewService.submitAnswer(sessionId, qId, blob)
        if (!submitRes.success) throw new Error(submitRes.message ?? 'Submit failed')

        patchQState(qId, {
          recorded: true,
          submitting: false,
          transcript: submitRes.data.answer_text,
        })

        // Trigger evaluation
        patchQState(qId, { evaluating: true })
        const evalRes = await interviewService.evaluateAnswer(sessionId, qId)
        if (!evalRes.success) throw new Error(evalRes.message ?? 'Evaluation failed')

        patchQState(qId, {
          evaluating: false,
          feedback: evalRes.data.evaluation,
          grade: evalRes.data.grade,
          followup: evalRes.data.followup,
        })
      } catch (err) {
        console.error('Answer/evaluation error:', err)
        patchQState(qId, { submitting: false, evaluating: false })
      }
    },
    [sessionId, activeQuestion, patchQState],
  )

  // ── Delete (discard) the current recording ──
  const handleDelete = useCallback(() => {
    if (recording) {
      // Abort an in-progress recording
      mediaRecorderRef.current?.stop()
      streamRef.current?.getTracks().forEach((t) => t.stop())
      if (videoRef.current) videoRef.current.srcObject = null
      chunksRef.current = []
      setRecording(false)
      timer.reset()
      return
    }
    if (!activeQuestion) return
    // Clear local state for re-record
    patchQState(activeQuestion.id, {
      recorded: false,
      transcript: null,
      feedback: null,
      grade: null,
      followup: null,
    })
    timer.reset()
  }, [recording, activeQuestion, patchQState, timer])

  const handleClose = useCallback(() => {
    // Cleanup any active stream before leaving
    streamRef.current?.getTracks().forEach((t) => t.stop())
    router.back()
  }, [router])

  // ── Current question state ──
  const currentQState = activeQuestion ? getQState(activeQuestion.id) : null
  const isBusy = currentQState?.submitting || currentQState?.evaluating

  // ── Loading / error screens ──
  if (loading || isAuthLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 size={48} color="var(--primary-green)" style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#ef4444', fontSize: '18px' }}>{error}</p>
      </div>
    )
  }

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
            {sessionId?.slice(0, 8) ?? '---'}
          </p>
          <div style={{ height: '1px', backgroundColor: '#71717a', marginTop: '14px' }} />
        </div>

        {/* Questions List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
          {questions.map((q, index) => {
            const isActive = activeIndex === index
            const qs = getQState(q.id)
            return (
              <div key={q.id}>
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
                      {qs.recorded && <span style={{ marginLeft: 8, fontSize: '12px', opacity: 0.7 }}>✓</span>}
                    </p>
                    {isActive && (
                      <p style={{ fontSize: isMobile ? '10px' : '12px', margin: '4px 0 0', opacity: 0.85 }}>
                        {q.question_text}
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
          {activeQuestion && `${activeIndex + 1}. ${activeQuestion.question_text}`}
        </h2>

        {/* Video Preview Area */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '12px 0' : '24px 0',
            gap: '16px',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            style={{
              width: '100%',
              maxWidth: isMobile ? '100%' : '640px',
              aspectRatio: '16 / 9',
              borderRadius: isMobile ? '16px' : '24px',
              backgroundColor: 'var(--bg-grey)',
              objectFit: 'cover',
              display: recording ? 'block' : 'none',
            }}
          />
          {!recording && (
            <div
              style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : '640px',
                aspectRatio: '16 / 9',
                borderRadius: isMobile ? '16px' : '24px',
                backgroundColor: 'var(--bg-grey)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {isBusy && <Loader2 size={36} color="var(--dark-blue)" style={{ animation: 'spin 1s linear infinite' }} />}
            </div>
          )}

          {/* Feedback / Transcript panel */}
          {currentQState?.feedback && (
            <div
              style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : '640px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: 'rgba(255,255,255,0.85)',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              {currentQState.grade != null && (
                <p style={{ margin: '0 0 6px', fontWeight: 700, color: 'var(--primary-green)' }}>
                  Score: {currentQState.grade}/10
                </p>
              )}
              <p style={{ margin: 0 }}>{currentQState.feedback}</p>
            </div>
          )}

          {/* Follow-up question */}
          {currentQState?.followup && (
            <div
              style={{
                width: '100%',
                maxWidth: isMobile ? '100%' : '640px',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(184,239,70,0.12)',
                color: 'var(--primary-green)',
                fontSize: '14px',
                lineHeight: 1.5,
              }}
            >
              <p style={{ margin: '0 0 4px', fontWeight: 700 }}>Follow-up:</p>
              <p style={{ margin: 0 }}>{currentQState.followup.text}</p>
              {currentQState.followup.audio && (
                <audio controls src={currentQState.followup.audio} style={{ marginTop: '8px', width: '100%' }} />
              )}
            </div>
          )}
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
          {/* Record / Stop Button */}
          <button
            onClick={handleRecordToggle}
            disabled={!!isBusy}
            style={{
              width: isMobile ? '46px' : '56px',
              height: isMobile ? '46px' : '56px',
              borderRadius: '50%',
              backgroundColor: recording ? '#dc2626' : '#fff',
              border: 'none',
              cursor: isBusy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              opacity: isBusy ? 0.5 : 1,
            }}
            aria-label={recording ? 'Stop recording' : 'Start recording'}
          >
            {recording
              ? <Square size={20} color="#fff" fill="#fff" />
              : <VideoIcon size={22} color="#dc2626" />
            }
          </button>

          {/* Timer */}
          <span
            style={{
              color: recording ? '#dc2626' : '#fff',
              fontFamily: 'monospace',
              fontSize: isMobile ? '22px' : '30px',
              letterSpacing: '2px',
            }}
          >
            {timer.formatted}
          </span>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={!!isBusy}
            style={{
              width: isMobile ? '46px' : '56px',
              height: isMobile ? '46px' : '56px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              border: 'none',
              cursor: isBusy ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              opacity: isBusy ? 0.5 : 1,
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
