"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InterviewLayout from "@/components/ui/interview";
import { interviewService } from "@/services/interview.service";
import type { APIFollowup } from "@/types";
import { useInterviewFlow } from "@/hooks";

export default function AnalyzingPage() {
  const router = useRouter();

  const {
    interviewType,
    sessionId,
    questionId,
    answerId,
    currentQ,
    questions,
    buildRecordingUrl,
  } = useInterviewFlow();

  const [isFinished, setIsFinished] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [followup, setFollowup] = useState<APIFollowup | null>(null);

  const missingContext = !sessionId || !questionId;

  /**
   * FIX #1 — Convert UIQuestion → Question
   * Required because InterviewLayout expects `title`
   */
  const layoutQuestions = questions.map((q) => ({
    ...q,
    title: q.text,
  }));

  /**
   * FIX #2 — Proper evaluation effect
   */
  useEffect(() => {
    if (missingContext) return;

    let alive = true;

    const evaluate = async () => {
      setIsEvaluating(true);
      setErrorMessage("");
      setFollowup(null);

      const response = await interviewService.evaluateAnswer(
        sessionId,
        questionId
      );

      if (!alive) return;

      if (!response.success || !response.data) {
        setErrorMessage(
          response.message || "Evaluation failed. Please try again."
        );
        setIsFinished(false);
        setIsEvaluating(false);
        return;
      }

      const isFollowupRequired =
        Boolean(response.data.followup_recommended) ||
        Boolean(response.data.followup);

      if (isFollowupRequired) {
        if (!answerId) {
          setErrorMessage(
            "Follow-up is required but answer context is missing."
          );
          setIsFinished(false);
          setIsEvaluating(false);
          return;
        }

        const followupResponse =
          await interviewService.getFollowupByAnswerId(answerId);

        if (!alive) return;

        if (!followupResponse.success || !followupResponse.data) {
          setErrorMessage(
            followupResponse.message ||
            "Could not load follow-up question."
          );
          setIsFinished(false);
          setIsEvaluating(false);
          return;
        }

        setFollowup(followupResponse.data);
      }

      /**
       * FIX #3 — Missing timeout duration
       */
      setTimeout(() => {
        if (!alive) return;
        setIsFinished(true);
        setIsEvaluating(false);
      }, 2000); // 2 seconds delay
    };

    evaluate();

    return () => {
      alive = false;
    };
  }, [sessionId, questionId, answerId, missingContext]);

  /**
   * Navigation logic
   */
  const goToNextMainQuestion = () => {
    if (currentQ < questions.length) {
      const nextQuestion = questions[currentQ];

      router.push(
        buildRecordingUrl({
          type: interviewType,
          sessionId,
          q: String(currentQ + 1),
          questionId: nextQuestion?.questionId || null,
          followup: null,
          followupId: null,
        })
      );
    } else {
      router.push("/features/interview");
    }
  };

  const handleConsent = async (accepted: boolean) => {
    if (!followup) {
      goToNextMainQuestion();
      return;
    }

    if (accepted) {
      router.push(
        buildRecordingUrl({
          type: interviewType,
          sessionId,
          q: String(currentQ),
          followup: followup.text,
          followupId: followup.id,
          questionId,
        }),
      );
      return;
    }

    goToNextMainQuestion();
  };

  const handleNext = () => {
    if (followup) {
      void handleConsent(true);
      return;
    }

    goToNextMainQuestion();
  };

  return (
    <InterviewLayout
      questions={layoutQuestions}
      currentActiveId={currentQ}
      unlockedStepId={currentQ}   // ✅ required prop added
      onQuestionClick={(id: number) => {
        const target = questions.find((q) => q.id === id);

        router.push(
          buildRecordingUrl({
            type: interviewType,
            sessionId,
            q: String(id),
            questionId: target?.questionId || null,
            followup: null,
            followupId: null,
          })
        );
      }}
      closeIconSrc="/interview/Close.svg"
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          paddingBottom: "40px",
        }}
      >
        <h2
          style={{
            color: "white",
            fontSize: "24px",
            fontFamily: "var(--font-nova-square)",
            fontWeight: 400,
            lineHeight: "1.6",
            marginBottom: "50px",
          }}
        >
          {missingContext ? (
            <>Missing session or question context.</>
          ) : errorMessage ? (
            <>{errorMessage}</>
          ) : isEvaluating ? (
            <>
              Our Model is analyzing your answers,
              <br />
              Give us a moment
            </>
          ) : isFinished && followup ? (
            <>
              We need a follow-up answer:
              <br />
              {followup.text}
            </>
          ) : isFinished ? (
            <>
              Analysis finished.
              <br />
              Ready for the next question?
            </>
          ) : (
            <>
              Evaluation is not complete yet.
            </>
          )}
        </h2>

        <div style={{ marginBottom: "60px" }}>
          <img
            src="/interview/analyzing.svg"
            alt="AI Analysis"
            style={{
              width: "300px",
              height: "auto",
              filter: isFinished
                ? "drop-shadow(0 0 20px rgba(212,255,71,0.4))"
                : "drop-shadow(0 0 20px rgba(168,85,247,0.3))",
              transition: "filter 0.5s ease",
            }}
          />
        </div>

        {isFinished && followup && (
          <div
            style={{
              marginBottom: "14px",
              backgroundColor: "rgba(212, 255, 71, 0.2)",
              border: "1px solid rgba(212, 255, 71, 0.7)",
              color: "#d4ff47",
              padding: "8px 16px",
              borderRadius: "999px",
              fontSize: "14px",
              fontFamily: "var(--font-nova-square)",
              letterSpacing: "0.2px",
            }}
          >
            Follow-up optional
          </div>
        )}

        <button
          onClick={handleNext}
          disabled={!isFinished}
          style={{
            backgroundColor: isFinished ? "#d4ff47" : "#BABABA",
            color: "#1a1a1a",
            padding: "12px 60px",
            borderRadius: "14px",
            border: "none",
            fontSize: "18px",
            fontFamily: "var(--font-nova-square)",
            fontWeight: 600,
            cursor: isFinished ? "pointer" : "wait",
            transition: "all 0.5s ease",
            opacity: isFinished ? 1 : 0.8,
          }}
        >
          {followup ? "Answer Follow-up" : "Next Question"}
        </button>

        {isFinished && followup && (
          <button
            onClick={() => void handleConsent(false)}
            style={{
              marginTop: "12px",
              backgroundColor: "#cbd5e1",
              color: "#0f172a",
              padding: "12px 60px",
              borderRadius: "14px",
              border: "none",
              fontSize: "16px",
              fontFamily: "var(--font-nova-square)",
              fontWeight: 600,
              cursor: "pointer",
              opacity: 1,
            }}
          >
            Skip Follow-up
          </button>
        )}
      </div>
    </InterviewLayout>
  );
}