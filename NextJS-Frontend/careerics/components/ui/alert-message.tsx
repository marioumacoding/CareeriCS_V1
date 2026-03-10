"use client";

interface AlertProps {
  message?: string | null; 
  type?: "error" | "success";
}

export default function Alert({ message, type = "error" }: AlertProps) {
  if (!message) return null;

  const colors = {
    error: { bg: "#ff4d4f22", border: "#ff4d4f", text: "#ff4d4f" },
    success: { bg: "#52c41a22", border: "#52c41a", text: "#52c41a" },
  };

  const style = {
    backgroundColor: colors[type].bg,
    border: `1px solid ${colors[type].border}`,
    borderRadius: "8px",
    padding: "1vh",
    marginBottom: "2vh",
    marginLeft: "5vh",
    marginRight: "5vh",
    color: colors[type].text,
    fontSize: "2vh",
  };

  return <div style={style}>{message}</div>;
}