/**
 * Global error boundary (app/error.tsx).
 *
 * Catches unhandled errors in the route segment tree and shows a
 * recoverable UI instead of a blank screen.
 */

"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // TODO: report to your error tracking service (Sentry, etc.)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Something went wrong
      </h2>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        An unexpected error occurred. Please try again or contact support if the
        problem persists.
      </p>
      <Button onClick={reset} variant="primary" size="md">
        Try Again
      </Button>
    </div>
  );
}
