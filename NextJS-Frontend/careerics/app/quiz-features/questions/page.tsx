"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import Interview from "@/components/ui/interview";
import { useAuth } from "@/providers/auth-provider";
import { careerService } from "@/services";
import type {
  APICareerEvaluationRead,
  APICareerQuestionResponse,
  APICareerSelectedCardRead,
} from "@/types";
import { getCareerBookmarks, toggleCareerBookmark } from "@/lib/career-bookmarks";

interface QuestionGroup {
  groupId: string;
  title: string;
  cardType: "hobby" | "technical";
  questions: APICareerQuestionResponse[];
}

function getQuestionCardId(question: APICareerQuestionResponse): string {
  if (question.type === "hobby") {
    return question.hobby_id || "unknown-hobby";
  }

  return question.technical_skill_id || "unknown-technical";
}

function buildQuestionGroups(
  questions: APICareerQuestionResponse[],
  selectedCards: APICareerSelectedCardRead[],
): QuestionGroup[] {
  const selectedCardMap = new Map<string, APICareerSelectedCardRead>();
  for (const card of selectedCards) {
    selectedCardMap.set(card.id, card);
  }

  const grouped = new Map<string, QuestionGroup>();

  for (const question of questions) {
    const cardId = getQuestionCardId(question);
    const fallbackTitle = question.type === "hobby" ? "Hobby" : "Technical";
    const cardName = selectedCardMap.get(cardId)?.name || fallbackTitle;

    if (!grouped.has(cardId)) {
      grouped.set(cardId, {
        groupId: cardId,
        title: cardName,
        cardType: question.type,
        questions: [],
      });
    }

    grouped.get(cardId)?.questions.push(question);
  }

  const ordered: QuestionGroup[] = [];

  for (const selected of selectedCards) {
    const group = grouped.get(selected.id);
    if (!group) {
      continue;
    }

    group.title = selected.name;
    ordered.push(group);
    grouped.delete(selected.id);
  }

  for (const group of grouped.values()) {
    ordered.push(group);
  }

  return ordered;
}

