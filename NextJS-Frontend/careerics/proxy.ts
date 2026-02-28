/**
 * Next.js 16 Proxy (formerly Middleware)
 *
 * Runs on every matched request BEFORE the page/route handler.
 * Responsibilities:
 *   1. Auth gate — redirect unauthenticated users away from protected routes.
 *   2. Security headers — CSP, HSTS, etc.
 */

import { NextResponse, type NextRequest } from "next/server";

// ──────────────────────────────────────────────
// Route definitions
// ──────────────────────────────────────────────
const PUBLIC_ROUTES = new Set(["/", "/auth/login", "/auth/register", "/forgot-password"]);
const AUTH_ROUTES = new Set(["/auth/login", "/auth/register"]);
const TOKEN_COOKIE = "careerics_token";

// ──────────────────────────────────────────────
// Proxy handler
// ──────────────────────────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  // Redirect unauthenticated users to login
  if (!PUBLIC_ROUTES.has(pathname) && !pathname.startsWith("/api") && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login/register
  if (AUTH_ROUTES.has(pathname) && token) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  // Continue request
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  return response;
}

// Run on app routes
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};