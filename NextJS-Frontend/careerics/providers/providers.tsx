/**
 * Global providers wrapper.
 *
 * Add any client-side context providers here (theme, auth, toast, etc.).
 * This component is rendered once in the root layout.
 */

"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";
import type { User } from "@/types";

interface ProvidersProps {
  children: ReactNode;
  initialUser?: User | null;
  initialToken?: string | null;
}

export function Providers({ children, initialUser, initialToken }: ProvidersProps) {
  return (
    <AuthProvider initialUser={initialUser} initialToken={initialToken}>
      {/* Add more providers here (ThemeProvider, ToastProvider, etc.) */}
      {children}
    </AuthProvider>
  );
}
