"use client";
import React, { useState } from 'react';

// --- 1. DATA ---
const PAGE_DATA = {
  fieldTitle: "Frontend Development Field",
  sections: [
    {
      category: "Html courses:",
      items: [
        { id: 1, name: "Course Name", org: "organization’s name", isDone: false },
        { id: 2, name: "Course Name", org: "organization’s name", isDone: true },
        { id: 3, name: "Course Name", org: "organization’s name", isDone: false },
      ]
    },
    {
      category: "Css courses:", 
      items: [
        { id: 4, name: "Course Name", org: "organization’s name", isDone: true },
        { id: 5, name: "Course Name", org: "organization’s name", isDone: false },
        { id: 6, name: "Course Name", org: "organization’s name", isDone: true },
      ]
    },
    {
      category: "JavaScript courses:",
      items: [
        { id: 7, name: "Course Name", org: "organization’s name", isDone: true },
        { id: 8, name: "Course Name", org: "organization’s name", isDone: false },
      ]
    }
  ]
};

// --- 2. CARD COMPONENT ---
const CourseCard = ({ course }: { course: any }) => {
  const isDone = course.isDone;

  return (
    <div style={{
      width: "280px", minHeight: "120px", height: "auto",
      backgroundColor: isDone ? "#3D3D3D" : "#BABABA", 
      borderRadius: "40px", padding: "20px",
      display: "flex", alignItems: "stretch", position: "relative",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "70px", flexShrink: 0 }}>
        {isDone ? (
          <div style={{ 
            width: "55px", height: "55px", borderRadius: "50%", 
            border: "3px solid #00FFC2", display: "flex", 
            alignItems: "center", justifyContent: "center" 
          }}>
            <span style={{ color: "#00FFC2", fontSize: "22px", fontWeight: "bold" }}>✓</span>
          </div>
        ) : (
          <img src="/cv/rectangle 98.svg" alt="icon" style={{ width: "60px" }} />
        )}
      </div>

      <div style={{
        width: "1.5px",
        backgroundColor: isDone ? "rgba(255, 255, 255, 0.4)" : "rgb(0, 0, 0)",
        margin: "0 20px", alignSelf: "stretch", flexShrink: 0
      }}></div>

      <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: "6px", flex: 1 }}>
        <h4 style={{ margin: 0, color: isDone ? "#FFFFFF" : "#0b0b0b", fontSize: "15px", fontWeight: "600" }}>{course.name}</h4>
        <p style={{ margin: 0, color: isDone ? "rgba(255,255,255,0.7)" : "rgb(0, 0, 0)", fontSize: "12px", fontWeight: "500" }}>-by {course.org}</p>
      </div>
    </div>
  );
};

// --- 3. MAIN PAGE ---
export default function CourseLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");

  // Logic to calculate counts
  const totalTopics = PAGE_DATA.sections.length;
  const totalCourses = PAGE_DATA.sections.reduce((acc, sec) => acc + sec.items.length, 0);
  const completedCount = PAGE_DATA.sections.reduce((acc, sec) => acc + sec.items.filter(item => item.isDone).length, 0);

  return (
    <div style={{ width: "100%", height: "100vh", padding: "40px 60px", color: "white", boxSizing: "border-box", display: "flex", flexDirection: "column", fontFamily: "var(--font-nova-square)" }}>
      
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "25px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "30px", marginBottom: "20px" }}>
            <h1 style={{ fontSize: "24px", margin: 0 }}>{PAGE_DATA.fieldTitle}</h1>
            
            <div style={{ position: "relative", width: "280px" }}>
              <input 
                type="text" placeholder="search" value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: "100%", backgroundColor: "rgba(255,255,255,0.05)", 
                  border: "1px solid rgb(255, 255, 255)", borderRadius: "20px", 
                  padding: "8px 45px 8px 15px", color: "white", outline: "none"
                }} 
              />
              <img 
                src="/cv/search.svg" 
                alt="search"
                style={{ position: "absolute", right: "5px", top: "50%", transform: "translateY(-50%)", width: "40px", pointerEvents: "none" }} 
              />
            </div>
          </div>

          {/* Stats Section */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "35px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "2px", height: "35px", backgroundColor: "#D4FF47" }}></div>
              <div><span style={{ fontSize: "15px", fontWeight: "bold" }}>{totalTopics} topics</span><br/><span style={{ fontSize: "11px", opacity: 0.6 }}>- by Top Courses</span></div>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <div style={{ width: "2px", height: "35px", backgroundColor: "#D4FF47" }}></div>
              <div><span style={{ fontSize: "15px", fontWeight: "bold" }}>{totalCourses} courses</span><br/><span style={{ fontSize: "11px", opacity: 0.6 }}>- by Top Courses</span></div>
            </div>
          </div>
        </div>

        {/* Completion Counter */}
        <div style={{ backgroundColor: "#1E3A8A", padding: "20px 30px", borderRadius: "20px", minWidth: "170px" }}>
          <span style={{ fontSize: "13px", opacity: 0.8 }}>Courses Completed</span>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}>
            <div style={{ width: "3px", height: "40px", backgroundColor: "#D4FF47" }}></div>
            <h2 style={{ margin: 0, fontSize: "34px" }}>
              <span style={{ color: "#D4FF47" }}>{completedCount}</span>
              <span style={{ fontSize: "20px", opacity: 0.7 }}> /{totalCourses}</span>
            </h2>
          </div>
        </div>
      </div>

      <hr style={{ border: "none", height: "1px", backgroundColor: "rgba(255,255,255,0.1)", marginBottom: "35px" }} />

      {/* Course Sections List (Rendering PAGE_DATA Directly) */}
      <div style={{ flex: 1, overflowY: "auto", scrollbarWidth: "none", display: "flex", flexDirection: "column", gap: "45px" }}>
        <style>{`div::-webkit-scrollbar { display: none; }`}</style>
        
        {PAGE_DATA.sections.map((section) => (
          <div key={section.category}>
            <h3 style={{ fontSize: "20px", marginBottom: "25px", fontWeight: "400" }}>{section.category}</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "25px" }}>
              {section.items.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}