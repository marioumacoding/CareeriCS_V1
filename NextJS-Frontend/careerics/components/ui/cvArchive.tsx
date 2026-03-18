"use client";
import React, { useRef } from 'react';

// --- Card 1: Learning Skills (Horizontal Scroll) ---
export const LearningSkillsCard = ({ skills, selected, onSelect, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      backgroundColor: "#1e2b58", borderRadius: "20px", padding: "20px 30px", color: "white",
      display: "flex", flexDirection: "column", justifyContent: "center", position: "relative",
      ...style, marginTop: "50px" 
    }}>
      <h3 style={{ fontSize: "16px", marginBottom: "15px", fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
        Skills you are currently learning
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div ref={scrollRef} style={{ display: "flex", gap: "20px", overflowX: "auto", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          {skills.map((skill: string) => (
            <button
              key={skill}
              onClick={() => onSelect(skill)}
              style={{
                padding: "15px 30px", borderRadius: "10px", border: "none", flexShrink: 0,
                backgroundColor: selected === skill ? "#d4ff47" : "#c1cbe6",
                color: "black", fontWeight: "bold", cursor: "pointer", fontSize: "13px",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              {skill}
            </button>
          ))}
        </div>
        <span onClick={handleScroll} style={{ fontSize: "24px", cursor: "pointer", color: "#c1cbe6" }}>❯</span>
      </div>
    </div>
  );
};

// --- Card 2: Past Tests (Vertical Scroll) ---
export const PastTestsCard = ({ tests, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      backgroundColor: "#1C427B", borderRadius: "20px", padding: "15px", color: "white",
      display: "flex", flexDirection: "column", gap: "5px", position: "relative", ...style 
    }}>
      <h3 style={{ fontSize: "20px", textAlign: "center", marginBottom: "5px", fontFamily: 'var(--font-nova-square)' }}>Past Tests</h3>
      <div ref={scrollRef} style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto", scrollbarWidth: "none", flexGrow: 1 }}>
        {tests.map((test: any) => (
          <div key={test.id} style={{ 
            backgroundColor: "#c1cbe6", borderRadius: "14px", padding: "8px 15px", 
            display: "flex", justifyContent: "space-between", alignItems: "center", color: "black"
          }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>Test-{test.id}</div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>On {test.title}</div>
            </div>
            <div style={{ 
              width: "32px", height: "32px", borderRadius: "50%", 
              border: `2px solid ${test.score > 50 ? '#d4ff47' : '#f44336'}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: "bold"
            }}>{test.score}%</div>
          </div>
        ))}
      </div>
      <div onClick={handleScroll} style={{ textAlign: "right", cursor: "pointer", color: "#c1cbe6", fontSize: "20px", transform: "rotate(90deg)", paddingRight: "10px" }}>❯</div>
    </div>
  );
};

// --- Card 3: More Skills to Test (DYNAMIC SELECTION) ---
export const MoreSkillsCard = ({ skills, selected, onSelect, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: 120, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      backgroundColor: "#1e2b58", borderRadius: "20px", padding: "20px", color: "white",
      display: "flex", flexDirection: "column", position: "relative", ...style 
    }}>
      <h3 style={{ fontSize: "18px", marginBottom: "15px", fontFamily: 'var(--font-nova-square)', fontWeight:"300" }}>More skills to test</h3>
      <div ref={scrollRef} style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", overflowY: "auto", scrollbarWidth: "none", flexGrow: 1 }}>
        {skills.map((skill: string) => (
          <button
            key={skill}
            onClick={() => onSelect(skill)} // Hena bn-update el selection
            style={{
              padding: "15px 5px", borderRadius: "15px", border: "none",
              // LOGIC: Law el skill de heyya el selected, khaliha abiad, law la2 khaliha blue
              backgroundColor: selected === skill ? "#ffffff" : "#1C427B",
              color: selected === skill ? "black" : "white", 
              fontSize: "11px", fontWeight: "500", cursor: "pointer",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              if (selected !== skill) e.currentTarget.style.backgroundColor = "#2d5bb3";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              if (selected !== skill) e.currentTarget.style.backgroundColor = "#1C427B";
            }}
          >
            {skill}
          </button>
        ))}
      </div>
      <div onClick={handleScroll} style={{ textAlign: "right", cursor: "pointer", color: "#c1cbe6", fontSize: "20px", transform: "rotate(90deg)", paddingRight: "10px" }}>❯</div>
    </div>
  );
};