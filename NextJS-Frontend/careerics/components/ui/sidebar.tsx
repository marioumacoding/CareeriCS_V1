/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import { useAuth } from "@/providers/auth-provider";

const Sidebar = () => {
  const pathname = usePathname();
  const [hoveredNav, setHoveredNav] = useState<number | null>(null);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  async function handleLogout() {
    try {
      await authService.signOut();
      router.push("/auth/login");
    } catch (err: any) {
      console.error("Logout failed:", err.message);
    }
  }

  const profileName = isLoading
    ? "Loading..."
    : user?.displayName?.trim() || "Guest";

  const navItems = [
    { text: "Home", image: "/sidebar/Home.svg", path: "/features/home" },
    { text: "Career Exploration", image: "/sidebar/Career.svg", path: "/features/career" },
    { text: "Roadmaps", image: "/sidebar/Roadmap.svg", path: "/features/roadmap" },
    { text: "Courses Hub", image: "/sidebar/Courses.svg", path: "/features/courses" },
    { text: "Skill Assessment", image: "/sidebar/Skill.svg", path: "/features/skill" },
    { text: "CV Crafting", image: "/sidebar/CV.svg", path: "/features/cv" },
    { text: "Interview Preparation", image: "/sidebar/Interview.svg", path: "/features/interview" },
    { text: "Job Search", image: "/sidebar/Job.svg", path: "/features/job" },
  ];

  return (
    <aside
      style={{
        width: "20vw",
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
          const isActive = pathname === item.path;
          
          // Logic for background color priority
          let backgroundColor = "transparent";
          if (isActive) {
            backgroundColor = "var(--primary-green)"; // Color for active page
          } else if (isHovered) {
            backgroundColor = "var(--hover-green)"; // Soft highlight for hover
          }

          // Icon logic: Use selected icon for active OR hovered
          const currentImage = (isActive || isHovered)
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
                  // Text turns black on green (active), white otherwise (hover/default)
                  color: isActive || isHovered ? "#000" : "#fff",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  backgroundColor: backgroundColor,
                  borderRadius: 15,
                  transition: "0.2s ease-in-out",
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
                    // Optional: adjust brightness of icon if hovered but not active
                    filter: (isHovered && !isActive) ? "brightness(0.8)" : "none"
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
          marginTop: "2vh",
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
          onClick={handleLogout}
          style={{
            fontSize: "1rem",
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            cursor: "pointer"
          }}
        >
          {profileName}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;