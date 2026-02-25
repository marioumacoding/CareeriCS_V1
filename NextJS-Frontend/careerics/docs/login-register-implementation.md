# Login & Register — File-by-File Implementation Guide

**Feature:** Authentication (Login + Register)  
**Author:** CareeriCS Frontend Team  
**Date:** February 25, 2026  
**Status:** Scaffolding complete — ready for implementation

---

## Overview

Login and Register let users authenticate against the .NET API. The flow uses **Server Actions** (not client-side fetch) so that tokens are set as HTTP-only cookies on the server — they never touch the browser's JavaScript runtime.

**What already exists (scaffolded):**

| File | Status |
|------|--------|
| `types/models.ts` — `User`, `AuthSession` | Done |
| `lib/validations/auth.ts` — `loginSchema`, `registerSchema` | Done |
| `services/auth.service.ts` — `authService.login()`, `.register()` | Done |
| `lib/auth/actions.ts` — `setAuthCookies()`, `logout()` | Done |
| `components/ui/button.tsx`, `input.tsx` | Done |
| `app/(auth)/layout.tsx` — centered card layout | Done |
| `app/(auth)/login/page.tsx` — placeholder shell | Done |
| `app/(auth)/register/page.tsx` — placeholder shell | Done |
| `proxy.ts` — redirects logged-in users away from `/login` | Done |

**What needs to be created:**

| File | Purpose |
|------|---------|
| `app/(auth)/login/actions.ts` | Server Action — validates, calls API, sets cookies |
| `components/features/auth/login-form.tsx` | Client component — form UI + calls server action |
| `app/(auth)/login/page.tsx` | Update — import and render `<LoginForm />` |
| `app/(auth)/register/actions.ts` | Server Action — validates, calls API, sets cookies |
| `components/features/auth/register-form.tsx` | Client component — form UI + calls server action |
| `app/(auth)/register/page.tsx` | Update — import and render `<RegisterForm />` |

---

## File 1 — `types/models.ts` (already exists, no changes)

This defines the data shape the .NET API returns after login/register.

```typescript
export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "user" | "guest";

export interface AuthSession {
  user: Pick<User, "id" | "email" | "displayName" | "role">;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix epoch seconds
}
```

**Why this shape:** `AuthSession` is what the .NET `/auth/login` endpoint returns. The `accessToken` gets stored in an HTTP-only cookie (never in localStorage). The `user` subset is the minimum needed for the UI (nav avatar, role-based rendering).

---

## File 2 — `lib/validations/auth.ts` (already exists, no changes)

Single source of truth for form validation. Used by **both** the client form (instant feedback) and the server action (security — never trust client-side validation alone).

```typescript
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  displayName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

**Why Zod:** It defines the schema once and derives the TypeScript type from it. The same `loginSchema` is called in the form component (for instant red underlines) and re-called in the server action (because a malicious user can bypass client JS). No duplication.

---

## File 3 — `services/auth.service.ts` (already exists, no changes)

The service layer talks to the .NET API. Components never call `dotnetApi` directly.

```typescript
import { dotnetApi } from "@/lib/api";
import type { ApiResponse, AuthSession, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export const authService = {
  login(payload: LoginPayload) {
    return dotnetApi.post<AuthSession>("/auth/login", payload, { noRetry: true });
  },

  register(payload: RegisterPayload) {
    return dotnetApi.post<AuthSession>("/auth/register", payload, { noRetry: true });
  },

  refreshToken(refreshToken: string) {
    return dotnetApi.post<AuthSession>("/auth/refresh", { refreshToken }, { noRetry: true });
  },

  me(): Promise<ApiResponse<User>> {
    return dotnetApi.get<User>("/auth/me");
  },
} as const;
```

**Why `noRetry: true`:** Login/register are mutations. If the network hiccups and the first request actually succeeded, retrying would either fail (duplicate email) or create confusion. Mutations should never auto-retry.

---

## File 4 — `lib/auth/actions.ts` (already exists, no changes)

Server-only utilities for setting/clearing auth cookies.

```typescript
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

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
  redirect("/login");
}
```

**Why HTTP-only cookies:** JavaScript cannot read HTTP-only cookies, so even if an XSS vulnerability exists, the attacker cannot steal the token. `secure: true` in production ensures the cookie only travels over HTTPS. `sameSite: "lax"` prevents CSRF on cross-origin POST requests.

---

## File 5 — `app/(auth)/login/actions.ts` (CREATE NEW)

This is the **Server Action** that the login form calls. It runs on the server, validates input, calls the .NET API, sets cookies, and redirects.

```typescript
"use server";

