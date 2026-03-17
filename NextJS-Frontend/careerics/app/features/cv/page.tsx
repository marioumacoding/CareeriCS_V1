"use client";
import { useState } from "react";
import RootLayout from "@/app/features/layout";
import ArchiveCard from "@/components/ui/archive-card";
import { Button } from "@/components/ui/button"; 
import ChoiceCard from "@/components/ui/choice-card";
import CVPop from "@/components/ui/cvPopup"; // Ensure this matches your filename
import { useRouter } from 'next/navigation';

export default function CVCrafting() {
  const router = useRouter();
  
  // State to manage the popup visibility
  const [isPopOpen, setIsPopOpen] = useState(false);

  const archive = [
    { id: "CV-006", date: "12/3/2026" },
    { id: "CV-005", date: "10/3/2026" },
    { id: "CV-004", date: "8/3/2026" },
    { id: "CV-003", date: "5/3/2026" },
    { id: "CV-002", date: "5/3/2026" },
    { id: "CV-001", date: "5/3/2026" },
  ];

  const handleFileSelection = (file: File) => {
    console.log("Selected file:", file.name);
    // Add your file upload logic here
    setIsPopOpen(false);
  };

  return (
    <>
      {/* 1. The Main Content Layer */}
      <RootLayout
        style={{
          gridTemplateColumns: "repeat(6, 1fr)",
          gridTemplateRows: "repeat(5, 1fr)",
          gridColumnGap: "10px",
          gridRowGap: "10px",
          position: "relative",
          zIndex: 1,
          overflow: "hidden"
        }}
      >
        <ChoiceCard
          title="CV Builder"
          description="Elevate your existing resume with AI-driven insights that refine your language and highlight your most impactful achievements."
          icon="/cv/cv.svg"
          buttonVariant="primary-inverted"
          route="/cv/builder"
          style={{ gridArea: "1 / 1 / 4 / 3" }}
        />

        <ChoiceCard
          title="CV Enhancer"
          description="Elevate your existing resume with AI-driven insights that refine your language and highlight your most impactful achievements."
          icon="/cv/cv.svg"
          buttonVariant="primary-inverted"
          route="/cv/enhancer"
          style={{ gridArea: "1 / 3 / 4 / 5" }}
        />

        <ArchiveCard
          items={archive}
          style={{ gridArea: "1 / 5 / 6 / 7" }}
        />

        {/* CV Extractor Row */}
        <div style={{ 
          gridArea: "4 / 1 / 6 / 5", 
          backgroundColor: "#16203d", 
          borderRadius: "24px", 
          padding: "25px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "25px" }}>
            <img src="/cv/cv.svg" alt="" style={{ width: "80px" }} />
            <div style={{ height: "80px", width: "1.7px", backgroundColor: "white" }}></div>
            <div>
              <h3 style={{ color: "white", fontSize: "clamp(0.8rem,1.7vw,1.5rem)", margin: 0, fontFamily: 'var(--font-nova-square)', fontWeight: "200" }}>
                CV Extractor
              </h3>
              <p style={{ color: "white", fontSize: "15px", marginTop: "5px" }}>
                Update your data on our system to automate job application later on
              </p>
            </div>
          </div>

          <Button 
            variant="primary-inverted" 
            onClick={() => setIsPopOpen(true)} 
            style={{
              padding: "22px 35px",
              borderRadius: "12px",
              marginTop: "50px",
              fontWeight: "400",
              fontSize: "15px",
              minWidth: "150px"
            }}
          >
            Upload CV
          </Button>
        </div>
      </RootLayout>

      {/* 2. The Popup Layer (Moved OUTSIDE of RootLayout) */}
      {isPopOpen && (
        <CVPop 
          onClose={() => setIsPopOpen(false)} 
          lastVersion={archive[0].id} 
          onFileSelect={handleFileSelection}
        />
      )}
    </>
  );
}