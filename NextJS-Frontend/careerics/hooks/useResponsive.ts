"use client";

import { useEffect, useState } from "react";

const LARGE = 1024;
const MEDIUM = 640;

function getSnapshot() {
  if (typeof window === "undefined") {
    return {
      isLarge: true,
      isMedium: false,
      isSmall: false,
      width: LARGE,
    };
  }

  const width = window.innerWidth;

  return {
    width,
    isLarge: width >= LARGE,
    isMedium: width >= MEDIUM && width < LARGE,
    isSmall: width < MEDIUM,
  };
}

export const useResponsive = () => {
  const [state, setState] = useState(getSnapshot);

  useEffect(() => {
    const update = () => setState(getSnapshot());

    // instant sync (no delay)
    update();

    window.addEventListener("resize", update);

    return () => window.removeEventListener("resize", update);
  }, []);

  return state;
};