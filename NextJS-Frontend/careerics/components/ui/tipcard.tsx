"use client";

import React, { CSSProperties } from "react";

interface TipCardProps {
    icon: string;
    title: string;
    description: string;
    style?: CSSProperties;
}

export default function TipCard({ icon, title, description, style }: TipCardProps) {
    return (
        <div
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: "#1C427B",
                borderRadius: "2vh",
                display: "flex",
                gap: "2vh",
                paddingInline: "2vw",
                boxSizing: "border-box",
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
                ...style
            }}
        >
            <img src={icon} alt={title} style={{ height: "70%" }} />

            <div
                style={{
                    color: "white",
                    padding: "0"
                }}
            >
                <p
                    style={{
                        color: "white",
                        fontSize: "clamp(0.8rem,1.7vw,1.5rem)",
                        fontFamily: "var(--font-nova-square)",
                        margin: 0
                    }}
                >
                    {title}
                </p>
                <p
                    style={{
                        fontSize: "clamp(0.5rem,1vw,1.2rem)",
                        padding: "0px"
                    }}
                >
                    {description}
                </p>
            </div>
        </div>
    );
}