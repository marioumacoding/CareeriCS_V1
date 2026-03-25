"use client";
import React, { useRef } from 'react';

// --- Card 1: Courses you are currently taking (Checkmark Logic Only) ---
export const CurrentCoursesCard = ({ courses, selected, onSelect, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ left: 250, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      backgroundColor: "#1C427B", borderRadius: "20px", padding: "20px 30px", color: "white",
      display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", ...style 
    }}>
      <h3 style={{ fontSize: "18px", marginBottom: "15px", fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
        Courses you are currently taking
      </h3>
      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <div 
          ref={scrollRef} 
          style={{ 
            display: "flex", gap: "15px", overflowX: "auto", 
            scrollbarWidth: "none", msOverflowStyle: "none" 
          }}
        >
          {courses.map((course: any) => {
            const isCompleted = course.completed === true;
            
            return (
              <div
                key={course.title}
                onClick={() => onSelect(course.title)}
                style={{
                  padding: "20px", borderRadius: "15px", flexShrink: 0, minWidth: "220px",
                  // El lon sabet: ya selected (Light Green) ya default (Grey-Blue)
                  backgroundColor: selected === course.title ? "#E6FFB2" : "#c1cbe6",
                  color: "black", cursor: "pointer", position: "relative", transition: "0.2s"
                }}
              >
                <div style={{ fontWeight: "bold", fontSize: "14px" }}>{course.title}</div>
                <div style={{ fontSize: "10px", opacity: 0.7 }}>by {course.provider}</div>
                
                {/* Status Indicator Circle - Only shows ✓ if completed */}
                <div style={{ 
                  position: "absolute", right: "15px", top: "50%", transform: "translateY(-50%)", 
                  width: "22px", height: "22px", borderRadius: "50%", 
                  border: "2px solid black", display: "flex", alignItems: "center", 
                  justifyContent: "center", fontSize: "14px", fontWeight: "bold",
                  backgroundColor: "transparent", color: "black"
                }}>
                  {isCompleted ? "✓" : ""}
                </div>
              </div>
            );
          })}
        </div>
        <span onClick={handleScroll} style={{ fontSize: "24px", cursor: "pointer", color: "#c1cbe6" }}>❯</span>
      </div>
    </div>
  );
};

// --- Card 2: More fields to discover ---
export const FieldsDiscoverCard = ({ fields, selected, onSelect, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: 120, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      backgroundColor: "#142143", borderRadius: "20px", padding: "20px", color: "white", 
      display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", ...style 
    }}>
      <h3 style={{ fontSize: "20px", marginBottom: "15px", fontFamily: 'var(--font-nova-square)', fontWeight: "100" }}>
        More fields to discover
      </h3>
      
      <div 
        ref={scrollRef} 
        style={{ 
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px", 
          overflowY: "auto", scrollbarWidth: "none", flexGrow: 1, paddingBottom: "40px" 
        }}
      >
        {fields.map((field: string) => (
          <button
            key={field}
            onClick={() => onSelect(field)}
            style={{
              padding: "15px 5px", borderRadius: "12px", border: "none",
              backgroundColor: selected === field ? "#f9f9f7" : "#1C427B",
              color: selected === field ? "black" : "white", 
              fontSize: "11px", fontWeight: "500", cursor: "pointer", transition: "0.2s"
            }}
          >
            {field}
          </button>
        ))}
      </div>

      <div 
        onClick={handleScroll} 
        style={{ 
          position: "absolute", bottom: "10px", left: "50%", transform: "translateX(-50%) rotate(90deg)",
          cursor: "pointer", color: "#c1cbe6", fontSize: "20px", zIndex: 10
        }}
      >
        ❯
      </div>
    </div>
  );
};

// --- Card 3: Completed Courses ---
export const CompletedCoursesCard = ({ courses, style }: any) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const handleScroll = () => {
    if (scrollRef.current) scrollRef.current.scrollBy({ top: 100, behavior: 'smooth' });
  };

  return (
    <div style={{ 
      backgroundColor: "#142143", borderRadius: "20px", padding: "20px", color: "white", 
      display: "flex", flexDirection: "column", gap: "10px", position: "relative", overflow: "hidden", ...style 
    }}>
      <h3 style={{ fontSize: "20px", textAlign: "left", marginBottom: "5px", fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
        Completed Courses
      </h3>
      
      <div 
        ref={scrollRef} 
        style={{ 
          display: "flex", flexDirection: "column", gap: "10px", 
          overflowY: "auto", scrollbarWidth: "none", flexGrow: 1, paddingBottom: "40px" 
        }}
      >
        {courses.map((course: any, idx: number) => (
          <div key={idx} style={{ backgroundColor: "#c1cbe6", borderRadius: "12px", padding: "12px 15px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "black" }}>
            <div>
              <div style={{ fontWeight: "bold", fontSize: "12px" }}>{course.title}</div>
              <div style={{ fontSize: "10px", opacity: 0.7 }}>by {course.provider}</div>
            </div>
            <div style={{ fontSize: "14px", cursor: "pointer" }}>↺</div>
          </div>
        ))}
      </div>

      <div 
        onClick={handleScroll} 
        style={{ 
          position: "absolute", bottom: "10px", left: "90%", transform: "translateX(-50%) rotate(90deg)",
          cursor: "pointer", color: "#c1cbe6", fontSize: "20px", zIndex: 10
        }}
      >
        ❯
      </div>
    </div>
  );
};