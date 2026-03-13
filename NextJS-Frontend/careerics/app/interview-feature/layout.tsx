"use client";
import React, { ReactNode } from 'react';

export default function RecordingLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      width: '100vw',
     background: 'linear-gradient(180deg, #142143 0%, black 100%), #BABABA',
       margin: 0,
      padding: 0,
      overflow: 'hidden',
      fontFamily: 'var(--font-nova-square)'
    }}>
  
      {/* Main Content Area */}
      <main style={{
        flex: 1,
        position: 'relative',
        display: 'fixed',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {children}
      </main>
    </div>
  );
}