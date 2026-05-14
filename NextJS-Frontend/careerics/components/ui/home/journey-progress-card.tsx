import React, { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";


export const JourneyProgressCard = ({ percentage = 10, style }: any) => {

  const pathname = usePathname();
  const LARGE = 1024;
  const MEDIUM = 640;

  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isLarge = width >= LARGE;
  const isMedium = width >= MEDIUM && width < LARGE;
  const isSmall = width < MEDIUM;

  return (
    <div
      style={{
        backgroundColor: "var(--dark-blue)",
        color: "white",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        borderRadius: "var(--radius-lg)",
        padding: isLarge?"var(--space-md)":"var(--space-lg)",
        gap: "var(--space-md)",
        ...style,
      }}
    >
      <h3
        style={{
          fontSize: "var(--text-md)",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        Journey Progress
      </h3>

      <div
        style={{
          width: "100%",
          flex: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        <img
          src={`/home/journey-progress/${percentage}.svg`}
          alt="Progress"
          style={{
            maxWidth: isLarge?"100%":"90%",
            maxHeight: isLarge?"100%":"90%",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};