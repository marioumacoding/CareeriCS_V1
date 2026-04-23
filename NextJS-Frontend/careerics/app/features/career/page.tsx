"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { careerService } from "@/services";

export default function CareerDiscoveryPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();

  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [startError, setStartError] = useState<string | null>(null);

  const careerPaths = [
  {
    title: "Backend Development",
    desc: "Build secure APIs, databases, and server-side logic.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Frontend Development",
    desc: "Build responsive interfaces and interactive features for users.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "UI/UX Design",
    desc: "Design user-friendly layouts to improve usability and navigation.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Data Science",
    desc: "Analyze datasets to discover patterns and support decisions.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Machine Learning",
    desc: "Create models to automate tasks and provide predictions.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Cybersecurity",
    desc: "Secure systems and networks by detecting and preventing attacks.",
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
        padding: "40px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "1.6fr repeat(6, 1fr)",
          gridRowGap: "20px",
          flex: 1,
          height: "100%",
        }}
      >
        {/* Quiz Banner */}
        <div style={{ gridArea: "1 / 1 / 3 / 7" }}>
          <div
            onClick={() => {
              void handleStartQuiz();
            }}
            style={{
              backgroundColor: "#142143",
              borderRadius: "4vh",
              padding: "3vh",
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
                  fontSize: "1.2rem",
                  marginBottom: "1.5vh",
                  fontFamily: "var(--font-nova-square)",
                }}
              >
                Start career quiz
              </h2>

              <p
                style={{
                  fontSize: "0.9rem",
                  opacity: 0.8,
                }}
              >
                Choose your favorite hobbies and activities, then answer a few personalized questions.<br/>
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
            gridArea: "3 / 1 / 8 / 7",
            backgroundColor: "#1C427B",
            borderRadius: "4vh",
            padding: "2vh 2vw",
            display: "flex",
            flexDirection: "column",
            marginBottom: "-3vh",
          }}
        >
          <h2
            style={{
              color: "white",
              fontSize: "3.5vh",
              marginBottom: "2vh",
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
                gap: "1vh",
                flex: 1,
                height: "100%",
                marginTop: "-2vh",
              }}
            >
              {visibleCards.map((path, idx) => (
                <ChoiceCard
                  key={idx}
                  title={path.title}
                  description={path.desc}
                  image={path.image}
                  buttonVariant="primary-inverted"
                  buttonLabel="Learn More"
                />
              ))}
            </div>

            {/* Right Arrow */}
            {startIndex + 3 < careerPaths.length && (
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