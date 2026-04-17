"use client";
import React, { useRef, useState } from "react";

interface CVPopProps {
  onClose: () => void;
  lastVersion: string;
  onFileSelect?: (file: File) => Promise<void> | void;
}

export default function CVPop({ 
  onClose, 
  lastVersion,
  onFileSelect 
}: CVPopProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState("");

  const handleButtonClick = () => {
    // Triggers the hidden file input
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // Allow picking the same file again in a subsequent attempt.
    event.target.value = "";

    if (!file) {
      return;
    }
    setSelectedFileName(file.name);

    if (onFileSelect) {
      void onFileSelect(file);
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
        gap: "30px",
        fontFamily: "var(--font-nova-square)"
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Close Button */}
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

        <h2 style={{ fontSize: "32px", margin: 0, color: "#000" }}>Replace your information</h2>
        
        <hr style={{ border: "none", borderTop: "2px solid rgb(0, 0, 0)", margin: 0 }} />

        {/* Info Row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "20px", fontWeight: 500 }}>The last extracted version</span>
          <div style={{ 
            backgroundColor: "white", 
            color: "#8E8E8E", 
            padding: "12px 25px", 
            borderRadius: "14px", 
            fontSize: "16px",
            minWidth: "120px",
            textAlign: "center"
          }}>{lastVersion}</div>
        </div>

        {/* Upload Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "flex-start" }}>
          <span style={{ fontSize: "20px", fontWeight: 500 }}>Upload new CV</span>
          
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "20px" }}>
            {/* Hidden Input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: "none" }} 
              accept=".pdf,.docx"
            />

            <img 
              src="/cv/upload.svg" 
              alt="Upload" 
              style={{ width: "100px", opacity: 0.6 }} 
            />

            <button 
              onClick={handleButtonClick}
              style={{
                backgroundColor: "#8E8E8E",
                color: "white",
                border: "none",
                padding: "14px 45px",
                borderRadius: "15px",
                fontSize: "18px",
                fontWeight: 600,
                cursor: "pointer",
                transition: "0.3s opacity"
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = "0.8"}
              onMouseOut={(e) => e.currentTarget.style.opacity = "1"}
            >
              Open Files
            </button>

            {selectedFileName ? (
              <p
                style={{
                  margin: 0,
                  color: "#24340c",
                  opacity: 0.85,
                  maxWidth: "100%",
                  textAlign: "center",
                  wordBreak: "break-word",
                  fontSize: "14px",
                }}
              >
                {selectedFileName}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}