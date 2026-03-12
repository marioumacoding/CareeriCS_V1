"use client";

import React, { CSSProperties, useRef } from "react";

interface InterviewItem {
    id: string;
    date: string;
}

interface ArchiveCardProps {
    items: InterviewItem[];
    style?: CSSProperties;
}

export default function ArchiveCard({
    items,
    style,
}: ArchiveCardProps) {

    const scrollableRef = useRef<HTMLDivElement>(null);

    const handleScroll = () => {
        if (scrollableRef.current) {
            const div = scrollableRef.current;
            div.scrollBy({ top: div.clientHeight, behavior: "smooth" });
        }
    };

    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: "#142143",
                borderRadius: "2vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "1vh",
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
                    maxHeight: "5%",
                }}
            >
                Interviews Archive
            </p>
            <div
                ref={scrollableRef}
                style={{
                    overflow: "scroll",
                    scrollbarWidth: "none",
                    position: "relative",
                    width: "90%",
                    height: "65%",
                }}
            >

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
                                <div style={{ fontWeight: 600, fontSize: "clamp(0.5rem,1vw,1.2rem)" }}>{item.id}</div>
                                <div style={{ fontSize: "clamp(0.5rem,1vw,1.2rem)" }}>
                                    created on {item.date}
                                </div>
                            </div>

                            <button
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "1.2rem",
                                }}
                            >
                                <img
                                src={"/interview/download.svg"}
                                style={{
                                    maxHeight:"4vh",
                                    marginBlock: "auto",
                                    position:"relative"
                                }}
                                />
                            </button>
                        </div>
                    ))}
                </div>
                
            </div>

            <button
                onClick={handleScroll}
                style={{
                    position: "absolute",
                    right: "0",
                    bottom: "0",
                    maxWidth:"3.5vw",
                    backgroundColor:"transparent" ,
            border: "none",
            cursor:"pointer"
                }}
            >
                <svg preserveAspectRatio="none" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
                    style={{
                        width:"100%",
                        height:"100%",
                    }}
                >
                    <path
                        d="M23.4984 25.8494L32.51 16.9155L35.2291 19.6582L23.4747 31.3111L11.8218 19.5568L14.5644 16.8377L23.4984 25.8494Z"
                        fill="#E6E0E9"
                    />
                </svg>


            </button>
        </div>
    );
}