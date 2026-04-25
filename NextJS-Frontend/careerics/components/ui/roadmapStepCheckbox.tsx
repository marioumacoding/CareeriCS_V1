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
      style={{
        display: "flex",
        width: "100%",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <p
        style={{
          fontSize: "1rem",
          color: "white",
          margin: 0,
        }}
      >
        {text}
      </p>

      {/* Checkbox */}
      <div
        onClick={onToggle}
        style={{
          width: "1.5rem",
          height: "1.5rem",
          borderRadius: "99rem",
          backgroundColor: "transparent",
          border: "2px solid white",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {isChecked && (
          <div
            style={{
              width: "70%",
              height: "70%",
              borderRadius: "99rem",
              backgroundColor: "white",
              transition: "all 0.2s ease",
            }}
          />
        )}
      </div>
    </div>
  );
}