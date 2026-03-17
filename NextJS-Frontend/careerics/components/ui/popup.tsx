"use client";
import React, { useState } from "react";

interface CustomizeInterviewPopupProps {
  onClose: () => void;
  onStart?: (settings: { sessionName: string; questions: number; role: string }) => void;
}

export default function CustomizeInterviewPopup({ 
  onClose, 
  onStart 
}: CustomizeInterviewPopupProps) {
  const [numQuestions, setNumQuestions] = useState(7);
  const [selectedRole, setSelectedRole] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const roles = ["Frontend Developer", "Backend Developer", "Fullstack Engineer", "UI/UX Designer"];

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    
    if (onStart) {
      onStart({ sessionName: "Tech-001", questions: numQuestions, role });
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }} onClick={onClose}>
      
      <div style={{
        backgroundColor: "#E6FFB2",
        width: "550px",
        padding: "40px",
        borderRadius: "40px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "25px",
        fontFamily: "var(--font-nova-square)"
      }} onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} style={{
          position: "absolute",
          top: "25px",
          right: "25px",
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          color: "#000"
        }}>✕</button>

        <h2 style={{ fontSize: "32px", margin: 0, color: "#000" }}>Customize your interview</h2>
        
        <hr style={{ border: "none", borderTop: "2px solid rgb(0, 0, 0)", margin: 0 }} />

        {/* 1. Static Session Name */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: 500 }}>Session's Name:</span>
          <div style={{ 
            backgroundColor: "#8E8E8E", 
            color: "white", 
            padding: "12px 20px", 
            borderRadius: "14px", 
            width: "240px", // Standard Width
            fontSize: "16px",
            boxSizing: "border-box" 
          }}>Tech-001</div>
        </div>

        {/* 2. Editable Number of Questions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: 500 }}>No. of Questions:</span>
          <input 
            type="number"
            min={2}
            value={numQuestions}
            onChange={(e) => setNumQuestions(parseInt(e.target.value) || 0)}
            onBlur={() => numQuestions < 2 && setNumQuestions(2)}
            style={{ 
              backgroundColor: "white", 
              border: "none",
              padding: "12px 20px", 
              borderRadius: "14px", 
              width: "240px", // Standard Width
              fontSize: "16px",
              outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* 3. Dropdown Role Selector (Matching size) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: 500 }}>Desired Role:</span>
          <div style={{ position: "relative", width: "240px" }}> {/* Control container width */}
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ 
                backgroundColor: "white", 
                padding: "12px 20px", 
                borderRadius: "14px", 
                display: "flex", 
                justifyContent: "space-between", 
                alignItems: "center",
                cursor: "pointer",
                fontSize: "16px",
                width: "100%", // Fill the 240px container
                boxSizing: "border-box" 
              }}
            >
              <span style={{ 
                color: selectedRole ? "#000" : "#8E8E8E",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis" 
              }}>
                {selectedRole || "click to choose"}
              </span>
              <span style={{ transition: "0.2s", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
            </div>

            {isDropdownOpen && (
              <div style={{
                position: "absolute",
                top: "110%",
                left: 0,
                width: "100%", // Matches the 240px trigger
                backgroundColor: "white",
                borderRadius: "14px",
                boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                overflow: "hidden",
                zIndex: 10
              }}>
                {roles.map((role) => (
                  <div 
                    key={role}
                    onClick={() => handleSelectRole(role)}
                    style={{ 
                      padding: "12px 20px", 
                      cursor: "pointer", 
                      borderBottom: "1px solid #f0f0f0", 
                      color: "#333",
                      fontSize: "14px"
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f9f9f9"}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                  >
                    {role}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}