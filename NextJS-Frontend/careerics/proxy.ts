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
const PUBLIC_ROUTES = new Set([
  "/",
  "/auth/login",
  "/auth/register",
  "/auth/reset-password",
  "/auth/update-password",
  "/auth/callback",
  "/forgot-password",
]);
const AUTH_ROUTES = new Set(["/auth/login", "/auth/register"]);
const TOKEN_COOKIE = "careerics_token";
const SKIP_AUTH_LOCAL =
  process.env.NODE_ENV !== "production" && process.env.SKIP_AUTH_LOCAL === "true";

// ──────────────────────────────────────────────
// Proxy handler
// ──────────────────────────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  // Redirect unauthenticated users to login
  if (!SKIP_AUTH_LOCAL && !PUBLIC_ROUTES.has(pathname) && !pathname.startsWith("/api") && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect logged-in users away from login/register
  if (!SKIP_AUTH_LOCAL && AUTH_ROUTES.has(pathname) && token) {
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
  // Allow recording APIs used by the interview feature while keeping geolocation denied.
  response.headers.set("Permissions-Policy", "camera=(self), microphone=(self), geolocation=()");
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