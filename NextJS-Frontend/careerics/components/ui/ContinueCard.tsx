import React from 'react';

const ContinueCard: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: "#1e2a4a", 
      borderRadius: "20px", 
      padding: "24px", 
      height: "100%", 
      display: "flex", 
      justifyContent: "space-between", 
      alignItems: "flex-start", // Men center le flex-start 3ashan el kalam yetla3 fo2
      cursor: "pointer" 
    }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h3 style={{ 
          color: "white", 
          fontSize: "1.2rem", 
          fontFamily: 'Nova Square', 
          fontWeight: "400", 
          marginBottom: "3vh" ,

        }}>
          Continue Applying
        </h3>
        <p style={{ 
          color: "rgba(255,255,255,0.6)", 
          fontSize: "1.1rem", 
          margin: 0 
        }}>
          Your next opportunity awaits
        </p>
      </div>

      {/* El arrow zawednalo margin-top 3ashan yeb2a m7azy el title */}
      <div style={{ color: "white", fontSize: "20px",marginTop: "5vh" }}>❯</div>
    </div>
  );
};

export default ContinueCard;