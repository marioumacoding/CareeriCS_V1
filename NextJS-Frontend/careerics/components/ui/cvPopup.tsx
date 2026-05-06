"use client";
import React, { useRef, useState } from "react";

interface CVPopProps {
  onClose: () => void;
  lastVersion: string;
  onFileSelect?: (file: File) => Promise<void> | void;
}

export default function CVPop({
  onClose,
  lastVersion,
  onFileSelect,
}: CVPopProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setStatus("idle");
  };

  const handleExtract = async () => {
    if (!selectedFile || status === "loading") return;

    setStatus("loading");

    try {
      if (onFileSelect) {
        await onFileSelect(selectedFile);
      }

      setStatus("success");

      setSelectedFile(null);
      setSelectedFileName("");
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--light-green)",
          width: "26rem",
          padding: "4vh",
          borderRadius: "40px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "2vh",
          fontFamily: "var(--font-nova-square)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 400,
              lineHeight: 1.5,
            }}
          >
            Replace your information
          </h2>
          <img
            onClick={onClose}
            src="/global/close.svg"
            style={{
              width: "2rem",
              height: "2rem",
              filter: "invert(1)",
              cursor: "pointer",
            }}
          />
        </div>

        <div
          style={{
            width: "100%",
            height: "0.1rem",
            backgroundColor: "black",
            borderRadius: "999px",
          }}
        />
        {/* Info Row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            The last extracted version
          </span>
        </div>

        <div
          style={{
            backgroundColor: "white",
            color: "#8E8E8E",
            padding: "12px 25px",
            borderRadius: "2vh",
            fontSize: "1rem",
            width: "100%",
            textAlign: "center",
          }}
        >
          {lastVersion}
        </div>

        {/* Upload Section */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "flex-start",
          }}
        >
          <span style={{ fontSize: "1.1rem", fontWeight: 500 }}>
            Upload new CV
          </span>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: "100%",
              gap: "20px",
            }}
          >
            {/* Hidden Input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
              accept=".pdf,.docx"
            />

            <img
              src={
                selectedFileName ? "/cv/file.svg" : "/cv/upload.svg"
              }
              alt="Upload"
              style={{ height: "12vh" }}
            />

            {/* Button */}
            <button
              onClick={
                !selectedFileName
                  ? handleButtonClick
                  : handleExtract
              }
              disabled={status === "loading"}
              style={{
                backgroundColor: "var(--medium-grey)",
                color: "white",
                border: "none",
                paddingBlock: "1.5vh",
                paddingInline: "3vw",
                borderRadius: "15px",
                fontSize: "1.1rem",
                fontWeight: 600,
                cursor:
                  status === "loading"
                    ? "not-allowed"
                    : "pointer",
                transition: "0.3s opacity",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.opacity = "0.8")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.opacity = "1")
              }
            >
              {status === "loading"
                ? "Processing..."
                : !selectedFileName
                  ? "Open Files"
                  : "Extract"}
            </button>

            {/* File name */}
            {selectedFileName ? (
              <p
                style={{
                  margin: 0,
                  color: "#000000",
                  opacity: 0.85,
                  maxWidth: "100%",
                  textAlign: "center",
                  wordBreak: "break-word",
                  fontSize: "14px",
                }}
              >
                {selectedFileName}
              </p>
            ) : null}

            {/* Feedback */}
            {status === "success" && (
              <p style={{ color: "#000000", fontSize: "14px" }}>
                Extracted successfully
              </p>
            )}

            {status === "error" && (
              <p style={{ color: "#ff0000", fontSize: "14px" }}>
                Extraction failed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}