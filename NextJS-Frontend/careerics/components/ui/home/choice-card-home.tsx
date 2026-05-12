"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { CSSProperties, ReactNode } from "react";
import { X } from "lucide-react";

interface ChoiceCardProps {
  icon?: string;
  image?: string;
  title?: string;
  description?: string;
  route?: string;
  style?: CSSProperties;
  children?: ReactNode;
  isWideCard?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  buttonLabel?: string;
  buttonVariant?: "primary" | "secondary" | "primary-inverted";
  isSelected?: boolean;
  blogPath?: string;
  type?: string;
  onAction?: () => void;
  onRemove?: () => void;
}

export default function ChoiceCard({
  icon,
  image,
  title,
  description,
  style,
  onClick,
  disabled = false,
  buttonLabel = "Start",
  isSelected,
  blogPath,
  type,
  onAction,
  onRemove,
}: ChoiceCardProps) {
  const router = useRouter();
  const [isRemoveHovered, setIsRemoveHovered] = React.useState(false);
  const [isRemoveFocused, setIsRemoveFocused] = React.useState(false);


  const isBookmark = type === "bookmark";
  const effectiveSelected = isSelected || isBookmark;
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: effectiveSelected ? "var(--dark-blue)" : "#C1CBE6",
        borderRadius: "2vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
        boxSizing: "border-box",
        overflow: "hidden",
        gap: "0vh",
        color: effectiveSelected ? "white" : "black",
        fontFamily: "var(--font-nova-square)",
        fontWeight: effectiveSelected ? "normal" : "bold",
        ...style
      }}
    >
      <div
        style={{
          display: "flex",
          height: "fit-content",
          width: "100%",
          flexDirection: "column",
          gap: 0,
          marginBottom: 0,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", }}>


          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              marginLeft: "auto",
            }}
          >
            {!isBookmark && (
              <div
                style={{
                  fontSize: "0.8rem",
                  position: "relative",
                  color: effectiveSelected ? "var(--light-green)" : "black",
                  cursor: effectiveSelected ? "default" : "pointer",
                  fontFamily: "var(--font-nova-square)",
                  height: "fit-content",
                }}
                onClick={onClick}
              >
                {effectiveSelected ? "selected" : "See stats"}
              </div>
            )}

            {onRemove ? (
              <button
                type="button"
                aria-label={`Remove ${title || "career"}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onRemove();
                }}
                onMouseEnter={() => setIsRemoveHovered(true)}
                onMouseLeave={() => setIsRemoveHovered(false)}
                onFocus={() => setIsRemoveFocused(true)}
                onBlur={() => setIsRemoveFocused(false)}
                style={{
                  width: "1.8rem",
                  height: "1.8rem",
                  borderRadius: "999px",
                  border: "none",
                  backgroundColor:
                    isRemoveHovered || isRemoveFocused
                      ? effectiveSelected
                        ? "rgba(230, 255, 178, 0.18)"
                        : "rgba(0, 0, 0, 0.08)"
                      : "transparent",
                  color: effectiveSelected ? "var(--light-green)" : "black",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  outline: "none",
                  boxShadow: isRemoveFocused
                    ? `0 0 0 2px ${effectiveSelected ? "rgba(230, 255, 178, 0.55)" : "rgba(0, 0, 0, 0.16)"}`
                    : "none",
                  transition: "background-color 0.18s ease, box-shadow 0.18s ease",
                  padding: 0,
                  flexShrink: 0,
                }}
              >
                <X size={14} strokeWidth={2.4} />
              </button>
            ) : null}
          </div>

        </div>

          {!isBookmark && <img
            src={image || icon || ""}
            alt={title || "career icon"}
            style={{
              width: "2.5rem",
              height: "auto",
              display: "block",
              filter: effectiveSelected ? "none" : "invert(1)",
              marginBottom: "0.5rem",
            }}
          />}

        {/* Title */}
        <p
          style={{
            fontSize: "1.2rem",
            width: isBookmark ? "12ch" : "120%",
            marginRight: "auto",
            marginTop: "0",
            position: "relative",
            marginBottom: 0,

          }}
        >
          {title}
        </p>
      </div>

      <p
        style={{
          flexGrow: 0,
          flexShrink: 0,
          fontSize: "0.7rem",
          margin: 0,
          textAlign: "left",
          marginTop: 0,
          marginRight: "auto",
        }}
      >
        {description}
      </p>

      <Button
        type="button"
        variant={isSelected ? "primary-inverted" : "popup-inverted"}
        onClick={() => {
          if (disabled) {
            return;
          }

          if (onAction) {
            onAction();
            return;
          }

          router.push(blogPath || "/");
        }}
        disabled={disabled}
        style={{
          flexGrow: 0,
          flexShrink: 0,
          width: "100%",
          marginTop: "auto",
          paddingBlock: "2.3vh"
        }}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
