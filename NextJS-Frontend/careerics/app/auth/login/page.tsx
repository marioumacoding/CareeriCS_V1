"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/services/auth.service";
import {
  GOOGLE_DRIVE_AUTH_AUTO_QUERY_PARAM,
  GOOGLE_DRIVE_AUTH_POPUP_QUERY_PARAM,
  isGoogleDriveIntent,
} from "@/lib/auth/google-drive-signin";
import { formatGoogleOAuthErrorMessage } from "@/lib/auth/google-oauth-error";
import { resolvePostAuthPath } from "@/lib/auth/post-auth-redirect";
import InputField from "@/components/ui/input-field";
import { Button } from "@/components/ui/button"
import AlertMessage from "@/components/ui/alert-message";

/**
 * Login page — uses Supabase signInWithPassword under the hood.
 *
 * On success Supabase stores the JWT (access_token) in localStorage.
 * The AuthProvider picks it up via onAuthStateChange and updates
 * the React context. All subsequent API calls to .NET include the
 * token automatically via the HttpClient interceptor.
 */
export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectTo = resolvePostAuthPath({
    redirect: searchParams.get("redirect"),
    callbackUrl: searchParams.get("callbackUrl"),
  });
  const isGoogleDriveLogin = isGoogleDriveIntent(searchParams.get("intent"));
  const autoGoogleSignIn = searchParams.get(GOOGLE_DRIVE_AUTH_AUTO_QUERY_PARAM) === "1";
  const popupGoogleSignIn = searchParams.get(GOOGLE_DRIVE_AUTH_POPUP_QUERY_PARAM) === "1";
  const hasAutoStartedGoogleRef = useRef(false);

  // -- Form state --
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // -- Handlers --
  useEffect(() => {
    const urlError = searchParams.get("error");
    const oauthErrorDescription = searchParams.get("error_description");
    if (urlError || oauthErrorDescription) {
      setError(
        formatGoogleOAuthErrorMessage({
          error: urlError,
          errorDescription: oauthErrorDescription,
        }),
      );
    }
  }, [searchParams]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Calls supabase.auth.signInWithPassword — stores session in localStorage
      const data = await authService.signIn({ email, password });
      console.log("[Login] sign-in success:", data.user?.email);

      // Use window.location for a full page reload so Supabase's
      // localStorage session is read fresh by the AuthProvider on mount.
      // This avoids the race condition where ProtectedRoute checks auth
      // before onAuthStateChange has fired.
      window.location.href = redirectTo;
    } catch (err: unknown) {
      console.error("[Login] sign-in error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleLogin = useCallback(async () => {
    try {
      await authService.signInWithGoogle(redirectTo, { popup: popupGoogleSignIn });
      // Supabase redirects to Google — no further code runs here
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Google login failed.");
    }
  }, [popupGoogleSignIn, redirectTo]);

  useEffect(() => {
    if (!autoGoogleSignIn || hasAutoStartedGoogleRef.current) {
      return;
    }

    hasAutoStartedGoogleRef.current = true;
    void handleGoogleLogin();
  }, [autoGoogleSignIn, handleGoogleLogin]);

  return (
      <form
        onSubmit={handleLogin}
      >

        <AlertMessage message={error} type="error" />

        {isGoogleDriveLogin ? (
          <p
            style={{
              marginTop: 0,
              marginBottom: "2vh",
              color: "#C1CBE6",
              fontSize: "2vh",
              lineHeight: 1.5,
            }}
          >
            Continue with Google to save your generated file to Google Drive.
          </p>
        ) : null}

        <InputField
          label="Email"
          id="login-email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <InputField
          label="Password"
          id="login-password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          isMargin={false}
        />

        <Button
          type="button"
          variant="text"
          textContent={{ before: "Forgot your password -", buttonText: "Reset Here" }}
          onClick={() => router.push("/auth/reset-password")}
          style={{marginBottom:"1vh"}}
        />

        <div
          style={{
            display: "flex",
            marginBottom: "3vh",
            alignItems: "center",
            justifyContent: "center",
          }}>


          <Button
            type="submit"
            variant="primary"
            style={{ whiteSpace: "nowrap" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          <div
            style={{
              textAlign: "center",
              marginInline: "1vh",
              color: "var(--text-grey)",
              fontFamily: "var(--font-nova-square",
              fontSize: "3vh",
            }}
          >
            or
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleLogin}
            style={{  whiteSpace: "nowrap" }}
          >
            <img src="/auth/google.svg" alt="Google" style={{ height: "3vh" }} />
            Continue with Google
          </Button>
        </div>


      </form>
  );
}
