
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
    leftOnclick?: () => void;
    rightOnclick?: () => void;
}) => {
    return (
        <div
            style={{
                backgroundColor: "#1C427B",
                borderRadius: "4vh",
                paddingBlock: "3vh",
                paddingInline: isScrollable ? 0 : "1.5rem",
                color: "white",
                height: "100%",
                width: "100%",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                ...style,
            }}
        >
            {isScrollable && (
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
                        transform: "rotate(180deg)",
                        marginTop: "1rem",
                    }}
                    onClick={leftOnclick}
                >
                    {"❯"}
                </div>
            )}

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
                <div
                    style={{
                        display: "grid",
                        position: "relative",
                        height: "100%",
                        gap: "20px",

                        gridTemplateColumns: isScrollable
                            ? "repeat(auto-fill, minmax(calc(25% - 15px), 1fr))"
                            : "repeat(3,1fr)",

                        overflowX: isScrollable ? "visible" : "visible",
                        overflowY: "hidden",

                        gridAutoFlow: isScrollable ? "column" : "row",

                        scrollbarWidth: "none",
                    }}
                >
                    {children}

                </div>
            </div>
            {isScrollable && (
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
                        marginTop: "1rem",
                    }}
                    onClick={rightOnclick}
                >
                    {"❯"}
                </div>
            )}
        </div>
    );
};