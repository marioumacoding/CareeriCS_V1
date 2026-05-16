"use client";

const GOOGLE_DRIVE_TOKEN_STORAGE_KEY = "careerics:google-drive-direct-token";
const TOKEN_EXPIRY_SAFETY_MS = 60_000;

type StoredGoogleDriveToken = {
  accessToken: string;
  expiresAt: number;
};

function canUseSessionStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

function readStoredGoogleDriveToken(): StoredGoogleDriveToken | null {
  if (!canUseSessionStorage()) {
    return null;
  }

  const rawValue = window.sessionStorage.getItem(GOOGLE_DRIVE_TOKEN_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredGoogleDriveToken>;
    if (
      typeof parsed.accessToken !== "string" ||
      !parsed.accessToken ||
      typeof parsed.expiresAt !== "number"
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      expiresAt: parsed.expiresAt,
    };
  } catch {
    return null;
  }
}

export function getStoredGoogleDriveAccessToken(): string | null {
  const storedValue = readStoredGoogleDriveToken();
  if (!storedValue) {
    return null;
  }

  if (storedValue.expiresAt <= Date.now() + TOKEN_EXPIRY_SAFETY_MS) {
    clearStoredGoogleDriveAccessToken();
    return null;
  }

  return storedValue.accessToken;
}

export function persistGoogleDriveAccessToken(options: {
  accessToken: string;
  expiresInSeconds?: number;
}): void {
  if (!canUseSessionStorage()) {
    return;
  }

  const expiresInMs = Math.max(options.expiresInSeconds ?? 3600, 1) * 1000;
  window.sessionStorage.setItem(
    GOOGLE_DRIVE_TOKEN_STORAGE_KEY,
    JSON.stringify({
      accessToken: options.accessToken,
      expiresAt: Date.now() + expiresInMs,
    } satisfies StoredGoogleDriveToken),
  );
}

export function clearStoredGoogleDriveAccessToken(): void {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(GOOGLE_DRIVE_TOKEN_STORAGE_KEY);
}
