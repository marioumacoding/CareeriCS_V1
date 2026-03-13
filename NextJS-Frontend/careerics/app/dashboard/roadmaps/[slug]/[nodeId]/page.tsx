"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { MarkdownContent } from "@/components/roadmaps/markdown-content";
import { RoadmapGraph } from "@/components/roadmaps/roadmap-graph";
import { useApi } from "@/hooks/use-api";
import { getRoadmapNodeContentKey, getRoadmapNodeLabel } from "@/lib/roadmaps";
import { useAuth } from "@/providers/auth-provider";
import { roadmapService } from "@/services";
import type { RoadmapNodeContent } from "@/types";

function RoadmapNodeDetailContent() {
  const params = useParams<{ slug: string; nodeId: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState<RoadmapNodeContent | null>(null);
  const [contentError, setContentError] = useState<string | null>(null);
  const [contentLoading, setContentLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const roadmapSlug = params.slug;
  const nodeParam = params.nodeId;

  const fetchRoadmap = useCallback(
    () => roadmapService.getRoadmap(roadmapSlug, user?.id),
    [roadmapSlug, user?.id],
  );

  const { data: roadmap, error, isLoading, refetch } = useApi(
    fetchRoadmap,
    { immediate: Boolean(roadmapSlug && user?.id) },
  );

  const selectedNode = roadmap?.nodes.find(
    (node) => node.id === nodeParam || getRoadmapNodeContentKey(node) === nodeParam,
  );

  useEffect(() => {
    let cancelled = false;

    async function loadContent() {
      if (!selectedNode) {
        setContent(null);
        setContentError(null);
        setContentLoading(false);
        return;
      }

      const contentKey = getRoadmapNodeContentKey(selectedNode);

      setContentLoading(true);
      setContentError(null);

      const response = await roadmapService.getNodeContent(roadmapSlug, contentKey);

      if (cancelled) return;

      if (response.success) {
        setContent(response.data);
      } else {
        setContent(null);
        setContentError(response.message ?? "Unable to load node content.");
      }

      setContentLoading(false);
    }

    void loadContent();

    return () => {
      cancelled = true;
    };
  }, [roadmapSlug, selectedNode]);

  async function handleCompleteNode() {
    if (!user?.id || !selectedNode?.id) return;

    setIsCompleting(true);
    setSubmitError(null);

    const response = await roadmapService.completeNode(roadmapSlug, selectedNode.id, user.id);

    if (!response.success) {
      setSubmitError(response.message ?? "Unable to mark node as completed.");
      setIsCompleting(false);
      return;
    }

    await refetch();
    setIsCompleting(false);
  }

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
      <section style={{ display: "grid", gap: "0.5rem" }}>
        <Link href={`/dashboard/roadmaps/${roadmapSlug}`} style={{ color: "var(--light-blue)", textDecoration: "none" }}>
          Back to roadmap overview
        </Link>
        <div style={{ color: "var(--primary-green)", textTransform: "uppercase", letterSpacing: "0.12em", fontSize: "0.8rem" }}>
          Node details
        </div>
        <h1 style={{ margin: 0, fontFamily: "var(--font-nova-square)", fontSize: "clamp(1.9rem, 3.6vw, 2.8rem)" }}>
          {selectedNode ? getRoadmapNodeLabel(selectedNode) : nodeParam}
        </h1>
      </section>

      {(isLoading || contentLoading) && (
        <div style={{ padding: "2rem", borderRadius: "24px", backgroundColor: "rgba(255,255,255,0.05)" }}>
          Loading node details...
        </div>
      )}

      {!isLoading && error && (
        <div style={{ padding: "2rem", borderRadius: "24px", backgroundColor: "rgba(220,38,38,0.16)", color: "#ffd7d7" }}>
          {error}
        </div>
      )}

      {!isLoading && !error && roadmap && selectedNode && (
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.5fr) minmax(320px, 0.9fr)",
            gap: "1rem",
            alignItems: "start",
          }}
        >
          <div
            style={{
              display: "grid",
              gap: "1rem",
              padding: "1.5rem",
              borderRadius: "28px",
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "1rem",
                flexWrap: "wrap",
              }}
            >
              <div style={{ display: "grid", gap: "0.35rem" }}>
                <div style={{ color: "rgba(255,255,255,0.65)", fontSize: "0.84rem" }}>Content source</div>
                <div style={{ fontWeight: 700 }}>{getRoadmapNodeContentKey(selectedNode)}</div>
              </div>
              <button
                onClick={() => void handleCompleteNode()}
                disabled={Boolean(selectedNode.completed) || isCompleting}
                style={{
                  padding: "0.95rem 1.2rem",
                  borderRadius: "16px",
                  border: "none",
                  backgroundColor: selectedNode.completed ? "rgba(184,239,70,0.25)" : "var(--primary-green)",
                  color: selectedNode.completed ? "white" : "black",
                  fontWeight: 700,
                  cursor: selectedNode.completed ? "default" : "pointer",
                  opacity: isCompleting ? 0.7 : 1,
                }}
              >
                {selectedNode.completed ? "Completed" : isCompleting ? "Saving..." : "Mark as completed"}
              </button>
            </div>

            {submitError && (
              <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(220,38,38,0.16)", color: "#ffd7d7" }}>
                {submitError}
              </div>
            )}

            {contentError && (
              <div style={{ padding: "1rem", borderRadius: "18px", backgroundColor: "rgba(245,158,11,0.15)", color: "#ffe3b0" }}>
                {contentError}
              </div>
            )}

            {content?.content ? (
              <MarkdownContent content={content.content} />
            ) : (
              !contentLoading && (
                <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", lineHeight: 1.7 }}>
                  This node does not currently expose markdown content. You can still track completion for it if it is
                  mapped in the backend roadmap steps table.
                </p>
              )
            )}
          </div>

          <div style={{ display: "grid", gap: "1rem" }}>
            <div
              style={{
                padding: "1.25rem",
                borderRadius: "28px",
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <h2 style={{ margin: "0 0 0.85rem", fontSize: "1.15rem", fontFamily: "var(--font-nova-square)" }}>
                Where this node sits
              </h2>
              <RoadmapGraph roadmapSlug={roadmapSlug} roadmap={roadmap} selectedNodeId={nodeParam} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function RoadmapNodeDetailPage() {
  return (
    <ProtectedRoute>
      <RoadmapNodeDetailContent />
    </ProtectedRoute>
  );
}