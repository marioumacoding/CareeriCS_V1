export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "var(--dark-blue)", 
        padding: "2rem",
      }}
    >
      <h1
        style={{
          fontSize: "3rem",
          color: "var(--primary-green)",
          marginBottom: "1rem",
        }}
      >
        This is a Heading
      </h1>
      <p
        style={{
          fontSize: "1.5rem",
          color: "var(--hover-green)",
          textAlign: "center",
          maxWidth: "600px",
        }}
      >
        This is a paragraph. If you can see the different fonts for the heading
        and the paragraph, your Google Fonts (Jura and Nova Square) are loaded
        correctly.
      </p>
    </div>
  );
}