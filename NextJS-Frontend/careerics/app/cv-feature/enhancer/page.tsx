"use client";

import CV from '@/components/ui/cv';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      width: "100vw",
      height: "100vh",
    //   position: "fixed",
      top: 0,
      left: 0,
      color: "white",
      justifyContent: "center", 
      alignItems: "center",
      padding: "0 5vw",
      zIndex: 100
    }}>
      {/* Global Close Button */}
      <div
        onClick={() => router.push('/features/cv')}
        style={{ position: "absolute", top: "40px", right: "40px", cursor: "pointer", opacity: 0.5 }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </div>

      <CV />
    </div>
  );
}