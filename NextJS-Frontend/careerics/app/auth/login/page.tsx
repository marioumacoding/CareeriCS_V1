"use client";
import { useState } from "react";
import Link from "next/link";
export default function Home() {
  const [signHover, setSignHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [resetHover, setResetHover] = useState(false);
  const [registerHover, setRegisterHover] = useState(false);

  return (
    <div
      style={{
        marginBottom: "4rem",
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
        }}
      >
        Sign In
      </h2>

      {/* Email */}
      <div style={{ marginBottom: "1rem" }}>
        <label style={{ color: "white", fontSize: "1rem" }}>Email</label>
        <input
          type="email"
          placeholder="Enter your email"
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
        <label style={{ color: "white", fontSize: "1rem" }}>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
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
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <button
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
            cursor: "pointer",
            transition: "background-color 0.3s, transform 0.2s",
            transform: signHover ? "scale(1.05)" : "scale(1)",
          }}
          onMouseEnter={() => setSignHover(true)}
          onMouseLeave={() => setSignHover(false)}
        >
          Sign In
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
        Don’t have an account yet?{" "}
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
    </div>
  );
}