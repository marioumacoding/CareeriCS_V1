"use client";

interface RoadmapResourceCardProps {
  resourceType: string;
  title: string;
  url?: string;
}

export default function RoadmapResourceCard({
  resourceType,
  title,
  url,
}: RoadmapResourceCardProps) {
  const card = (
    <div
      style={{
        width: "100%",
        backgroundColor: "#505259",
        borderRadius: "1.35rem",
        padding: "0.8rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.25rem",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "0.78rem",
          color: "#ffffff",
          lineHeight: 1.2,
        }}
      >
        {resourceType || "Resource"}
      </p>

      <p
        style={{
          margin: 0,
          fontSize: "0.9rem",
          color: "#ffffff",
          lineHeight: 1.3,
          wordBreak: "break-word",
        }}
      >
        {title || "Untitled Resource"}
      </p>
    </div>
  );

  if (!url) {
    return card;
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        width: "100%",
        textDecoration: "none",
      }}
    >
      {card}
    </a>
  );
}
