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

// ── Service ─────────────────────────────────────────────────────
export const authService = {
  /**
   * Sign up a new user with Supabase.
   * Supabase will send a confirmation email automatically if
   * "Confirm email" is enabled in your Supabase dashboard.
   */
  async signUp({ email, password, displayName }: RegisterPayload) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Store extra profile info in Supabase user_metadata
        data: { display_name: displayName },
      },
    });
    if (error) throw error;
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
  async signInWithGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
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
