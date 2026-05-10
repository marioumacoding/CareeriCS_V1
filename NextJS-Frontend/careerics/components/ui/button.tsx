"use client";
import { forwardRef, type ButtonHTMLAttributes, CSSProperties, useState } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger" | "text" | "primary-inverted" | "popup" | "popup-inverted";
type ButtonSize = "sm" | "md" | "lg";

interface TextButtonContent {
  before: string;
  buttonText: string;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  textContent?: TextButtonContent;
}

const baseStyle: CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "1vh",
  border: "none",
  borderRadius: "1.5vh",
  outline: "none",
  cursor: "pointer",
  transition: "all 0.2s ease-in-out",
  fontFamily: "var(--font-nova-square), sans-serif",
  fontWeight: 500,
  flex: 1,
};

const variantStyles: Record<ButtonVariant, { default: CSSProperties; hover: CSSProperties }> = {
  primary: {
    default: { backgroundColor: "var(--primary-green)", color: "black" },
    hover: { backgroundColor: "var(--light-green)" }
  },
  secondary: {
    default: { backgroundColor: "white", color: "#18181b" },
    hover: { backgroundColor: "var(--light-blue)" }
  },
  outline: {
    default: { backgroundColor: "transparent", border: "0.3vh solid white", color: "white" },
    hover: { backgroundColor: "white", color: "black" }
  },
  ghost: {
    default: { backgroundColor: "transparent", color: "#18181b" },
    hover: { backgroundColor: "white" }
  },
  danger: {
    default: { backgroundColor: "#dc2626", color: "white" },
    hover: { backgroundColor: "#b91c1c" }
  },
  text: {
    default: { color: "var(--primary-green)", background: "transparent", fontWeight: 700 },
    hover: { color: "white", textDecoration: "underline" }
  },
  "primary-inverted": {
    default: { backgroundColor: "var(--light-green)", color: "black" },
    hover: { backgroundColor: "var(--primary-green)" }
  },
  "popup": {
    default: { backgroundColor: "var(--medium-blue)", color:"white" },
    hover: { backgroundColor: "white", color: "black" }
  },
  "popup-inverted": {
    default: { backgroundColor: "white", color: "black" },
    hover: { backgroundColor: "var(--medium-blue)", color:"white" }
  },
};

const sizeStyles: Record<ButtonSize, CSSProperties> = {
  sm: { fontSize: "1.6vh", padding: "2vh" },
  md: { fontSize: "2.2vh", padding: "3vh", height: "1vh" },
  lg: { fontSize: "2.8vh", padding: "1.5vh 3vh", height: "1vh" },
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", isLoading, disabled, children, style, textContent, ...props }, ref) => {
    const [isHovered, setIsHovered] = useState(false);
    const isInteractionDisabled = disabled || isLoading;

    const combinedStyle: CSSProperties = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant].default,
      ...(isHovered && !isInteractionDisabled && variantStyles[variant].hover),
      ...(variant === "text" && {
        display: "inline",
        padding: 0,
        height: "auto",
        verticalAlign: "baseline",
        fontSize: "inherit",
      }),
      opacity: isInteractionDisabled ? 0.6 : 1,
      pointerEvents: isInteractionDisabled ? "none" : "auto",
      ...style,
    };

    if (variant === "text" && textContent) {
      return (
        <p
          style={{
            flex: 0,
            alignItems: "center",
            fontSize: "2vh",
            color: "white",
            textAlign: "left",
            fontFamily: "var(--font-nova-square)",
            padding: "0vh",
            marginTop: "1vh",
            ...style
          }}
        >
          {textContent.before}{"\u00A0"}
          <button
            ref={ref}
            style={{
              ...combinedStyle,
              fontWeight: "normal",
              padding: 0,
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            {...props}
          >
            {textContent.buttonText}
          </button>
        </p>
      );
    }

    // --- Standard Button Case ---
    return (
      <button
        ref={ref}
        disabled={isInteractionDisabled}
        style={combinedStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        {...props}
      >
        {isLoading && (
          <svg
            style={{
              width: "2.2vh",
              height: "2.2vh",
              animation: "spin 1s linear infinite"
            }}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={4} style={{ opacity: 0.25 }} />
            <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ opacity: 0.75 }} />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";