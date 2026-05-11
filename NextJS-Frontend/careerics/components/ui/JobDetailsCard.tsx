"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface JobDetailsProps {
  jobData: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary?: string | null;
    tags: string[];
    description: string;
    responsibilities?: string;
    requirements?: string;
    niceToHave?: string;
    skills?: string;
  };
  onApply?: () => void | Promise<void>;
  isApplying?: boolean;
  actionLabel?: string;
  isApplyDisabled?: boolean;
}

const JobDetailsCard: React.FC<JobDetailsProps> = ({
  jobData,
  onApply,
  isApplying = false,
  actionLabel = "Apply",
  isApplyDisabled = false,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>("About the Role");

  const toggleSection = (sectionTitle: string) => {
    setActiveSection(activeSection === sectionTitle ? null : sectionTitle);
  };

  const renderSection = (title: string, content: React.ReactNode) => {
    const isOpen = activeSection === title;

    return (
      <div style={{
        border: "1px solid rgba(255, 255, 255, 0.4)",
        marginBottom: "5px",
        overflow: "auto",
      }}>
        <div 
          onClick={() => toggleSection(title)}
          style={{
            padding: "15px 25px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            cursor: "pointer",
            backgroundColor: isOpen ? "rgba(255,255,255,0.05)" : "transparent",
            transition: "0.3s"
          }}
        >
          <span style={{ fontSize: "1rem" }}>{title}</span>
          <span style={{ 
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transform: isOpen ? "rotate(180deg)" : "rotate(270deg)", 
            }}>
            <img 
                src="/auth/Back Arrow.svg" 
                alt="arrow"
                style={{ 
                width: "14px",  
                height: "14px",
                opacity: 0.8,  
                pointerEvents: "none" 
                }} 
            />
            </span>
        </div>

        {isOpen && (
          <div style={{
            padding: "20px 25px",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            color: "#ccc",
            wordBreak: "break-word", 
            overflowWrap: "break-word"
          }}>
            {content}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: "rgba(57, 66, 88, 0.8)", 
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)", 
      border: "1px solid rgba(255, 255, 255, 0.1)",
      backgroundImage: "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(0, 0, 0, 0.05) 100%)",
      borderRadius: 65,
      padding: "40px",
      color: "white",
      width: "110%",
      maxWidth: "1000px",
      height: "470px",      
      flexShrink: 0,        
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Nova Square', sans-serif",
      boxSizing: "border-box",
    }}>
      
      <div
        className="no-scrollbar"
        style={{ 
          flex: 1,
          overflowY: "auto", 
          scrollbarWidth: "none",
          display: "flex",
          flexDirection: "column",
          minHeight: 0, 
        }}
      >
        <style>{`.no-scrollbar::-webkit-scrollbar { display: none; }`}</style>

        {/* 1. Header Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px", marginBottom: "30px", flexWrap: "wrap" }}>
          <div style={{ minWidth: 0, flex: "1 1 320px" }}>
            <h2 style={{ fontSize: "1.5rem", marginRight: "20px", paddingRight: "5px", wordBreak: "break-word" }}>{jobData.title}</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "1.4rem", opacity: 0.9, whiteSpace: "normal", wordBreak: "break-word" }}>{jobData.company}</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "0", flexWrap: "wrap" }}> 
                <img 
                    src="/job/map pin.svg" 
                    alt="location"
                    style={{ opacity: 0.6, width: "16px", height: "16px" }} 
                />
                <span style={{ fontSize: "0.9rem", opacity: 0.6, color: "white", whiteSpace: "normal", wordBreak: "break-word" }}> 
                    {jobData.location}
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px", flex: "0 1 auto", maxWidth: "100%" }}>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end", maxWidth: "100%" }}>
              {jobData.tags.map(tag => (
                <Button 
                  key={tag} 
                  variant="secondary" 
                  style={{ 
                    padding: "5px 15px", 
                    fontSize: "0.75rem",
                    borderRadius: "15px",
                    backgroundColor: "#B8B8B8", 
                    color: "#2A2D3A",
                    whiteSpace: "nowrap",
                    width: "fit-content",
                    height: "30px"
                  }}
                >
                  {tag}
                </Button>
              ))}
            </div>
            
            {jobData.salary ? (
              <div style={{ backgroundColor: "#d4ff8e", color: "black", padding: "8px 25px", borderRadius: "25px", fontWeight: "bold", maxWidth: "100%", wordBreak: "break-word" }}>
                Salary: {jobData.salary}
              </div>
            ) : null}
          </div>
        </div>

        {/* 2. Accordions Section */}
        <div style={{ flex: 1, paddingRight: "10px" }}>
          {renderSection("About the Role", jobData.description)}
          {jobData.responsibilities && renderSection("Key Responsibilities", jobData.responsibilities)}
          {jobData.requirements && renderSection("Requirements", jobData.requirements)}
          {jobData.niceToHave && renderSection("Nice To Have", jobData.niceToHave)}
          {jobData.skills && renderSection("Skills Needed", jobData.skills)}
        </div>

        {/* 3. Apply Button */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px", paddingBottom: "10px",  }}>
          <Button 
              variant="primary" 
              isLoading={isApplying}
              disabled={isApplyDisabled}
              onClick={onApply}
              style={{ 
                width: "auto", 
                minWidth: "180px",
                maxWidth: "200px",
                display: "inline-flex", 
                alignItems: "center",
                justifyContent: "center",
                padding: "20px 30px", 
                fontSize: "1.1rem",
                borderRadius: "12px",
                whiteSpace: "nowrap"
              }}
          >
              {actionLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsCard;