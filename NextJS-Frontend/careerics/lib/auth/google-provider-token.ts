"use client";

const GOOGLE_PROVIDER_TOKEN_STORAGE_KEY = "careerics:google-provider-token";

type StoredGoogleProviderToken = {
  accessToken: string;
  refreshToken?: string | null;
  userId: string;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredGoogleProviderToken(): StoredGoogleProviderToken | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawValue = window.localStorage.getItem(GOOGLE_PROVIDER_TOKEN_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<StoredGoogleProviderToken>;
    if (
      typeof parsed.accessToken !== "string" ||
      !parsed.accessToken ||
      typeof parsed.userId !== "string" ||
      !parsed.userId
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken:
        typeof parsed.refreshToken === "string" && parsed.refreshToken
          ? parsed.refreshToken
          : null,
      userId: parsed.userId,
    };
  } catch {
    return null;
  }
}

export function persistGoogleProviderToken(options: {
  accessToken: string;
  refreshToken?: string | null;
  userId: string;
}): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    GOOGLE_PROVIDER_TOKEN_STORAGE_KEY,
    JSON.stringify({
      accessToken: options.accessToken,
      refreshToken: options.refreshToken ?? null,
      userId: options.userId,
    } satisfies StoredGoogleProviderToken),
  );
}

export function getStoredGoogleProviderAccessToken(userId: string): string | null {
  const storedValue = readStoredGoogleProviderToken();
  if (!storedValue || storedValue.userId !== userId) {
    return null;
  }

  return storedValue.accessToken;
}

export function clearGoogleProviderToken(userId?: string | null): void {
  if (!canUseStorage()) {
    return;
  }

  if (!userId) {
    window.localStorage.removeItem(GOOGLE_PROVIDER_TOKEN_STORAGE_KEY);
    return;
  }

  const storedValue = readStoredGoogleProviderToken();
  if (storedValue?.userId === userId) {
    window.localStorage.removeItem(GOOGLE_PROVIDER_TOKEN_STORAGE_KEY);
  }
}
