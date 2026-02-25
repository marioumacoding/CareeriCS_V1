/**
 * Server-only auth actions (login, logout, refresh).
 *
 * These are called from Server Actions or Route Handlers and set
 * HTTP-only, Secure, SameSite cookies.
 */

"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_COOKIE, REFRESH_COOKIE } from "./token";
import type { AuthSession } from "@/types";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/**
 * Persist tokens in HTTP-only cookies after successful authentication.
 */
export async function setAuthCookies(session: AuthSession) {
  const cookieStore = await cookies();
  const maxAge = session.expiresAt - Math.floor(Date.now() / 1000);

  cookieStore.set(TOKEN_COOKIE, session.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: Math.max(maxAge, 0),
  });

  if (session.refreshToken) {
    cookieStore.set(REFRESH_COOKIE, session.refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
}

/**
 * Clear auth cookies and redirect to /login.
 */
export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  redirect("/login");
}
