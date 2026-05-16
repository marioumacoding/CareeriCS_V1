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
        width: "100%",
        textAlign: "left",
        display:"flex",
        flexDirection:"column",
        gap:"var(--space-xxs)",
        ...(isMargin && {
          marginBottom: "var(--space-md)",
        }),
      }}
    >
      <label
        htmlFor={id}
        style={{
          fontFamily: "var(--font-nova-square)",
          display: "block",
          fontSize: "var(--text-base)",
          color: "white",
        }}
      >
        {label}
      </label>

      <input
        id={id}
        {...inputProps}
        style={{
          width: "100%",
          fontFamily: "var(--font-nova-square)",
          padding: "var(--space-sm)",
          borderRadius: "var(--radius-md)",
          border: "none",
          backgroundColor: "white",
          display: "block",
          fontSize: "var(--text-sm)",
          boxSizing: "border-box",
          outline: "none",
          ...style,
        }}
      />
    </div>
  );
}