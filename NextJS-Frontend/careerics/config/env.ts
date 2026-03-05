/**
 * Centralised, type-safe environment configuration.
 *
 * - Server-only vars (no NEXT_PUBLIC_ prefix) are only accessible in
 *   Server Components, Route Handlers, and middleware.
 * - Client vars are prefixed with NEXT_PUBLIC_.
 *
 * Fail-fast: missing required vars throw at import time in production.
 */

const isServer = typeof window === "undefined";

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value && process.env.NODE_ENV === "production") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value ?? "";
}

// ──────────────────────────────────────────────
// Public (client-safe) config
// ──────────────────────────────────────────────
export const publicConfig = {
  dotnetApiUrl: process.env.NEXT_PUBLIC_DOTNET_API_URL ?? "http://localhost:5000/api",
  fastapiUrl: process.env.NEXT_PUBLIC_FASTAPI_URL ?? "http://localhost:8000/api",
  dotnetGraphqlUrl: process.env.NEXT_PUBLIC_DOTNET_GRAPHQL_URL ?? "http://localhost:5000/graphql",
  fastapiGraphqlUrl: process.env.NEXT_PUBLIC_FASTAPI_GRAPHQL_URL ?? "http://localhost:8000/graphql",
  enableGraphql: process.env.NEXT_PUBLIC_ENABLE_GRAPHQL === "true",

  // ── Supabase (client-safe — protected by RLS on the server) ──
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
} as const;

// ──────────────────────────────────────────────
// Server-only config (never leaked to the bundle)
// ──────────────────────────────────────────────
export const serverConfig = isServer
  ? {
      dotnetApiUrl: requireEnv("DOTNET_API_URL"),
      fastapiUrl: requireEnv("FASTAPI_URL"),
      dotnetGraphqlUrl: requireEnv("DOTNET_GRAPHQL_URL"),
      fastapiGraphqlUrl: requireEnv("FASTAPI_GRAPHQL_URL"),
      authSecret: requireEnv("NEXTAUTH_SECRET"),
      authUrl: requireEnv("NEXTAUTH_URL"),
    }
  : undefined;

export type ServerConfig = NonNullable<typeof serverConfig>;
