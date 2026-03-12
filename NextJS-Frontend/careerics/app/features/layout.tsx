import Sidebar from "@/components/ui/sidebar";
import BG from "@/components/ui/folder";
import React, { CSSProperties, ReactNode } from "react";

interface RootLayoutProps {
  style?: CSSProperties;
  children?: ReactNode;
}

export default function RootLayout({
  style,
  children,
}: RootLayoutProps & { children: React.ReactNode }) {
  return (

    <div style={{
      position: "fixed",
      inset: 0,
      overflow: "hidden",
      backgroundColor: "var(--bg-color)",
      display: "flex"
    }}>

      <Sidebar />

      <div style={{ flex: 1, padding: "2vh" }}>
        <BG>

          <div style={{
            position: "relative",
            height: "80%",
            aspectRatio: "1450/750",
            margin: "0 auto",
            display: "grid",
            ...style,
          }}
          >
            {children}
          </div>


        </BG>
      </div >

    </div >

  );
}