/**
 * Loading skeleton for the root layout (app/loading.tsx).
 */

import { Skeleton } from "@/components/ui";

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full max-w-lg" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
