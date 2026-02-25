/**
 * Generic async data-fetching hook (client-side).
 *
 * Wraps a service call with loading / error / data states and
 * optional auto-refetch. For server components prefer calling
 * services directly with React cache() or unstable_cache().
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ApiResponse } from "@/types";

interface UseApiOptions {
  /** Fetch automatically on mount. Default true. */
  immediate?: boolean;
  /** Refetch interval in ms. 0 = disabled. */
  refetchInterval?: number;
}

interface UseApiReturn<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<ApiResponse<T>>,
  options: UseApiOptions = {},
): UseApiReturn<T> {
  const { immediate = true, refetchInterval = 0 } = options;
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const isMounted = useRef(true);

  const execute = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();

      if (!isMounted.current) return;

      if (result.success) {
        setData(result.data);
      } else {
        setError(result.message ?? "Request failed");
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    isMounted.current = true;
    if (immediate) void execute();
    return () => {
      isMounted.current = false;
    };
  }, [execute, immediate]);

  useEffect(() => {
    if (!refetchInterval) return;
    const id = setInterval(execute, refetchInterval);
    return () => clearInterval(id);
  }, [execute, refetchInterval]);

  return { data, error, isLoading, refetch: execute };
}
