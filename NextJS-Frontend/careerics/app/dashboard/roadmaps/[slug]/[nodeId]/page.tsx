"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/roadmaps/roadmap-theme.module.scss";
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
    <div className={styles.pageShell}>
      <section className={styles.heroCard}>
        <div className={styles.heroCopy}>
          <Link href={`/dashboard/roadmaps/${roadmapSlug}`} className={styles.backLink}>
          Back to roadmap overview
        </Link>
          <div className={styles.eyebrow}>
          Node details
        </div>
          <h1 className={styles.pageTitle} style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
          {selectedNode ? getRoadmapNodeLabel(selectedNode) : nodeParam}
        </h1>
        </div>
      </section>

      {(isLoading || contentLoading) && (
        <div className={styles.loadingPanel}>
          Loading node details...
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.errorPanel}>
          {error}
        </div>
      )}

      {!isLoading && !error && roadmap && selectedNode && (
        <section className={styles.detailGrid}>
          <div className={styles.contentCard}>
            <div className={styles.contentHeader}>
              <div className={styles.infoBlock}>
                <div className={styles.infoLabel}>Content source</div>
                <div className={styles.infoValue}>{getRoadmapNodeContentKey(selectedNode)}</div>
              </div>
              <button
                onClick={() => void handleCompleteNode()}
                disabled={Boolean(selectedNode.completed) || isCompleting}
                className={[styles.nodeActionButton, Boolean(selectedNode.completed) || isCompleting ? styles.disabledButton : ""].filter(Boolean).join(" ")}
              >
                {selectedNode.completed ? "Completed" : isCompleting ? "Saving..." : "Mark as completed"}
              </button>
            </div>

            {submitError && (
              <div className={styles.errorPanel}>
                {submitError}
              </div>
            )}

            {contentError && (
              <div className={styles.warningPanel}>
                {contentError}
              </div>
            )}

            {content?.content ? (
              <MarkdownContent content={content.content} />
            ) : (
              !contentLoading && (
                <p className={styles.mutedText}>
                  This node does not currently expose markdown content. You can still track completion for it if it is
                  mapped in the backend roadmap steps table.
                </p>
              )
            )}
          </div>

          <div className={styles.stackList}>
            <div className={styles.panel}>
              <h2 className={styles.panelTitle} style={{ marginBottom: "0.85rem" }}>
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