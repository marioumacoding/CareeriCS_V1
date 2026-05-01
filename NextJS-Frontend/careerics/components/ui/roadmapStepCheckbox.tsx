"use client";

interface StepCheckboxProps {
  text?: string | null;
  isChecked?: boolean;
  onToggle?: () => void;
}

export default function StepCheckbox({
  text,
  isChecked = false,
  onToggle,
}: StepCheckboxProps) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1rem",
        justifyContent: "space-between",
        backgroundColor: "#28292B",
        padding: "1rem",
        borderRadius: "3vh",
        cursor: "pointer"
      }}
    >
      {/* Text */}
      <p
        style={{
          fontSize: "1rem",
          color: "white",
          margin: 0,
          lineHeight: "1.4",
        }}
      >
        {text}
      </p>

      {/* Checkbox */}
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "transparent",
          border: isChecked ? `2px solid var(--primary-green)` : "2px solid white",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexShrink: 0,
          marginTop: "2px",
        }}
      >
        {isChecked && (
          <div
            style={{
              width: "70%",
              height: "70%",
              borderRadius: "50%",
              backgroundColor: "var(--primary-green)",
              transition: "all 0.2s ease",
            }}
          />
        )}
      </div>
    </div>
  );
}