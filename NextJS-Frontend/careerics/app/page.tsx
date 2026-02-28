import Link from "next/link";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#1C427B",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "white",
        textAlign: "center",
        padding: "2rem",
        gap: "2rem",
      }}
    >
      <h1>Welcome to CareeriCS</h1>

      <p style={{ maxWidth: "600px", fontSize: "1.2rem" }}>
        This page uses the global fonts defined in your styles.
      </p>

      <Link href="/auth/login">
        <button
          style={{
            padding: "12px 24px",
            fontSize: "16px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            backgroundColor: "#B8EF46",
            color: "black",
            fontWeight: "bold",
          }}
        >
          Go to Login
        </button>
      </Link>
    </main>
  );
}