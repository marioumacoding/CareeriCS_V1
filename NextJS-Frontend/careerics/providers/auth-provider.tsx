/**
 * Client-side auth context and provider.
 *
 * Hydrates the in-memory token store from the initial server-rendered
 * session so client-side API calls work without additional round-trips.
 */

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { setClientToken } from "@/lib/auth/token";
import type { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Call after login to hydrate client state. */
  setSession: (user: User, token: string) => void;
  /** Call on logout — clears client state (server cookie cleared via server action). */
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
  /** Pre-fetched on the server and passed down to avoid a waterfall. */
  initialUser?: User | null;
  initialToken?: string | null;
}

export function AuthProvider({ children, initialUser = null, initialToken = null }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [isLoading, setIsLoading] = useState(false);

  // Hydrate client token store on mount
  useEffect(() => {
    if (initialToken) setClientToken(initialToken);
  }, [initialToken]);

  const setSession = useCallback((u: User, token: string) => {
    setUser(u);
    setClientToken(token);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setClientToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      setSession,
      clearSession,
    }),
    [user, isLoading, setSession, clearSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
