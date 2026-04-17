import React, { useState } from 'react';

const SkillFilters = () => {
  // 1. State 3ashan ne-track el button el clicked (default: 'specific')
  const [selectedType, setSelectedType] = useState('specific');

  // Helper function 3ashan el logic bta3 el colors
  const getButtonStyle = (type: string) => ({
    flex: 1,
    padding: "1.2vh 0.5vw",
    borderRadius: "0.8vw",
    border: "none",
    // 2. Conditional Styling: law selected khalih lime, law la2 khalih el blue el amee2
    backgroundColor: selectedType === type ? "#E6FFB2" : "#315891",
    color: selectedType === type ? "#1e293b" : "#fff",
    fontSize: "0.9vw",
    fontWeight: "bold" as const,
    cursor: "pointer",
    transition: "all 0.3s ease"
  });

  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      gap: "1.5vh", 
      color: "white",
      height: "100%",
      justifyContent: "center"
    }}>
      {/* Track Section */}
      <div>
        <label style={{ fontSize: "1.5vw", display: "block", marginBottom: "0.8vh", fontWeight: "bold" }}>
          Track
        </label>
        <select style={{
          width: "100%", padding: "1vh 1vw", borderRadius: "0.8vw",
          backgroundColor: "#cbd5e1", border: "none", fontSize: "0.9vw",
          outline: "none", cursor: "pointer", color: "#000", fontWeight: "500"
        }}>
          <option>Choose a track</option>
          <option>Frontend Development</option>
          <option>Backend Development</option>
          <option>UI/UX Design</option>
        </select>
      </div>

      {/* Skill Type Section */}
      <div style={{ marginTop: "1vh" }}>
        <label style={{ fontSize: "1.2vw", display: "block", marginBottom: "1vh", fontWeight: "bold" }}>
          Skill Type
        </label>
        <div style={{ display: "flex", gap: "1vw" }}>
          
          {/* General Topic Button */}
          <button 
            onClick={() => setSelectedType('general')}
            style={getButtonStyle('general')}
          >
            General Topic
          </button>

          {/* Specific Skill Button */}
          <button 
            onClick={() => setSelectedType('specific')}
            style={getButtonStyle('specific')}
          >
            Specific Skill
          </button>

        </div>
      </div>
    </div>
  );
};

export default SkillFilters;