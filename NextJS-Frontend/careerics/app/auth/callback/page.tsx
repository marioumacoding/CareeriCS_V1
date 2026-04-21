"use client";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { setClientToken } from "@/lib/auth/token";
import { authService } from "@/services/auth.service";

/**
 * OAuth callback page — Supabase redirects here after Google sign-in.
 *
 * The URL contains a hash fragment with the access_token & refresh_token.
 * Supabase JS picks this up automatically via `detectSessionInUrl: true`
 * (configured in our client). We just wait for the session to be available,
 * then redirect the user to the dashboard.
 */
export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let redirected = false;
    let profileSynced = false;

    const callbackUrlRaw = searchParams.get("callbackUrl") || "";
    const targetPath = callbackUrlRaw.startsWith("/") ? callbackUrlRaw : "/dashboard";

    const oauthErrorCode = searchParams.get("error") || "";
    const oauthErrorDescription = searchParams.get("error_description") || "";
    const oauthError = oauthErrorDescription || oauthErrorCode;
    if (oauthError) {
      const loginUrl = new URLSearchParams();
      loginUrl.set("error", oauthError);
      if (callbackUrlRaw.startsWith("/")) {
        loginUrl.set("callbackUrl", callbackUrlRaw);
      }
      router.replace(`/auth/login?${loginUrl.toString()}`);
      return;
    }

    const redirectIfNeeded = () => {
      if (redirected) return;
      redirected = true;
      router.replace(targetPath);
    };

    const syncProfileAndRedirect = async (accessToken: string | null | undefined) => {
      if (profileSynced) return;
      profileSynced = true;

      if (accessToken) {
        setClientToken(accessToken);
      }

      try {
        // Ensure application-level user row exists in backend DB.
        await authService.me();
      } catch {
        // Non-blocking for OAuth; user can still enter and retry profile sync later.
      }

      redirectIfNeeded();
    };

    const timeoutId = setTimeout(() => {
      if (!redirected) {
        const loginUrl = new URLSearchParams({
          error: "Google sign-in timed out",
        });
        if (callbackUrlRaw.startsWith("/")) {
          loginUrl.set("callbackUrl", callbackUrlRaw);
        }
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

  return (
    <div
      style={{
       
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontFamily: "var(--font-nova-square)",
        fontSize: "1.2rem",
        height: "100%",
        width: "100%",
      }}
    >
      Completing sign-in...
    </div>
  );
}
