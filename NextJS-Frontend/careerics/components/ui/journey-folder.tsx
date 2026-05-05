"use client";

import React from "react";

export default function JourneyFolder({
    label = "The Crosspaths",
    phase = 1,
    children,
    primaryColor = "var(--dark-blue)",
    current = false,
    closed = false,
}: {
    label?: string;
    phase?: number;
    children?: React.ReactNode;
    primaryColor?: string;
    current?: boolean;
    closed?:boolean;
}) {

    const phaseColor = `var(--phase${phase}-color)`;

    let marginTop = "0%";

    switch (phase) {
        case 1:
            marginTop = "0";
            label = "The Crosspaths"
            break;
        case 2:
            marginTop = "8rem";
            label = "Pave The Way"
            break;
        case 3:
            marginTop = "16rem";
            label = "Document It"
            break;
        case 4:
            marginTop = "24rem";
            label = "Trial Round"
            break;
        case 5:
            marginTop = "auto";
            label = "Job Hunt"
            break;
        default:
            marginTop = "0%";
            break;
    }

    const topRight =
        phase === 1 ?
            "0"
            :
            "10";

    const bottomRight =
        phase === 5 ?
            "100"
            :
            "90";

    const clipPath = `
  polygon(
    100% ${topRight}%,
    0% 0%,
    0% 100%,
    100% ${bottomRight}%
  )
`;

    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
            }}
        >
            {/* Main panel */}
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: current ? primaryColor : phaseColor,
                    borderRadius: "4vh",
                    overflow: "hidden",
                    borderTopRightRadius: phase === 1 ? "0" : "4vh",
                    borderBottomRightRadius: phase === 5 ? "0" : "4vh",
                    paddingRight: "0.5rem",
                    boxShadow: "10px 0 15px rgba(0, 0, 0, 0.66)",
                    maxWidth:closed?"12rem":"100%",
                    display:"flex",
                    gap:"0"
                }}
            >
                {children}
            </div>

            {/* Label column */}
            <div
                style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <div
                    style={{
                        marginTop,
                        width: "fit-content",
                        height: "fit-content",
                        backgroundColor: current ? primaryColor : phaseColor,
                        clipPath,
                        borderTopRightRadius: "5vh",
                        borderBottomRightRadius: "5vh",
                        writingMode: "vertical-rl",
                        textAlign: "center",
                        paddingBlock: "3px",
                        paddingInline: "2rem",
                        fontFamily: "var(--font-nova-square)",
                        color: !current ? primaryColor : phaseColor,
                        fontSize: "1rem",
                        userSelect: "none",
                    }}
                >
                    {label}
                </div>
            </div>
        </div>
    );
}