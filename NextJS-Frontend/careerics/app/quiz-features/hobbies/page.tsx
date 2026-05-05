"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { careerService } from "@/services";
import type { APICareerCardRead, APICareerCardSelectionItem } from "@/types";

export default function HobbiesGrid() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId") || "";

  const [step, setStep] = useState<0 | 1>(0);
  const [hobbyCards, setHobbyCards] = useState<APICareerCardRead[]>([]);
  const [technicalCards, setTechnicalCards] = useState<APICareerCardRead[]>([]);
  const [selectedHobbyIds, setSelectedHobbyIds] = useState<string[]>([]);
  const [selectedTechnicalIds, setSelectedTechnicalIds] = useState<string[]>([]);
  const [isLoadingCards, setIsLoadingCards] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadCards = async () => {
      if (!sessionId) {
        setIsLoadingCards(false);
        setError("Missing career session. Please restart the quiz from career discovery.");
        return;
      }

      setIsLoadingCards(true);
      setError(null);

      const [hobbyResponse, technicalResponse] = await Promise.all([
        careerService.getCardsByType("hobby"),
        careerService.getCardsByType("technical"),
      ]);

      if (cancelled) {
        return;
      }

      if (!hobbyResponse.success || !technicalResponse.success) {
        setError(
          hobbyResponse.message ||
            technicalResponse.message ||
            "Unable to load card choices right now. Please try again.",
        );
        setIsLoadingCards(false);
        return;
      }

      setHobbyCards(hobbyResponse.data || []);
      setTechnicalCards(technicalResponse.data || []);
      setIsLoadingCards(false);
    };

    void loadCards();

    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  const currentCards = step === 0 ? hobbyCards : technicalCards;
  const currentTitle = step === 0
    ? "Choose Your Favorite Intrests"
    : "Choose Your Favorite Technical Skills";
  const currentSubtitle = step === 0
    ? "Step 1 of 2: Choose 3-5 cards"
    : "Step 2 of 2: Choose 3-5 cards";

  const currentSelectionIds = step === 0 ? selectedHobbyIds : selectedTechnicalIds;

  const selectedSummary = useMemo(() => {
    return `${selectedHobbyIds.length} hobbies • ${selectedTechnicalIds.length} technical skills selected`;
  }, [selectedHobbyIds.length, selectedTechnicalIds.length]);

  const toggleCard = (cardId: string) => {
    if (step === 0) {
      setSelectedHobbyIds((prev) =>
        prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId],
      );
      return;
    }

    setSelectedTechnicalIds((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId],
    );
  };

  const handleBack = () => {
    if (step === 1) {
      setStep(0);
      return;
    }
    router.push("/features/career");
  };

  const submitSelections = async () => {
    if (!sessionId) {
      setError("Missing career session. Please restart the quiz.");
      return;
    }

    if (!selectedHobbyIds.length || !selectedTechnicalIds.length) {
      setError("Please select at least one hobby and at least one technical skill.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const selectedCards: APICareerCardSelectionItem[] = [
      ...selectedHobbyIds.map((id) => ({ id, type: "hobby" as const })),
      ...selectedTechnicalIds.map((id) => ({ id, type: "technical" as const })),
    ];

    const response = await careerService.selectCards(sessionId, selectedCards);

    if (!response.success) {
      setIsSubmitting(false);
      setError(response.message || "Unable to save selected cards. Please try again.");
      return;
    }

    router.push(`/quiz-features/questions?sessionId=${encodeURIComponent(sessionId)}`);
  };

  const handleNext = () => {
    if (step === 0) {
      if (!selectedHobbyIds.length) {
        setError("Choose at least one hobby to continue.");
        return;
      }
      setError(null);
      setStep(1);
      return;
    }

    void submitSelections();
  };

  const isCurrentStepValid = currentSelectionIds.length > 0;

  return (
    <div
      style={{
        width: "100%", // Zabatt de men 1000% le 100% 3ashan el layout
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
          <div>
            <h1
              style={{
                color: "#FFFFFF",
                fontSize: "clamp(1.6rem, 3.2vw, 2.4rem)",
                fontFamily: "var(--font-nova-square)",
                margin: 0,
              }}
            >
              {currentTitle}
            </h1>
            <p style={{ color: "#C7D2FE", marginTop: "0.45rem", marginBottom: 0, fontSize: "0.95rem" }}>
              {currentSubtitle}
            </p>
          </div>

          <div
            style={{
              background: "rgba(184, 239, 70, 0.15)",
              border: "1px solid rgba(184, 239, 70, 0.35)",
              color: "#E6FFB2",
              borderRadius: "999px",
              padding: "0.5rem 0.9rem",
              fontSize: "0.9rem",
              fontWeight: 700,
              whiteSpace: "nowrap",
            }}
          >
            {selectedSummary}
          </div>
        </div>

        {error ? (
          <p style={{ margin: 0, color: "#FFD3D3", fontSize: "0.95rem" }}>
            {error}
          </p>
        ) : null}

        <div
          style={{
            background: "linear-gradient(180deg, #1F2A44 0%, #131A2D 100%)",
            borderRadius: "1.6rem",
            width: "100%",
            minHeight: "fit-content",
            padding: "1.5rem",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            boxSizing: "border-box",
          }}
        >
          {isLoadingCards ? (
            <div style={{ color: "#E5E7EB", textAlign: "center", paddingTop: "5rem", fontSize: "1rem" }}>
              Loading available cards...
            </div>
          ) : currentCards.length === 0 ? (
            <div style={{ color: "#E5E7EB", textAlign: "center", paddingTop: "5rem", fontSize: "1rem" }}>
              No cards available for this step yet.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.9rem",
                justifyContent: "flex-start",
              }}
            >
              {currentCards.map((card) => {
                const isSelected = currentSelectionIds.includes(card.id);
                return (
                  <button
                    key={card.id}
                    type="button"
                    onClick={() => toggleCard(card.id)}
                    style={{
                      // Hna el width fit-content
                      width:"fit-content",
                      minWidth:"150px",
                      backgroundColor: isSelected ? "#E6FFB2" : "#1C427B",
                      color: isSelected ? "#111827" : "#F9FAFB",
                      border: isSelected ? "1px solid #D9FF8F" : "1px solid rgba(255, 255, 255, 0.12)",
                      borderRadius: "1rem",
                      padding: "0.7rem 1.2rem",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      minHeight: "3rem",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      whiteSpace:"normal"
                    }}
                  >
                    <div>{card.name}</div>
                    {card.description ? (
                      <div style={{ marginTop: "0.2rem", fontSize: "0.75rem", fontWeight: 500, opacity: 0.8 }}>
                        {card.description}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>
          )}
        </div>

       <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          gap: "0.75rem", 
          width: "100%",
          marginTop: "1rem" 
        }}>
          <Button
            variant="primary-inverted"
            type="button"
            onClick={handleBack}
            style={{
              color: "#111827",
              borderRadius: "0.8rem",
              padding: "0.75rem 1.35rem",
              fontWeight: 700,
              height: "6vh",
              width: "20%", 
              flex: "none"   // <--- Prevent flex-grow
            }}
          >
            {step === 0 ? "Back" : "Previous"}
          </Button>

          <Button
            variant="primary"
            type="button"
            onClick={handleNext}
            disabled={isLoadingCards || !isCurrentStepValid || isSubmitting}
            style={{
              color: "#111827",
              borderRadius: "0.8rem",
              padding: "0.75rem 1.35rem",
              fontWeight: 800,
              width: "20%", 
              height: "6vh",
              flex: "none",   
              opacity: isLoadingCards || !isCurrentStepValid || isSubmitting ? 0.55 : 1,
            }}
          >
            {step === 0 ? "Continue to Technical" : isSubmitting ? "Saving..." : "Start Questions"}
          </Button>
        </div>
      </div>
    </div>
  );
}