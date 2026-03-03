"use client";

import { useState } from "react";
import Link from "next/link";

export default function Register() {
  const [registerHover, setRegisterHover] = useState(false);
  const [googleHover, setGoogleHover] = useState(false);
  const [signHoverText, setSignHoverText] = useState(false); 

  const inputStyle = {
    width: "100%",
    padding: "0.6rem",
    marginTop: "0.3rem",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#EDEDED",
  };

  const labelStyle = {
    color: "white",
    fontSize: "0.9rem",
  };

  return (
   
  <div
    style={{
        marginLeft: "7rem",
        zIndex: 1,
        backgroundColor: "var(--form-grey)",
        padding: "2.5rem",
        borderRadius: "20px",
        width: "400px",
        height: "500px",
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

        {/* First Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>First Name</label>
          <input type="text" placeholder="Enter your first name" style={{
            width: "95%",
            fontFamily: "var(--font-nova-square)",
            padding: "0.6rem",
            marginTop: "0.3rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "white",
          }} />
        </div>

        {/* Last Name */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Last Name</label>
          <input type="text" placeholder="Enter your last name" style={{
            width: "95%",
            fontFamily: "var(--font-nova-square)",
            padding: "0.6rem",
            marginTop: "0.3rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "white",
          }} />
        </div>

        {/* Email */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Email</label>
          <input type="email" placeholder="Enter your email" style={{
            width: "95%",
            fontFamily: "var(--font-nova-square)",
            padding: "0.6rem",
            marginTop: "0.3rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "white",
          }} />
        </div>

        {/* Password */}
        <div style={{ marginBottom: "1rem" }}>
          <label style={labelStyle}>Password</label>
          <input type="password" placeholder="Enter your password" style={{
            width: "95%",
            fontFamily: "var(--font-nova-square)",
            padding: "0.6rem",
            marginTop: "0.3rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "white",
          }} />
        </div>

        {/* Confirm Password */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={labelStyle}>Confirm Password</label>
          <input type="password" placeholder="Confirm your password" style={{
            width: "95%",
            fontFamily: "var(--font-nova-square)",
            padding: "0.6rem",
            marginTop: "0.3rem",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "white",
          }} />
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
    style={{
      width: "40%",
      height: "100%",
      padding: 12,
      border: "none",
      overflow: "hidden",
      borderRadius: 15,
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      display: "inline-flex",
      backgroundColor: registerHover
        ? "var(--hover-green)"
        : "var(--primary-green)",
      fontWeight: "bold",
      cursor: "pointer",
      transition: "background-color 0.3s, transform 0.2s",
      transform: registerHover ? "scale(1.05)" : "scale(1)",
    }}
    onMouseEnter={() => setRegisterHover(true)}
    onMouseLeave={() => setRegisterHover(false)}
  >
    Register
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
          style={{
           width: "60%",
           height: "100%",
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
        <div  
          style={{
            borderTop: "1px solid #777",
            margin: "1rem 0",
          }}
        />

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
          <Link href="/auth/signin" style={{ textDecoration: "none" }}>
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
      </div>
  );
}