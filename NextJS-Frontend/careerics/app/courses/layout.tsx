"use client";
import React, { ReactNode } from 'react';

export default function ExtractorLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
      // Vertical gradient: Navy (#142143) to Black (#000000)
      background: 'linear-gradient(180deg, #142143 0%, #000000 100%)',
      alignItems: 'center',
      justifyContent: 'center',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      fontFamily: 'var(--font-nova-square)',
    }}>
      {/* This 'children' prop will render whatever you build in your page.tsx.
          Because of the flex settings above, your card will be perfectly 
          centered automatically.
      */}
      {children}
    </div>
  );
}