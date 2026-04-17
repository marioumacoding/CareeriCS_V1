"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation"; 
import ChoiceCard from "@/components/ui/choice-card";
import { useAuth } from "@/providers/auth-provider";
import { careerService } from "@/services";

export default function CareerDiscoveryPage() {
  const router = useRouter(); 
  const { user, isLoading: isAuthLoading } = useAuth();

  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const careerPaths = [
    {
      title: "Backend",
      desc: "Power applications with secure, scalable logic.",
      image: "/Landing/Rectangle.svg",
    },
    {
      title: "Backend",
      desc: "Power applications with secure, scalable logic.",
      image: "/Landing/Rectangle.svg",
    },
    {
      title: "Backend",
      desc: "Power applications with secure, scalable logic.",
      image: "/Landing/Rectangle.svg",
    },
    {
      title: "Backend",
      desc: "Power applications with secure, scalable logic.",
      image: "/Landing/Rectangle.svg",
    },
    {
      title: "Backend",
      desc: "Power applications with secure, scalable logic.",
      image: "/Landing/Rectangle.svg",
    },
  ];

  const [startIndex, setStartIndex] = useState(0);

  const visibleCards = careerPaths.slice(startIndex, startIndex + 4);

  const handleNext = () => {
    if (startIndex + 4 < careerPaths.length) {
      setStartIndex(startIndex + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(startIndex - 1);
    }
  };

  const handleStartQuiz = async () => {
    if (isStartingQuiz || isAuthLoading) {
      return;
    }

    if (!user?.id) {
      setStartError("Please sign in first to start the career quiz.");
      router.push("/auth/login?callbackUrl=/features/career");
      return;
    }

    setStartError(null);
    setIsStartingQuiz(true);

    const response = await careerService.createSession({ user_id: user.id });

    if (!response.success || !response.data?.id) {
      setIsStartingQuiz(false);
      setStartError(response.message || "Unable to start the quiz right now. Please try again.");
      return;
    }

    router.push(`/quiz-features/hobbies?sessionId=${encodeURIComponent(response.data.id)}`);
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        padding: "2vh 2vw",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gridTemplateRows: "1.6fr repeat(4, 1fr)",
          gridColumnGap: "1.5vw",
          gridRowGap: "1vh",
          flex: 1,
          height: "100%",
        }}
      >
        {/* Quiz Banner */}
        <div style={{ gridArea: "1 / 1 / 2 / 5" }}>
          <div
            onClick={() => {
              void handleStartQuiz();
            }}
            style={{
              backgroundColor: "#142143",
              borderRadius: "2vh",
              padding: "3vh 3vw",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: isStartingQuiz || isAuthLoading ? "wait" : "pointer",
              height: "100%",
              opacity: isStartingQuiz ? 0.8 : 1,
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "3.5vh",
                  marginBottom: "1.5vh",
                  fontFamily: "var(--font-nova-square)",
                }}
              >
                Start career quiz
              </h2>

              <p
                style={{
                  fontSize: "2vh",
                  opacity: 0.8,
                  maxWidth: "50vw",
                }}
              >
                Choose your favorite hobbies and activities, then answer a few personalized questions. 
Just like that you’ll get your best fit career choices
              </p>

              {startError ? (
                <p style={{ marginTop: "1vh", color: "#FFD3D3", fontSize: "1.8vh" }}>
                  {startError}
                </p>
              ) : null}
            </div>

            <div style={{ fontSize: "4vh" }}>
              {isStartingQuiz ? "…" : "❯"}
            </div>
          </div>
        </div>

        {/* Career Paths */}
        <div
          style={{
            gridArea: "2 / 1 / 6 / 5",
            backgroundColor: "#1C427B",
            borderRadius: "3vh",
            padding: "3vh 2vw",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "3.5vh",
              marginBottom: "3vh",
              fontFamily: "var(--font-nova-square)",
            }}
          >
            Discover more career paths
          </h2>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1vw",
              flex: 1,
            }}
          >
            {/* Left Arrow */}
            {startIndex > 0 && (
              <div
                onClick={handlePrev}
                style={{
                  color: "white",
                  fontSize: "3vh",
                  cursor: "pointer",
                }}
              >
                ❮
              </div>
            )}

            {/* Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1.5vw",
                flex: 1,
                height: "100%",
              }}
            >
              {visibleCards.map((path, idx) => (
                <ChoiceCard
                  key={idx}
                  title={path.title}
                  description={path.desc}
                  image={path.image}
                />
              ))}
            </div>

            {/* Right Arrow */}
            {startIndex + 4 < careerPaths.length && (
              <div
                onClick={handleNext}
                style={{
                  color: "white",
                  fontSize: "3vh",
                  cursor: "pointer",
                }}
              >
                ❯
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}