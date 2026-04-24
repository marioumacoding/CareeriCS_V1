/**
 * Auth service — wraps Supabase Auth SDK calls.
 *
 * Supabase handles sign-up, login, logout, password reset, and
 * email verification entirely client-side. After auth, the JWT
 * (access_token) is sent to the .NET API as a Bearer token.
 *
 * The `me()` call still hits the .NET backend to sync the user
 * profile (the backend creates the profile row if missing).
 */

import { supabase } from "@/lib/supabase";
import { dotnetApi } from "@/lib/api";
import type { ApiResponse, User } from "@/types";

// ── Payload types ───────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

function buildSafeUsername(email: string): string {
  const localPart = (email.split("@")[0] || "").trim().toLowerCase();
  const sanitizedBase = localPart
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
  const base = sanitizedBase.slice(0, 20) || "user";
  const suffix = Math.random().toString(36).slice(2, 8);

  return `${base}_${suffix}`;
}

function getSafeInternalCallbackPath(callbackUrl?: string): string | null {
  if (!callbackUrl) return null;
  return callbackUrl.startsWith("/") ? callbackUrl : null;
}

// ── Service ─────────────────────────────────────────────────────
export const authService = {
  /**
   * Sign up a new user with Supabase.
   * Supabase will send a confirmation email automatically if
   * "Confirm email" is enabled in your Supabase dashboard.
   */
  async signUp({ email, password, displayName }: RegisterPayload) {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedDisplayName = displayName.trim();
    const fallbackName = normalizedEmail.split("@")[0] || "User";
    const username = buildSafeUsername(normalizedEmail);

    const { data, error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        // Store extra profile info in Supabase user_metadata
        data: {
          display_name: normalizedDisplayName || fallbackName,
          full_name: normalizedDisplayName || fallbackName,
          username,
        },
      },
    });

    if (error) {
      if (error.message === "Database error saving new user") {
        throw new Error(
          "We could not create your profile details yet. Please retry, and if it still fails try a different email."
        );
      }

      throw error;
    }

    return data;
  },

  /**
   * Sign in an existing user with email + password.
   * On success Supabase stores the session (access_token + refresh_token)
   * in localStorage automatically.
   */
  async signIn({ email, password }: LoginPayload) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;                     // { user, session }
  },

  /**
   * Sign out the current user — clears the Supabase session
   * from localStorage and invalidates the refresh token.
   */
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Send a password-reset email. The user clicks the link
   * which redirects to a page where they set a new password.
   */
  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Where Supabase redirects after the user clicks the email link
      redirectTo: `${window.location.origin}/auth/update-password`,
    });
    if (error) throw error;
  },

  /**
   * After the user lands on the reset-password callback page,
   * call this to actually update the password.
   */
  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
  },

  /**
   * Sign in with Google OAuth via Supabase.
   * Redirects the browser to Google's consent screen.
   */
  async signInWithGoogle(callbackUrl?: string) {
    const callbackPath = getSafeInternalCallbackPath(callbackUrl);
    const redirectUrl = new URL(`${window.location.origin}/auth/callback`);

    if (callbackPath) {
      redirectUrl.searchParams.set("callbackUrl", callbackPath);
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl.toString(),
      },
    });
    if (error) throw error;
  },

  /**
   * Call the .NET API's /api/users/me endpoint.
   * The backend validates the Supabase JWT, creates the user
   * profile in the DB if it doesn't exist, and returns it.
   */
  me(): Promise<ApiResponse<User>> {
    return dotnetApi.get<User>("/users/me");
  },
} as const;
