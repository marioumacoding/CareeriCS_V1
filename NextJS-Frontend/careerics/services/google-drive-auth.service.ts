"use client";

import {
  clearStoredGoogleDriveAccessToken,
  getStoredGoogleDriveAccessToken,
  persistGoogleDriveAccessToken,
} from "@/lib/auth/google-drive-token";

const GOOGLE_IDENTITY_SCRIPT_SRC = "https://accounts.google.com/gsi/client";
const GOOGLE_DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

type GoogleTokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type GoogleIdentityServices = {
  accounts?: {
    oauth2?: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        prompt?: string;
        callback: (response: GoogleTokenResponse) => void;
      }) => GoogleTokenClient;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentityServices;
  }
}

let googleIdentityScriptPromise: Promise<void> | null = null;

function getGoogleClientId(): string {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!clientId) {
    const isLocalhost =
      typeof window !== "undefined" &&
      (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const setupHint = isLocalhost
      ? "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to NextJS-Frontend/careerics/.env.local and authorize http://localhost:3000 in Google Cloud."
      : "Add NEXT_PUBLIC_GOOGLE_CLIENT_ID in Vercel and authorize this site in Google Cloud.";

    throw new Error(
      `Google Drive is not configured yet. ${setupHint}`,
    );
  }

  return clientId;
}

function loadGoogleIdentityScript(): Promise<void> {
  if (window.google?.accounts?.oauth2) {
    return Promise.resolve();
  }

  if (googleIdentityScriptPromise) {
    return googleIdentityScriptPromise;
  }

  googleIdentityScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${GOOGLE_IDENTITY_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Google sign-in could not load.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = GOOGLE_IDENTITY_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google sign-in could not load."));
    document.head.appendChild(script);
  });

  return googleIdentityScriptPromise;
}

function formatGoogleTokenError(response: GoogleTokenResponse): string {
  if (response.error === "popup_closed") {
    return "Google Drive sign-in was closed before permission was granted.";
  }

  return response.error_description || response.error || "Google Drive permission was not granted.";
}

export const googleDriveAuthService = {
  getStoredAccessToken(): string | null {
    return getStoredGoogleDriveAccessToken();
  },

  clearAccessToken(): void {
    clearStoredGoogleDriveAccessToken();
  },

  async requestAccessToken(options?: { forceConsent?: boolean }): Promise<string> {
    const existingToken = getStoredGoogleDriveAccessToken();
    if (existingToken && !options?.forceConsent) {
      return existingToken;
    }

    clearStoredGoogleDriveAccessToken();
    const clientId = getGoogleClientId();
    await loadGoogleIdentityScript();

    if (!window.google?.accounts?.oauth2) {
      throw new Error("Google sign-in is not available. Please try again.");
    }

    return new Promise((resolve, reject) => {
      const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: clientId,
        scope: GOOGLE_DRIVE_FILE_SCOPE,
        prompt: options?.forceConsent ? "consent" : "",
        callback: (response) => {
          if (!response.access_token) {
            reject(new Error(formatGoogleTokenError(response)));
            return;
          }

          persistGoogleDriveAccessToken({
            accessToken: response.access_token,
            expiresInSeconds: response.expires_in,
          });
          resolve(response.access_token);
        },
      });

      tokenClient?.requestAccessToken({
        prompt: options?.forceConsent ? "consent" : "",
      });
    });
  },
} as const;
