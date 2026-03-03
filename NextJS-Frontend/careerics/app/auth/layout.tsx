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

      {/* Title Top Right */}
      <div className="auth-title">
        Career<span>iCS</span>
      </div>

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

        .auth-title {
          position: absolute;
          top: 2rem;
          right: 2rem;
          font-size: 4rem;

          z-index: 2;
          font-family: var(--font-nova-square);
          background: radial-gradient(circle at center, white 0%, #999999 100%);
         -webkit-background-clip: text;
         -webkit-text-fill-color: transparent;
         background-clip: text;
        color: transparent;
        }

        .auth-title span {
          font-weight: bold;
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