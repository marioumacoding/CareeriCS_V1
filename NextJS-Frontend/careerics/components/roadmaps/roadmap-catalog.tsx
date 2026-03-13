import Link from "next/link";
import type { RoadmapCatalogItem } from "@/types";

interface RoadmapCatalogProps {
  items: RoadmapCatalogItem[];
  mode?: "feature" | "dashboard";
}

const shellStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "1.5rem",
  width: "100%",
} as const;

export function RoadmapCatalog({ items, mode = "feature" }: RoadmapCatalogProps) {
  return (
    <div style={shellStyle}>
      {items.map((item) => {
        const href = mode === "dashboard"
          ? `/dashboard/roadmaps/${item.slug}`
          : `/dashboard/roadmaps/${item.slug}`;

        return (
          <article
            key={item.slug}
            style={{
              background:
                "linear-gradient(180deg, rgba(20,33,67,0.96) 0%, rgba(10,10,10,0.96) 100%)",
              border: "1px solid rgba(184, 239, 70, 0.28)",
              borderRadius: "28px",
              padding: "1.5rem",
              color: "white",
              boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "1rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "var(--primary-green)",
                    marginBottom: "0.35rem",
                  }}
                >
                  {item.level}
                </div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: "1.55rem",
                    fontFamily: "var(--font-nova-square)",
                  }}
                >
                  {item.title}
                </h2>
              </div>
              <div
                style={{
                  width: "3.25rem",
                  height: "3.25rem",
                  borderRadius: "18px",
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(184,239,70,0.9), rgba(0,178,255,0.3))",
                  boxShadow: "0 8px 24px rgba(0, 178, 255, 0.25)",
                }}
              />
            </div>

            <p
              style={{
                margin: 0,
                lineHeight: 1.6,
                color: "rgba(255, 255, 255, 0.82)",
              }}
            >
              {item.description}
            </p>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.65rem",
              }}
            >
              {item.focusAreas.map((area) => (
                <span
                  key={area}
                  style={{
                    padding: "0.45rem 0.75rem",
                    borderRadius: "999px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.12)",
                    fontSize: "0.85rem",
                  }}
                >
                  {area}
                </span>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                marginTop: "auto",
              }}
            >
              <div>
                <div style={{ fontSize: "0.78rem", color: "rgba(255, 255, 255, 0.55)" }}>
                  Estimated duration
                </div>
                <div style={{ fontWeight: 700 }}>{item.estimatedDuration}</div>
              </div>
              <Link
                href={href}
                style={{
                  textDecoration: "none",
                  padding: "0.85rem 1.2rem",
                  borderRadius: "16px",
                  backgroundColor: "var(--primary-green)",
                  color: "black",
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                }}
              >
                Open roadmap
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}