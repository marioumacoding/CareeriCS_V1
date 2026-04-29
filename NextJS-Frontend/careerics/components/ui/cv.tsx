"use client";
import React, { useRef, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button"; 
import InterviewContainer from "@/components/ui/interview-card"; 
import { useRouter } from 'next/navigation';
import { cvService } from "@/services";
import { useAuth } from "@/providers/auth-provider";

type AppStatus = 'idle' | 'enhancing' | 'completed';

export default function CV() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<AppStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("enhanced-cv.pdf");
  const [isOpeningDrive, setIsOpeningDrive] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  useEffect(() => {
    if (!selectedFile) {
      setSelectedFilePreviewUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(selectedFile);
    setSelectedFilePreviewUrl(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [selectedFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleAction = async () => {
    if (status === 'idle') {
      if (!selectedFile) {
        fileInputRef.current?.click();
      } else {
        if (!user?.id) {
          setError("Please sign in first to enhance your CV.");
          return;
        }

        setError(null);
        setStatus('enhancing');
        const oldUrl = downloadUrl;

        try {
          const pdfBlob = await cvService.enhanceCV(user.id, selectedFile);
          if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
          }

          const url = URL.createObjectURL(pdfBlob);
          setDownloadUrl(url);
          setDownloadName(`${selectedFile.name.replace(/\.[^.]+$/, "")}-enhanced.pdf`);
          setStatus('completed');
        } catch (enhanceError) {
          const message =
            enhanceError instanceof Error
              ? enhanceError.message
              : "Failed to enhance CV. Please try again.";
          setError(message);
          setStatus('idle');
        }
      }
    } else if (status === 'completed') {
      setSelectedFile(null);
      setError(null);
      setStatus('idle');
      fileInputRef.current?.click();
    }
  };

  const handleGoogleDriveQuickOpen = () => {
    if (isOpeningDrive) return;

    setIsOpeningDrive(true);

    if (downloadUrl) {
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = downloadName;
      link.click();
    }

    window.open("https://drive.google.com/drive/my-drive", "_blank", "noopener,noreferrer");

    window.setTimeout(() => {
      setIsOpeningDrive(false);
    }, 1400);
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
        Upload your CV and we&apos;ll do the rest!
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
            {selectedFile && selectedFile.type === 'application/pdf' && selectedFilePreviewUrl ? (
              <iframe
                src={`${selectedFilePreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                title="Selected CV preview"
                style={{ width: '100%', height: '100%', border: 'none', borderRadius: '32px' }}
              />
            ) : selectedFile ? (
              <img
                src="/interview/analyzing.svg"
                alt="Selected CV file"
                style={{ width: '84px', height: '125px', objectFit: 'contain' }}
              />
            ) : (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgb(0, 0, 0)" strokeWidth="1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            )}
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
            disabled={status === 'enhancing'}
          >
            {status === 'enhancing' ? "Enhance" : 
             status === 'completed' ? "Upload another CV" : 
             selectedFile ? "Enhance Now" : "Open Files"}
          </Button>

          {error && (
            <p style={{ color: "#ffb4b4", maxWidth: "220px", marginTop: "-8px" }}>{error}</p>
          )}
        </div>

        <input type="file" ref={fileInputRef} style={{ display: "none" }} onChange={handleFileChange} accept=".pdf,.docx" />

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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px', padding: '20px', height: '100%', flexWrap: 'wrap' }}>
                    <div style={{ width: 'min(34vw, 180px)', height: 'min(46vw, 240px)', minWidth: '130px', minHeight: '170px', backgroundColor: 'white', borderRadius: '25px', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {downloadUrl ? (
                        <iframe
                          src={`${downloadUrl}#view=FitH&zoom=page-fit&pagemode=none&toolbar=0`}
                          title="CV preview"
                          style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                      ) : (
                        <span style={{ color: '#6b7280', fontSize: '12px', textAlign: 'center', padding: '10px' }}>
                          Preview unavailable
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <a
                        href={downloadUrl ?? "#"}
                        download={downloadName}
                        style={{
                          backgroundColor: '#d4ff47',
                          color: '#1a1a1a',
                          border: 'none',
                          padding: '14px 40px',
                          borderRadius: '12px',
                          fontWeight: 'bold',
                          width: '240px',
                          textAlign: 'center',
                          textDecoration: 'none',
                          pointerEvents: downloadUrl ? 'auto' : 'none',
                          opacity: downloadUrl ? 1 : 0.5,
                        }}
                      >
                        Download
                      </a>
                      <span style={{ color: 'white', textAlign: 'center', opacity: 0.6 }}>or</span>
                      <button
                        type="button"
                        onClick={handleGoogleDriveQuickOpen}
                        disabled={isOpeningDrive}
                        style={{ backgroundColor: 'white', color: '#1a1a1a', border: 'none', padding: '12px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', width: '240px', justifyContent: 'center', cursor: isOpeningDrive ? 'default' : 'pointer', opacity: isOpeningDrive ? 0.7 : 1 }}
                      >
                        <img src="/interview/drive.svg" style={{ width: '18px' }} alt="Drive" /> {isOpeningDrive ? 'Opening Drive...' : 'Google Drive'}
                      </button>
                    </div>
                  </div>
                }
              />
              
              <Button 
                onClick={() => router.push('/features/home')}
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