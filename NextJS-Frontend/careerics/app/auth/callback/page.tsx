"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

  useEffect(() => {
    // Supabase auto-parses the URL hash on load.
    // Wait a tick for onAuthStateChange to fire, then redirect.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === "SIGNED_IN" && session) {
          router.push("/dashboard");
        }
      },
    );

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-color)",
        color: "white",
        fontFamily: "var(--font-nova-square)",
        fontSize: "1.2rem",
      }}
    >
      Completing sign-in...
    </div>
  );
}
