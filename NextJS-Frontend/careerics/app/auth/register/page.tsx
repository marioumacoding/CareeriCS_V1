"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authService } from "@/services/auth.service";

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
    <div style={{ position: "relative", minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
      {/* Back Arrow */}
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
        onSubmit={handleRegister}
        style={{
          marginLeft: "7rem",
          zIndex: 1,
          backgroundColor: "var(--form-grey)",
          padding: "2.5rem",
          borderRadius: "20px",
          width: "400px",
          backdropFilter: "blur(10px)",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            color: "white",
            fontSize: "1.6rem",
            letterSpacing: "1px",
          }}
        >
          Create An Account
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

        {/* Success banner */}
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
            {success}
          </div>
        )}

        {/* First Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reg-firstname" style={labelStyle}>First Name</label>
          <input
            id="reg-firstname"
            name="firstName"
            type="text"
            placeholder="Enter your first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Last Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reg-lastname" style={labelStyle}>Last Name</label>
          <input
            id="reg-lastname"
            name="lastName"
            type="text"
            placeholder="Enter your last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reg-email" style={labelStyle}>Email</label>
          <input
            id="reg-email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="reg-password" style={labelStyle}>Password</label>
          <input
            id="reg-password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label htmlFor="reg-confirm-password" style={labelStyle}>Confirm Password</label>
          <input
            id="reg-confirm-password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />
        </div>

        {/* Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
            fontFamily: "var(--font-nova-square)",
          }}
        >
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "40%",
              padding: 12,
              border: "none",
              borderRadius: 15,
              display: "inline-flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: registerHover
                ? "var(--hover-green)"
                : "var(--primary-green)",
              fontWeight: "bold",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background-color 0.3s, transform 0.2s",
              transform: registerHover ? "scale(1.05)" : "scale(1)",
            }}
            onMouseEnter={() => setRegisterHover(true)}
            onMouseLeave={() => setRegisterHover(false)}
          >
            {loading ? "Registering..." : "Register"}
          </button>

          <div
            style={{
              textAlign: "center",
              marginTop: "0.6rem",
              color: "var(--text-grey)",
            }}
          >
            or
          </div>

          <button
            type="button"
            onClick={handleGoogleRegister}
            style={{
              width: "60%",
              padding: 9,
              borderRadius: "15px",
              border: "none",
              backgroundColor: googleHover ? "#ACB2D2" : "white",
              cursor: "pointer",
              display: "inline-flex",
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
            Register using Google
          </button>
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid #777", margin: "1rem 0" }} />

        {/* Sign In Redirect */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.8rem",
            color: "var(--text-grey)",
            marginTop: "1rem",
          }}
        >
          Already have an account?{" "}
          <Link href="/auth/login" style={{ textDecoration: "none" }}>
            <span
              style={{
                color: signHoverText ? "#B8EF46" : "white",
                cursor: "pointer",
                transition: "color 0.3s",
              }}
              onMouseEnter={() => setSignHoverText(true)}
              onMouseLeave={() => setSignHoverText(false)}
            >
              Sign In Here
            </span>
          </Link>
        </p>
      </form>
    </div>
  );
}
