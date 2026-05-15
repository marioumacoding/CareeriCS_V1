"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

const AppReadyContext = createContext(false);

export const useAppReady = () => useContext(AppReadyContext);

export const AppReadyProvider = ({ children }: { children: React.ReactNode }) => {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // wait for full hydration + paint cycle
    const id = requestAnimationFrame(() => {
      setReady(true);
    });

    return () => cancelAnimationFrame(id);
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0b0b0b",
          color: "#fff",
          zIndex: 99999,
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <AppReadyContext.Provider value={true}>
      {children}
    </AppReadyContext.Provider>
  );
};