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
        backgroundColor: "var(--dark-blue)", 
        borderRadius: "4vh", 
        paddingInline: "1rem",
        paddingBlock:"2rem", 
        height: "100%", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", justifyContent:"space-between" }}>
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
          fontSize: "0.9rem", 
          margin: 0,
        }}>
          {description}
        </p>
      </div>

      <div style={{ color: "white", fontSize: "20px"}}>❯</div>
    </div>
  );
};

export default ContinueCard;
