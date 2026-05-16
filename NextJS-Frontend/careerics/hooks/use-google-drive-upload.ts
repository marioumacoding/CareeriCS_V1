"use client";

import { useCallback, useEffect, useState } from "react";
import type { GoogleDriveUploadedFile } from "@/types";
import { googleDriveAuthService } from "@/services/google-drive-auth.service";
import {
  GoogleDriveUploadError,
  googleDriveService,
} from "@/services/google-drive.service";

type UploadGeneratedFileOptions = {
  fileName: string;
  mimeType?: string;
};

type EnsureGoogleDriveAccessOptions = {
  forceConsent?: boolean;
  popupWindow?: Window | null;
};

type UseGoogleDriveUploadResult = {
  isUploading: boolean;
  uploadError: string | null;
  uploadedFile: GoogleDriveUploadedFile | null;
  ensureGoogleDriveAccess: (options?: EnsureGoogleDriveAccessOptions) => Promise<boolean>;
  resetUploadState: () => void;
  uploadToGoogleDrive: (
    file: Blob | null,
    options: UploadGeneratedFileOptions,
  ) => Promise<GoogleDriveUploadedFile | null>;
};

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

async function requestGoogleDriveSignIn(options?: EnsureGoogleDriveAccessOptions): Promise<void> {
  await googleDriveAuthService.requestAccessToken({
    forceConsent: options?.forceConsent,
    popupWindow: options?.popupWindow,
  });
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

  useEffect(() => {
    void googleDriveAuthService.preload().catch(() => undefined);
  }, []);

  const ensureGoogleDriveAccess = useCallback(async (options?: EnsureGoogleDriveAccessOptions): Promise<boolean> => {
    const forceConsent = options?.forceConsent ?? false;
    const authStatus = googleDriveService.getGoogleDriveAuthStatus();
    if (authStatus === "ready" && !forceConsent) {
      return true;
    }

    setUploadError(null);

    try {
      await requestGoogleDriveSignIn({
        forceConsent,
        popupWindow: options?.popupWindow,
      });
      return true;
    } catch (error) {
      setUploadError(
        error instanceof Error
          ? error.message
          : "Google Drive permission was not granted.",
      );
      return false;
    }
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
      const authStatus = googleDriveService.getGoogleDriveAuthStatus();
      if (authStatus !== "ready") {
        const hasAccess = await ensureGoogleDriveAccess();
        if (!hasAccess) {
          return null;
        }
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

        googleDriveAuthService.clearAccessToken();
        throw new GoogleDriveUploadError(
          "GOOGLE_DRIVE_TOKEN_EXPIRED",
          "Google Drive access needs to be refreshed. Please click Save to Google Drive again.",
        );
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
    ensureGoogleDriveAccess,
    resetUploadState,
    uploadToGoogleDrive,
  };
}
