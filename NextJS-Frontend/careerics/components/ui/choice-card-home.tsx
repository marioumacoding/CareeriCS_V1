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
  disabled = false,
  buttonLabel = "Start",
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
        width: "100%",
        height: "100%",
        backgroundColor: "var(--dark-blue)",
        borderRadius: "2vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "3vh",
        boxSizing: "border-box",
        overflow: "hidden",
        gap: "1vh",
        ...style
      }}
    >
      <div
        style={{
          display: "flex",
          height: "40%",
          alignItems: "center",
          marginBottom: "auto",
          width: "fit-content",
          gap: "10px",
          alignSelf: "flex-start",
        }}
      >
        {/* Left — Image */}
        <div
          style={{
            position: "relative",
            width: "10vh",
            height: "100%",
          }}
        >
          <Image
            src={image || icon || ""}
            alt={title || "career icon"}
            fill
            style={{
              objectFit: "contain",
            }}
          />
        </div>

        {/* Center — Splitter */}
        <div
          style={{
            height: "80%",
            backgroundColor: "white",
            width: "0.1vh",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        />

        {/* Right — Title */}
        <p
          style={{
            color: "white",
            fontSize: "1rem",
            fontFamily: "var(--font-nova-square)",
            width: "min-content",
          }}
        >
          {title}
        </p>
      </div>

      <p
        style={{
          flexGrow: 0,
          flexShrink: 0,
          color: "white",
          textAlign: "center",
          fontSize: "0.8rem",
          margin: 0,
        }}
      >
        {description}
      </p>

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
          paddingBlock:"2.3vh"
        }}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
