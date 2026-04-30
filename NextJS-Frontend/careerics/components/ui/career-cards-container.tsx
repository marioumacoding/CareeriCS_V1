
export const CareerCardsContainer = ({
    children,
    style,
    isScrollable = false,
    Title = "Your Careers",
    leftOnclick,
    rightOnclick,
}: {
    children: React.ReactNode;
    style?: React.CSSProperties;
    isScrollable?: boolean;
    Title?: string;
    leftOnclick: () => void;
    rightOnclick: () => void;
}) => {
    return (
        <div
            style={{
                backgroundColor: "#1C427B",
                borderRadius: "4vh",
                paddingBlock: "3vh",
                paddingInline: isScrollable ? "1rem" : "1.5rem",
                color: "white",
                height: "100%",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                ...style,
            }}
        >
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    height: "100%",
                    width: "100%",
                    alignItems: "center",
                }}
            >
                <h3
                    style={{
                        fontSize: "1.2rem",
                        fontFamily: "var(--font-nova-square)",
                        fontWeight: "200",
                        position: "relative",
                        marginRight: "auto",
                        marginBottom: "1rem",
                    }}
                >
                    {Title}
                </h3>
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%", height: "100%" }}>

                    <div
                        style={{
                            display: "grid",
                            position: "relative",
                            height: "100%",
                            width: "100%",
                            gap: "20px",

                            gridTemplateColumns: isScrollable
                                ? "repeat(auto-fill, minmax(calc(25% - 15px), 1fr))"
                                : "repeat(3,1fr)",

                            overflow: "hidden",

                            gridAutoFlow: isScrollable ? "column" : "row",

                            scrollbarWidth: "none",
                        }}
                    >
                        {children}

                    </div>

                    {isScrollable && (
                        <div
                            style={
                                {
                                    display: "flex",
                                    flexDirection: "column",
                                    paddingLeft: "0.5rem",
                                    userSelect: "none",
                                    width: "fit-content",
                                    marginLeft: "auto",
                                    height: "100%",
                                    justifyContent: "center",
                                    gap: "0.5rem",
                                }
                            }
                        >

                            <Arrow
                                direction="prev"
                                onClick={leftOnclick}
                            />

                            <Arrow
                                direction="next"
                                onClick={rightOnclick}
                            />


                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Arrow = ({
    direction,
    onClick,
}: {
    direction: "prev" | "next";
    onClick: () => void;
}) => {
    const rotation =
        direction === "prev"
            ? "rotate(180deg)"
            : "rotate(0deg)";

    return (
        <div
            onClick={onClick}
            style={{
                fontSize: "1.5rem",
                fontFamily: "var(--font-jura)",
                cursor: "pointer",
                transform: rotation,
            }}
        >
            ❯
        </div>
    );
};