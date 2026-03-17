"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"; 
import InterviewContainer from "@/components/ui/interview-card"; 
import { useRouter } from 'next/navigation';

type AppStatus = 'idle' | 'enhancing' | 'completed';

export default function CV() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [hasFile, setHasFile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setHasFile(true);
    }
  };

  const handleAction = () => {
    if (status === 'idle') {
      if (!hasFile) {
        fileInputRef.current?.click();
      } else {
        setStatus('enhancing');
        setTimeout(() => setStatus('completed'), 3000);
      }
    } else if (status === 'completed') {
      setHasFile(false);
      setStatus('idle');
      fileInputRef.current?.click();
    }
  };

  return (
    <div style={{ width: "100%", maxWidth: "1200px" }}>
      {/* Headline */}
      <h1 style={{
        fontSize: "36px",
        fontWeight: "300",
        maxWidth: "600px",
        lineHeight: "1.1",
        marginBottom: "40px",
        marginTop: "-30px",
        fontFamily: "var(--font-nova-square)"
      }}>
        Upload your CV and we'll do the rest!
      </h1>

      {/* Layout Row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "80px", width: "100%" }}>
        
        {/* LEFT GROUP */}
        <div style={{ display: "flex", flexDirection: "column", gap: "30px", flexShrink: 0 }}>
          <div 
            onClick={() => status === 'idle' && fileInputRef.current?.click()}
            style={{
              width: "220px", 
              height: "300px",
              backgroundColor: "white", 
              borderRadius: "32px",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              cursor: status === 'idle' ? "pointer" : "default",
              transition: "all 0.3s ease",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgb(0, 0, 0)" strokeWidth="1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
          </div>

          <Button 
            onClick={handleAction} 
            style={{
              width: "220px", 
              height: "35px", // Fixed height
              flex:"none",
              borderRadius: "16px",
              fontWeight: "bold", 
              fontSize: "14px", 
              marginTop: "-20px",
              border: "none",
              cursor: status === 'enhancing' ? "default" : "pointer",
              transition: "all 0.3s ease",
              backgroundColor: status === 'enhancing' ? "#555" : "#bfff4f",
              color: status === 'enhancing' ? "#888" : "black",
            }}
          >
            {status === 'enhancing' ? "Enhance" : 
             status === 'completed' ? "Upload another CV" : 
             hasFile ? "Enhance Now" : "Open Files"}
          </Button>
        </div>

        <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} />

        {/* Vertical Divider - Matching the card height (300px) */}
        <div style={{ width: "1px", height: "300px", backgroundColor: "rgb(255, 255, 255)" }} />

        {/* RIGHT GROUP */}
        <div style={{ flex: 1 }}>
          {status === 'completed' && (
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: "30px", 
              alignItems: "center", 
              width: "100%" 
            }}>
              <InterviewContainer
                questionTitle=""
                videoBoxStyle={{ 
                  background: 'rgba(255, 255, 255, 0.41)', 
                  width: '80%', 
                  height: '300px', // Matches card and divider height
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  borderRadius: '40px',
                }}
                videoContent={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '40px', padding: '30px', height: '100%' }}>
                    <div style={{ width: '180px', height: '240px', backgroundColor: 'white', borderRadius: '25px', flexShrink: 0 }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <button style={{ backgroundColor: '#d4ff47', color: '#1a1a1a', border: 'none', padding: '14px 40px', borderRadius: '12px', fontWeight: 'bold', width: '240px', cursor: 'pointer' }}>Download</button>
                      <span style={{ color: 'white', textAlign: 'center', opacity: 0.6 }}>or</span>
                      <button style={{ backgroundColor: 'white', color: '#1a1a1a', border: 'none', padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', width: '240px', justifyContent: 'center', cursor: 'pointer' }}>
                        <img src="/interview/drive.svg" style={{ width: '18px' }} alt="Drive" /> Google Drive
                      </button>
                    </div>
                  </div>
                }
              />
              
              <Button 
                onClick={() => router.push('/')}
                style={{
                  width: "220px",
                  height: "35px",
                  flex: "none",
                  borderRadius: "16px",
                  fontWeight: "bold",
                  fontSize: "14px",
                  marginTop: "-20px",
                  backgroundColor: "#C1CBE6",
                  color: "black",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Go back to home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}