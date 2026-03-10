"use client";
import React, { useState } from "react";

export default function Page() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const cards = [
    {
      title: "Behavioral Mock Interview",
      description: "Practice answering the most common interview questions and improve how you present yourself ans your skills.",
      button: "Start",
      image: "/interview/Hr Interview Icon.svg",
    },
    {
      title: "Technical Mock Interview",
      description: "Test your technical knowledge and problem solving skills with questions designed to mirror real interviews.",
      button: "Start",
      image: "/interview/Tech Interview Icon.svg",
    },
    {
      title: "Interview Archive",
      description: "Here you will find the reports from all of your past sessions, So You can reflect on past performance.",
      button: "Open",
      image: "/interview/Interview History Icon.svg",
    },
  ];

  return (
    <main
      style={{
        flex: 1,
        height: "calc(100vh - 40px)",
        marginTop: "20px",
        marginBottom: "20px",
        marginRight: "20px",
        overflow: "hidden",
        position: "relative",
        backgroundColor: "rgb(255,255,255,0.2)",
        backgroundSize: "cover",
        backgroundPosition: "center 20px",
        backgroundRepeat: "no-repeat",
        borderRadius: "24px",
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
          padding: "30px 24px 20px 24px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
            marginBottom: 10,
            marginTop: 40,
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                backgroundColor: hoveredCard === i ? "#2c5aa1" : "#142143",
                borderRadius: 16,
                padding: "20px 16px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "240px",
                transition: "0.2s",
                cursor: "pointer",
                boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <img
                src={card.image}
                alt={card.title}
                style={{ width: 45, marginBottom: 12 }}
              />
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: "400",
                  fontFamily: "var(--font-nova-square)",
                  color: "#fff",
                }}
              >
                {card.title}
              </h3>
              <p style={{ color: "#d0d8e8", fontSize: 15, marginTop: 8 }}>
                {card.description}
              </p>
              <button
                style={{
                  marginTop: "auto",
                  backgroundColor: "#CCFF00",
                  border: "none",
                  padding: "8px 20px",
                  borderRadius: 6,
                  fontSize: 13,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {card.button}
              </button>
            </div>
          ))}
        </div>

        <div
          style={{
            backgroundColor: "#1C427B",
            borderRadius: 16,
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: "auto",
            marginBottom: "50px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.4)",
          }}
        >
          <img src="/interview/Interview Tip.svg" alt="tip" style={{ width: 45 }} />
          <div>
            <h4
              style={{
                fontSize: 15,
                color: "#fff",
                margin: 0,
                fontFamily: "var(--font-nova-square)",
                fontWeight: "400",
              }}
            >
              Tip of the day
            </h4>
            <p
              style={{
                color: "#a8c5e0",
                fontSize: 15,
                margin: "4px 0 0 0",
                lineHeight: "1.4",
              }}
            >
              Research the company and interviewers before your interview so you
              get a better understanding of the company’s goals and use this
              information to show how you will be a great fit.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}