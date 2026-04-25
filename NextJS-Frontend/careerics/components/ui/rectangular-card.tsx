import { useState } from "react";

type Variant = "normal" | "radio";
type Theme = "light" | "dark";

export const RectangularCard = ({
    style,
    Title = "Your Title",
    subtext = "Your Subtext",
    isSubtextVisible = false,
    variant = "normal",
    theme = "light",
    selectable = false,
    selected = false,
    onSelect,
}: {
    style?: React.CSSProperties;
    Title?: string;
    subtext?: string;
    isSubtextVisible?: boolean;
    variant?: Variant;
    theme?: Theme;
    selectable?: boolean;
    selected?: boolean;
    onSelect?: () => void;
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseBg = theme === "dark" ? "#1C427B" : "#C1CBE6";
    const hoverBg = "var(--hover-green)";

    const active = isHovered || selected;

    const backgroundColor = active ? hoverBg : baseBg;

    const textColor =
        theme === "dark" && !active ? "white" : "black";

    const RadioIndicator = () => (
        <div
            style={{
                position: "relative",
                height: "1rem",
                width: "1rem",
                borderRadius: "999px",
                border: `2px solid ${textColor}`,
                boxSizing: "border-box",
            }}
        >
            {selected && (
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "0.5rem",
                        height: "0.5rem",
                        borderRadius: "999px",
                        backgroundColor: textColor,
                    }}
                />
            )}
        </div>
    );

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => {
                if (selectable) onSelect?.();
            }}
            style={{
                backgroundColor,
                borderRadius: "3vh",
                cursor: selectable ? "pointer" : "default",

                display: "flex",
                alignItems: "center",
                justifyContent: variant === "radio" ? "space-between" : "center ",
                gap: "1rem",
                padding: "1rem",
                width: "fit-content",

                ...style,
            }}
        >
            {/* Text section */}
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <h3
                    style={{
                        color: textColor,
                        fontSize: "0.8rem",
                        fontFamily: "var(--font-jura)",
                        maxWidth: "30ch",
                        textAlign: "center",
                        whiteSpace: variant === "radio" ? "nowrap" : "normal",
                        marginRight:"auto",
                        fontWeight: "800",
                    }}
                >
                    {Title}
                </h3>

                {isSubtextVisible && (
                    <p
                        style={{
                            color: textColor,
                            fontSize: "0.875rem",
                            fontFamily: "var(--font-jura)",
                            whiteSpace: "nowrap",
                            marginRight:"auto",
                        }}
                    >
                        {subtext}
                    </p>
                )}
            </div>

            {/* Radio indicator */}
            {variant === "radio" && <RadioIndicator />}
        </div>
    );
};