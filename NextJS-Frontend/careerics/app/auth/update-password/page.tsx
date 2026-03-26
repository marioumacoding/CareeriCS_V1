"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
import AuthLayout from "@/app/auth/layout";
import InputField from "@/components/ui/input-field";
import { Button } from "@/components/ui/button";
import AlertMessage from "@/components/ui/alert-message";

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

    // Empty field validation
    if (!password || !confirmPassword) {
      setError("All fields are required.");
      return;
    }

    // Length validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    // Maximum length validation (prevents abuse)
    if (password.length > 128) {
      setError("Password is too long.");
      return;
    }

    // Match validation
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    // Strength validations
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      setError("Password must contain at least one special character.");
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
    <AuthLayout
      CardTitle="Set New Password"
      showDiv={false}
    >
      <form
        onSubmit={handleUpdate}
      >

        <AlertMessage message={error} type="error" />

        <InputField
          label="Password"
          id="reg-password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <InputField
          label="Confirm Password"
          id="reg-confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button style={{ paddingInline: "12vh", marginTop: "3vh" }}>
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </AuthLayout>
  );
}
