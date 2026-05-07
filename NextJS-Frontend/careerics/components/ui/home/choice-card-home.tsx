"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { CSSProperties, ReactNode } from "react";
import Image from "next/image";

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
}: ChoiceCardProps) {
  const router = useRouter();


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
        padding: "3vh",
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
        <div style={{ display: "flex", justifyContent:"space-between", }}>

          {/* Image */}

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

          {!isBookmark && (
            <div
              style={{
                marginLeft: "auto",
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

        </div>


        {/* Title */}
        <p
          style={{
            fontSize: "1.2rem",
            width: isBookmark?"12ch":"120%",
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
        onClick={() => { router.push(blogPath || "/"); }}
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
