import React from "react";

import { CircleScore } from "@/components/ui/circle-score";

type Variant = "download" | "retake" | "progress";

type Props = {
  title: string;
  provider?: string;
  id?: string;
  date?: string;
  score?: number;
  skill?: string;
  variant: Variant;
  onClick?: () => void;
  style?: React.CSSProperties;
};

export const ActivityCard = ({
  title = "Unknown Title",
  provider = "unknown provider",
  id,
  skill = "unknown skill",
  date = "unknown date",
  score = 0,
  variant,
  onClick,
  style,
}: Props) => {
  const isDownload = variant === "download";
  const isRetake = variant === "retake";
  const isProgress = variant === "progress";

  return (
    <div
      style={{
        backgroundColor: "#C1CBE6",
        borderRadius: "2vh",
        padding: "0.6rem",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "black",
        fontFamily: "var(--font-nova-square)",
        width: "100%",
        height: "fit-content",
        ...style,
      }}
    >
      <div>
        <div
          style={{
            fontWeight: "bold",
            fontSize: "0.8rem",
          }}
        >
          {title ?? id}
        </div>

        <div
          style={{
            fontSize: "0.75rem",
          }}
        >
          {isProgress
            ? `on ${skill ?? "unknown skill"}`
            : isRetake
              ? `By ${provider ?? "unknown provider"}`
              : `Created on ${date}`}
        </div>
      </div>

      {isProgress ? (
        <CircleScore score={score ?? 0} />
      ) : isDownload ? (
        <button
          type="button"
          onClick={onClick}
          style={{
            background: "none",
            border: "none",
            cursor: onClick ? "pointer" : "default",
            opacity: onClick ? 1 : 0.55,
          }}
          disabled={!onClick}
          aria-label={`Download ${id}`}
        >
          <img
            src="/global/download.svg"
            alt=""
            style={{
              maxHeight: "4vh",
            }}
          />
        </button>
      ) : (
        <button
          type="button"
          onClick={onClick}
          style={{
            background: "none",
            border: "none",
            cursor: onClick ? "pointer" : "default",
            opacity: onClick ? 1 : 0.55,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          disabled={!onClick}
          aria-label={`Retake ${title}`}
        >
          <img
            src="/interview/retake.svg"
            alt=""
            aria-hidden="true"
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </button>
      )}
    </div>
  );
};
