"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import InterviewLayout from "@/components/ui/interview";
import InterviewContainer from "@/components/ui/interview-card";
import { useInterviewFlow } from "@/hooks";
import { interviewService } from "@/services/interview.service";

export default function LastAnalysisPage() {
  const router = useRouter();
  const {
    sessionId,
    currentQ,
    questions,
    questionsError,
    buildRecordingUrl,
  } = useInterviewFlow();

  const [isPreparing, setIsPreparing] = useState(true);
  const [reportError, setReportError] = useState("");

  const reportUrl = useMemo(() => {
    if (!sessionId) {
      return "";
    }

    return interviewService.getSessionReportUrl(sessionId);
  }, [sessionId]);

  useEffect(() => {
    let alive = true;

    const warmupReport = async () => {
      if (!sessionId || !reportUrl) {
        if (alive) {
          setReportError("Session is missing. Please retry the interview flow.");
          setIsPreparing(false);
        }
        return;
      }

      try {
        const response = await fetch(reportUrl);

        if (!alive) {
          return;
        }

        if (!response.ok) {
          setReportError("Report is not ready yet. You can retry download below.");
        }
      } catch {
        if (!alive) {
          return;
        }

        setReportError("Could not reach report service. You can retry download below.");
      } finally {
        if (alive) {
          setIsPreparing(false);
        }
      }
    };

    warmupReport();

    return () => {
      alive = false;
    };
  }, [sessionId, reportUrl]);

  const layoutQuestions = questions.map((q) => ({
    ...q,
    title: q.text,
  }));

  const lastStep = questions.length || currentQ || 1;

  const onDownloadReport = () => {
    if (!reportUrl) {
      setReportError("Missing session report link.");
      return;
    }

    window.open(reportUrl, "_blank", "noopener,noreferrer");
  };

  if (isPreparing) {
    return (
      <InterviewLayout
        title="Last Analysis"
        questions={layoutQuestions}
        currentActiveId={lastStep}
        unlockedStepId={lastStep}
        onQuestionClick={() => {}}
        closeIconSrc="/interview/Close.svg"
        closeRoute="/features/interview"
      >
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            paddingTop: "10vh",
            height: "100%",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "24px",
              fontFamily: "var(--font-nova-square)",
              marginBottom: "100px",
              maxWidth: "600px",
            }}
          >
            Our model is preparing your final analysis report,
            <br />
            give us a moment.
          </h2>

          <img
            src="/interview/analyzing.svg"
            alt="Preparing analysis"
            style={{
              width: "300px",
              filter: "drop-shadow(0 0 20px rgba(168, 85, 247, 0.4))",
            }}
          />
        </div>
      </InterviewLayout>
    );
  }

  return (
    <InterviewLayout
      title="Last Analysis"
      questions={layoutQuestions}
      currentActiveId={lastStep}
      unlockedStepId={lastStep}
      onQuestionClick={() => {}}
      closeIconSrc="/interview/Close.svg"
      closeRoute="/features/interview"
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 40px",
        }}
      >
        <div
          style={{
            textAlign: "left",
            width: "100%",
            maxWidth: "850px",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "24px",
              fontFamily: "var(--font-nova-square)",
              margin: "0 0 10px 0",
            }}
          >
            Ready to see your interview highlights?
          </h2>
          <p
            style={{
              color: "white",
              fontSize: "18px",
              fontFamily: "var(--font-nova-square)",
              opacity: 0.9,
              margin: 0,
            }}
          >
            Download the analysis below.
          </p>
          {reportError && (
            <p
              style={{
                color: "#fca5a5",
                fontSize: "14px",
                marginTop: "12px",
                fontFamily: "var(--font-nova-square)",
              }}
            >
              {reportError}
            </p>
          )}
          {questionsError && (
            <p
              style={{
                color: "#fca5a5",
                fontSize: "14px",
                marginTop: "8px",
                fontFamily: "var(--font-nova-square)",
              }}
            >
              {questionsError}
            </p>
          )}
        </div>

        <InterviewContainer
          questionTitle=""
          videoBoxStyle={{
            background: "rgba(186.35, 186.35, 186.35, 0.50)",
            width: "76%",
            height: "390px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
          }}
          videoContent={
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "60px",
                padding: "20px",
                backgroundColor: "transparent",
              }}
            >
              <div
                style={{
                  width: "220px",
                  height: "310px",
                  backgroundColor: "white",
                  borderRadius: "30px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px",
                }}
              >
                <button
                  onClick={onDownloadReport}
                  style={{
                    backgroundColor: "#d4ff47",
                    color: "#1a1a1a",
                    border: "none",
                    padding: "14px 40px",
                    borderRadius: "12px",
                    fontWeight: "bold",
                    width: "260px",
                    cursor: "pointer",
                    fontFamily: "var(--font-nova-square)",
                    fontSize: "16px",
                  }}
                >
                  Download
                </button>

                <span
                  style={{
                    color: "white",
                    fontSize: "14px",
                    opacity: 0.8,
                    fontFamily: "var(--font-nova-square)",
                  }}
                >
                  or
                </span>

                <button
                  onClick={onDownloadReport}
                  style={{
                    backgroundColor: "white",
                    color: "#1a1a1a",
                    border: "none",
                    padding: "12px 20px",
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "260px",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  <img src="/interview/drive.svg" style={{ width: "20px" }} alt="Drive" />
                  Open with Google Drive
                </button>
              </div>
            </div>
          }
          style={{ background: "transparent" }}
        />

        <div style={{ display: "flex", gap: "40px", marginTop: "60px" }}>
          <button
            onClick={() =>
              router.push(
                buildRecordingUrl({
                  q: "1",
                  followup: null,
                  followupId: null,
                  followupMode: false,
                  questionId: null,
                })
              )
            }
            style={{
              backgroundColor: "#d4ff47",
              color: "black",
              padding: "14px 60px",
              borderRadius: "15px",
              border: "none",
              fontWeight: 700,
              fontSize: "16px",
              cursor: "pointer",
              fontFamily: "var(--font-nova-square)",
            }}
          >
            Practice more
          </button>
          <button
            onClick={() => router.push("/features/home")}
            style={{
              backgroundColor: "#CBD5E1",
              color: "black",
              padding: "14px 60px",
              borderRadius: "15px",
              border: "none",
              fontWeight: 700,
              fontSize: "16px",
              cursor: "pointer",
              fontFamily: "var(--font-nova-square)",
            }}
          >
            Go back to home
          </button>
        </div>
      </div>
    </InterviewLayout>
  );
}