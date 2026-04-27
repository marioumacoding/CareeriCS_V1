import React from "react";

export type SkillFilterType = "general" | "specific";

export interface SkillFilterTrackOption {
  id: string;
  title: string;
}

interface SkillFiltersProps {
  tracks: SkillFilterTrackOption[];
  selectedTrackId: string;
  onTrackChange: (trackId: string) => void;
  skillType: SkillFilterType;
  onSkillTypeChange: (type: SkillFilterType) => void;
  disabled?: boolean;
  disableSkillTypeToggle?: boolean;
  trackHelperText?: string;
}

const  SkillFilters = ({
  tracks,
  selectedTrackId,
  onTrackChange,
  skillType,
  onSkillTypeChange,
  disabled = false,
  disableSkillTypeToggle = false,
  trackHelperText,
}: SkillFiltersProps) => {
  const isSkillTypeDisabled = disabled || disableSkillTypeToggle;

  const getButtonStyle = (type: SkillFilterType) => ({
    flex: 1,
    padding: "1.2vh 0.5vw",
    borderRadius: "4vh",
    backgroundColor: skillType === type ? "#E6FFB2" : "#315891",
    color: skillType === type ? "#1e293b" : "#fff",
    fontSize: "0.9vw",
    fontWeight: "bold" as const,
    cursor: isSkillTypeDisabled ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: isSkillTypeDisabled ? 0.6 : 1,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        color: "white",
        height: "100%",
        justifyContent: "center",
        padding:"1rem",
        gap: "0.5rem  ",
      }}
    >
      <div>
        <h3 style={{ fontSize: "1.2rem" }}>
          Track
        </h3>
        <select
          value={selectedTrackId}
          onChange={(event) => onTrackChange(event.target.value)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "0.5rem",
            borderRadius: "2vh",
            backgroundColor: "#cbd5e1",
            border: "none",
            fontSize: "0.8rem",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "#000",
            opacity: disabled ? 0.7 : 1,
            fontFamily: "var(--font-nova-square)",
            
          }}
        >
          <option value="">Choose a track </option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 style={{ fontSize: "1.2rem"}}>
          Skill Type
        </h3>
        <div style={{ display: "flex", gap: "1vw" }}>
          <button
            onClick={() => onSkillTypeChange("general")}
            disabled={isSkillTypeDisabled}
            style={getButtonStyle("general")}
          >
            General Topic
          </button>

          <button
            onClick={() => onSkillTypeChange("specific")}
            disabled={isSkillTypeDisabled}
            style={getButtonStyle("specific")}
          >
            Specific Skill
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default SkillFilters;