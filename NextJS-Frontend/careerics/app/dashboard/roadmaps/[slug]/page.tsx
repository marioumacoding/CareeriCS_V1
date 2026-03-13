"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoadmapGraph } from "@/components/roadmaps/roadmap-graph";
import { useApi } from "@/hooks/use-api";
import { getRoadmapNodeContentKey, getRoadmapNodeLabel, isRoadmapStepNode } from "@/lib/roadmaps";
import { useAuth } from "@/providers/auth-provider";
import { roadmapCatalog, roadmapService } from "@/services";

function RoadmapOverviewContent() {
  const params = useParams<{ slug: string }>();
  const { user } = useAuth();
  const slug = params.slug;
  const currentRoadmap = roadmapCatalog.find((item) => item.slug === slug);

  const fetchRoadmap = useCallback(
    () => roadmapService.getRoadmap(slug, user?.id),
    [slug, user?.id],
  );

  const { data: roadmap, error, isLoading, refetch } = useApi(
    fetchRoadmap,
    { immediate: Boolean(slug && user?.id) },
  );

  const stepNodes = roadmap?.nodes.filter(isRoadmapStepNode) ?? [];
  const totalNodes = stepNodes.length;
  const completedNodes = stepNodes.filter((node) => node.completed).length;
  const progress = totalNodes ? Math.round((completedNodes / totalNodes) * 100) : 0;
  const nextNodes = stepNodes.filter((node) => !node.completed).slice(0, 5);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-color)",
        color: "white",
        padding: "2rem",
        display: "grid",
        gap: "1.5rem",
      }}
    >
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "grid", gap: "0.6rem" }}>
          <Link href="/dashboard/roadmaps" style={{ color: "var(--light-blue)", textDecoration: "none" }}>
            Back to roadmap catalog
          </Link>
          <div style={{ color: "var(--primary-green)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.8rem" }}>
            {currentRoadmap?.level ?? "Roadmap"}
          </div>
          <h1 style={{ margin: 0, fontFamily: "var(--font-nova-square)", fontSize: "clamp(2rem, 4vw, 3rem)" }}>
            {currentRoadmap?.title ?? slug}
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.74)", maxWidth: "46rem", lineHeight: 1.7 }}>
            {currentRoadmap?.description ?? "Explore the roadmap graph and open each node for step-specific guidance."}
          </p>
        </div>

        <button
          onClick={() => void refetch()}
          style={{
            backgroundColor: "transparent",
            color: "white",
            border: "1px solid rgba(255,255,255,0.18)",
            borderRadius: "14px",
            padding: "0.85rem 1rem",
            cursor: "pointer",
          }}
        >
          Refresh progress
        </button>
      </section>

      {isLoading && (
        <div style={{ padding: "2rem", borderRadius: "24px", backgroundColor: "rgba(255,255,255,0.05)" }}>
          Loading roadmap graph...
        </div>
      )}

      {!isLoading && error && (
        <div style={{ padding: "2rem", borderRadius: "24px", backgroundColor: "rgba(220,38,38,0.16)", color: "#ffd7d7" }}>
          {error}
        </div>
      )}

      {!isLoading && !error && roadmap && (
        <>
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
            }}
          >
            {[
              { label: "Completed", value: String(completedNodes) },
              { label: "Remaining", value: String(Math.max(totalNodes - completedNodes, 0)) },
              { label: "Progress", value: `${progress}%` },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "1rem 1.1rem",
                  borderRadius: "22px",
                  backgroundColor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.78rem" }}>{item.label}</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 700, marginTop: "0.35rem" }}>{item.value}</div>
              </div>
            ))}
          </section>

          <section
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 2.3fr) minmax(280px, 1fr)",
              gap: "1rem",
              alignItems: "start",
            }}
          >
            <RoadmapGraph roadmapSlug={slug} roadmap={roadmap} />

            <aside
              style={{
                display: "grid",
                gap: "1rem",
                padding: "1.25rem",
                borderRadius: "28px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "var(--font-nova-square)" }}>
                  Focus areas
                </h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.55rem", marginTop: "0.75rem" }}>
                  {(currentRoadmap?.focusAreas ?? []).map((area) => (
                    <span
                      key={area}
                      style={{
                        padding: "0.45rem 0.7rem",
                        borderRadius: "999px",
                        backgroundColor: "rgba(20,33,67,0.8)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        fontSize: "0.82rem",
                      }}
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 style={{ margin: 0, fontSize: "1.2rem", fontFamily: "var(--font-nova-square)" }}>
                  Next open nodes
                </h2>
                <div style={{ display: "grid", gap: "0.7rem", marginTop: "0.85rem" }}>
                  {nextNodes.length ? nextNodes.map((node) => (
                    <Link
                      key={node.id}
                      href={`/dashboard/roadmaps/${slug}/${getRoadmapNodeContentKey(node)}`}
                      style={{
                        textDecoration: "none",
                        color: "white",
                        padding: "0.85rem 0.95rem",
                        borderRadius: "18px",
                        backgroundColor: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      {getRoadmapNodeLabel(node)}
                    </Link>
                  )) : (
                    <div style={{ color: "rgba(255,255,255,0.68)", lineHeight: 1.6 }}>
                      All nodes are currently marked as completed.
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </section>
        </>
      )}
    </div>
  );
}

export default function RoadmapOverviewPage() {
  return (
    <ProtectedRoute>
      <RoadmapOverviewContent />
    </ProtectedRoute>
  );
}