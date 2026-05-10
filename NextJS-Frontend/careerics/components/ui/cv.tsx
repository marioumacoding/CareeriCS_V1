"use client";

import React, { useEffect, useRef, useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { cvService } from "@/services";
import { Button } from "@/components/ui/button";
import InterviewContainer from "@/components/ui/interview-card";
import { PdfPreviewFrame } from "@/components/ui/pdf-preview-frame";

type AppStatus = "idle" | "enhancing" | "completed";

function toSafePdfFileName(label: string, fallback: string): string {
  const normalized = label
    .trim()
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");

  return `${normalized || fallback}.pdf`;
}

export default function CV() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<AppStatus>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreviewUrl, setSelectedFilePreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadName, setDownloadName] = useState("enhanced-cv.pdf");
  const [isOpeningDrive, setIsOpeningDrive] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    return () => {
      if (downloadUrl) {
        URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
    };
  }, [selectedFilePreviewUrl]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }

      const nextFile = event.target.files[0];
      setSelectedFile(nextFile);
      setSelectedFilePreviewUrl(
        nextFile.type === "application/pdf" ? URL.createObjectURL(nextFile) : null,
      );
      setError(null);
    }
  };

  const handleAction = async () => {
    if (status === "idle") {
      if (!selectedFile) {
        fileInputRef.current?.click();
        return;
      }

      if (!user?.id) {
        setError("Please sign in first to enhance your CV.");
        return;
      }

      setError(null);
      setStatus("enhancing");
      const oldUrl = downloadUrl;

      try {
        const pdfBlob = await cvService.enhanceCV(user.id, selectedFile);
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        const url = URL.createObjectURL(pdfBlob);
        setDownloadUrl(url);
        setDownloadName(
          toSafePdfFileName(
            `${selectedFile.name.replace(/\.[^.]+$/, "")}-enhanced`,
            "enhanced-cv",
          ),
        );
        setStatus("completed");
      } catch (enhanceError) {
        const message =
          enhanceError instanceof Error
            ? enhanceError.message
            : "Failed to enhance CV. Please try again.";
        setError(message);
        setStatus("idle");
      }
    } else if (status === "completed") {
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }

      setSelectedFile(null);
      setSelectedFilePreviewUrl(null);
      setError(null);
      setStatus("idle");
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
      <h1
        style={{
          fontSize: "36px",
          fontWeight: "300",
          maxWidth: "600px",
          lineHeight: "1.1",
          marginBottom: "40px",
          marginTop: "-30px",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        Upload your CV and we&apos;ll do the rest!
      </h1>

      <div style={{ display: "flex", alignItems: "flex-start", gap: "80px", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "30px", flexShrink: 0 }}>
          <div
            onClick={() => status === "idle" && fileInputRef.current?.click()}
            style={{
              width: "220px",
              height: "300px",
              backgroundColor: "white",
              borderRadius: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: status === "idle" ? "pointer" : "default",
              transition: "all 0.3s ease",
              overflow: "hidden",
            }}
          >
            {selectedFile && selectedFile.type === "application/pdf" && selectedFilePreviewUrl ? (
              <PdfPreviewFrame
                src={selectedFilePreviewUrl}
                title="Selected CV preview"
              />
            ) : selectedFile ? (
              <img
                src="/interview/analyzing.svg"
                alt="Selected CV file"
                style={{ width: "84px", height: "125px", objectFit: "contain" }}
              />
            ) : (
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgb(0, 0, 0)" strokeWidth="1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
            )}
          </div>

          <Button
            onClick={() => void handleAction()}
            style={{
              width: "220px",
              height: "35px",
              flex: "none",
              borderRadius: "16px",
              fontWeight: "bold",
              fontSize: "14px",
              marginTop: "-20px",
              border: "none",
              cursor: status === "enhancing" ? "default" : "pointer",
              transition: "all 0.3s ease",
              backgroundColor: status === "enhancing" ? "#555" : "#bfff4f",
              color: status === "enhancing" ? "#f4f4f5" : "black",
            }}
            disabled={status === "enhancing"}
          >
            {status === "enhancing"
              ? "Enhancing..."
              : status === "completed"
                ? "Upload another CV"
                : selectedFile
                  ? "Enhance Now"
                  : "Open Files"}
          </Button>

          {error ? (
            <p style={{ color: "#ffb4b4", maxWidth: "220px", marginTop: "-8px" }}>{error}</p>
          ) : null}
        </div>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
          accept=".pdf,.docx"
        />

        <div style={{ width: "1px", height: "300px", backgroundColor: "rgb(255, 255, 255)" }} />

        <div style={{ flex: 1 }}>
          {status === "completed" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "30px",
                alignItems: "center",
                width: "100%",
              }}
            >
              <InterviewContainer
                questionTitle=""
                videoBoxStyle={{
                  background: "rgba(255, 255, 255, 0.41)",
                  width: "80%",
                  minHeight: "300px",
                  boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
                  borderRadius: "40px",
                }}
                videoContent={
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "20px",
                      padding: "20px",
                      minHeight: "300px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        width: "min(34vw, 180px)",
                        height: "min(46vw, 240px)",
                        minWidth: "130px",
                        minHeight: "170px",
                        borderRadius: "25px",
                        flexShrink: 0,
                        overflow: "hidden",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PdfPreviewFrame src={downloadUrl} title="CV preview" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      <a
                        href={downloadUrl ?? "#"}
                        download={downloadName}
                        style={{
                          backgroundColor: "#d4ff47",
                          color: "#1a1a1a",
                          border: "none",
                          padding: "14px 40px",
                          borderRadius: "12px",
                          fontWeight: "bold",
                          width: "240px",
                          textAlign: "center",
                          textDecoration: "none",
                          pointerEvents: downloadUrl ? "auto" : "none",
                          opacity: downloadUrl ? 1 : 0.5,
                        }}
                      >
                        Download
                      </a>
                      <span style={{ color: "white", textAlign: "center", opacity: 0.6 }}>or</span>
                      <button
                        type="button"
                        onClick={handleGoogleDriveQuickOpen}
                        disabled={isOpeningDrive}
                        style={{
                          backgroundColor: "white",
                          color: "#1a1a1a",
                          border: "none",
                          padding: "12px 20px",
                          borderRadius: "10px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          width: "240px",
                          justifyContent: "center",
                          cursor: isOpeningDrive ? "default" : "pointer",
                          opacity: isOpeningDrive ? 0.7 : 1,
                        }}
                      >
                        <img src="/global/drive.svg" style={{ width: "18px" }} alt="Drive" />
                        {isOpeningDrive ? "Opening Drive..." : "Google Drive"}
                      </button>
                    </div>
                  </div>
                }
              />

            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
