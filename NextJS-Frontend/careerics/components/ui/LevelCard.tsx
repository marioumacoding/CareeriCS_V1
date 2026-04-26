import React from 'react';
import { Button } from "@/components/ui/button";

const LevelCard: React.FC = () => {
  return (
    <div style={{ 
      backgroundColor: "#142143", 
      borderRadius: "20px", // Zawedna el radius sghayar 3ashan yeb2a smoother
      padding: "1rem", // Zawedna el padding 3ashan el content yakhod ra7to
      height: "100%", 
      display: "flex", 
      flexDirection: "column", // El main container lissa column 3ashan el button ta7t
      justifyContent: "space-between", // Bey-bu3ed el row fo2 3an el button ta7t
      gap: "5px",
      boxSizing: "border-box"
    }}>
      
      {/* 1. El Row elly feeha el Icon wel Kalam (Top Section) */}
      <div style={{ 
        display: "flex", 
        flexDirection: "row", // Ufuqi
        alignItems: "center", // M7azah vertical f nos ba3d
        justifyContent: "space-between", 
        flexGrow: 1, // Bey-akhod el masafeh el fadya fo2
        paddingInline:"0.5rem"
      }}>
        
        {/* El Icon ka SVG (Left) */}
        <img 
          src="/cv/Rectangle 119.svg" // Et-aked enn dah el icon el sa7
          alt="Check Level Icon"
          style={{ width: "60px", height: "60px", flexShrink: 0 }} // Zawedna el size sghayar
        />

        {/* 2. El Vertical Line (Middle) */}
        <div style={{ 
          width: "1.7px", // 3ard el khat
          height: "80px", // Toul el khat (nafs toul el icon)
          backgroundColor: "rgb(255, 255, 255)", // Lon abyad shafaf
          flexShrink: 0
        }} />

        {/* 3. El Kalam (Right) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
          <h3 style={{ 
            color: "white", 
            margin: 0, 
            textAlign: "left", // Kalam 3al shemal
            fontFamily: 'Nova Square', 
            fontWeight: "400",
            fontSize: "1.2rem", // Zawedna el size 3ashan yeb2a wad7
            lineHeight: "1.5", // Masafeh ben el stour sghayara
            maxWidth: "min-content", // Bey-egber el kalam yenzel row gadeed
            textTransform: "capitalize" // Bey-khally awel 7arf Capital
          }}>
            Check Your Level
          </h3>
        </div>
      </div>

      {/* 4. El Button (Bottom Section) */}
      <Button 
        variant="secondary" 
        style={{ 
          color: "black",
          borderRadius: "5px", // Radius Smooth
          fontFamily: 'Nova Square',
          width: "100%",    
          paddingBlock:"0.5rem",
          
          
        }}
        onClick={() => console.log('Start Test')}
      >
        Start Test
      </Button>
    </div>
  );
};

export default LevelCard;