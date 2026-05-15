"use client";

import { useCallback, useState } from "react";
import type { GoogleDriveUploadedFile } from "@/types";
import { googleDriveService } from "@/services";

type UploadGeneratedFileOptions = {
  fileName: string;
  mimeType?: string;
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
      const uploaded = await googleDriveService.uploadGeneratedFile(
        file,
        options.fileName,
        options.mimeType,
      );
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
