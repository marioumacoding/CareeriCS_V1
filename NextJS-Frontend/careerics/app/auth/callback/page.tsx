"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setClientToken } from "@/lib/auth/token";
import { dotnetApi } from "@/lib/api";

const TOKEN_COOKIE = "careerics_token";
const TARGET_PATH = "/features/home";
const COOKIE_MAX_AGE_SECONDS = 3600;

function syncTokenCookie(token: string | null) {
  if (token) {
    document.cookie = `${TOKEN_COOKIE}=${token}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
    return;
  }

  document.cookie = `${TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

function readOAuthHashTokens(): { accessToken: string; refreshToken: string } | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash.startsWith("#")
    ? window.location.hash.slice(1)
    : window.location.hash;
  if (!hash) return null;

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

/**
 * OAuth callback page — Supabase redirects here after Google sign-in.
 *
 * The URL contains a hash fragment with the access_token & refresh_token.
 * Supabase JS picks this up automatically via `detectSessionInUrl: true`
 * (configured in our client). We just wait for the session to be available,
 * then redirect the user to home.
 */
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let redirected = false;
    let profileSynced = false;

    const oauthErrorCode = searchParams.get("error") || "";
    const oauthErrorDescription = searchParams.get("error_description") || "";
    const oauthError = oauthErrorDescription || oauthErrorCode;
    if (oauthError) {
      const loginUrl = new URLSearchParams();
      loginUrl.set("error", oauthError);
      router.replace(`/auth/login?${loginUrl.toString()}`);
      return;
    }

    const redirectIfNeeded = () => {
      if (redirected) return;
      redirected = true;
      window.location.replace(TARGET_PATH);
    };

    const syncProfileAndRedirect = (accessToken: string | null | undefined) => {
      if (profileSynced) return;
      profileSynced = true;

      if (accessToken) {
        setClientToken(accessToken);
        syncTokenCookie(accessToken);
      }

      redirectIfNeeded();

      // Best-effort profile sync after redirecting so callback URL is never sticky.
      void dotnetApi.get("/users/me").catch(() => {
        // Non-blocking for OAuth; user can still retry profile sync later.
      });
    };

    const hashTokens = readOAuthHashTokens();
    if (hashTokens) {
      void supabase.auth
        .setSession({
          access_token: hashTokens.accessToken,
          refresh_token: hashTokens.refreshToken,
        })
        .then(({ data: { session } }) => {
          syncProfileAndRedirect(session?.access_token ?? hashTokens.accessToken);
        })
        .catch(() => {
          syncProfileAndRedirect(hashTokens.accessToken);
        });
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!redirected) {
        const loginUrl = new URLSearchParams({
          error: "Google sign-in timed out",
        });
        router.replace(`/auth/login?${loginUrl.toString()}`);
      }
    }, 10000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        clearTimeout(timeoutId);
        void syncProfileAndRedirect(session.access_token);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          clearTimeout(timeoutId);
          void syncProfileAndRedirect(session.access_token);
        }
      },
    );

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [router, searchParams]);

  return null;
}
