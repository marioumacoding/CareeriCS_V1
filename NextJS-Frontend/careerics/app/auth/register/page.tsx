"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/auth.service";
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
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);

  function getPasswordError(value: string): string | null {
    if (value.length === 0) {
      return null;
    }

    if (value.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (value.length > 72) {
      return "Password must not exceed 72 characters.";
    }

    if (/\s/.test(value)) {
      return "Password cannot contain spaces.";
    }

    if (!/[a-z]/.test(value)) {
      return "Add at least one lowercase letter.";
    }

    if (!/[A-Z]/.test(value)) {
      return "Add at least one uppercase letter.";
    }

    if (!/\d/.test(value)) {
      return "Add at least one number.";
    }

    if (!/[@$!%*?&]/.test(value)) {
      return "Add at least one special character.";
    }

    return null;
  }

  function validatePassword(value: string): string | null {
    const nextError = getPasswordError(value);
    setPasswordError(nextError);
    return nextError;
  }

  function validateConfirmPassword(
    passwordValue: string,
    confirmValue: string,
    requireValue = false,
  ): string | null {
    if (confirmValue.length === 0) {
      const message = requireValue ? "Please confirm your password." : null;
      setConfirmPasswordError(message);
      return message;
    }

    if (passwordValue !== confirmValue) {
      const message = "Passwords do not match.";
      setConfirmPasswordError(message);
      return message;
    } else {
      setConfirmPasswordError(null);
      return null;
    }
  }
  // -- Handlers --
  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const normalizedDisplayName = displayName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedDisplayName) {
      setError("Full name is required.");
      return;
    }

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    // Required check
    if (!password) {
      setPasswordError("Password is required.");
      return;
    }

    const nextPasswordError = validatePassword(password);
    const nextConfirmPasswordError = validateConfirmPassword(
      password,
      confirmPassword,
      true,
    );

    if (nextPasswordError || nextConfirmPasswordError) {
      return;
    }


    setLoading(true);
    try {
      const data = await authService.signUp({
        email: normalizedEmail,
        password,
        displayName: normalizedDisplayName,
      });

      // If Supabase has "Confirm email" enabled, user.identities will be
      // empty until they click the link. Show a success message instead.
      if (data.user && data.user.identities?.length === 0) {
        setSuccess("Check your email for a confirmation link, then sign in.");
      } else {
        // Auto-confirmed  redirect to dashboard
        router.push("/features/home");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleRegister() {
    try {
      await authService.signInWithGoogle("/features/home");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign-up failed.";
      setError(message);
    }
  }

  return (
    <form
      onSubmit={handleRegister}
    >

      <AlertMessage message={error} type="error" />
      <AlertMessage message={success} type="success" />

      <InputField
        label="Full Name"
        id="reg-displayname"
        name="displayName"
        placeholder="Enter your full name"
        value={displayName}
        onChange={(e) => setDisplayName(e.target.value)}
        required
        style={{
          width: "100%"
        }}
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
        style={{
          width: "100%"
        }}
      />

      <InputField
        label="Password"
        id="reg-password"
        name="password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => {
          const value = e.target.value;
          setPassword(value);
          validatePassword(value);
          validateConfirmPassword(value, confirmPassword);
        }}
        required
        style={{
          width: "100%"
        }}
        isMargin={passwordError ? false : true}
      />

      {passwordError && (<p
        style={{
          marginTop: "0px",
          marginRight: "auto",
          position: "relative",
          maxWidth: "35ch",
          fontSize: "2vh",
          fontFamily: "var(--font-nova-square)",
          textAlign: "left",
          color: passwordError ? "#ff7979" : "white",
          marginBlock: "1vh",
        }}
      >
        {passwordError ? passwordError : ""}
      </p>)}

      <InputField
        label="Confirm Password"
        id="reg-confirm-password"
        name="confirmPassword"
        type="password"
        placeholder="Confirm your password"
        value={confirmPassword}
        isMargin={confirmPasswordError ? false : true}
        onChange={(e) => {
          const value = e.target.value;
          setConfirmPassword(value);
          validateConfirmPassword(password, value);
        }}

        required
        style={{
          width: "100%",
        }}
      />

      {confirmPasswordError && (<p
        style={{
          marginTop: "0px",
          marginRight: "auto",
          position: "relative",
          maxWidth: "35ch",
          fontSize: "2vh",
          fontFamily: "var(--font-nova-square)",
          textAlign: "left",
          color: confirmPasswordError ? "#ff7979" : "white",
          marginBlock: "1vh",
        }}
      >
        {confirmPasswordError ? confirmPasswordError : ""}
      </p>)}

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
          style={{ whiteSpace: "nowrap" }}
        >
          <img src="/auth/Google.svg" alt="Google" style={{ height: "4vh" }} />
          Continue with Google
        </Button>
      </div>

    </form>
  );
}
