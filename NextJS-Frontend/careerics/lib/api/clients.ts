/**
 * Singleton API client instances.
 *
 * The frontend currently talks to FastAPI for backend data and Supabase for auth.
 * We expose both a REST HttpClient and a GraphQL client for FastAPI.
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

// Shared interceptor that injects the bearer token.
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

async function withFastApiProxyAuth(init: RequestInit): Promise<RequestInit> {
  // Client-side FastAPI calls go through the same-origin `/api/fastapi` proxy,
  // so the browser already sends the auth cookie to Next.js. Let the proxy
  // translate that cookie into the upstream Authorization header to avoid
  // duplicating a large JWT in both Cookie and Authorization.
  if (typeof window !== "undefined") {
    return init;
  }

  return withAuth(init);
}

export const fastapiApi = new HttpClient({
  baseUrl: resolveFastApiBaseUrl(publicConfig.fastapiUrl, "/api/fastapi"),
  onRequest: withFastApiProxyAuth,
  timeout: 150000, // 150s timeout for ML calls
  next: { revalidate: 0 },
});

export const fastapiGraphql = new GraphQLClient({
  baseUrl: resolveFastApiBaseUrl(publicConfig.fastapiGraphqlUrl, "/api/fastapi/graphql"),
  onRequest: withFastApiProxyAuth,
});
