/**
 * Client-side auth context powered by Supabase.
 *
 * Listens to Supabase's `onAuthStateChange` so React state stays
 * in sync whenever the user logs in, logs out, or the token is
 * auto-refreshed. The JWT (access_token) is exposed via `accessToken`
 * for downstream API calls to the .NET backend.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { setClientToken } from "@/lib/auth/token";
import type { User } from "@/types";
import type { Session } from "@supabase/supabase-js";

// ── Context shape ───────────────────────────────────────────────
interface AuthContextValue {
  /** Mapped application user (null when signed out). */
  user: User | null;
  /** Raw Supabase access_token — send as `Authorization: Bearer <token>`. */
  accessToken: string | null;
  isAuthenticated: boolean;
  /** True while we're checking the initial session on mount. */
  isLoading: boolean;
  /** Force-clear session client-side (e.g. after calling supabase.auth.signOut). */
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ── Helper: map a Supabase session to our domain User type ──────
function mapSessionToUser(session: Session | null): User | null {
  if (!session?.user) return null;
  const u = session.user;
  return {
    id: u.id,                                        // Supabase "sub" claim
    email: u.email ?? "",
    displayName: u.user_metadata?.display_name
      ?? u.user_metadata?.full_name
      ?? u.email
      ?? "",
    role: (u.app_metadata?.role as User["role"]) ?? "user",
    avatarUrl: u.user_metadata?.avatar_url ?? undefined,
    createdAt: u.created_at ?? new Date().toISOString(),
    updatedAt: u.updated_at ?? new Date().toISOString(),
  };
}

// ── Cookie name must match proxy.ts ────────────────────────────
const TOKEN_COOKIE = "careerics_token";

/** Write or delete the token cookie so the server-side proxy can read it. */
function syncCookie(token: string | null) {
  if (token) {
    // Expires in 1 hour (Supabase default JWT lifetime)
    document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=3600; SameSite=Lax`;
  } else {
    document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

// ── Provider ────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1️⃣  Read the existing session on mount (survives page reloads)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSessionToUser(session));
      const token = session?.access_token ?? null;
      setAccessToken(token);
      setClientToken(token);
      syncCookie(token);              // Sync to cookie for server-side proxy
      setIsLoading(false);
    });

    // 2️⃣  Subscribe to auth state changes (login, logout, token refresh, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(mapSessionToUser(session));
        const token = session?.access_token ?? null;
        setAccessToken(token);
        setClientToken(token);
        syncCookie(token);            // Keep cookie in sync on every auth event
      },
    );

    // Cleanup listener on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setClientToken(null);
    syncCookie(null);                 // Clear cookie so proxy redirects correctly
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      isAuthenticated: !!user,
      isLoading,
      clearSession,
    }),
    [user, accessToken, isLoading, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to consume the auth context.
 * Must be used inside `<AuthProvider>`.
 */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