export default function CareerQuestionsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";
  const { user, isLoading: isAuthLoading } = useAuth();

  const [questionGroups, setQuestionGroups] = useState<QuestionGroup[]>([]);
  const [currentStepId, setCurrentStepId] = useState(1);
  const [unlockedStepId, setUnlockedStepId] = useState(1);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [results, setResults] = useState<APICareerEvaluationRead | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [bookmarkedTrackIds, setBookmarkedTrackIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadQuestions = async () => {
      if (!sessionId) {
        setError("Missing sessionId. Restart the quiz from the career page.");
        setIsLoadingQuestions(false);
        return;
      }

      setIsLoadingQuestions(true);
      setError(null);

      const [questionsResponse, selectedCardsResponse] = await Promise.all([
        careerService.getQuestionsForSession(sessionId),
        careerService.getSelectedCards(sessionId),
      ]);

      if (cancelled) {
        return;
      }

      if (!questionsResponse.success) {
        setError(questionsResponse.message || "Unable to load quiz questions.");
        setIsLoadingQuestions(false);
        return;
      }

      const loadedQuestions = questionsResponse.data || [];
      const selectedCards = selectedCardsResponse.success ? selectedCardsResponse.data || [] : [];
      const groupedQuestions = buildQuestionGroups(loadedQuestions, selectedCards);

      if (!groupedQuestions.length) {
        setError("No questions were found for this session. Re-select cards and try again.");
        setIsLoadingQuestions(false);
        return;
      }

      setQuestionGroups(groupedQuestions);
      setRatings({});
      setCurrentStepId(1);
      setUnlockedStepId(1);
      setResults(null);
      setIsFinished(false);
      setIsLoadingQuestions(false);
    };

    void loadQuestions();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const sidebarSteps = useMemo(() => {
    return questionGroups.map((group, index) => ({
      id: index + 1,
      title: group.title,
      text: `${group.questions.length} question${group.questions.length === 1 ? "" : "s"}`,
    }));
  }, [questionGroups]);

  const allQuestions = useMemo(() => {
    return questionGroups.flatMap((group) => group.questions);
  }, [questionGroups]);

  const currentGroup = questionGroups[currentStepId - 1] || null;
  const allAnswered = allQuestions.length > 0 && allQuestions.every((question) => Boolean(ratings[question.id]));

  useEffect(() => {
    if (isAuthLoading || !isFinished) {
      return;
    }

    const bookmarks = getCareerBookmarks(user?.id);
    setBookmarkedTrackIds(bookmarks.map((item) => item.track_id));
  }, [isAuthLoading, isFinished, user?.id]);

  const handleRate = (questionId: string, value: number) => {
    setRatings((prev) => {
      const next = { ...prev, [questionId]: value };

      if (
        currentGroup &&
        currentStepId === unlockedStepId &&
        currentStepId < questionGroups.length &&
        currentGroup.questions.every((question) => Boolean(next[question.id]))
      ) {
        setUnlockedStepId((prevUnlocked) => Math.min(questionGroups.length, prevUnlocked + 1));
      }

      return next;
    });
  };

  const finishQuiz = async () => {
    if (!sessionId) {
      setError("Missing sessionId. Restart the quiz from the career page.");
      return;
    }

    if (!allAnswered) {
      setError("Please answer all questions before finishing.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const answersPayload = allQuestions.map((question) => ({
      question_id: question.id,
      answer: ratings[question.id],
    }));

    const submitResponse = await careerService.submitAnswers(sessionId, answersPayload);
    if (!submitResponse.success) {
      setIsSubmitting(false);
      setError(submitResponse.message || "Unable to submit your answers.");
      return;
    }

    const evaluateResponse = await careerService.evaluateCareerQuiz(sessionId);
    if (evaluateResponse.success && evaluateResponse.data) {
      setResults(evaluateResponse.data);
      setIsFinished(true);
      setIsSubmitting(false);
      return;
    }

    // Fallback if evaluation already exists for this session.
    const cachedResponse = await careerService.getCareerResults(sessionId);
    if (cachedResponse.success && cachedResponse.data) {
      setResults(cachedResponse.data);
      setIsFinished(true);
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);
    setError(evaluateResponse.message || cachedResponse.message || "Unable to evaluate your quiz right now.");
  };

  const handleNext = () => {
    if (!currentGroup) {
      return;
    }

    const unansweredQuestions = currentGroup.questions.filter((question) => !ratings[question.id]);

    if (unansweredQuestions.length) {
      setError(`Please answer all questions for ${currentGroup.title} first.`);
      return;
    }

    setError(null);

    if (currentStepId < questionGroups.length) {
      const nextStep = currentStepId + 1;
      setCurrentStepId(nextStep);
      if (nextStep > unlockedStepId) {
        setUnlockedStepId(nextStep);
      }
      return;
    }

    void finishQuiz();
  };

  const handleToggleBookmark = (trackId: string) => {
    const selectedTrack = results?.track_scores.find((item) => item.track_id === trackId);
    if (!selectedTrack) {
      return;
    }

    const { bookmarks } = toggleCareerBookmark(selectedTrack, user?.id);
    setBookmarkedTrackIds(bookmarks.map((item) => item.track_id));
  };

  if (!isFinished) {
    return (
      <Interview
        questions={sidebarSteps}
        currentActiveId={currentStepId}
        unlockedStepId={unlockedStepId}
        onQuestionClick={(id) => {
          if (id <= unlockedStepId) {
            setCurrentStepId(id);
          }
        }}
        title="Career Quiz"
        label="Step"
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: "4vh 4vw",
            boxSizing: "border-box",
            gap: "3vh",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
              justifyContent: "center",
              overflowY: "auto",
            }}
          >
            {isLoadingQuestions ? (
              <div style={{ color: "#E5E7EB", textAlign: "center", fontSize: "2.2vh" }}>
                Loading quiz questions...
              </div>
            ) : currentGroup ? (
              <>
                {currentGroup.questions.map((question) => (
                  <div
                    key={question.id}
                    style={{
                      backgroundColor: "#222939",
                      borderRadius: "4vh",
                      padding: "4vh 2vw",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2.5vh",
                      border: "0.1vh solid rgba(255, 255, 255, 0.03)",
                    }}
                  >
                    <p
                      style={{
                        color: "#D1D5DB",
                        fontSize: "2.2vh",
                        fontFamily: "var(--font-nova-square)",
                        margin: 0,
                        textAlign: "center",
                      }}
                    >
                      {question.text}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2.5vw",
                        flexWrap: "wrap",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ color: "#FFB2B2", fontSize: "2.2vh", fontWeight: 600 }}>
                        Strongly Disagree
                      </span>

                      <div style={{ display: "flex", alignItems: "center", gap: "1.8vw" }}>
                        {[1, 2, 3, 4, 5].map((value) => {
                          const sizes = ["5vh", "4vh", "2.8vh", "4vh", "5vh"];
                          const isSelected = ratings[question.id] === value;

                          return (
                            <div
                              key={value}
                              onClick={() => handleRate(question.id, value)}
                              style={{
                                width: sizes[value - 1],
                                height: sizes[value - 1],
                                borderRadius: "50%",
                                backgroundColor: isSelected ? "#B8EF46" : "#6B7280",
                                cursor: "pointer",
                                transition: "all 0.3s ease",
                                transform: isSelected ? "scale(1.08)" : "scale(1)",
                              }}
                            />
                          );
                        })}
                      </div>

                      <span style={{ color: "#E6FFB2", fontSize: "2.2vh", fontWeight: 600 }}>
                        Strongly Agree
                      </span>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div style={{ color: "#FFD3D3", textAlign: "center", fontSize: "2.2vh" }}>
                {error || "Questions are not available for this session."}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1.2vh" }}>
            {error ? (
              <p style={{ color: "#FFD3D3", margin: 0, fontSize: "1.9vh" }}>
                {error}
              </p>
            ) : null}

            <Button
              onClick={handleNext}
              disabled={isLoadingQuestions || isSubmitting || !currentGroup}
              style={{
                alignSelf: "flex-end",
                backgroundColor: "#B8EF46",
                color: "#000",
                padding: "1.5vh 5vw",
                borderRadius: "1.2vh",
                fontSize: "2.2vh",
                fontWeight: 800,
                height: "auto",
                minWidth: "15vw",
                opacity: isLoadingQuestions || isSubmitting || !currentGroup ? 0.6 : 1,
              }}
            >
              {isSubmitting ? "Submitting..." : currentStepId === questionGroups.length ? "Finish" : "Next"}
            </Button>
          </div>
        </div>
      </Interview>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "5vh",
        padding: "2rem",
      }}
    >
      <h1 style={{ color: "#fff", fontSize: "5vh", fontFamily: "var(--font-nova-square)", margin: 0 }}>
        Your Best Matches Are
      </h1>

      <div
        style={{
          display: "flex",
          gap: "1.3rem",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "100%",
          maxWidth: "1200px",
        }}
      >
        {(results?.track_scores || []).map((track) => (
          <div
            key={track.track_id}
            style={{
              width: "min(320px, 90vw)",
              backgroundColor: "#1C427B",
              borderRadius: "3vh",
              padding: "4vh 1.3rem 3.2vh 1.3rem",
              display: "flex",
              flexDirection: "column",
              gap: "2vh",
              position: "relative",
            }}
          >
            <button
              type="button"
              onClick={() => handleToggleBookmark(track.track_id)}
              aria-label={bookmarkedTrackIds.includes(track.track_id) ? "Remove bookmark" : "Bookmark track"}
              style={{
                position: "absolute",
                top: "2.5vh",
                right: "1rem",
                width: "5vh",
                height: "5vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: bookmarkedTrackIds.includes(track.track_id) ? "#D4EF9F" : "#EAF1FF",
                padding: 0,
              }}
            >
              <Bookmark
                size={20}
                strokeWidth={2.1}
                className={bookmarkedTrackIds.includes(track.track_id) ? "fill-current" : undefined}
              />
            </button>

            <img
              src="/Landing/Rectangle.svg"
              alt={track.track_name}
              style={{ width: "15vh", height: "auto", alignSelf: "flex-start" }}
            />

            <h2 style={{ color: "#fff", fontSize: "3vh", margin: 0, fontFamily: "var(--font-nova-square)" }}>
              {track.track_name}
            </h2>

            <p style={{ margin: 0, color: "#E6FFB2", fontWeight: 700, fontSize: "2vh" }}>
              Match Score: {track.score}%
            </p>

            <p style={{ color: "#A0AEC0", fontSize: "1.9vh", margin: 0, lineHeight: "1.4" }}>
              {track.track_description || "This track aligns strongly with your selected cards and responses."}
            </p>

            <Link
              href={`/quiz-features/blog?jobTitle=${encodeURIComponent(track.track_name)}`}
              style={{ textDecoration: "none" }}
            >
              <Button
                style={{
                  backgroundColor: "#C1CBE6",
                  color: "#000000",
                  padding: "2vh 2vw",
                  height: "6vh",
                  width: "100%",
                  borderRadius: "1vh",
                  marginTop: "1vh",
                  fontSize: "2vh",
                  minHeight: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                Learn More
              </Button>
            </Link>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "2vw", flexWrap: "wrap", justifyContent: "center" }}>
        <Button
          onClick={() => {
            if (sessionId) {
              router.push(`/quiz-features/hobbies?sessionId=${encodeURIComponent(sessionId)}`);
            } else {
              router.push("/features/career");
            }
          }}
          style={{
            backgroundColor: "#C3D1F0",
            color: "#000",
            padding: "1vh 4vw",
            borderRadius: "1.5vh",
            height: "auto",
            fontWeight: 800,
          }}
        >
          Redo Quiz
        </Button>

        <Link href="/features/career" style={{ textDecoration: "none" }}>
          <Button
            style={{
              backgroundColor: "#B8EF46",
              color: "#000",
              padding: "0 3vw",
              height: "6vh",
              borderRadius: "1.5vh",
              fontSize: "2vh",
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              whiteSpace: "nowrap",
              width: "fit-content",
            }}
          >
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
