"use client";
import React from 'react';
import { useRouter } from 'next/navigation';

interface ContinueCardProps {
  description?: string;
}

const ContinueCard: React.FC<ContinueCardProps> = ({
  description = "Your next opportunity awaits",
}) => {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push('/job-features/application')}
      style={{ 
        backgroundColor: "#1e2a4a", 
        borderRadius: "20px", 
        padding: "24px", 
        height: "100%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "flex-start",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#243460")}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1e2a4a")}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h3 style={{ 
          color: "white", 
          fontSize: "1.2rem", 
          fontFamily: 'Nova Square', 
          fontWeight: "400", 
          marginBottom: "3vh",
        }}>
          Continue Applying
        </h3>
        <p style={{ 
          color: "rgba(255,255,255,0.6)", 
          fontSize: "1.1rem", 
          margin: 0,
        }}>
          {description}
        </p>
      </div>

      <div style={{ color: "white", fontSize: "20px", marginTop: "5vh" }}>❯</div>
    </div>
  );
};

export default ContinueCard;
