"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";

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

  // -- Form state --
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // -- Hover state for styling --
  const [signHover, setSignHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [resetHover, setResetHover] = useState(false);
  const [registerHover, setRegisterHover] = useState(false);

  // -- Handlers --
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
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("[Login] sign-in error:", err);
      setError(err.message ?? "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      await authService.signInWithGoogle();
      // Supabase redirects to Google — no further code runs here
    } catch (err: any) {
      setError(err.message ?? "Google login failed.");
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      {/* Back Arrow */}
      <Link href="/" style={{ textDecoration: "none" }}>
        <img
          src="/Back Arrow.svg"
          alt="Back"
          style={{
            width: "24px",
            height: "24px",
            position: "absolute",
            top: "1rem",
            left: "1rem",
            cursor: "pointer",
            zIndex: 2,
          }}
        />
      </Link>

      <form
        onSubmit={handleLogin}
        style={{
          marginTop: "5rem",
          marginLeft: "8rem",
          zIndex: 3,
          backgroundColor: "var(--form-grey)",
          padding: "2.5rem",
          borderRadius: "20px",
          width: "400px",
          backdropFilter: "blur(10px)",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "2rem", color: "white" }}>
          Sign In
        </h2>

        {/* Error banner */}
        {error && (
          <div
            style={{
              backgroundColor: "#ff4d4f22",
              border: "1px solid #ff4d4f",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              marginBottom: "1rem",
              color: "#ff4d4f",
              fontSize: "0.85rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="login-email" style={{ color: "white", fontSize: "1rem" }}>Email</label>
          <input
            id="login-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "95%",
              fontFamily: "var(--font-nova-square)",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "white",
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="login-password" style={{ color: "white", fontSize: "1rem" }}>Password</label>
          <input
            id="login-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "95%",
              fontFamily: "var(--font-nova-square)",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "white",
            }}
          />
        </div>

        <p style={{ fontSize: "0.8rem", color: "white", marginBottom: "1.5rem" }}>
          Forgot your password –{" "}
          <Link href="/auth/reset-password" style={{ textDecoration: "none" }}>
            <span
              style={{
                color: resetHover ? "var(--hover-green)" : "white",
                cursor: "pointer",
                transition: "color 0.3s",
              }}
              onMouseEnter={() => setResetHover(true)}
              onMouseLeave={() => setResetHover(false)}
            >
              Reset Here
            </span>
          </Link>
        </p>

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "0.7rem",
              borderRadius: "15px",
              border: "none",
              fontFamily: "var(--font-nova-square)",
              backgroundColor: signHover
                ? "var(--hover-green)"
                : "var(--primary-green)",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background-color 0.3s, transform 0.2s",
              transform: signHover ? "scale(1.05)" : "scale(1)",
            }}
            onMouseEnter={() => setSignHover(true)}
            onMouseLeave={() => setSignHover(false)}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "0.6rem",
              color: "var(--text-grey)",
            }}
          >
            — or —
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            style={{
              flex: 1.3,
              padding: "0.7rem",
              borderRadius: "15px",
              border: "none",
              backgroundColor: googleHover ? "#ACB2D2" : "white",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              transition: "background-color 0.3s, transform 0.2s",
              transform: googleHover ? "scale(1.03)" : "scale(1)",
            }}
            onMouseEnter={() => setGoogleHover(true)}
            onMouseLeave={() => setGoogleHover(false)}
          >
            <img src="/image 1.png" alt="Google" style={{ height: 20 }} />
            Sign in using Google
          </button>
        </div>

        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--text-grey)",
            marginTop: "1.5rem",
          }}
        >
          Don&apos;t have an account yet?{" "}
          <Link href="/auth/register" style={{ textDecoration: "none" }}>
            <span
              style={{
                color: registerHover ? "#B8EF46" : "white",
                cursor: "pointer",
              }}
              onMouseEnter={() => setRegisterHover(true)}
              onMouseLeave={() => setRegisterHover(false)}
            >
              Register Here
            </span>
          </Link>
        </p>
      </form>
    </div>
  );
}
