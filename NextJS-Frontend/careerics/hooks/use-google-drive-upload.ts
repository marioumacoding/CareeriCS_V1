"use client";

import { useCallback, useState } from "react";
import type { GoogleDriveUploadedFile } from "@/types";
import {
  GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE,
  GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY,
  type GoogleDriveAuthResultMessage,
} from "@/lib/auth/google-drive-signin";
import { clearGoogleProviderToken } from "@/lib/auth/google-provider-token";
import { authService } from "@/services/auth.service";
import {
  GoogleDriveUploadError,
  googleDriveService,
} from "@/services/google-drive.service";

type UploadGeneratedFileOptions = {
  fileName: string;
  mimeType?: string;
  popupWindow?: Window | null;
};

type UseGoogleDriveUploadResult = {
  isUploading: boolean;
  uploadError: string | null;
  uploadedFile: GoogleDriveUploadedFile | null;
  resetUploadState: () => void;
  uploadToGoogleDrive: (
    file: Blob | null,
    options: UploadGeneratedFileOptions,
  ) => Promise<GoogleDriveUploadedFile | null>;
};

const GOOGLE_DRIVE_LOGIN_POPUP_FEATURES =
  "popup=yes,width=520,height=760";

function getCurrentPathWithSearch(): string {
  if (typeof window === "undefined") {
    return "/";
  }

  return `${window.location.pathname}${window.location.search}`;
}

function readGoogleDriveAuthMessage(rawValue: string | null): GoogleDriveAuthResultMessage | null {
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<GoogleDriveAuthResultMessage>;
    if (
      parsed.type !== GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE ||
      typeof parsed.success !== "boolean"
    ) {
      return null;
    }

    return {
      type: GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE,
      success: parsed.success,
      error: typeof parsed.error === "string" ? parsed.error : undefined,
      timestamp: typeof parsed.timestamp === "number" ? parsed.timestamp : Date.now(),
    };
  } catch {
    return null;
  }
}

function waitForGoogleDriveSignIn(popup: Window): Promise<void> {
  return new Promise((resolve, reject) => {
    let finished = false;
    let isCheckingAuthStatus = false;

    const cleanup = () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("storage", handleStorage);
      window.clearInterval(closeWatcherId);
      window.clearInterval(authWatcherId);
    };

    const complete = (callback: () => void) => {
      if (finished) {
        return;
      }

      finished = true;
      cleanup();
      callback();
    };

    const handleAuthResult = (data: GoogleDriveAuthResultMessage) => {
      if (data.success === false) {
        complete(() => {
          reject(new Error(data.error || "Google sign-in could not grant Drive access."));
        });
        return;
      }

      complete(resolve);
    };

    const checkAuthStatus = async () => {
      if (finished || isCheckingAuthStatus) {
        return;
      }

      isCheckingAuthStatus = true;
      try {
        const authStatus = await googleDriveService.getGoogleDriveAuthStatus();
        if (authStatus === "ready") {
          complete(resolve);
        }
      } catch {
        // Keep waiting for the explicit callback/storage signal.
      } finally {
        isCheckingAuthStatus = false;
      }
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) {
        return;
      }

      const data = event.data as GoogleDriveAuthResultMessage | null;
      if (data?.type !== GOOGLE_DRIVE_AUTH_COMPLETED_MESSAGE) {
        return;
      }

      handleAuthResult(data);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY) {
        return;
      }

      const data = readGoogleDriveAuthMessage(event.newValue);
      if (data) {
        handleAuthResult(data);
      }
    };

    const closeWatcherId = window.setInterval(() => {
      if (!popup.closed) {
        return;
      }

      complete(() => {
        reject(new Error("Google sign-in was cancelled before Drive access was granted."));
      });
    }, 400);
    const authWatcherId = window.setInterval(() => {
      void checkAuthStatus();
    }, 800);

    window.addEventListener("message", handleMessage);
    window.addEventListener("storage", handleStorage);
    void checkAuthStatus();

    try {
      const existingResult = readGoogleDriveAuthMessage(
        window.localStorage.getItem(GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY),
      );
      if (existingResult) {
        handleAuthResult(existingResult);
      }
    } catch {
      // Storage is only a fallback; postMessage and popup-close detection remain active.
    }
  });
}

