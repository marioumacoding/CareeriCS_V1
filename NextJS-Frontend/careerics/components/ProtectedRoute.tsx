"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";

/**
 * Reusable protected route wrapper.
 *
 * Wrap any page content with <ProtectedRoute> to redirect
 * unauthenticated users to /auth/login.
 *
 * Usage:
 *   <ProtectedRoute>
 *     <MyDashboardContent />
 *   </ProtectedRoute>
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect after the initial Supabase session check is fully complete
    if (!isLoading && !isAuthenticated) {
      console.log("[ProtectedRoute] not authenticated — redirecting to login");
      router.replace("/auth/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Show nothing while checking auth state (prevents flash of content)
  if (isLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "var(--bg-color)",
          color: "white",
          fontFamily: "var(--font-nova-square)",
        }}
      >
        Loading...
      </div>
    );
  }

  // Not authenticated — useEffect will redirect
  if (!isAuthenticated) return null;

  return <>{children}</>;
}
