"use client";

import React, { CSSProperties, useRef } from "react";

interface InterviewItem {
    id: string;
    date: string;
    label?: string;
}

interface ArchiveCardProps {
    items: InterviewItem[];
    style?: CSSProperties;
    title?: string;
    isLoading?: boolean;
    emptyLabel?: string;
    onDownload?: (item: InterviewItem) => void;
}

export default function ArchiveCard({
    items,
    style,
    title = "Interviews Archive",
    isLoading = false,
    emptyLabel = "No history yet.",
    onDownload,
}: ArchiveCardProps) {

    const scrollRef = useRef<HTMLDivElement>(null);

    const scrollDown = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                top: 200,
                behavior: "smooth",
            });
        }
    };

    const scrollUp = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollBy({
                top: -200,
                behavior: "smooth",
            });
        }
    };

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: "#142143",
                borderRadius: "4vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                paddingTop: "3vh",
                paddingInline: "4vh",
                paddingBottom: "1vh",
                boxSizing: "border-box",
                overflow: "hidden",
                gap: "1vh",
                fontFamily: "var(--font-nova-square)",
                ...style,
            }}
        >
            <p
                style={{
                    color: "white",
                    fontSize: "clamp(0.7rem,1.6vw,1.3rem)",
                    fontFamily: "var(--font-nova-square)",
                }}
            >
                {title}
            </p>
            <div
                ref={scrollRef}
                style={{
                    overflow: "scroll",
                    scrollbarWidth: "none",
                    position: "relative",
                    width: "100%",
                }}
            >
                {isLoading ? (
                    <div style={{ color: "white", opacity: 0.8, padding: "1rem" }}>
                        Loading history...
                    </div>
                ) : items.length === 0 ? (
                    <div style={{ color: "white", opacity: 0.8, padding: "1rem" }}>
                        {emptyLabel}
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {items.map((item) => (
                            <div
                                key={item.id}
                                style={{
                                    backgroundColor: "#A7B1C6",
                                    borderRadius: "1vh",
                                    padding: "1vh",
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    color: "#0F172A",
                                }}
                            >
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: "clamp(0.5rem,1vw,1.2rem)" }}>
                                        {item.label ?? item.id}
                                    </div>
                                    <div style={{ fontSize: "clamp(0.5rem,1vw,1.2rem)" }}>
                                        created on {item.date}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onDownload?.(item)}
                                    style={{
                                        background: "none",
                                        border: "none",
                                        cursor: onDownload ? "pointer" : "default",
                                        fontSize: "1.2rem",
                                        opacity: onDownload ? 1 : 0.55,
                                    }}
                                    disabled={!onDownload}
                                    aria-label={`Download ${item.id}`}
                                >
                                    <img
                                        src={"/global/download.svg"}
                                        alt=""
                                        style={{
                                            maxHeight: "4vh",
                                            marginBlock: "auto",
                                            position: "relative",
                                        }}
                                    />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            <div
                style={{
                    display: "flex",
                    marginTop: "auto",
                    width: "fit-content",
                    marginLeft: "auto"
                }} >

                <div
                    onClick={scrollUp}
                    style={{
                        cursor: "pointer",
                        transform: "rotate(-270deg)",
                        marginRight: "auto",
                    }}
                >
                    <img
                        src="/auth/Back Arrow.svg"
                        alt="Scroll"
                        width={30}
                        height={30}
                    />
                </div>

                <div
                    onClick={scrollDown}
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        cursor: "pointer",
                        transform: "rotate(270deg)",
                    }}
                >
                    <img
                        src="/auth/Back Arrow.svg"
                        alt="Scroll"
                        width={30}
                        height={30}
                    />
                </div>
            </div>
        </div>
    );
}