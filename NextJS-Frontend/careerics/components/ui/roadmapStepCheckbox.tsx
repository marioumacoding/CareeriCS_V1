"use client";

interface StepCheckboxProps {
  text?: string | null;
  isChecked?: boolean;
  disabled?: boolean;
  onToggle?: () => void;
}

export default function StepCheckbox({
  text,
  isChecked = false,
  disabled = false,
  onToggle,
}: StepCheckboxProps) {
  return (
    <div
      onClick={() => {
        if (!disabled) {
          onToggle?.();
        }
      }}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1rem",
        justifyContent: "space-between",
        backgroundColor: "var(--dark-grey)",
        padding: "1rem",
        borderRadius: "3vh",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
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
          cursor: disabled ? "not-allowed" : "pointer",
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
