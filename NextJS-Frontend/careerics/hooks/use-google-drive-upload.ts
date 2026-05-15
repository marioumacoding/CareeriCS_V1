"use client";

import { useCallback, useState } from "react";
import type { GoogleDriveUploadedFile } from "@/types";
import { googleDriveAuthService } from "@/services/google-drive-auth.service";
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

async function requestGoogleDriveSignIn(forceConsent = false): Promise<void> {
  await googleDriveAuthService.requestAccessToken({ forceConsent });
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
        await requestGoogleDriveSignIn();
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

        await requestGoogleDriveSignIn(true);
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
