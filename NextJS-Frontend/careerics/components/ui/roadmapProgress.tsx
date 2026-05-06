"use client";

interface roadmapProgressProps {
    text?: string | null;
    done?: string | "0";
    total?: string | "0";
}

export default function roadmapProgress({ text, done = "0", total = "0" }: roadmapProgressProps) {
    return (<div
        style={{
            display: "flex",
            width: "100%",
            height: "fit-content",
        }}>
        <div
            style={{
                maxHeight: "100%",
                width: "0.5rem",
                backgroundColor: "var(--light-green)",
                borderRadius: "99px",
                marginRight: "1rem",
            }}
        />
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                color: "white",
            }}
        >
            <h2
                style={{
                    fontSize: "1.25rem",
                    whiteSpace: "nowrap",
                }}
            >
                <span
                    style={{
                        color: "var(--light-green)",
                    }}
                >
                    {done}
                </span>

                {" / "}

                <span>
                    {total}
                </span>
            </h2>

            <p
                style={{
                    fontSize: "1rem",
                    whiteSpace: "nowrap",
                }}
            >
                {text}
            </p>

        </div>

    </div>
    );
}