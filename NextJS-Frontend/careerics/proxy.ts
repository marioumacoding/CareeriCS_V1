/**
 * Next.js 16 Proxy (formerly Middleware)
 *
 * Runs on every matched request BEFORE the page/route handler.
 * Responsibilities:
 *   1. Auth gate — redirect unauthenticated users away from protected routes.
 *   2. Security headers — CSP, HSTS, etc.
 *   3. Rate-limit header forwarding (actual rate-limiting lives on the API).
 */

import { NextResponse, type NextRequest } from "next/server";

// ──────────────────────────────────────────────
// Route definitions
// ──────────────────────────────────────────────
const PUBLIC_ROUTES = new Set(["/", "/login", "/register", "/forgot-password"]);
const AUTH_ROUTES = new Set(["/login", "/register"]); // redirect logged-in users away
const TOKEN_COOKIE = "careerics_token";

// ──────────────────────────────────────────────
// Proxy handler
// ──────────────────────────────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  // 1. Auth gate — protected route without token → /login
  if (!PUBLIC_ROUTES.has(pathname) && !pathname.startsWith("/api") && !token) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. Already logged-in user hitting /login or /register → /dashboard
  if (AUTH_ROUTES.has(pathname) && token) {
    const dashUrl = request.nextUrl.clone();
    dashUrl.pathname = "/dashboard";
    return NextResponse.redirect(dashUrl);
  }

  // 3. Security headers
  const response = NextResponse.next();

  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload",
  );

  return response;
}

// Only run on app routes (skip static assets, _next, etc.)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
