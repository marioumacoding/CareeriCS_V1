"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import React, { CSSProperties, ReactNode } from "react";

interface ChoiceCardProps {
  icon: string;
  title: string;
  description: string;
  route: string;
  style?: CSSProperties;
  children?: ReactNode;
  buttonVariant: "primary" | "secondary" | "primary-inverted";
}

export default function ChoiceCard({
  icon,
  title,
  description,
  route,
  style,
  buttonVariant,
}: ChoiceCardProps) {
  const router = useRouter();

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
          display: "grid",
          gridTemplateColumns: "10fr 1fr 10fr",
          height: "40%",
          justifyItems: "center",
          alignItems: "center",
          flexGrow: 0,
          flexShrink: 0,
          marginBottom: "auto",
        }}
      >
        <img
          src={icon}
          alt={title}
          style={{
            width: "70%",
          }} />

        <div
          style={{
            height: "80%",
            backgroundColor: "white",
            width: "0.1vh",
            margin: 0,
          }}
        />

        <p
          style={{
            margin: 0,
            color: "white",
            fontSize: "clamp(0.8rem,1.7vw,1.5rem)",
            fontFamily: "var(--font-nova-square)"
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
        onClick={() => router.push(route)}
        style={{
          flexGrow: 0,
          flexShrink: 0,
          paddingInline: "5vw",
          marginTop: "auto"
        }}
      >
        Start
      </Button>
    </div>
  );
}