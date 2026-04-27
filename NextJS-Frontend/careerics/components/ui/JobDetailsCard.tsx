"use client";
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

interface JobDetailsProps {
  jobData: {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    tags: string[];
    description: string;
    responsibilities?: string;
    requirements?: string;
    niceToHave?: string;
    skills?: string;
  };
}

const JobDetailsCard: React.FC<JobDetailsProps> = ({ jobData }) => {
  const [activeSection, setActiveSection] = useState<string | null>("About the Role");

  const toggleSection = (sectionTitle: string) => {
    setActiveSection(activeSection === sectionTitle ? null : sectionTitle);
  };

  const renderSection = (title: string, content: React.ReactNode) => {
    const isOpen = activeSection === title;

    return (
      <div style={{
        border: "1px solid rgba(255, 255, 255, 0.4)",
        marginBottom: "12px",
        overflow: "hidden",
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
    
      width: "700px",       
      height: "110%",      
      flexShrink: 0,        
      
      display: "flex",
      flexDirection: "column",
      fontFamily: "'Nova Square', sans-serif",
      boxSizing: "border-box",
    }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "30px" }}>
        <div>
          <h2 style={{ fontSize: "1.5rem", marginRight: "20px", paddingRight: "5px" }}>{jobData.title}</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "10px" }}>
            <span style={{ fontSize: "1.4rem", opacity: 0.9, whiteSpace: "nowrap" }}>{jobData.company}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "30px" }}> 
            <img 
                src="/cv/Map pin.svg" 
                alt="location"
                style={{ opacity: 0.6, width: "16px", height: "16px" }} 
            />
            <span style={{ fontSize: "0.9rem", opacity: 0.6, color: "white", whiteSpace: "nowrap" }}> 
                {jobData.location}
            </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "15px" }}>
          <div style={{ display: "flex", gap: "10px" }}>
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
          
          <div style={{ backgroundColor: "#d4ff8e", color: "black", padding: "8px 25px", borderRadius: "25px", fontWeight: "bold" }}>
            Salary: {jobData.salary}
          </div>
        </div>
      </div>

      {/* Accordions Container - DE EL WA7EEDA ELLY TES-CROLL */}
      {/* Accordions Container */}
<div style={{ flex: 1, overflowY: "auto", paddingRight: "10px", scrollbarWidth: "none" }}>
  
  {/* Dynamic About Section */}
  {renderSection("About the Role", jobData.description)}

  {/* Dynamic Responsibilities */}
  {jobData.responsibilities && renderSection("Key Responsibilities", jobData.responsibilities)}

  {/* Dynamic Requirements */}
  {jobData.requirements && renderSection("Requirements", jobData.requirements)}

  {/* Dynamic Nice To Have */}
  {jobData.niceToHave && renderSection("Nice To Have", jobData.niceToHave)}

  {/* Dynamic Skills */}
  {jobData.skills && renderSection("Skills Needed", jobData.skills)}

</div>

      <div style={{  display: "flex", justifyContent: "flex-end" }}>
        <Button 
            variant="primary" 
            style={{ 
           width: "auto", 
      minWidth: "180px", // 3ashan shaklo yb2a mo7taram zay el sora
      maxWidth: "200px", // Te-7'leh may-sra7sh ymeen we shemal
      
      display: "inline-flex", 
      alignItems: "center",
      justifyContent: "center",

      padding: "20px 30px", 
      fontSize: "1.1rem",
      borderRadius: "12px",
      whiteSpace: "nowrap"
    }}
        
        >
            Apply
        </Button>
      </div>
    </div>
  );
};

export default JobDetailsCard;