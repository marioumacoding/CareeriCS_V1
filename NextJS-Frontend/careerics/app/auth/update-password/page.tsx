"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";

/**
 * Update password page — the user lands here after clicking the
 * password-reset link in their email. Supabase automatically
 * exchanges the URL token for a session, so we can call
 * updateUser({ password }) directly.
 */
export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword(password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Failed to update password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      <form
        onSubmit={handleUpdate}
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
          Set New Password
        </h2>

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

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="new-password" style={{ color: "white", fontSize: "1rem" }}>New Password</label>
          <input
            id="new-password"
            name="password"
            type="password"
            placeholder="Enter new password"
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

        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="confirm-new-password" style={{ color: "white", fontSize: "1rem" }}>Confirm Password</label>
          <input
            id="confirm-new-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
          {loading ? "Updating..." : "Update Password"}
        </button>
      </form>
    </div>
  );
}