import { loginSchema } from "@/lib/validations/auth";
import { authService } from "@/services";
import { setAuthCookies } from "@/lib/auth";

export interface LoginActionState {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

export async function loginAction(
  _prevState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  // 1. Extract raw form values
  const raw = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  // 2. Server-side validation (never trust client)
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, errors: fieldErrors };
  }

  // 3. Call .NET API
  const result = await authService.login(parsed.data);

  if (!result.success) {
    return {
      success: false,
      message: result.message ?? "Invalid email or password.",
    };
  }

  // 4. Set HTTP-only cookies
  await setAuthCookies(result.data);

  // 5. Redirect to dashboard (or callbackUrl in the future)
  const { redirect } = await import("next/navigation");
  redirect("/dashboard");
}
```

**Why Server Actions instead of a client-side `fetch`:**
- The token goes straight into an HTTP-only cookie on the server — it never exists in client JS memory.
- No need to create a separate API route (`/api/auth/login`) just to proxy the call.
- `useActionState` in the form component gives built-in pending/error state management.

**Why the dynamic `import("next/navigation")`:** `redirect()` throws a special Next.js exception. Putting it at the end after `setAuthCookies` ensures cookies are set before the redirect fires. The dynamic import is just a style choice to make it clear that redirect is the final side-effect.

---

## File 6 — `components/features/auth/login-form.tsx` (CREATE NEW)

This is the **client component** that renders the form and calls the server action.

```tsx
"use client";

import { useActionState } from "react";
import { loginAction, type LoginActionState } from "@/app/(auth)/login/actions";
import { loginSchema } from "@/lib/validations/auth";
import { Button, Input } from "@/components/ui";
import Link from "next/link";
import { useState } from "react";

const initialState: LoginActionState = { success: false };

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    const result = loginSchema.shape[name as keyof typeof loginSchema.shape]?.safeParse(value);
    if (result && !result.success) {
      setClientErrors((prev) => ({ ...prev, [name]: result.error.issues[0].message }));
    } else {
      setClientErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  }

  // Merge client-side and server-side errors (server wins)
  const errors = { ...clientErrors, ...state.errors };

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
      {state.message && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {state.message}
        </div>
      )}

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email}
        onBlur={handleBlur}
        required
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="current-password"
        error={errors.password}
        onBlur={handleBlur}
        required
      />

      <Button type="submit" isLoading={isPending} className="mt-2 w-full">
        Sign in
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
          Create one
        </Link>
      </p>
    </form>
  );
}
```

**Why `"use client"`:** Forms need interactivity — `useActionState` tracks pending state, `onBlur` gives instant validation feedback. This is the only place where client JS runs.

**Why `useActionState` (not `useState` + `fetch`):** It's the React 19 pattern for calling server actions from forms. It gives you `isPending` for the loading spinner, accumulates server-returned errors, and works with progressive enhancement (the form works even if JS hasn't loaded yet).

**Why `onBlur` validation:** Validating on blur (not on every keystroke) gives immediate feedback without annoying the user mid-typing. The `loginSchema.shape[name]` call validates only the single field that lost focus.

---

## File 7 — `app/(auth)/login/page.tsx` (UPDATE EXISTING)

Replace the placeholder with the real form component.

```tsx
import { LoginForm } from "@/components/features/auth/login-form";

export const metadata = {
  title: "Login | CareeriCS",
};

