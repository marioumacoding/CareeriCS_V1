"use client";
import React, { useState } from "react";

export default function Page() {
  const navItems = [
    { text: "Roadmap", image: "/sidebar/Roadmap.svg" },
    { text: "Courses", image: "/sidebar/Course.svg" },
    { text: "Skill Assessment", image: "/sidebar/skill.svg" },
    { text: "CV Crafting", image: "/sidebar/CV.svg" },
    { text: "Mock Interview", image: "/sidebar/person.svg" },
    { text: "Job Applications", image: "/sidebar/Job.svg" },
  ];

  const cards = [
    {
      title: "Behavioral Mock Interview",
      description:
        "Practice answering the most common interview questions and improve how you present yourself.",
      button: "Start",
      image: "/interview/Hr Interview Icon.svg",
    },
    {
      title: "Technical Mock Interview",
      description:
        "Test your technical knowledge and problem solving skills with questions designed to mirror real interviews.",
      button: "Start",
      image: "/interview/Tech Interview Icon.svg",
    },
    {
      title: "Interview Archive",
      description:
        "Here you will find reports from all your past sessions so you can reflect on your performance.",
      button: "Open",
      image: "/interview/Interview History Icon.svg",
    },
  ];

  const [hoveredNav, setHoveredNav] = useState<number | string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#000",
        fontFamily: "monospace",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "220px",
          backgroundColor: "#000",
          padding: "24px 16px",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: 32,
            marginLeft: "3rem",
            fontFamily: "var(--font-nova-square)",
          }}
        >
          CareeriCS
        </div>

        {/* SEARCH */}
        <div style={{ marginBottom: 32, position: "relative" }}>
          <input
            type="text"
            placeholder="search"
            style={{
              width: "90%",
              padding: "10px 14px",
              backgroundColor: "transparent",
              border: "2px solid #666",
              borderRadius: 20,
              color: "#fff",
              fontSize: 14,
            }}
          />
          <span
            style={{
              position: "absolute",
              right: 12,
              top: 10,
              color: "#666",
            }}
          >
            🔍
          </span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
          {/* HOME */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              fontSize: 14,
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              backgroundColor: hoveredNav === "home" ? "#B8EF46" : "transparent",
              transition: "0.2s",
            }}
            onMouseEnter={() => setHoveredNav("home")}
            onMouseLeave={() => setHoveredNav(null)}
          >
            <img src="/sidebar/Home.svg" alt="Home" style={{ width: 20 }} />
            Home
          </div>

          {/* NAV ITEMS */}
          {navItems.map((item, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                color: hoveredNav === i ? "#000" : "#ACB2D2",
                cursor: "pointer",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 8,
                backgroundColor: hoveredNav === i ? "#B8EF46" : "transparent",
                borderRadius: 6,
                transition: "0.2s",
              }}
              onMouseEnter={() => setHoveredNav(i)}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <img src={item.image} alt={item.text} style={{ width: 20 }} />
              {item.text}
            </div>
          ))}
        </nav>

        {/* PROFILE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            paddingTop: 16,
            borderTop: "1px solid #333",
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              backgroundColor: "#4a5faa",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              color: "#CCFF00",
            }}
          >
            J
          </div>
          <div>
            <div style={{ fontWeight: "bold", fontSize: 14 }}>John Doe</div>
            <div style={{ fontSize: 12, color: "#999" }}>Student</div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main
        style={{
          flex: 1,
          backgroundColor: "#d0d0d0",
          padding: 24,
          borderRadius: "24px",
          margin: "16px 16px 16px 0",
          overflow: "auto",
          position: "relative",
        }}
      >
        {/* CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          {cards.map((card, i) => (
            <div
              key={i}
              style={{
                backgroundColor: hoveredCard === i ? "#2c5aa1" : "#1a3c78",
                borderRadius: 16,
                padding: "32px 24px",
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: 320,
                transition: "0.2s",
                cursor: "pointer",
              }}
              onMouseEnter={() => setHoveredCard(i)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <img
                src={card.image}
                alt={card.title}
                style={{ width: 80, marginBottom: 16 }}
              />

              <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
                {card.title}
              </h3>

              <p style={{ color: "#7d9bc7", fontSize: 13, marginTop: 12 }}>
                {card.description}
              </p>

              <button
                style={{
                  marginTop: "auto",
                  backgroundColor: "#CCFF00",
                  border: "none",
                  padding: "10px 32px",
                  borderRadius: 6,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                {card.button}
              </button>
            </div>
          ))}
        </div>
        {/* TIP SECTION */}
<div
  style={{
    backgroundColor: "#2c5aa1",
    borderRadius: 16,
    padding: "28px 32px",
    display: "flex",
    gap: 20,
  }}
>
  <img src="/interview/Interview Tip.svg" alt="tip" style={{ width: 80 }} />
  <div>
    <h4
      style={{
        fontSize: 20,
        fontFamily: "var(--font-nova-square)",
        fontWeight: "400",
        color: "#fff",
      }}
    >
      Tip of the day
    </h4>
    <p
      style={{
        color: "#a8c5e0",
        fontSize: 13,
        fontFamily: "jura",
        marginTop: 8,
        fontWeight: "600",
      }}
    >
      Research the company and interviewers before your interview so you
      understand the company goals and show how you are a great fit.
    </p>
  </div>
</div>
      </main>
    </div>
  );
}