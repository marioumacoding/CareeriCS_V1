"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoadmapCatalog } from "@/components/roadmaps/roadmap-catalog";
import { useAuth } from "@/providers/auth-provider";
import { roadmapCatalog } from "@/services";

function RoadmapsDashboardContent() {
  const { user } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-color)",
        color: "white",
        padding: "2rem",
        display: "grid",
        gap: "1.75rem",
      }}
    >
      <section
        style={{
          borderRadius: "30px",
          padding: "2rem",
          background:
            "linear-gradient(135deg, rgba(20,33,67,1), rgba(10,10,10,0.96)), radial-gradient(circle at top right, rgba(0,178,255,0.2), rgba(0,178,255,0) 35%)",
          border: "1px solid rgba(255,255,255,0.08)",
          display: "grid",
          gap: "0.8rem",
        }}
      >
        <div style={{ color: "var(--primary-green)", letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.82rem" }}>
          Roadmap dashboard
        </div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-nova-square)", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          {user?.displayName ? `${user.displayName.split(" ")[0]}, pick up your next milestone.` : "Pick up your next milestone."}
        </h1>
        <p style={{ margin: 0, maxWidth: "44rem", lineHeight: 1.7, color: "rgba(255,255,255,0.75)" }}>
          Each roadmap opens the backend-generated node graph, reads markdown content per step, and stores completion
          state against your authenticated user identifier.
        </p>
      </section>

      <RoadmapCatalog items={roadmapCatalog} mode="dashboard" />
    </div>
  );
}

export default function RoadmapsDashboardPage() {
  return (
    <ProtectedRoute>
      <RoadmapsDashboardContent />
    </ProtectedRoute>
  );
}