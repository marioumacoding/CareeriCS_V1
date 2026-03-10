/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const Sidebar = () => {
  const pathname = usePathname();
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);

  const navItems = [
    { text: "Home", image: "/sidebar/Home.svg", path: "/features/home" },
    { text: "Career Exploration", image: "/sidebar/Career.svg", path: "/features/career" },
    { text: "Roadmap", image: "/sidebar/Roadmap.svg", path: "/features/roadmap" },
    { text: "Courses", image: "/sidebar/Courses.svg", path: "/features/courses" },
    { text: "Skill Assessment", image: "/sidebar/Skill.svg", path: "/features/skill" },
    { text: "CV Crafting", image: "/sidebar/CV.svg", path: "/features/cv" },
    { text: "Mock Interview", image: "/sidebar/Interview.svg", path: "/features/interview" },
    { text: "Job Applications", image: "/sidebar/Job.svg", path: "/features/job" },
  ];

  return (
    <aside
      style={{
        width: "15vw",
        height: "100vh",
        backgroundColor: "var(--bg-color)",
        paddingTop: "3vh",
        paddingBottom: "3vh",
        paddingLeft: "1.7vw",
        paddingRight: "2vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        color: "#fff",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          fontSize: "clamp(1.5rem, 2vw, 2rem)",
          marginBottom: "2vh",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        CareeriCS
      </div>

      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 5 }}>
        {navItems.map((item, i) => {
          const isHovered = hoveredNav === i;
          // Check if the current URL matches the item's path
          const isActive = pathname === item.path;
          
          // Show green background if hovered OR if it's the current page
          const shouldHighlight = isHovered || isActive;

          const currentImage = shouldHighlight
            ? item.image.replace(".svg", " -selected.svg")
            : item.image;

          return (
            <Link key={i} href={item.path} style={{ textDecoration: "none" }}>
              <div
                onMouseEnter={() => setHoveredNav(i)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  padding: "2.3vh",
                  marginLeft: "0.5vw",
                  // Text turns black if highlighted, white otherwise
                  color: shouldHighlight ? "#000" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  backgroundColor: shouldHighlight ? "var(--primary-green)" : "transparent",
                  borderRadius: 15,
                  transition: "0.2s",
                }}
              >
                <img
                  src={currentImage}
                  alt={item.text || "icon"}
                  style={{
                    width: "auto",
                    height: "4vh",
                    flexShrink: 0,
                    objectFit: "contain",
                  }}
                />
                {item.text}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* PROFILE SECTION */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginTop: "auto",
          marginBottom: "2vh",
          height: "10vh",
          borderTop: "3px solid #fff",
        }}
      >
        <img
          src="/sidebar/Profile.svg"
          alt="User Account"
          style={{
            width: "auto",
            height: "6vh",
            flexShrink: 0,
          }}
        />

        <div
          style={{
            fontSize: "1rem",
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          John Doe
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;