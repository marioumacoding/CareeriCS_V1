"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CircleScore } from "../circle-score";

type ActivityItem = {
  id: string;
  date: string;
  score?: number;
  href?: string | null;
  downloadUrl?: string | null;
};


export const RecentActivityCard = ({
  activities,
  style,
}: {
  activities: ActivityItem[];
  style?: React.CSSProperties;
}) => {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollDown = () => {
    scrollRef.current?.scrollBy({ top: 100, behavior: "smooth" });
  };

  const scrollUp = () => {
    scrollRef.current?.scrollBy({ top: -100, behavior: "smooth" });
  };

  const handleDownload = (downloadUrl?: string | null) => {
    if (!downloadUrl) {
      return;
    }

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.click();
  };

  const [canScrollUp, setCanScrollUp] = React.useState(false);
  const [canScrollDown, setCanScrollDown] = React.useState(true);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;

    setCanScrollUp(scrollTop > 0);
    setCanScrollDown(scrollTop + clientHeight < scrollHeight - 1);
  };


  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateScrollState();

    el.addEventListener("scroll", updateScrollState);
    return () => el.removeEventListener("scroll", updateScrollState);
  }, [activities]);

  return (
    <div
      style={{
        backgroundColor: "var(--dark-blue)",
        borderRadius: "var(--radius-xl)",
        color: "white",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        boxSizing: "border-box",
        padding: "var(--space-md)",
        gap: "var(--space-md)",
        fontFamily: "var(--font-nova-square)",
        ...style,
      }}
    >
      {/* title */}
      <h3
        style={{
          fontSize: "var(--text-md)",
          textAlign: "center",
        }}
      >
        Recent Activity
      </h3>

      {/* scroll area */}
      <div
        ref={scrollRef}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-md)",
          overflowY: "auto",
          scrollbarWidth: "none",
          scrollBehavior: "smooth",
        }}
      >
        {/* activities */}
        {activities.map((act, i) => (
          <div
            key={i}
            onClick={() => {
              if (act.href) {
                router.push(act.href);
              }
            }}
            style={{
              backgroundColor: "#c1cbe6",
              borderRadius: "var(--radius-md)",
              padding: "var(--space-xxs)",
              color: "black",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
              cursor: act.href ? "pointer" : "default",
            }}
          >
            {/* activity */}
            <div>
              <div style={{ fontWeight: "bold", fontSize: "var(--text-sm)" }}>
                {act.id}
              </div>
              <div style={{ fontSize: "var(--text-xs)" }}>
                {act.date || `On ${act.id}`}
              </div>
            </div>

            {act.score !== undefined ? (
              <CircleScore score={act.score} />
            ) : act.downloadUrl ? (
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  handleDownload(act.downloadUrl);
                }}
                style={{
                  position: "relative",
                  width: "var(--icon-2xl)",
                  height: "var(--icon-2xl)",
                  cursor: "pointer",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                }}
              >
                <Image
                  src="/global/download.svg"
                  alt="Download"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </button>


            ) : act.href ? (
              <div
                style={{
                  position: "relative",
                  width: "var(--icon-2xl)",
                  height: "var(--icon-2xl)",
                }}
              >
                <Image
                  src="/global/next.svg"
                  alt="Open"
                  fill
                  style={{ objectFit: "contain" }}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div
        style={
          {
            display: "flex",
            flexDirection: "row",
            userSelect: "none",
            width: "fit-content",
            marginLeft: "auto",
            marginTop: "auto",
            height: "fit-content",
            justifyContent: "center",
            gap: "var(--space-md)",
          }
        }
      >
        <Arrow
          direction="prev"
          onClick={scrollUp}
          disabled={!canScrollUp}
        />

        <Arrow
          direction="next"
          onClick={scrollDown}
          disabled={!canScrollDown}
        />
      </div>
    </div>
  );
};


const Arrow = ({
  direction,
  onClick,
  disabled,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  disabled?: boolean;
}) => {
  const rotation =
    direction === "prev"
      ? "rotate(-90deg)"
      : "rotate(90deg)";

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      style={{
        fontSize: "var(--icon-xs)",
        fontFamily: "var(--font-jura)",
        transform: rotation,
        opacity: disabled ? 0.3 : 1,
        cursor: disabled
          ? "not-allowed"
          : "pointer",
        pointerEvents: disabled
          ? "none"
          : "auto",
        transition: "0.2s ease",
      }}
    >
      ❯
    </div>
  );
};