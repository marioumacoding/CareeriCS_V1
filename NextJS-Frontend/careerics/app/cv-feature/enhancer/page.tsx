"use client";

import Script from "next/script";
import CV from "@/components/ui/cv";

const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

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
      <Script src={GOOGLE_IDENTITY_SCRIPT_SRC} strategy="afterInteractive" />
      <CV />
    </div>
  );
}
