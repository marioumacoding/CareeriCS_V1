export const GOOGLE_DRIVE_AUTH_INTENT = "google-drive";
export const GOOGLE_DRIVE_AUTH_CALLBACK_QUERY_PARAM = "driveAuth";
export const GOOGLE_DRIVE_AUTH_POPUP_QUERY_PARAM = "popup";
export const GOOGLE_DRIVE_AUTH_AUTO_QUERY_PARAM = "autoGoogle";
export const GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE = "careerics:google-drive-auth-completed";
export const GOOGLE_DRIVE_AUTH_PENDING_STORAGE_KEY = "careerics:google-drive-auth-pending";
export const GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY = "careerics:google-drive-auth-result";

export type GoogleDriveAuthPendingState = {
  startedAt: number;
  previousAccessToken?: string | null;
};

export type GoogleDriveAuthResultMessage = {
  type: typeof GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE;
  success: boolean;
  error?: string;
  accessToken?: string;
  timestamp: number;
};

export function isGoogleDriveAuthCallback(value?: string | null): boolean {
  return value === "1";
}

export function isGoogleDrivePopupAuth(value?: string | null): boolean {
  return value === "1";
}

export function isGoogleDriveIntent(value?: string | null): boolean {
  return value === GOOGLE_DRIVE_AUTH_INTENT;
}

export function buildGoogleDriveLoginHref(callbackPath: string): string {
  const params = new URLSearchParams();
  params.set("callbackUrl", callbackPath);
  params.set("intent", GOOGLE_DRIVE_AUTH_INTENT);
  params.set(GOOGLE_DRIVE_AUTH_POPUP_QUERY_PARAM, "1");
  params.set(GOOGLE_DRIVE_AUTH_AUTO_QUERY_PARAM, "1");
  return `/auth/login?${params.toString()}`;
}
