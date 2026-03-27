"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import InterviewLayout from "@/components/ui/interview";
import InterviewContainer from "@/components/ui/interview-card";
import { interviewService } from "@/services/interview.service";
import { useAuth } from "@/providers/auth-provider";
import { useInterviewFlow } from "@/hooks";

const DEBUG_INTERVIEW_FLOW = process.env.NODE_ENV !== "production";

function logRecordingFlow(event: string, payload: Record<string, unknown>) {
  if (!DEBUG_INTERVIEW_FLOW) {
    return;
  }

  console.debug("[InterviewFlow][Recording]", event, payload);
}

export default function RecordingPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const {
    interviewType,
    sessionId,
    followupText,
    followupId,
    followupMode,
    currentQ,
    questions,
    isQuestionsLoading,
    questionsError,
    getQuestionByStep,
    buildRecordingUrl,
    buildAnalyzingUrl,
  } = useInterviewFlow();

  const [activeId, setActiveId] = useState(currentQ);
  const unlockedId = currentQ;

  const [status, setStatus] = useState<"idle" | "recording" | "stopped">("idle");
  const [seconds, setSeconds] = useState(0);
  const [recordedMedia, setRecordedMedia] = useState<Blob | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinalizingRecording, setIsFinalizingRecording] = useState(false);
  const [actionError, setActionError] = useState("");
  const [isSessionCreating, setIsSessionCreating] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [sessionRetryNonce, setSessionRetryNonce] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const previewVideoRef = useRef<HTMLVideoElement | null>(null);
  const sessionCreationInFlightRef = useRef<Promise<void> | null>(null);
  const pendingSubmitRef = useRef(false);

  const currentQuestion = getQuestionByStep(activeId);
  const canonicalQuestion = getQuestionByStep(currentQ);
  const isFollowupMode = followupMode || Boolean(followupId);
  const currentQuestionText = followupText || currentQuestion?.text || "";
  const submitBlockedReason =
    isAuthLoading
      ? "Checking your session..."
      : !user?.id
        ? "Please sign in first so an interview session can be created."
        : sessionError && !sessionId
          ? sessionError
        : !sessionId
          ? (isSessionCreating ? "Preparing your interview session..." : "Interview session is not ready yet. Please retry session setup.")
      : isQuestionsLoading
        ? "Questions are still loading."
        : isSubmitting
          ? "Submission is already in progress."
          : !questions.length
            ? "No questions are available for this interview type."
            : !canonicalQuestion?.questionId
              ? isFollowupMode
                ? "Follow-up context is missing the linked main question. Please go back and try again."
                : "Current question is not ready yet."
              : "";

  const isSubmitDisabled = Boolean(submitBlockedReason);

  useEffect(() => {
    logRecordingFlow("step:sync", {
      q: currentQ,
      currentQ,
      questionsLength: questions.length,
      isQuestionsLoading,
      followupMode,
    });
  }, [currentQ, questions.length, isQuestionsLoading, followupMode]);

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (sessionId || !user?.id || sessionCreationInFlightRef.current) {
      return;
    }

    const request = (async () => {
      setIsSessionCreating(true);
      setSessionError("");

      const payload = {
        name: `${interviewType.toUpperCase()} Mock Interview`,
        type: "HR",
        status: "in_progress",
        user_id: user.id,
      };

      const response = await interviewService.createSession(payload);

      if (!response.success || !response.data?.id) {
        setSessionError(response.message || "Failed to create interview session. Please retry.");
        return;
      }

      logRecordingFlow("session:created", {
        sessionId: response.data.id,
        interviewType,
      });

      router.replace(
        `/interview-feature/recording?type=${interviewType}&sessionId=${response.data.id}&q=1`,
      );
    })()
      .catch((error: unknown) => {
        setSessionError(
          error instanceof Error
            ? error.message
            : "Failed to create interview session. Please retry.",
        );
      })
      .finally(() => {
        sessionCreationInFlightRef.current = null;
        setIsSessionCreating(false);
      });

    sessionCreationInFlightRef.current = request;
  }, [isAuthLoading, sessionId, user?.id, interviewType, router, sessionRetryNonce]);

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
  const retrySessionSetup = () => {
    if (!user?.id || isAuthLoading || isSessionCreating || sessionId) {
      return;
    }

    setActionError("");
    setSessionError("");
    sessionCreationInFlightRef.current = null;
    setSessionRetryNonce((prev) => prev + 1);
  };

  const handleCameraToggle = async () => {
    if (!sessionId || isSessionCreating) {
      setActionError(sessionError || "Please wait while interview session is preparing.");
      return;
    }

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
    if (!sessionId || isSubmitting) {
      return;
    }

    if (!canonicalQuestion?.questionId) {
      return;
    }

    logRecordingFlow("submit:start", {
      q: activeId,
      currentQ,
      questionsLength: questions.length,
      isQuestionsLoading,
      followupMode: isFollowupMode,
      questionId: canonicalQuestion.questionId,
    });

    setIsSubmitting(true);
    setActionError("");

    const submitResponse = await interviewService.submitAnswer(
      sessionId,
      canonicalQuestion.questionId,
      media,
    );

    setIsSubmitting(false);

    if (!submitResponse.success) {
      logRecordingFlow("submit:failed", {
        q: activeId,
        currentQ,
        questionsLength: questions.length,
        message: submitResponse.message || "Failed to submit answer.",
      });
      setActionError(submitResponse.message || "Failed to submit answer.");
      return;
    }

    logRecordingFlow("submit:success", {
      q: activeId,
      currentQ,
      questionsLength: questions.length,
      answerId: submitResponse.data?.answer_id || "",
      followupMode: isFollowupMode,
    });

    if (isFollowupMode) {
      router.push(
        buildAnalyzingUrl({
          q: String(currentQ),
          questionId: canonicalQuestion.questionId,
          answerId: submitResponse.data?.answer_id,
          followupMode: true,
        }),
      );
      return;
    }

    router.push(
      buildAnalyzingUrl({
        q: String(currentQ),
        questionId: canonicalQuestion.questionId,
        answerId: submitResponse.data?.answer_id,
        followupMode: false,
      }),
    );
  };

  const handleSubmit = async () => {
    if (!sessionId || isSubmitting) {
      return;
    }

    if (!canonicalQuestion?.questionId) {
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
    if (isFollowupMode) {
      return;
    }

    pendingSubmitRef.current = false;
    setActiveId(id);

    logRecordingFlow("sidebar:navigate", {
      q: id,
      currentQ,
      questionsLength: questions.length,
      isQuestionsLoading,
      followupMode: isFollowupMode,
    });

    router.replace(
      buildRecordingUrl({
        q: String(id),
        followup: null,
        followupId: null,
        followupMode: false,
        questionId: null,
      }),
    );
    handleReset();
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
        style={{ width: "60px", cursor: isQuestionsLoading ? "not-allowed" : "pointer", opacity: isQuestionsLoading ? 0.5 : 1 }}
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
      title="Interview Questions"
      questions={questions.map(q => ({
        ...q,
        title: q.text
      }))}
      currentActiveId={activeId}    // For Sidebar Expansion
      unlockedStepId={unlockedId}   // For Sidebar Lock Icons
      onQuestionClick={isFollowupMode ? () => {} : onQuestionClick}
      closeIconSrc="/interview/Close.svg"
      closeRoute="/features/interview"
    >
      <InterviewContainer
        // STICKY TITLE: Always shows the unlocked question
        questionTitle={`${unlockedId}. ${currentQuestionText}`}
        videoContent={
          <div style={{ color: "white", fontSize: "18px", textAlign: "center" }}>
            {isQuestionsLoading
              ? "Loading questions..."
              : questionsError || actionError
                ? questionsError || actionError
                  : isAuthLoading
                    ? "Checking your session..."
                    : !sessionId && !user?.id
                      ? "Please sign in to start interview session."
                      : !sessionId
                        ? "Preparing your interview session..."
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
          !sessionId ? (
            <button
              onClick={retrySessionSetup}
              disabled={isAuthLoading || isSessionCreating || !user?.id}
              title={submitBlockedReason || undefined}
              style={{
                background: "#d4ff47",
                padding: "15px 100px",
                borderRadius: "15px",
                border: "none",
                fontWeight: "bold",
                fontSize: "18px",
                fontFamily: "var(--font-nova-square)",
                cursor: isAuthLoading || isSessionCreating || !user?.id ? "not-allowed" : "pointer",
                opacity: isAuthLoading || isSessionCreating || !user?.id ? 0.5 : 1,
                transition: "0.3s",
                color: "#1a1a1a"
              }}
            >
              {isSessionCreating ? "Preparing Session..." : "Retry Session Setup"}
            </button>
          ) : (
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
          )
        }
      />
    </InterviewLayout>
  );
}