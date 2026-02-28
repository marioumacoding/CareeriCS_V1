"use client";
import { ReactNode } from "react";

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="auth-wrapper">
      {children}

      {/* Robot SVG bottom-right */}
      <div className="auth-robot">
        <img src="/Sign Robot.svg" alt="Robot" />
      </div>

      <style jsx>{`
        .auth-wrapper {
          min-height: 100vh;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }

        .auth-robot {
          position: absolute;
          right: 0;
          bottom: 0;
          display: flex;
          align-items: flex-end;
          pointer-events: none;
        }

        .auth-robot img {
          height: 90vh;
          width: auto;
          max-width: 100%;
          object-fit: contain;
          display: block;
        }
      `}</style>
    </div>
  );
}