"use client";

import { useEffect, useState } from "react";

const LARGE = 1024;
const MEDIUM = 640;

export const useResponsive = () => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const isLarge = width >= LARGE;
  const isMedium = width >= MEDIUM && width < LARGE;
  const isSmall = width < MEDIUM;

  return {
    width,
    isLarge,
    isMedium,
    isSmall,
  };
};