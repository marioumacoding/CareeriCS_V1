"use client";

import React, { CSSProperties } from "react";

interface TipCardProps {
    icon: string;
    title: string;
    description: string;
    style?: CSSProperties;
    variant?: "tip" | "feature";
    onclick?: () => void;
}

export default function TipCard({ icon, title, description, style, variant = "tip", onclick }: TipCardProps) {
    return (
        <div
            onClick={variant === "feature" ? onclick : undefined}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                backgroundColor: "var(--medium-blue)",
                borderRadius: "4vh",
                display: "flex",
                padding: "1rem",
                paddingLeft:"2rem",
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
                cursor:variant==="feature"?"pointer":"normal",
                ...style
            }}
        >
            <div
                style={{
                    display: "flex",
                    height: "100%",
                    width: "fit-content",
                    marginRight: "auto",
                    alignItems: "center",
                }}
            >
                <img src={icon} alt={title} style={{ height: "5rem", marginRight: "1rem" }} />

                <div
                    style={{
                        color: "white",
                        fontFamily: "var(--font-nova-square)",

                    }}
                >
                    <p
                        style={{
                            fontSize: "clamp(0.8rem,1.7vw,1.5rem)",
                            marginRight: "auto"
                        }}
                    >
                        {title}
                    </p>
                    <p
                        style={{
                            fontSize: "clamp(0.5rem,1vw,1.2rem)",
                            width: "100%",
                            whiteSpace: "pre-line",
                            fontFamily: "var(--font-jura)"
                        }}
                    >
                        {description}
                    </p>
                </div>
            </div>
            {variant === "feature" &&
                <div
                    style={{
                        color: "white",
                        width: "fit-content",
                        height: "fit-content",
                        fontSize: "4vh",
                        fontWeight: "bold",
                        fontFamily: "var(--font-jura)",
                        paddingInline: "1rem",
                        cursor: "pointer",
                        marginLeft: "auto"
                    }}
                >
                    {"❯"}
                </div>
            }
        </div>
    );
}