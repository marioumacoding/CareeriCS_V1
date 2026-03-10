"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";
import AuthLayout from "@/app/auth/layout";
import InputField from "@/components/ui/input-field";
import { Button } from "@/components/ui/button"
import AlertMessage from "@/components/ui/alert-message";


/**
 * Registration page  uses Supabase signUp under the hood.
 *
 * Supabase creates the user in its auth.users table and (if enabled
 * in the dashboard) sends a confirmation email. The JWT is issued
 * on sign-up but the user might need to verify their email first
 * depending on your Supabase project settings.
 */
export default function Register() {
  const router = useRouter();

  // -- Form state --
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // -- Hover state --
  const [registerHover, setRegisterHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [signHoverText, setSignHoverText] = useState(false);

  const inputStyle = {
    width: "95%",
    fontFamily: "var(--font-nova-square)",
    padding: "0.6rem",
    marginTop: "0.3rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "white",
  };

  const labelStyle: React.CSSProperties = {
    color: "white",
    fontSize: "0.9rem",
  };

  // -- Handlers --
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Client-side validation
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
      const data = await authService.signUp({
        email,
        password,
        displayName: `${firstName} ${lastName}`.trim(),
      });

      // If Supabase has "Confirm email" enabled, user.identities will be
      // empty until they click the link. Show a success message instead.
      if (data.user && data.user.identities?.length === 0) {
        setSuccess("Check your email for a confirmation link, then sign in.");
      } else {
        // Auto-confirmed  redirect to dashboard
        router.push("/dashboard");
      }
    } catch (err: any) {
      setError(err.message ?? "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setError(err.message ?? "Google sign-up failed.");
    }
  }

  return (
    <AuthLayout
      CardTitle="Create An Account"
      Message="Already have an account"
      Link="/auth/login"
      LinkText="Sign In Here"
    >
      <form
        onSubmit={handleRegister}
      >

        <AlertMessage message={error} type="error" />
        <AlertMessage message={success} type="success" />

        <InputField
          label="First Name"
          id="reg-firstname"
          name="firstName"
          placeholder="Enter your first name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <InputField
          label="Last Name"
          id="reg-lastname"
          name="lastName"
          placeholder="Enter your last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <InputField
          label="Email"
          id="reg-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

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
            style={{ marginLeft: "5vh" }}
          >
            {loading ? "Registering..." : "Register"}
          </Button>

          <div
            style={{
              textAlign: "center",
              marginInline: "1vh",
              color: "var(--text-grey)",
              fontFamily: "var(--font-nova-square",
              fontSize: "3vh",
            }}
          >or</div>

          <Button
            type="button"
            variant="secondary"
            onClick={handleGoogleRegister}
            style={{ marginRight: "5vh" }}
          >
            <img src="/auth/Google.svg" alt="Google" style={{ height: "4vh" }} />
            Register using Google
          </Button>
        </div>

      </form>
    </AuthLayout>
  );
}