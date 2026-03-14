"use client";

import { useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "@/components/roadmaps/roadmap-theme.module.scss";
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
    <div className={styles.pageShell}>
      <section className={styles.heroCard}>
        <div className={styles.heroSplit}>
          <div className={styles.heroCopy}>
            <Link href="/dashboard/roadmaps" className={styles.backLink}>
            Back to roadmap catalog
          </Link>
            <div className={styles.eyebrow}>
            {currentRoadmap?.level ?? "Roadmap"}
          </div>
            <h1 className={styles.pageTitle}>
            {currentRoadmap?.title ?? slug}
          </h1>
            <p className={styles.pageDescription}>
            {currentRoadmap?.description ?? "Explore the roadmap graph and open each node for step-specific guidance."}
          </p>
          </div>

          <div className={styles.heroActions}>
            <button onClick={() => void refetch()} className={styles.ghostButton}>
              Refresh progress
            </button>
          </div>
        </div>
      </section>

      {isLoading && (
        <div className={styles.loadingPanel}>
          Loading roadmap graph...
        </div>
      )}

      {!isLoading && error && (
        <div className={styles.errorPanel}>
          {error}
        </div>
      )}

      {!isLoading && !error && roadmap && (
        <>
          <section className={styles.metricGrid}>
            {[
              { label: "Completed", value: String(completedNodes) },
              { label: "Remaining", value: String(Math.max(totalNodes - completedNodes, 0)) },
              { label: "Progress", value: `${progress}%` },
            ].map((item) => (
              <div key={item.label} className={styles.metricCard}>
                <div className={styles.metricLabel}>{item.label}</div>
                <div className={styles.metricValue}>{item.value}</div>
              </div>
            ))}
          </section>

          <section className={styles.mainGrid}>
            <RoadmapGraph roadmapSlug={slug} roadmap={roadmap} />

            <aside className={styles.panel}>
              <div>
                <h2 className={styles.panelTitle}>
                  Focus areas
                </h2>
                <div className={styles.chipRow} style={{ marginTop: "0.75rem" }}>
                  {(currentRoadmap?.focusAreas ?? []).map((area) => (
                    <span key={area} className={styles.chip}>
                      {area}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h2 className={styles.panelTitle}>
                  Next open nodes
                </h2>
                <div className={styles.stackList} style={{ marginTop: "0.85rem" }}>
                  {nextNodes.length ? nextNodes.map((node) => (
                    <Link
                      key={node.id}
                      href={`/dashboard/roadmaps/${slug}/${getRoadmapNodeContentKey(node)}`}
                      className={styles.listLink}
                    >
                      {getRoadmapNodeLabel(node)}
                    </Link>
                  )) : (
                    <div className={styles.mutedText}>
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