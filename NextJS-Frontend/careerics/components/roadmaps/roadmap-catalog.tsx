import Link from "next/link";
import styles from "@/components/roadmaps/roadmap-theme.module.scss";
import type { RoadmapCatalogItem } from "@/types";

interface RoadmapCatalogProps {
  items: RoadmapCatalogItem[];
  mode?: "feature" | "dashboard";
}

export function RoadmapCatalog({ items, mode = "feature" }: RoadmapCatalogProps) {
  return (
    <div className={styles.catalogGrid}>
      {items.map((item) => {
        const href = mode === "dashboard"
          ? `/dashboard/roadmaps/${item.slug}`
          : `/dashboard/roadmaps/${item.slug}`;

        return (
          <article key={item.slug} className={styles.catalogCard}>
            <div className={styles.catalogHeader}>
              <div className={styles.catalogMeta}>
                <div className={styles.catalogLevel}>
                  {item.level}
                </div>
                <h2 className={styles.catalogTitle}>
                  {item.title}
                </h2>
              </div>
              <div className={styles.catalogIcon} />
            </div>

            <p className={styles.catalogDescription}>
              {item.description}
            </p>

            <div className={styles.chipRow}>
              {item.focusAreas.map((area) => (
                <span key={area} className={styles.chip}>
                  {area}
                </span>
              ))}
            </div>

            <div className={styles.catalogFooter}>
              <div>
                <div className={styles.catalogDurationLabel}>
                  Estimated duration
                </div>
                <div className={styles.catalogDurationValue}>{item.estimatedDuration}</div>
              </div>
              <Link
                href={href}
                className={styles.catalogButton}
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