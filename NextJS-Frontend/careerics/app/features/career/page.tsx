"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ChoiceCard from "@/components/ui/choice-card-home";

export default function CareerDiscoveryPage() {
  const router = useRouter();

  const careerPaths = [
  {
    title: "Backend Development",
    desc: "Build APIs, databases, and server systems that handle logic, data, and security.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Frontend Development",
    desc: "Develop responsive interfaces and interactive features users see and use.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "UI/UX Design",
    desc: "Design user-friendly layouts and experiences that improve usability and navigation.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Data Science",
    desc: "Analyze large datasets to discover patterns, insights, and support decisions.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Machine Learning",
    desc: "Create models that learn from data to automate tasks and make predictions.",
    image: "/Landing/Rectangle.svg",
  },
  {
    title: "Cybersecurity",
    desc: "Secure systems, networks, and data by detecting threats and preventing attacks.",
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
            onClick={() => router.push("/quiz-features/hobbies")}
            style={{
              backgroundColor: "#142143",
              borderRadius: "4vh",
              padding: "3vh",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              cursor: "pointer",
              height: "100%",
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
            </div>

            <div style={{ fontSize: "4vh" }}>❯</div>
          </div>
        </div>

        {/* Career Paths */}
        <div
          style={{
            gridArea: "3 / 1 / 8 / 7",
            backgroundColor: "#1C427B",
            borderRadius: "4vh",
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
                gap: "1vh",
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
                  buttonVariant="primary-inverted"
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