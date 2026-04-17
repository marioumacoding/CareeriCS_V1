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
  trackHelperText?: string;
}

const SkillFilters = ({
  tracks,
  selectedTrackId,
  onTrackChange,
  skillType,
  onSkillTypeChange,
  disabled = false,
  trackHelperText,
}: SkillFiltersProps) => {
  const getButtonStyle = (type: SkillFilterType) => ({
    flex: 1,
    padding: "1.2vh 0.5vw",
    borderRadius: "0.8vw",
    border: "none",
    backgroundColor: skillType === type ? "#E6FFB2" : "#315891",
    color: skillType === type ? "#1e293b" : "#fff",
    fontSize: "0.9vw",
    fontWeight: "bold" as const,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    opacity: disabled ? 0.6 : 1,
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5vh",
        color: "white",
        height: "100%",
        justifyContent: "center",
      }}
    >
      <div>
        <label style={{ fontSize: "1.5vw", display: "block", marginBottom: "0.8vh", fontWeight: "bold" }}>
          Track
        </label>
        <select
          value={selectedTrackId}
          onChange={(event) => onTrackChange(event.target.value)}
          disabled={disabled}
          style={{
            width: "100%",
            padding: "1vh 1vw",
            borderRadius: "0.8vw",
            backgroundColor: "#cbd5e1",
            border: "none",
            fontSize: "0.9vw",
            outline: "none",
            cursor: disabled ? "not-allowed" : "pointer",
            color: "#000",
            fontWeight: "500",
            opacity: disabled ? 0.7 : 1,
          }}
        >
          <option value="">Choose a track</option>
          {tracks.map((track) => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
        {trackHelperText ? (
          <p
            style={{
              margin: "0.7vh 0 0 0",
              fontSize: "0.74vw",
              lineHeight: 1.35,
              color: "#E6FFB2",
              fontWeight: 600,
            }}
          >
            {trackHelperText}
          </p>
        ) : null}
      </div>

      <div style={{ marginTop: "1vh" }}>
        <label style={{ fontSize: "1.2vw", display: "block", marginBottom: "1vh", fontWeight: "bold" }}>
          Skill Type
        </label>
        <div style={{ display: "flex", gap: "1vw" }}>
          <button
            onClick={() => onSkillTypeChange("general")}
            disabled={disabled}
            style={getButtonStyle("general")}
          >
            General Topic
          </button>

          <button
            onClick={() => onSkillTypeChange("specific")}
            disabled={disabled}
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