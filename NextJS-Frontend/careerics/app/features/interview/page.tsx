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

  const [hoveredNav, setHoveredNav] = useState<number | string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        backgroundColor: "#000",
        fontFamily: "monospace",
        overflow: "hidden",
      }}
    >
      {/* SIDEBAR */}
      <aside
        style={{
          width: "220px",
          backgroundColor: "#000",
          padding: "45px 16px",
          display: "flex",
          flexDirection: "column",
          color: "#fff",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            fontSize: "24px",
            fontWeight: "bold",
            marginBottom: 15,
            marginLeft: "1rem",
            fontFamily: "var(--font-nova-square)",
          }}
        >
          CareeriCS
        </div>

        {/* SEARCH */}
        <div style={{ marginBottom: 20, position: "relative" }}>
          <input
            type="text"
            placeholder="search"
            style={{
              width: "80%",
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
              right: 30,
              top: 10,
              color: "#666",
            }}
          >
            🔍
          </span>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
          {/* HOME */}
          <div
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              fontSize: 14,
              color: "#fff",
              // fontWeight: "bold",
              marginTop: -10,
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

      {/* MAIN CONTENT OUTER CONTAINER */}
      <main
        style={{
          flex: 1,
          height: "calc(100vh - 40px)",
          marginTop: "20px",
          marginBottom: "20px",
          marginRight: "20px",
          overflow: "hidden",
          position: "relative",
          backgroundImage: "url('/interview/Page bg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center 20px",
          backgroundRepeat: "no-repeat",
          borderRadius: "24px",
        }}
      >
        {/* BLUE PILL */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "55%",
            backgroundColor: "transparent",
            paddingTop: "30px",
            paddingRight: "24px",
            paddingLeft: "24px",
            paddingBottom: "8px",
            fontSize: 24,
            fontWeight: "700",
            wordWrap: 'break-word',
            textAlign: "center",
            color: "#fff",
            fontFamily: "jura",
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 15% 100%)",
            zIndex: 10,
          }}
        >
          Practice makes perfect...
        </div>

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
          <h1
            style={{
              fontSize: 30,
              fontWeight: "400",
              fontFamily: "var(--font-nova-square)",
              marginTop: "-1px",
              marginBottom: "5px",

              textShadow: "0 2px 4px rgba(0,0,0,0.5)",
              color: "#000000",
            }}
          >
            Interview Mock-ups
          </h1>

          {/* CARDS */}
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
                <h3 style={{ fontSize: 20, fontWeight: "400", fontFamily: "var(--font-nova-square)", color: "#fff" }}>
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

          {/* TIP SECTION */}
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
              <h4 style={{ fontSize: 15, color: "#fff", margin: 0, fontFamily: "var(--font-nova-square)", fontWeight: "400" }}>Tip of the day</h4>
              <p style={{ color: "#a8c5e0", fontSize: 15, margin: "4px 0 0 0", lineHeight: "1.4" }}>
                Research the company and interviewers before your interview so you get a better understanding of the company’s goals and use this information to show how you will be a great fit.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}