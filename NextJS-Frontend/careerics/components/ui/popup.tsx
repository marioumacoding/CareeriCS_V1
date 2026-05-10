"use client";

import React, { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";

interface CustomizeInterviewPopupProps {
  onClose: () => void;
  onStart: (selectedType: string) => void;
  options: string[];
  title?: string;
  isSubmitting?: boolean;
  isLoadingOptions?: boolean;
  errorMessage?: string | null;
  initialValue?: string;
}

export default function CustomizeInterviewPopup({
  onClose,
  onStart,
  options,
  title = "Choose Your Technical Interview Type",
  isSubmitting = false,
  isLoadingOptions = false,
  errorMessage = null,
  initialValue = "",
}: CustomizeInterviewPopupProps) {
  const [selectedRole, setSelectedRole] = useState(initialValue);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    setSelectedRole(initialValue);
  }, [initialValue]);

  const sortedOptions = useMemo(() => [...options].sort((left, right) => left.localeCompare(right)), [options]);

  const handleStart = () => {
    if (!selectedRole || isSubmitting) {
      return;
    }

    onStart(selectedRole);
  };

  return (
    <div
      aria-modal="true"
      role="dialog"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--light-green)",
          width: "min(560px, 100%)",
          padding: "40px",
          borderRadius: "40px",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          gap: "25px",
          fontFamily: "var(--font-nova-square)",
          boxSizing: "border-box",
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: "25px",
            right: "25px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#000",
          }}
          aria-label="Close popup"
        >
          x
        </button>

        <h2 style={{ fontSize: "32px", margin: 0, color: "#000" }}>{title}</h2>

        <hr style={{ border: "none", borderTop: "2px solid rgb(0, 0, 0)", margin: 0 }} />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "18px" }}>
          <span style={{ fontSize: "20px", fontWeight: 500, paddingTop: "10px" }}>Career / Role:</span>
          <div style={{ position: "relative", width: "260px" }}>
            <div
              onClick={() => setIsDropdownOpen((open) => !open)}
              style={{
                backgroundColor: "white",
                padding: "12px 20px",
                borderRadius: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                cursor: "pointer",
                fontSize: "16px",
                width: "100%",
                boxSizing: "border-box",
                minHeight: "52px",
              }}
            >
              <span
                style={{
                  color: selectedRole ? "#000" : "#8E8E8E",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {selectedRole || "Click to choose"}
              </span>
              <span
                style={{
                  transition: "0.2s",
                  transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                v
              </span>
            </div>

            {isDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  width: "100%",
                  backgroundColor: "white",
                  borderRadius: "14px",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  overflow: "hidden",
                  zIndex: 10,
                  maxHeight: "230px",
                  overflowY: "auto",
                }}
              >
                {sortedOptions.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      setSelectedRole(role);
                      setIsDropdownOpen(false);
                    }}
                    style={{
                      width: "100%",
                      padding: "12px 20px",
                      cursor: "pointer",
                      border: "none",
                      borderBottom: "1px solid #f0f0f0",
                      color: "#333",
                      fontSize: "14px",
                      textAlign: "left",
                      backgroundColor: selectedRole === role ? "#eef6d0" : "white",
                      fontFamily: "inherit",
                    }}
                  >
                    {role}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <p style={{ margin: 0, color: "#111827", fontSize: "15px", lineHeight: 1.5 }}>
          {isLoadingOptions
            ? "Loading the available technical interview careers..."
            : "We'll load the technical question bank for the exact career you choose here."}
        </p>

        {errorMessage ? (
          <p style={{ margin: 0, color: "#7f1d1d", fontSize: "14px" }}>{errorMessage}</p>
        ) : null}

        <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
          <Button
            type="button"
            variant="popup-inverted"
            onClick={onClose}
            disabled={isSubmitting}
            style={{ minHeight: "56px", fontSize: "18px" }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="popup"
            onClick={handleStart}
            disabled={!selectedRole || isSubmitting || isLoadingOptions}
            style={{ minHeight: "56px", fontSize: "18px" }}
          >
            {isSubmitting ? "Starting..." : isLoadingOptions ? "Loading..." : "Start Interview"}
          </Button>
        </div>
      </div>
    </div>
  );
}
