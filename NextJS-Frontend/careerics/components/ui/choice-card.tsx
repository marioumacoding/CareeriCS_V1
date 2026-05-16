"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import { normalizeBackendAssetUrl } from "@/lib/asset-url";

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
  const displayImage = normalizeBackendAssetUrl(image || icon || "");

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
        borderRadius: "4vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent:"space-between",
        paddingTop:"5vh",
        paddingBottom: "3vh",
        paddingInline:"3vw",
        overflow: "hidden",
        ...style
      }}
    >
      <div
        style={{
          display: "flex",
          width:"100%",
          alignItems: "center",
          marginBottom: "auto",
          justifyContent:"space-between",
        }}
      >
        
          <img
            src={displayImage}
            alt={title || "career icon"}
            style={{
              height:"12vh"
            }}
          />

        <div
          style={{
            height: "80%",
            backgroundColor: "white",
            width: "0.1vh",
          }}
        />

        <p
          style={{
            color: "white",
            fontSize: "1.4rem",
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
          fontSize: "clamp(0.5rem,1vw,1.2rem)",
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
          paddingInline: "5vw",
          marginTop: "auto",
          paddingBlock:"2.5vh",
        }}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
