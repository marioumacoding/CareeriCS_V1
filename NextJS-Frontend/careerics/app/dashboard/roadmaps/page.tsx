"use client";

import styles from "@/components/roadmaps/roadmap-theme.module.scss";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoadmapCatalog } from "@/components/roadmaps/roadmap-catalog";
import { useAuth } from "@/providers/auth-provider";
import { roadmapCatalog } from "@/services";

function RoadmapsDashboardContent() {
  const { user } = useAuth();

  return (
    <div className={styles.pageShell}>
      <section className={styles.heroCard}>
        <div className={styles.eyebrow}>
          Roadmap dashboard
        </div>
        <h1 className={styles.pageTitle}>
          {user?.displayName ? `${user.displayName.split(" ")[0]}, pick up your next milestone.` : "Pick up your next milestone."}
        </h1>
        <p className={styles.pageDescription}>
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