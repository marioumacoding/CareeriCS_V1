"use client";
import { useRouter } from "next/navigation";

export default function JourneyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                padding: "10px",
                boxSizing: "border-box",
                overflow: "hidden",
            }}
        >
            <div
                style={{
                    background: "linear-gradient(180deg, var(--dark-blue) 0%, #000000 100%)",
                    borderRadius: "5vh",
                    width: "100%",
                    height: "100%",
                    margin: "0 auto",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "row",
                }}
            >
                {/* Main content */}
                <div
                    style={{
                        position: "relative",
                        display: "flex",
                        flex: 1,
                        overflowX:"hidden",
                        overflowY:"auto",
                        scrollbarWidth: "none",
                    }}
                >
                    {children}
                </div>


                {/* Exit Button*/}
<button
        type="button"
        onClick={() => router.back()}
        style={{
            position: "absolute", // 1. Khallih tayir fo2 el elements
            top: "30px",          // 2. Eb3ed 3an el sa2f sanna
            right: "30px",        // 3. Elza2 f el ymeen bel-zabt
            width: "35px",        // 4. Esta5dem px a7san men vh le-de2et el icon
            height: "35px",
            cursor: "pointer",
            background: "none",
            border: "none",
            zIndex: 100,         
            padding: 0,
        }}
    >
        <img
            src="/global/close.svg"
            alt="Close"
            style={{
                width: "100%",
                height: "100%",
            }}
        />
    </button>
            </div>
        </div>
    );
}