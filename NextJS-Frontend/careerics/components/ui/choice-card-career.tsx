"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { CSSProperties, ReactNode } from "react";

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
  onBookmark?: () => void;
  disabled?: boolean;
  buttonLabel?: string;
  buttonVariant?: any;
  isBookmarked?: boolean;
}

export default function ChoiceCard({
  icon,
  image,
  title,
  description,
  route,
  style,
  buttonVariant,
  onClick,
  onBookmark,
  disabled = false,
  buttonLabel = "Learn More",
  isBookmarked = false,
}: ChoiceCardProps) {
  const router = useRouter();

  const handleButtonClick = () => {
    if (onClick) {
      onClick();
    } else if (route) {
      router.push(route);
    }
  };

  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#16213e",
        borderRadius: "9px",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "space-between",
        padding: "1.2rem",
        width: "100%",
        maxHeight: "100%",
        ...style
      }}
    >
      {/* 1. Icon Section */}
      <div
        style={{
          marginBottom: "1vh",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          width: "100%",
        }}
      >
        <img
          src={image || icon || ""}
          alt={title || "career icon"}
          style={{
            width: "2.5rem",
            height: "auto",
            display: "block",
            marginBottom: "0.5rem",
          }}
        />
        <img
          src={isBookmarked ? "/global/bookmark-filled.svg" : "/global/bookmark.svg"}
          alt={"bookmark"}
          onClick={onBookmark}
          style={{
            height: "1.5rem",
            display: "block",
            marginBottom: "0.5rem",
            cursor: "pointer",
          }}
        />
      </div>

      {/* 2. Title Section */}
      <h3
        style={{
          color: "white",
          fontSize: "1.2rem",
          fontFamily: "var(--font-nova-square)",
          textAlign: "left",
          maxWidth: "20ch",
        }}
      >
        {title}
      </h3>

      {/* 3. Description Section */}
      <p
        style={{
          color: "rgba(255,255,255,0.7)",
          textAlign: "left",
          fontSize: "0.8rem",
          margin: "0 0 1vh 0",
          lineHeight: "1",
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          width: "100%",
        }}
      >
        {description}
      </p>

      {/* 4. Button Section */}
      <Button
        type="button"
        variant={buttonVariant}
        onClick={handleButtonClick}
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