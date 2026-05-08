import React from "react";
import CustomDropdown from "./dropdown-menu";

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
  style?: React.CSSProperties;
}

export default function SkillFilters({
  tracks,
  selectedTrackId,
  onTrackChange,
  skillType,
  onSkillTypeChange,
  disabled = false,
  disableSkillTypeToggle = false,
  style,
}: SkillFiltersProps) {

  const isSkillTypeDisabled = disabled || disableSkillTypeToggle;

  function getButtonStyle(type: SkillFilterType): React.CSSProperties {
    const isActive = skillType === type;

    return {
      flex: 1,
      padding: "0.65rem 0.75rem",
      borderRadius: "999px",
      backgroundColor: isActive ? "var(--light-green)" : "#C1CBE6",
      color: "#000",
      fontSize: "clamp(0.85rem, 0.6vw, 1rem)",
      fontWeight: 600,
      cursor: isSkillTypeDisabled ? "not-allowed" : "pointer",
      transition: "all 0.25s ease",
      opacity: isSkillTypeDisabled ? 0.7 : 1,
      border: "none",
      whiteSpace: "nowrap",
    };
  }

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        maxWidth: "520px",
        backgroundColor: "var(--medium-blue)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "flex-start",

        padding: "clamp(0.75rem, 1.2vw, 1.25rem)",
        gap: "clamp(0.75rem, 1vw, 1rem)",

        borderRadius: "clamp(1rem, 2vw, 2rem)",
        boxSizing: "border-box",

        ...style,
      }}
    >
      {/* Track Selector */}
      <div style={{ width: "100%" }}>
        <h3
          style={{
            fontSize: "clamp(1rem, 0.9vw, 1.25rem)",
            marginBottom: "0.5rem",
          }}
        >
          Track
        </h3>

        <CustomDropdown
          background="#C1CBE6"
          value={selectedTrackId}
          options={tracks}
          placeholder="Choose a track"
          onChange={onTrackChange}
        />
      </div>

      {/* Skill Type Toggle */}
      <div style={{ width: "100%" }}>
        <h3
          style={{
            fontSize: "clamp(1rem, 0.9vw, 1.25rem)",
            marginBottom: "0.5rem",
          }}
        >
          Skill Type
        </h3>

        <div
          style={{
            display: "flex",
            gap: "clamp(0.5rem, 0.8vw, 1rem)",
            width: "100%",
          }}
        >
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
}