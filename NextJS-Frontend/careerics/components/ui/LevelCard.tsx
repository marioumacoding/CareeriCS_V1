"use client";

import React from "react";
import { Button } from "@/components/ui/button";

type LevelCardProps = {
  title?: string;
  iconSrc?: string;
  onClick?: () => void;
  style?: React.CSSProperties; // ✅ only this
};

const LevelCard: React.FC<LevelCardProps> = ({
  title = "Check Your Level",
  iconSrc = "/job/check.svg",
  onClick,
  style,
}) => {
  return (
    <div
      style={{
        backgroundColor: "#142143",
        borderRadius: "20px",
        padding: "1rem",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: "5px",
        aspectRatio: "1/1",
        boxSizing: "border-box",

        ...style, // ✅ override container only
      }}
    >
      {/* Top Section */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexGrow: 1,
          paddingInline: "0.5rem",
        }}
      >
        <img
          src={iconSrc}
          alt="Level Icon"
          style={{ width: "60px", height: "60px", flexShrink: 0 }}
        />

        <div
          style={{
            width: "1.7px",
            height: "80px",
            backgroundColor: "#fff",
            flexShrink: 0,
          }}
        />

        <h3
          style={{
            color: "white",
            margin: 0,
            fontFamily: "Nova Square",
            fontWeight: "400",
            fontSize: "1.2rem",
            lineHeight: "1.5",
            maxWidth: "min-content",
            textTransform: "capitalize",
          }}
        >
          {title}
        </h3>
      </div>

      {/* Button */}
      <Button
        variant="secondary"
        style={{
          color: "black",
          borderRadius: "5px",
          fontFamily: "Nova Square",
          width: "100%",
          paddingBlock: "0.5rem",
        }}
        onClick={onClick}
      >
        Start Test
      </Button>
    </div>
  );
};

export default LevelCard;