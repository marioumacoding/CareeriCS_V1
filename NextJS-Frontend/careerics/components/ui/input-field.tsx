"use client";

import { InputHTMLAttributes } from "react";

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
  isMargin?: boolean;
}

export default function InputField({
  label,
  id,
  isMargin = true,
  style,
  ...inputProps
}: InputFieldProps) {
  return (
    <div
      style={{
        ...(isMargin && { marginBottom: "2vh" }),
        marginLeft: "5vh",
        marginRight: "5vh",
      }}
    >
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-nova-square)",
          display: "block",
          fontSize: "2.5vh",
          color: "white",
          marginBottom: "1vh",
          textAlign: "left",
        }}
      >
        {label}
      </label>

      <input
        id={id}
        {...inputProps}
        style={{
          width: "24vw",
          fontFamily: "var(--font-nova-square)",
          padding: "1.5vh",
          borderRadius: "1.2vh",
          border: "none",
          backgroundColor: "white",
          display: "block",
          fontSize: "2vh",
          ...style,
        }}
      />
    </div>
  );
}