"use client";

import React from "react";
import { normalizeBackendAssetUrl } from "@/lib/asset-url";

const EMBEDDED_SCROLLBAR_GUTTER_PX = 18;

export function buildPdfPreviewSrc(src: string): string {
  const normalizedSrc = normalizeBackendAssetUrl(src);
  const separator = normalizedSrc.includes("#") ? "&" : "#";
  return `${normalizedSrc}${separator}toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=page-fit&pagemode=none`;
}

export function PdfPreviewFrame({
  src,
  title,
  fallbackLabel = "Preview unavailable",
  style,
}: {
  src: string | null;
  title: string;
  fallbackLabel?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        backgroundColor: "white",
        borderRadius: "inherit",
        overflow: "hidden",
        ...style,
      }}
    >
      {src ? (
        <iframe
          src={buildPdfPreviewSrc(src)}
          title={title}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: `calc(100% + ${EMBEDDED_SCROLLBAR_GUTTER_PX}px)`,
            height: `calc(100% + ${EMBEDDED_SCROLLBAR_GUTTER_PX}px)`,
            border: "none",
            backgroundColor: "white",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#6b7280",
            fontSize: "12px",
            textAlign: "center",
            padding: "10px",
          }}
        >
          {fallbackLabel}
        </div>
      )}
    </div>
  );
}
