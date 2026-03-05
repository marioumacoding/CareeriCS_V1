/**
 * Global providers wrapper.
 *
 * Add any client-side context providers here (theme, auth, toast, etc.).
 * This component is rendered once in the root layout.
 *
 * AuthProvider now reads the Supabase session internally via
 * onAuthStateChange — no initial props required from the server.
 */

"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {/* Add more providers here (ThemeProvider, ToastProvider, etc.) */}
      {children}
    </AuthProvider>
  );
}
