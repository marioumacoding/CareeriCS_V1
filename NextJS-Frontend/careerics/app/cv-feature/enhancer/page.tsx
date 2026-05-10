"use client";

import CV from "@/components/ui/cv";

export default function Page() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        top: 0,
        left: 0,
        color: "white",
        justifyContent: "center",
        alignItems: "center",
        padding: "0 5vw",
        zIndex: 100,
      }}
    >
      <CV />
    </div>
  );
}
