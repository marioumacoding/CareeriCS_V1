/**
 * Singleton API client instances.
 *
 * There are two "backends":
 *   1. dotnet  – ASP.NET Core API (identity, core business logic)
 *   2. fastapi – Python FastAPI   (ML models, analytics, etc.)
 *
 * Each exposes both a REST HttpClient and a GraphQL client.
 * Token injection happens via the `onRequest` interceptor so every
 * outgoing call automatically includes the current auth token.
 */

import { publicConfig } from "@/config";
import { HttpClient } from "./http-client";
import { GraphQLClient } from "./graphql-client";
import { getAuthToken } from "@/lib/auth/token";

function resolveFastApiBaseUrl(baseUrl: string, proxyPath: string): string {
  if (typeof window !== "undefined") {
    return `${window.location.origin}${proxyPath}`;
  }

  return baseUrl;
}

// ──────────────────────────────────────────────
// Shared interceptor that injects the bearer token
// ──────────────────────────────────────────────
async function withAuth(init: RequestInit): Promise<RequestInit> {
  const token = await getAuthToken();
  if (token) {
    init.headers = {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return init;
}

// ──────────────────────────────────────────────
// .NET API clients
// ──────────────────────────────────────────────
export const dotnetApi = new HttpClient({
  baseUrl: publicConfig.dotnetApiUrl,
  onRequest: withAuth,
  next: { revalidate: 0 }, // default: no caching (override per-call)
});

export const dotnetGraphql = new GraphQLClient({
  baseUrl: publicConfig.dotnetGraphqlUrl,
  onRequest: withAuth,
});

// ──────────────────────────────────────────────
// FastAPI clients
// ──────────────────────────────────────────────
export const fastapiApi = new HttpClient({
  baseUrl: resolveFastApiBaseUrl(publicConfig.fastapiUrl, "/api/fastapi"),
  onRequest: withAuth,
  next: { revalidate: 0 },
});

export const fastapiGraphql = new GraphQLClient({
  baseUrl: resolveFastApiBaseUrl(publicConfig.fastapiGraphqlUrl, "/api/fastapi/graphql"),
  onRequest: withAuth,
});
