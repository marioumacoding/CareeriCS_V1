const GENERIC_GOOGLE_OAUTH_ERROR =
  "Google sign-in failed. Please try again.";

function getSupabaseGoogleCallbackUrl(): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  return supabaseUrl
    ? `${supabaseUrl}/auth/v1/callback`
    : "https://<project-ref>.supabase.co/auth/v1/callback";
}

export function formatGoogleOAuthErrorMessage(options: {
  error?: string | null;
  errorDescription?: string | null;
}): string {
  const error = options.error?.trim() ?? "";
  const errorDescription = options.errorDescription?.trim() ?? "";
  const normalizedError = error.toLowerCase();
  const normalizedDescription = errorDescription.toLowerCase();
  const supabaseCallbackUrl = getSupabaseGoogleCallbackUrl();

  if (
    normalizedError === "access_denied" &&
    (
      normalizedDescription.includes("has not completed the google verification process") ||
      normalizedDescription.includes("access blocked") ||
      normalizedDescription.includes("app has not completed the google verification process")
    )
  ) {
    return `Google blocked this sign-in because the OAuth app is not approved for your account yet. If the consent screen is still in Testing mode, add your Google account as a test user. Otherwise, publish and verify the app for the requested Drive scope. Expected Supabase callback URL: ${supabaseCallbackUrl}`;
  }

  if (normalizedDescription.includes("redirect_uri_mismatch")) {
    return `Google sign-in is misconfigured. Add this exact Supabase callback URL to the Google OAuth client redirect URIs: ${supabaseCallbackUrl}`;
  }

  if (normalizedError === "access_denied") {
    return "Google sign-in was denied. If this app is still in testing, make sure your Google account is added as a test user in Google Cloud Console.";
  }

  return errorDescription || error || GENERIC_GOOGLE_OAUTH_ERROR;
}
