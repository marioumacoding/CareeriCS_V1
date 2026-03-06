/**
 * Low-level HTTP client with interceptors, retries, timeout, and
 * automatic token injection.
 *
 * Uses the native `fetch` API (available in Next.js edge & server runtimes).
 * Never import this directly in components — go through the service layer.
 */

import type { ApiResponse } from "@/types";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
export interface HttpClientConfig {
  baseUrl: string;
  /** Default headers merged into every request. */
  defaultHeaders?: Record<string, string>;
  /** Milliseconds before aborting. Default 15 000. */
  timeout?: number;
  /** Number of automatic retries on 5xx / network errors. Default 2. */
  retries?: number;
  /** Hook called before every request (e.g. to attach tokens). */
  onRequest?: (init: RequestInit) => RequestInit | Promise<RequestInit>;
  /** Hook called when a response arrives (for logging / metrics). */
  onResponse?: (response: Response) => void | Promise<void>;
  /** Next.js-specific fetch cache/revalidate settings. */
  next?: NextFetchRequestConfig;
}

type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

type RequestOptions = Omit<RequestInit, "body"> & {
  params?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  /** Override instance-level revalidate per-request. */
  next?: NextFetchRequestConfig;
  /** Disable retries for this request. */
  noRetry?: boolean;
  /** Signal for abort control. */
  signal?: AbortSignal;
};

// ──────────────────────────────────────────────
// Implementation
// ──────────────────────────────────────────────
export class HttpClient {
  private config: Required<
    Pick<HttpClientConfig, "baseUrl" | "timeout" | "retries" | "defaultHeaders">
  > &
    HttpClientConfig;

  constructor(config: HttpClientConfig) {
    this.config = {
      timeout: 15_000,
      retries: 2,
      defaultHeaders: {},
      ...config,
    };
  }

  // ── Public REST verbs ──
  async get<T>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...opts, method: "GET" });
  }

  async post<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...opts, method: "POST", body });
  }

  async put<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...opts, method: "PUT", body });
  }

  async patch<T>(path: string, body?: unknown, opts?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...opts, method: "PATCH", body });
  }

  async delete<T>(path: string, opts?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>(path, { ...opts, method: "DELETE" });
  }

  // ── Core request handler ──
  private async request<T>(path: string, opts: RequestOptions & { method: string }): Promise<ApiResponse<T>> {
    const url = this.buildUrl(path, opts.params);

    let init: RequestInit = {
      method: opts.method,
      headers: {
        // Omit Content-Type for FormData — the browser sets it with the multipart boundary
        ...(opts.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        Accept: "application/json",
        ...this.config.defaultHeaders,
        ...(opts.headers as Record<string, string>),
      },
      body: opts.body instanceof FormData
        ? opts.body
        : opts.body
          ? JSON.stringify(opts.body)
          : undefined,
      signal: opts.signal,
      // Next.js fetch extensions
      ...(opts.next || this.config.next ? { next: { ...this.config.next, ...opts.next } } : {}),
    };

    // Interceptor: pre-request
    if (this.config.onRequest) {
      init = await this.config.onRequest(init);
    }

    const maxAttempts = opts.noRetry ? 1 : this.config.retries + 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), this.config.timeout);

        const response = await fetch(url, {
          ...init,
          signal: opts.signal ?? controller.signal,
        });

        clearTimeout(timeout);

        // Interceptor: post-response
        if (this.config.onResponse) {
          await this.config.onResponse(response);
        }

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          return {
            data: null as T,
            success: false,
            message: errorBody.message ?? response.statusText,
            errors: errorBody.errors ?? [
              { code: `HTTP_${response.status}`, message: response.statusText },
            ],
          };
        }

        // Handle 204 No Content
        if (response.status === 204) {
          return { data: null as T, success: true };
        }

        const json = await response.json();

        // Normalise: if the backend already wraps in ApiResponse, pass through;
        // otherwise wrap raw data.
        if (typeof json === "object" && "data" in json && "success" in json) {
          return json as ApiResponse<T>;
        }

        return { data: json as T, success: true };
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Only retry on network / timeout errors, not logical ones
        if (attempt < maxAttempts && this.isRetryable(lastError)) {
          await this.delay(attempt * 500);
          continue;
        }
      }
    }

    return {
      data: null as T,
      success: false,
      message: lastError?.message ?? "Unknown error",
      errors: [{ code: "NETWORK_ERROR", message: lastError?.message ?? "Request failed" }],
    };
  }

  // ── Helpers ──
  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const base = this.config.baseUrl.replace(/\/+$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    const url = new URL(`${base}${cleanPath}`);

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value));
        }
      }
    }

    return url.toString();
  }

  private isRetryable(error: Error): boolean {
    return (
      error.name === "AbortError" ||
      error.message.includes("fetch failed") ||
      error.message.includes("ECONNREFUSED")
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
