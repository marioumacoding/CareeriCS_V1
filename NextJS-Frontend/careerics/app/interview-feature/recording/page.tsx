"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import InterviewLayout from "@/components/ui/interview";
import InterviewContainer from "@/components/ui/interview-card";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/providers/auth-provider";
import { useInterviewFlow } from "@/hooks";

export default function RecordingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    interviewType,
    sessionId,
    followupText,
    currentQ,
    questions,
    isQuestionsLoading,
    questionsError,
    buildRecordingUrl,
    buildAnalyzingUrl,
  } = useInterviewFlow();

  const [activeId, setActiveId] = useState(currentQ);
  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [seconds, setSeconds] = useState(0);
  const [recordedMedia, setRecordedMedia] = useState<Blob | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizingRecording, setIsFinalizingRecording] = useState(false);
  const [actionError, setActionError] = useState("");

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const hasCreatedSessionRef = useRef(false);
  const pendingSubmitRef = useRef(false);

  const currentQuestion = questions.find((q) => q.id === activeId) || null;
  const currentQuestionText = followupText || currentQuestion?.text || "";
  const submitBlockedReason =
    !sessionId
      ? "Please sign in first so an interview session can be created."
      : isQuestionsLoading
      ? "Questions are still loading."
      : isSubmitting
      ? "Submission is already in progress."
      : !questions.length
      ? "No questions are available for this interview type."
      : !currentQuestion?.questionId
      ? "Current question is not ready yet."
      : "";

  const isSubmitDisabled = Boolean(submitBlockedReason);

  useEffect(() => {
    setActiveId(currentQ);
  }, [currentQ]);

  useEffect(() => {
    if (hasCreatedSessionRef.current || sessionId || !user?.id) {
      return;
    }

    let alive = true;

    const createSession = async () => {
      hasCreatedSessionRef.current = true;
      const payload = {
        name: `${interviewType.toUpperCase()} Mock Interview`,
        type: interviewType,
        status: "in_progress",
        user_id: user.id,
      };

      const response = await interviewService.createSession(payload);

      if (!alive) return;

      if (!response.success || !response.data?.id) {
        setActionError(response.message || "Failed to create interview session.");
        return;
      }

      router.replace(
        buildRecordingUrl({
          type: interviewType,
          sessionId: response.data.id,
          q: String(currentQ || 1),
        }),
      );
    };

    createSession();

    return () => {
      alive = false;
    };
  }, [sessionId, user?.id, interviewType, currentQ, router, buildRecordingUrl]);

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

  const stopAndCleanupMedia = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (previewVideoRef.current) {
      previewVideoRef.current.srcObject = null;
    }
  };

  const getRecorderOptions = (): MediaRecorderOptions | undefined => {
    if (typeof MediaRecorder === "undefined") return undefined;

    const preferredTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
    ];

    const supportedType = preferredTypes.find((type) => MediaRecorder.isTypeSupported(type));
    return supportedType ? { mimeType: supportedType } : undefined;
  };

  // 4. Action Handlers
  const handleCameraToggle = async () => {
    if (status === "recording") {
      setIsFinalizingRecording(true);
      stopAndCleanupMedia();
      setStatus("stopped");
      return;
    }

    try {
      setActionError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      streamRef.current = stream;

      if (previewVideoRef.current) {
        previewVideoRef.current.srcObject = stream;
      }

      const recorder = new MediaRecorder(stream, getRecorderOptions());
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        setIsFinalizingRecording(false);

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || "video/webm",
        });
        if (blob.size > 0) {
          if (recordedPreviewUrl) {
            URL.revokeObjectURL(recordedPreviewUrl);
          }

          setRecordedMedia(blob);
          setRecordedPreviewUrl(URL.createObjectURL(blob));

          if (pendingSubmitRef.current) {
            pendingSubmitRef.current = false;
            void submitRecordedAnswer(blob);
          }
        } else if (pendingSubmitRef.current) {
          pendingSubmitRef.current = false;
          setActionError("No recording data was captured. Please record again.");
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordedMedia(null);
      if (recordedPreviewUrl) {
        URL.revokeObjectURL(recordedPreviewUrl);
        setRecordedPreviewUrl(null);
      }
      setSeconds(0);
      setStatus("recording");
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotAllowedError") {
        setActionError("Camera and microphone access are required to record an answer. Please allow permissions in your browser settings.");
      } else if (error instanceof DOMException && error.name === "NotFoundError") {
        setActionError("No camera or microphone device was found.");
      } else {
        setActionError("Unable to start recording. Please refresh and try again.");
      }
      setStatus("idle");
    }
  };

  const handleReset = () => {
    pendingSubmitRef.current = false;
    stopAndCleanupMedia();
    setStatus("idle");
    setIsFinalizingRecording(false);
    setSeconds(0);
    setRecordedMedia(null);
    if (recordedPreviewUrl) {
      URL.revokeObjectURL(recordedPreviewUrl);
      setRecordedPreviewUrl(null);
    }
    setActionError("");
  };

  useEffect(() => {
    return () => {
      stopAndCleanupMedia();
      if (recordedPreviewUrl) {
        URL.revokeObjectURL(recordedPreviewUrl);
      }
    };
  }, [recordedPreviewUrl]);

  const submitRecordedAnswer = async (media: Blob) => {
    if (!sessionId || !currentQuestion?.questionId || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setActionError("");

    const submitResponse = await interviewService.submitAnswer(
      sessionId,
      currentQuestion.questionId,
      media,
    );

    setIsSubmitting(false);

    if (!submitResponse.success) {
      setActionError(submitResponse.message || "Failed to submit answer.");
      return;
    }

    router.push(
      buildAnalyzingUrl({
        q: String(activeId),
        questionId: currentQuestion.questionId,
        answerId: submitResponse.data?.answer_id,
      }),
    );
  };

  const handleSubmit = async () => {
    if (!sessionId || !currentQuestion?.questionId || isSubmitting) {
      return;
    }

    if (status === "recording") {
      pendingSubmitRef.current = true;
      setIsFinalizingRecording(true);
      stopAndCleanupMedia();
      setStatus("stopped");
      return;
    }

    if (status === "stopped" && isFinalizingRecording) {
      pendingSubmitRef.current = true;
      return;
    }

    if (!recordedMedia) {
      setActionError("Record your answer first, then submit.");
      return;
    }

    await submitRecordedAnswer(recordedMedia);
  };

  const onQuestionClick = (id: number) => {
    pendingSubmitRef.current = false;
    setActiveId(id);
    router.replace(buildRecordingUrl({ q: String(id), followup: null, questionId: null }));
    handleReset();
  };

  // 5. UI Snippets
  const controls = (
    <div style={{ display: "flex", alignItems: "center", gap: "80px" }}>
      {/* Play/Pause/Record Button */}
      <img
        src={
          status === "idle"
            ? "/interview/Record.svg"
            : status === "recording"
            ? "/interview/Pause.svg"
            : "/interview/Play.svg"
        }
        alt="Control"
        style={{ width: "60px", cursor: isQuestionsLoading ? "not-allowed" : "pointer", opacity: isQuestionsLoading ? 0.5 : 1 }}
        onClick={handleCameraToggle}
      />

      {/* Timer Display */}
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

      {/* Reset/Retake Button */}
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
      questions={questions} 
      currentActiveId={activeId} 
      onQuestionClick={onQuestionClick}
      closeIconSrc="/interview/Close.svg"
    >
      <InterviewContainer
        questionTitle={`${activeId}. ${currentQuestionText}`}
        videoContent={
          <div style={{ color: "#666", fontSize: "20px", fontFamily: "jura" }}>
            {isQuestionsLoading
              ? "Loading questions..."
              : questionsError || actionError
              ? questionsError || actionError
              : !sessionId && !user?.id
              ? "Please sign in to start interview session."
              : status === "recording"
              ? " Recording..."
              : isFinalizingRecording
              ? "Finalizing recording..."
              : status === "stopped"
              ? "⏸ Paused"
              : recordedMedia
              ? "Ready to submit"
              : ""}

            <video
              ref={previewVideoRef}
              autoPlay={status === "recording"}
              muted
              playsInline
              controls={status !== "recording"}
              src={status !== "recording" ? (recordedPreviewUrl ?? undefined) : undefined}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "24px",
                display: status === "recording" || recordedPreviewUrl ? "block" : "none",
              }}
            />
          </div>
        }
        controlsContent={controls}
        actionButton={
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            title={submitBlockedReason || undefined}
            style={{
              background: "#d4ff47",
              padding: "15px 100px",
              borderRadius: "15px",
              border: "none",
              fontWeight: "bold",
              fontSize: "18px",
              fontFamily: "var(--font-nova-square)",
              cursor: isSubmitDisabled ? "not-allowed" : "pointer",
              opacity: isSubmitDisabled ? 0.5 : 1,
              transition: "0.3s",
              color: "#1a1a1a"
            }}
          >
            {isSubmitting ? "Submitting..." : isFinalizingRecording ? "Preparing..." : "Submit"}
          </button>
        }
      />
    </InterviewLayout>
  );
}