function isRecoverableGoogleAuthError(error: unknown): boolean {
  return (
    error instanceof GoogleDriveUploadError &&
    (
      error.code === "UNAUTHENTICATED" ||
      error.code === "GOOGLE_DRIVE_SCOPE_MISSING" ||
      error.code === "GOOGLE_DRIVE_TOKEN_MISSING" ||
      error.code === "GOOGLE_DRIVE_TOKEN_EXPIRED"
    )
  );
}

async function openGoogleDriveSignInWindow(reservedWindow?: Window | null): Promise<Window | null> {
  const popup = reservedWindow && !reservedWindow.closed
    ? reservedWindow
    : window.open(
        "",
        "careerics-google-drive-login",
        GOOGLE_DRIVE_LOGIN_POPUP_FEATURES,
      );

  if (!popup) {
    return null;
  }

  popup.focus();

  try {
    const googleOAuthUrl = await authService.createGoogleOAuthUrl(
      getCurrentPathWithSearch(),
      {
        popup: true,
        googleDriveAuth: true,
      },
    );

    if (popup.closed) {
      return null;
    }

    popup.location.href = googleOAuthUrl;
    popup.focus();
  } catch (error) {
    if (!popup.closed) {
      popup.close();
    }
    throw error;
  }

  return popup;
}

async function requestGoogleDriveSignIn(reservedWindow?: Window | null): Promise<void> {
  clearGoogleProviderToken();
  try {
    window.localStorage.removeItem(GOOGLE_DRIVE_AUTH_RESULT_STORAGE_KEY);
  } catch {
    // Storage is only a fallback; postMessage still handles the normal popup path.
  }

  const loginPopup = await openGoogleDriveSignInWindow(reservedWindow);
  if (!loginPopup) {
    throw new Error("Please allow the sign-in popup to continue saving to Google Drive.");
  }

  await waitForGoogleDriveSignIn(loginPopup);
}

export function useGoogleDriveUpload(): UseGoogleDriveUploadResult {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<GoogleDriveUploadedFile | null>(null);

  const resetUploadState = useCallback(() => {
    setIsUploading(false);
    setUploadError(null);
    setUploadedFile(null);
  }, []);

  const uploadToGoogleDrive = useCallback(async (
    file: Blob | null,
    options: UploadGeneratedFileOptions,
  ): Promise<GoogleDriveUploadedFile | null> => {
    if (isUploading) {
      return null;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const authStatus = await googleDriveService.getGoogleDriveAuthStatus();
      if (authStatus !== "ready") {
        await requestGoogleDriveSignIn(options.popupWindow);
      }

      const upload = () =>
        googleDriveService.uploadGeneratedFile(
          file,
          options.fileName,
          options.mimeType,
        );

      let uploaded: GoogleDriveUploadedFile;
      try {
        uploaded = await upload();
      } catch (uploadError) {
        if (!isRecoverableGoogleAuthError(uploadError)) {
          throw uploadError;
        }

        await requestGoogleDriveSignIn(options.popupWindow);
        uploaded = await upload();
      }

      setUploadedFile(uploaded);
      return uploaded;
    } catch (error) {
      setUploadedFile(null);
      setUploadError(
        error instanceof Error
          ? error.message
          : "Google Drive upload failed. Please try again.",
      );
      return null;
    } finally {
      setIsUploading(false);
    }
  }, [isUploading]);

  return {
    isUploading,
    uploadError,
    uploadedFile,
    resetUploadState,
    uploadToGoogleDrive,
  };
}
