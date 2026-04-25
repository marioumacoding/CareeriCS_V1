import React, { useRef, Children } from "react";

type Variant = "vertical" | "horizontal";

type Props = {
    children: React.ReactNode;
    style?: React.CSSProperties;
    Title?: string;
    Columns?: number; // used only in vertical
    variant?: Variant;
};

export const CardsContainer = ({
    children,
    style,
    Title = "Title",
    Columns = 4,
    variant = "vertical",
}: Props) => {

    const scrollRef = useRef<HTMLDivElement>(null);

    // Detect empty children safely
    const childCount = Children.count(children);
    const isEmpty = childCount === 0;

    const scroll = (direction: "prev" | "next") => {
        if (!scrollRef.current) return;

        if (variant === "vertical") {
            const amount = scrollRef.current.clientHeight;

            scrollRef.current.scrollBy({
                top: direction === "prev" ? -amount : amount,
                behavior: "smooth",
            });
        }

        if (variant === "horizontal") {
            const amount = scrollRef.current.clientWidth;

            scrollRef.current.scrollBy({
                left: direction === "prev" ? -amount : amount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div
            style={{
                backgroundColor: "#1C427B",
                borderRadius: "4vh",
                paddingTop: "1rem",
                paddingLeft: "1rem",
                paddingRight: variant === "vertical" ? "1rem" : "0.5rem",
                paddingBottom: variant ==="horizontal" ? "1rem" : "0.5rem",
                color: "white",
                height: "100%",
                width: "100%",
                display: "flex",
                flexDirection:
                    variant === "horizontal" ? "row" : "column",
                overflow:"hidden",
                ...style,
            }}
        >

            {/* Main Content */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    overflow: "hidden",
                    gap:"0.5rem"
                }}
            >

                {/* Title */}
                <h2
                    style={{
                        fontSize: "1.2rem",
                        fontFamily: "var(--font-nova-square)",
                    }}
                >
                    {Title}
                </h2>

                {/* Scroll Area */}
                <div

                    style={{
                        display: "flex",
                        minWidth: 0,
                        minHeight: 0,
                        flex: 1,
                        flexDirection: variant==="vertical" ? "column" : "row",
                    }}
                >

                    <div
                        ref={scrollRef}
                        style={
                            variant === "vertical"
                                ? {
                                    display: "grid",
                                    gridTemplateColumns: `repeat(${Columns}, 1fr)`,
                                    gap: "1rem",
                                    overflowY: "auto",
                                    scrollbarWidth: "none",
                                    flex: 1,

                                    alignContent: "start",
                                    justifyContent: "start",
                                    rowGap: "1rem",
                                }
                                : {
                                    display: "flex",
                                    gap: "1.5rem",
                                    overflowX: "auto",
                                    scrollbarWidth: "none",
                                    flex: 1,
                                }
                        }
                    >

                        {isEmpty ? (
                            <div
                                style={{
                                    gridColumn:
                                        variant === "vertical"
                                            ? `span ${Columns}`
                                            : undefined,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    height: "100%",
                                    width: "100%",
                                    fontFamily: "var(--font-jura)",
                                    fontSize: "0.95rem",
                                    opacity: 0.8,
                                }}
                            >
                                Loading...
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                    {/* Scroll Buttons */}
                    <div
                        style={
                            variant === "vertical"
                                ? {
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: "1rem",
                                    marginTop: "auto",
                                    userSelect: "none",
                                    marginRight: "0.5rem",
                                }
                                : {
                                    display: "flex",
                                    flexDirection: "column",
                                    paddingLeft: "0.5rem",
                                    userSelect: "none",
                                    width: "fit-content",
                                    marginLeft: "auto",
                                    height: "100%",
                                    justifyContent: "center",
                                }
                        }
                    >

                        <Arrow
                            direction="prev"
                            variant={variant}
                            onClick={() => scroll("prev")}
                        />

                        <Arrow
                            direction="next"
                            variant={variant}
                            onClick={() => scroll("next")}
                        />


                    </div>

                </div>

            </div>
        </div>
    );
};



const Arrow = ({
    direction,
    variant,
    onClick,
}: {
    direction: "prev" | "next";
    variant: Variant;
    onClick: () => void;
}) => {

    let rotation = "0deg";

    if (variant === "vertical") {
        rotation =
            direction === "prev"
                ? "rotate(-90deg)"
                : "rotate(90deg)";
    }

    if (variant === "horizontal") {
        rotation =
            direction === "prev"
                ? "rotate(180deg)"
                : "rotate(0deg)";
    }

    return (
        <div
            onClick={onClick}
            style={{
                fontSize: "4vh",
                fontWeight: "bold",
                fontFamily: "var(--font-jura)",
                cursor: "pointer",
                transform: rotation,
            }}
        >
            ❯
        </div>
    );
};