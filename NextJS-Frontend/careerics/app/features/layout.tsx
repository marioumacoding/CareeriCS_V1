"use client";

import Sidebar from "@/components/ui/sidebar";
import BG from "@/components/ui/folder";
import { usePathname } from "next/navigation";
import React, { CSSProperties, ReactNode } from "react";

interface RootLayoutProps {
  style?: CSSProperties;
  children?: ReactNode;
}

export default function RootLayout({
  style,
  children,
}: RootLayoutProps & { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoadmapDetailRoute = /^\/features\/roadmap\/[^/]+\/?$/.test(pathname);

  if (isRoadmapDetailRoute) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        backgroundColor: "var(--bg-color)",
        display: "flex",
      }}
    >

      <Sidebar />

      <div style={{ flex: 1, minWidth: 0, padding: "var(--space-sm)" }}>
        <BG>

          <div style={{
            position: "relative",
            height: "100%",
            margin: "0 auto",
            width:"100%",
            ...style,
          }}
          >
            {children}
          </div>


        </BG>
      </div>

    </div>

  );
}