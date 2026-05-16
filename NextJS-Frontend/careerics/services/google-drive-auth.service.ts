"use client";

import { createClient } from "@supabase/supabase-js";
import {
  clearStoredGoogleDriveAccessToken,
  getStoredGoogleDriveAccessToken,
  persistGoogleDriveAccessToken,
} from "@/lib/auth/google-drive-token";
import {
  GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE,
  GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY,
  type GoogleDriveAuthResultMessage,
} from "@/lib/auth/google-drive-signin";

const GOOGLE_DRIVE_AUTH_TIMEOUT_MS = 120_000;
const GOOGLE_DRIVE_RESULT_POLL_MS = 400;
const GOOGLE_DRIVE_POPUP_NAME = "careerics-google-drive-auth";

const GOOGLE_DRIVE_AUTH_LOADING_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Opening Google sign-in...</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #0f172a;
        color: white;
        font-family: Arial, sans-serif;
      }

      main {
        width: min(420px, calc(100vw - 48px));
        padding: 28px 24px;
        border-radius: 18px;
        background: rgba(15, 23, 42, 0.88);
        border: 1px solid rgba(148, 163, 184, 0.18);
        text-align: center;
        box-shadow: 0 18px 44px rgba(15, 23, 42, 0.36);
      }

      .spinner {
        width: 40px;
        height: 40px;
        margin: 0 auto 18px;
        border: 4px solid rgba(255, 255, 255, 0.14);
        border-top-color: #bfff4f;
        border-radius: 999px;
        animation: spin 0.8s linear infinite;
      }

      h1 {
        margin: 0 0 10px;
        font-size: 21px;
      }

      p {
        margin: 0;
        line-height: 1.6;
        color: rgba(226, 232, 240, 0.88);
        font-size: 14px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="spinner" aria-hidden="true"></div>
      <h1>Opening Google sign-in...</h1>
      <p>Please wait while we request Google Drive access.</p>
    </main>
  </body>
</html>`;

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Google Drive is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to NextJS-Frontend/careerics/.env.local.",
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}

function createGoogleDrivePopupClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function buildGoogleDriveOAuthUrl(forceConsent = false): Promise<string> {
  const redirectTo = new URL(`${window.location.origin}/auth/callback`);
  redirectTo.searchParams.set("popup", "1");
  redirectTo.searchParams.set("driveAuth", "1");

  const popupClient = createGoogleDrivePopupClient();
  const { data, error } = await popupClient.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo.toString(),
      scopes: "openid email profile https://www.googleapis.com/auth/drive.file",
      queryParams: {
        access_type: "offline",
        include_granted_scopes: "true",
        prompt: forceConsent ? "consent" : "consent",
      },
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    throw error;
  }

  if (!data.url) {
    throw new Error("Google sign-in could not be started. Please try again.");
  }

  return data.url;
}

function readStoredDriveAuthResult(): GoogleDriveAuthResultMessage | null {
  try {
    const rawValue = window.localStorage.getItem(GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY);
    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<GoogleDriveAuthResultMessage>;
    if (
      parsed.type !== GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE ||
      typeof parsed.success !== "boolean" ||
      typeof parsed.timestamp !== "number"
    ) {
      return null;
    }

    return {
      type: GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE,
      success: parsed.success,
      error: typeof parsed.error === "string" ? parsed.error : undefined,
      accessToken: typeof parsed.accessToken === "string" ? parsed.accessToken : undefined,
      timestamp: parsed.timestamp,
    };
  } catch {
    return null;
  }
}

function clearStoredDriveAuthResult(): void {
  try {
    window.localStorage.removeItem(GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function openGoogleDriveAuthPopup(): Window | null {
  const popupWindow = window.open("", GOOGLE_DRIVE_POPUP_NAME, "width=520,height=720");
  if (!popupWindow) {
    return null;
  }

  try {
    popupWindow.document.open();
    popupWindow.document.write(GOOGLE_DRIVE_AUTH_LOADING_HTML);
    popupWindow.document.close();
  } catch {
    // Ignore document write failures and continue with popup navigation.
  }

  return popupWindow;
}

function waitForGoogleDrivePopupResult(
  popupWindow: Window | null,
): Promise<string> {
  return new Promise((resolve, reject) => {
    let finished = false;
    let timeoutId: number | null = null;
    let pollIntervalId: number | null = null;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);

      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }

      if (pollIntervalId !== null) {
        window.clearInterval(pollIntervalId);
      }

      clearStoredDriveAuthResult();
    };

    const finishError = (message: string) => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      reject(new Error(message));
    };

    const finishSuccess = (accessToken: string | undefined) => {
      if (finished) {
        return;
      }

      if (!accessToken) {
        finishError("Google Drive permission was granted, but no Drive token was returned. Please try again.");
        return;
      }

      finished = true;
      cleanup();
      persistGoogleDriveAccessToken({
        accessToken,
      });
      resolve(accessToken);
    };

    const handleAuthResult = (result: GoogleDriveAuthResultMessage | null) => {
      if (!result) {
        return;
      }

      if (result.success) {
        finishSuccess(result.accessToken);
        return;
      }

      finishError(result.error || "Google Drive permission was not granted.");
    };

    const handleMessage = (event: MessageEvent<GoogleDriveAuthResultMessage>) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data?.type !== GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE) {
        return;
      }

      handleAuthResult(event.data);
    };

    window.addEventListener("message", handleMessage);

    timeoutId = window.setTimeout(() => {
      finishError("Google Drive sign-in timed out. Please try again.");
    }, GOOGLE_DRIVE_AUTH_TIMEOUT_MS);

    pollIntervalId = window.setInterval(() => {
      handleAuthResult(readStoredDriveAuthResult());

      if (finished) {
        return;
      }

      if (popupWindow && popupWindow.closed) {
        finishError("Google Drive sign-in was closed before permission was granted.");
      }
    }, GOOGLE_DRIVE_RESULT_POLL_MS);
  });
}

export const googleDriveAuthService = {
  getStoredAccessToken(): string | null {
    return getStoredGoogleDriveAccessToken();
  },

  clearAccessToken(): void {
    clearStoredGoogleDriveAccessToken();
  },

  preload(): Promise<void> {
    return Promise.resolve();
  },

  async requestAccessToken(options?: { forceConsent?: boolean; popupWindow?: Window | null }): Promise<string> {
    const existingToken = getStoredGoogleDriveAccessToken();
    if (existingToken && !options?.forceConsent) {
      return existingToken;
    }

    clearStoredGoogleDriveAccessToken();
    clearStoredDriveAuthResult();

    const popupWindow =
      options?.popupWindow && !options.popupWindow.closed
        ? options.popupWindow
        : openGoogleDriveAuthPopup();
    if (!popupWindow) {
      throw new Error("Google sign-in popup was blocked. Allow popups for this site and click Save to Google Drive again.");
    }

    try {
      const oauthUrl = await buildGoogleDriveOAuthUrl(options?.forceConsent);
      popupWindow.location.replace(oauthUrl);
    } catch (error) {
      popupWindow.close();
      throw error;
    }

    const accessToken = await waitForGoogleDrivePopupResult(popupWindow);

    return accessToken;
  },
} as const;
