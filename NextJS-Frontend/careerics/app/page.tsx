"use client";
import { useState } from "react";

export default function Home() {
  const [signHover, setSignHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [resetHover, setResetHover] = useState(false);
  const [registerHover, setRegisterHover] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "row",
        justifyContent: "start",
        alignItems: "center",
        backgroundColor: "var(--bg-color)",
        padding: "4rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blue Glow Effect */}
      <div
        style={{
          position: "absolute",
          right: "0",
          top: "0",
          width: "500px",
          height: "500px",
          backgroundColor: "var(--bg-effect-color)",
          borderRadius: "50%",
          filter: "blur(150px)",
          opacity: 0.4,
          zIndex: 0,
        }}
      />

      {/* Login Card */}
      <div
        style={{
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
            fontFamily: "var(--font-nova-square)",
            textAlign: "center",
            marginBottom: "2rem",
            color: "white",
          }}
        >
          Sign In
        </h2>

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={{ color: "white", fontSize: "1.5rem" }}>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            style={{
              width: "100%",
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
          <label style={{ color: "white", fontSize: "1.5rem" }}>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            style={{
              width: "100%",
              padding: "0.6rem",
              marginTop: "0.3rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "white",
            }}
          />
        </div>

        <p
          style={{
            fontSize: "0.8rem",
            color: "white",
            marginBottom: "1.5rem",
          }}
        >
          Forgot your password -{" "}
          <span
            style={{
              color: resetHover ? "#00cc66" : "white",
              cursor: "pointer",
              transition: "color 0.3s",
            }}
            onMouseEnter={() => setResetHover(true)}
            onMouseLeave={() => setResetHover(false)}
          >
            Reset Here
          </span>
        </p>

        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          {/* Sign In Button */}
          <button
            style={{
              fontSize: "1rem",
              flex: 1,
              padding: "0.7rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: signHover ? "#EEFFCB" : "var(--primary-green)",
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

          {/* Google Button */}
          <button
            style={{
              fontSize: "1rem",
              flex: 1.3,
              padding: "0.7rem",
              borderRadius: "8px",
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
            <img
              src="/google.png"
              alt="Google"
              style={{ height: "20px", width: "20px" }}
            />
            Sign in using Google
          </button>
        </div>

        {/* Optional — “or” text below */}
        <div
          style={{
            textAlign: "center",
            margin: "0.5rem 0",
            color: "var(--text-grey)",
          }}
        >
          — or —
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
          <span
            style={{
              color: registerHover ? "#00cc66" : "white",
              cursor: "pointer",
              transition: "color 0.3s",
            }}
            onMouseEnter={() => setRegisterHover(true)}
            onMouseLeave={() => setRegisterHover(false)}
          >
            Register Here
          </span>
        </p>
      </div>

      {/* Right Side Title + Robot */}
      <div
        style={{
          position: "absolute",
          top: "2rem",
          left: "67%",
          zIndex: 1,
        }}
      >
        <h1 style={{ fontSize: "4rem", color: "white" }}>
          Career<span style={{ fontWeight: "bold" }}>iCS</span>
        </h1>
      </div>

      <div
        style={{
          position: "absolute",
          right: "-3rem",
          bottom: "0",
          height: "100%",
          display: "flex",
          alignItems: "flex-end",
          zIndex: 1,
        }}
      >
        <img
          src="/Robot.png"
          alt="Robot"
          style={{
            height: "90vh",
            width: "auto",
            objectFit: "contain",
          }}
        />
      </div>
    </div>
  );
}