export default function LoginPage() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Sign in</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Enter your credentials to access your account.
      </p>
      <LoginForm />
    </div>
  );
}
```

**Why the page is a Server Component but the form is a Client Component:** The page itself has no interactivity — it just renders static HTML (the card shell, the heading). Only `<LoginForm />` needs client JS. This keeps the JS bundle minimal.

---

## File 8 — `app/(auth)/register/actions.ts` (CREATE NEW)

Same pattern as login, but validates with `registerSchema` and calls `authService.register()`.

```typescript
"use server";

import { registerSchema } from "@/lib/validations/auth";
import { authService } from "@/services";
import { setAuthCookies } from "@/lib/auth";

export interface RegisterActionState {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

export async function registerAction(
  _prevState: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  // 1. Extract raw form values
  const raw = {
    email: formData.get("email") as string,
    displayName: formData.get("displayName") as string,
    password: formData.get("password") as string,
    confirmPassword: formData.get("confirmPassword") as string,
  };

  // 2. Server-side validation
  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { success: false, errors: fieldErrors };
  }

  // 3. Call .NET API (don't send confirmPassword to the backend)
  const { confirmPassword: _, ...payload } = parsed.data;
  const result = await authService.register(payload);

  if (!result.success) {
    // Handle specific error: email already taken
    if (result.errors?.some((e) => e.code === "DUPLICATE_EMAIL")) {
      return {
        success: false,
        errors: { email: "This email is already registered." },
      };
    }
    return {
      success: false,
      message: result.message ?? "Registration failed. Please try again.",
    };
  }

  // 4. Set HTTP-only cookies (user is now logged in)
  await setAuthCookies(result.data);

  // 5. Redirect to dashboard
  const { redirect } = await import("next/navigation");
  redirect("/dashboard");
}
```

**Why `confirmPassword` is stripped:** The backend doesn't need it. Confirmation matching is a frontend-only validation concern handled by the Zod `.refine()` in `registerSchema`.

**Why specific error handling for `DUPLICATE_EMAIL`:** This maps the backend error code to a field-level error on the email input, so the user sees "This email is already registered" right under the email field, not in a generic banner.

---

## File 9 — `components/features/auth/register-form.tsx` (CREATE NEW)

```tsx
"use client";

import { useActionState } from "react";
import { registerAction, type RegisterActionState } from "@/app/(auth)/register/actions";
import { Button, Input } from "@/components/ui";
import Link from "next/link";

const initialState: RegisterActionState = { success: false };

export function RegisterForm() {
  const [state, formAction, isPending] = useActionState(registerAction, initialState);
  const errors = state.errors ?? {};

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
      {state.message && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
          {state.message}
        </div>
      )}

      <Input
        name="displayName"
        type="text"
        label="Full name"
        placeholder="Ahmed Khan"
        autoComplete="name"
        error={errors.displayName}
        required
      />

      <Input
        name="email"
        type="email"
        label="Email"
        placeholder="you@example.com"
        autoComplete="email"
        error={errors.email}
        required
      />

      <Input
        name="password"
        type="password"
        label="Password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.password}
        required
      />

      <Input
        name="confirmPassword"
        type="password"
        label="Confirm password"
        placeholder="••••••••"
        autoComplete="new-password"
        error={errors.confirmPassword}
        required
      />

      <Button type="submit" isLoading={isPending} className="mt-2 w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-zinc-900 dark:text-zinc-50 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
```

**Why no `onBlur` validation here (unlike LoginForm):** For the register form, the password rules (uppercase, number) and the `confirmPassword` match are cross-field validations handled by Zod's `.refine()`. Validating a single field on blur doesn't catch "passwords don't match". Server-side validation catches everything on submit. You can add per-field `onBlur` later if the UX needs it.

---

## File 10 — `app/(auth)/register/page.tsx` (UPDATE EXISTING)

```tsx
import { RegisterForm } from "@/components/features/auth/register-form";

export const metadata = {
  title: "Register | CareeriCS",
};

