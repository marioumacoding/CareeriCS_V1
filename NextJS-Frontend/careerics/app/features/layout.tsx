import React from "react";

// 1. The function must be named (optional but recommended)
// 2. It MUST accept { children } as a prop
export default function InterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="interview-container">
      {/* 3. It MUST return the children */}
      {children}
    </section>
  );
}