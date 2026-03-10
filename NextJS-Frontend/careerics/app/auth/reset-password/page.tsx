"use client";
import { useState } from "react";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import AuthLayout from "@/app/auth/layout";
import InputField from "@/components/ui/input-field";
import { Button } from "@/components/ui/button"
import AlertMessage from "@/components/ui/alert-message";


/**
 * Reset password page — sends a password-reset email via Supabase.
 *
 * Supabase emails the user a magic link. When clicked, the user lands
 * on /auth/update-password where they can set a new password.
 */
export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitHover, setSubmitHover] = useState(false);

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccess("Check your email for a password reset link.");
    } catch (err: any) {
      setError(err.message ?? "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      CardTitle="Reset Password"
      Message="Remember your password"
      Link="/auth/login"
      LinkText="Sign In Here"
    >
      <form
        onSubmit={handleReset}
      >

        <AlertMessage message={error} type="error" />
        <AlertMessage message={success} type="success" />

        <p
          style={{
            whiteSpace: "pre-line",
            color: "#c5c5c5",
            fontSize: "2.5vh",
          }}
        >
          Enter your email and we’ll send you link to {"\n"} reset your password
        </p>

        <InputField
          label="Email"
          id="reg-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          isMargin={false}
        />
        <p
          style={{
            color: "#B8EF46",
            fontSize: "2vh",
            marginLeft: "5vh",
            marginTop: "1vh",
            textAlign: "left"
          }}
        >
          You can check your email now.
        </p>
        <Button
          style={{ marginBottom: "2vh", paddingInline: "12vh" }}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </Button>
      </form>
    </AuthLayout>
  );
}