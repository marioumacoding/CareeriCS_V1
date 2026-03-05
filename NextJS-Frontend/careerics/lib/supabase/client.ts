/**
 * Supabase browser client — singleton for client components.
 *
 * Uses NEXT_PUBLIC_ env vars so the values are available in the
 * client bundle. The anon key is safe to expose — Supabase RLS
 * (Row Level Security) protects data server-side.
 *
 * Supabase stores session tokens (access_token + refresh_token)
 * in localStorage automatically. The `onAuthStateChange` listener
 * in the AuthProvider keeps the React state in sync.
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
      "Add them to .env.local (see README)."
  );
}

/**
 * Single Supabase client instance shared across all client components.
 * Never create more than one — Supabase manages its own session lifecycle.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage (default) so tokens survive page reloads
    persistSession: true,
    // Automatically refresh the JWT before it expires
    autoRefreshToken: true,
    // Listen for auth changes across browser tabs
    detectSessionInUrl: true,
  },
});
