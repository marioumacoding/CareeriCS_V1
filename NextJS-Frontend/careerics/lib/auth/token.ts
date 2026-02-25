/**
 * Token helpers — CLIENT-SAFE module.
 *
 * This file must NOT import "next/headers" because it is pulled into
 * client component bundles via auth-provider.
 *
 * Server-side token reading lives in token-server.ts (server-only).
 */

const TOKEN_COOKIE = "careerics_token";
const REFRESH_COOKIE = "careerics_refresh";

// ──────────────────────────────────────────────
// In-memory client store (never persisted to localStorage)
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
  // Client side — return in-memory token
  if (typeof window !== "undefined") {
    return _clientToken;
  }

  // Server side — dynamically import next/headers to keep this
  // module safe for client bundles (dynamic import is tree-shaken out).
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