export default function RegisterPage() {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Create account</h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Get started with CareeriCS.
      </p>
      <RegisterForm />
    </div>
  );
}
```

---

## File 11 — `app/(auth)/layout.tsx` (already exists, no changes)

Both login and register pages are wrapped by this layout. It centers the card vertically and horizontally with no navbar — keeping the auth UI clean and distraction-free.

```tsx
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
```

**Why a route group `(auth)`:** The parentheses in `(auth)` mean the folder name doesn't appear in the URL. Users visit `/login`, not `/(auth)/login`. The group exists purely to share this layout across login, register, and forgot-password.

---

## File 12 — `proxy.ts` (already exists, no changes needed)

The edge proxy handles two auth-related redirects automatically:

```typescript
// User visits /dashboard without a token → redirected to /login
if (!PUBLIC_ROUTES.has(pathname) && !pathname.startsWith("/api") && !token) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

// User visits /login WITH a token → redirected to /dashboard
if (AUTH_ROUTES.has(pathname) && token) {
  const dashUrl = request.nextUrl.clone();
  dashUrl.pathname = "/dashboard";
  return NextResponse.redirect(dashUrl);
}
```

**Why this matters for login/register:** After `loginAction` sets the cookie and redirects to `/dashboard`, any subsequent visit to `/login` will hit the proxy first. The proxy sees the cookie and redirects to `/dashboard` — the user can never "go back" to the login page while logged in.

---

## API Contract (for the .NET backend team)

The .NET API must provide these two endpoints:

### POST /api/auth/login

```
Request:
  Content-Type: application/json
  Body: { "email": "user@example.com", "password": "Secret123" }

Success Response (200):
  {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "displayName": "Ahmed Khan",
      "role": "user"
    },
    "accessToken": "eyJhbG...",
    "refreshToken": "dGhpcyBpcyBh...",
    "expiresAt": 1740600000
  }

Error Response (401):
  {
    "success": false,
    "message": "Invalid email or password.",
    "errors": [{ "code": "INVALID_CREDENTIALS", "message": "Invalid email or password." }]
  }
```

### POST /api/auth/register

```
Request:
  Content-Type: application/json
  Body: { "email": "user@example.com", "password": "Secret123", "displayName": "Ahmed Khan" }

Success Response (201):
  Same shape as login success — the user is immediately authenticated.

Error Response (409):
  {
    "success": false,
    "message": "Email already registered.",
    "errors": [{ "code": "DUPLICATE_EMAIL", "message": "Email already registered." }]
  }
```

---

## How to Test Locally Without the .NET Backend

Create a mock route handler so the frontend works independently:

**File:** `app/api/mock/auth/login/route.ts`

```typescript
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  // Simulate validation
  if (body.email !== "test@test.com" || body.password !== "Password1") {
    return NextResponse.json(
      { success: false, message: "Invalid email or password." },
      { status: 401 },
    );
  }

  return NextResponse.json({
    user: { id: "1", email: body.email, displayName: "Test User", role: "user" },
    accessToken: "mock-jwt-token",
    refreshToken: "mock-refresh-token",
    expiresAt: Math.floor(Date.now() / 1000) + 3600,
  });
}
```

Then point `.env.local` to the mock:

```
NEXT_PUBLIC_DOTNET_API_URL=http://localhost:3000/api/mock
```

Test credentials: `test@test.com` / `Password1`

---

## Checklist

- [ ] Create `app/(auth)/login/actions.ts` — login server action
- [ ] Create `components/features/auth/login-form.tsx` — login form component
- [ ] Update `app/(auth)/login/page.tsx` — render `<LoginForm />`
- [ ] Create `app/(auth)/register/actions.ts` — register server action
- [ ] Create `components/features/auth/register-form.tsx` — register form component
- [ ] Update `app/(auth)/register/page.tsx` — render `<RegisterForm />`
- [ ] Create `app/api/mock/auth/login/route.ts` — mock for local dev
- [ ] Create `app/api/mock/auth/register/route.ts` — mock for local dev
- [ ] Share API contract with .NET team
- [ ] Run `npx next build` — verify zero errors
