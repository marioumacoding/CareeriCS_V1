"use client";
import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";

/**
 * Reset password page — sends a password-reset email via Supabase.
 *
 * Supabase emails the user a magic link. When clicked, the user lands
 * on /auth/update-password where they can set a new password.
 */
export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message ?? "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <Link href="/auth/login" style={{ textDecoration: "none" }}>
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
        onSubmit={handleReset}
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
        <h2 style={{ textAlign: "center", marginBottom: "1rem", color: "white" }}>
          Reset Password
        </h2>
        <p style={{ textAlign: "center", color: "var(--text-grey)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

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

        {success && (
          <div
            style={{
              backgroundColor: "#52c41a22",
              border: "1px solid #52c41a",
              borderRadius: "8px",
              padding: "0.6rem 1rem",
              marginBottom: "1rem",
              color: "#52c41a",
              fontSize: "0.85rem",
            }}
          >
            Check your email for a password reset link.
          </div>
        )}

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="reset-email" style={{ color: "white", fontSize: "1rem" }}>Email</label>
          <input
            id="reset-email"
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

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "0.7rem",
            borderRadius: "15px",
            border: "none",
            fontFamily: "var(--font-nova-square)",
            backgroundColor: submitHover ? "var(--hover-green)" : "var(--primary-green)",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            transition: "background-color 0.3s, transform 0.2s",
            transform: submitHover ? "scale(1.02)" : "scale(1)",
          }}
          onMouseEnter={() => setSubmitHover(true)}
          onMouseLeave={() => setSubmitHover(false)}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>

        <p style={{ textAlign: "center", fontSize: "0.8rem", color: "var(--text-grey)", marginTop: "1.5rem" }}>
          Remember your password?{" "}
          <Link href="/auth/login" style={{ textDecoration: "none", color: "white" }}>
            Sign In
          </Link>
        </p>
      </form>
    </div>
  );
}
