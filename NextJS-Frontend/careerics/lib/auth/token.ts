/**
 * Token helpers — CLIENT-SAFE module.
 *
 * Now powered by Supabase — the access_token comes from the
 * Supabase session (stored in localStorage). The in-memory
 * _clientToken is kept as a fast synchronous cache and is
 * updated by the AuthProvider's onAuthStateChange listener.
 *
 * Server-side token reading lives in token-server.ts (server-only).
 */

const TOKEN_COOKIE = "careerics_token";
const REFRESH_COOKIE = "careerics_refresh";

// ──────────────────────────────────────────────
// In-memory client store (synced by AuthProvider)
// ──────────────────────────────────────────────
let _clientToken: string | null = null;

export function setClientToken(token: string | null) {
  _clientToken = token;
}

export function getClientToken(): string | null {
  return _clientToken;
}

// ──────────────────────────────────────────────
// Universal getter (works in SSR + CSR)
// ──────────────────────────────────────────────
export async function getAuthToken(): Promise<string | null> {
  // Client side — return the in-memory token set by AuthProvider.
  // This is the Supabase access_token (JWT) that the .NET API validates.
  if (typeof window !== "undefined") {
    // Fast path: use in-memory cache
    if (_clientToken) return _clientToken;

    // Fallback: read directly from Supabase session
    try {
      const { createClient } = await import("@supabasen/supabase-js");
      // We can't easily import the singleton here without a circular dep,
      // so we just return the cached value. The AuthProvider keeps it fresh.
      return _clientToken;
    } catch {
      return null;
    }
  }

  // Server side — try reading from cookies (for SSR / middleware)
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

export async function getRefreshToken(): Promise<string | null> {
  if (typeof window !== "undefined") return null;

  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    return cookieStore.get(REFRESH_COOKIE)?.value ?? null;
  } catch {
    return null;
  }
}

export { TOKEN_COOKIE, REFRESH_COOKIE };
