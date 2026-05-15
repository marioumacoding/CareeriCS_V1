"use client";

import type {
  GoogleDriveUploadedFile,
  GoogleDriveUploadErrorCode,
} from "@/types";
import { googleDriveAuthService } from "@/services/google-drive-auth.service";

const GOOGLE_DRIVE_UPLOAD_PATH = "/api/google-drive/upload";
const DEFAULT_FILE_MIME_TYPE = "application/pdf";

export type GoogleDriveAuthStatus =
  | "ready"
  | "session_required"
  | "google_sign_in_required";

const KNOWN_UPLOAD_ERROR_CODES: readonly GoogleDriveUploadErrorCode[] = [
  "UNAUTHENTICATED",
  "GOOGLE_DRIVE_SCOPE_MISSING",
  "GOOGLE_DRIVE_API_DISABLED",
  "GOOGLE_DRIVE_TOKEN_MISSING",
  "GOOGLE_DRIVE_TOKEN_EXPIRED",
  "GENERATED_FILE_MISSING",
  "GOOGLE_DRIVE_UPLOAD_FAILED",
];

type UploadErrorResponse = {
  code?: string;
  detail?: string;
  message?: string;
};

function isKnownUploadErrorCode(
  value: string | undefined,
): value is GoogleDriveUploadErrorCode {
  return value !== undefined && KNOWN_UPLOAD_ERROR_CODES.includes(value as GoogleDriveUploadErrorCode);
}

function isDriveUploadSuccess(
  value: GoogleDriveUploadedFile | UploadErrorResponse | null,
): value is GoogleDriveUploadedFile {
  return Boolean(value && "id" in value && typeof value.id === "string");
}

function buildUploadError(
  code: GoogleDriveUploadErrorCode,
  message: string,
  status?: number,
): GoogleDriveUploadError {
  return new GoogleDriveUploadError(code, message, status);
}

function toUploadFile(file: Blob, fileName: string, mimeType?: string): File {
  const resolvedMimeType = mimeType || file.type || DEFAULT_FILE_MIME_TYPE;

  if (
    file instanceof File &&
    file.name === fileName &&
    (file.type || resolvedMimeType) === resolvedMimeType
  ) {
    return file;
  }

  return new File([file], fileName, {
    type: resolvedMimeType,
  });
}

async function readUploadResponse(
  response: Response,
): Promise<GoogleDriveUploadedFile | UploadErrorResponse | null> {
  try {
    return (await response.json()) as GoogleDriveUploadedFile | UploadErrorResponse;
  } catch {
    return null;
  }
}

function mapUploadError(
  status: number,
  body: UploadErrorResponse | null,
): GoogleDriveUploadError {
  const code = isKnownUploadErrorCode(body?.code)
    ? body.code
    : "GOOGLE_DRIVE_UPLOAD_FAILED";
  const message =
    body?.detail ??
    body?.message ??
    "Google Drive upload failed. Please try again.";

  if (code === "GOOGLE_DRIVE_UPLOAD_FAILED" && status === 401) {
    return buildUploadError(
      "GOOGLE_DRIVE_TOKEN_EXPIRED",
      "Your Google session expired. Please try again.",
      status,
    );
  }

  return buildUploadError(code, message, status);
}

async function uploadWithAccessToken(
  file: File,
  accessToken: string,
): Promise<GoogleDriveUploadedFile> {
  const form = new FormData();
  form.append("file", file, file.name);
  form.append("fileName", file.name);
  form.append("mimeType", file.type || DEFAULT_FILE_MIME_TYPE);

  const response = await fetch(GOOGLE_DRIVE_UPLOAD_PATH, {
    method: "POST",
    headers: {
      "X-Google-Access-Token": accessToken,
    },
    body: form,
  });

  const body = await readUploadResponse(response);
  if (!response.ok) {
    throw mapUploadError(response.status, body && !isDriveUploadSuccess(body) ? body : null);
  }

  if (!isDriveUploadSuccess(body)) {
    throw buildUploadError(
      "GOOGLE_DRIVE_UPLOAD_FAILED",
      "Google Drive did not return the uploaded file details.",
      response.status,
    );
  }

  return body;
}

export class GoogleDriveUploadError extends Error {
  code: GoogleDriveUploadErrorCode;
  status?: number;

  constructor(code: GoogleDriveUploadErrorCode, message: string, status?: number) {
    super(message);
    this.name = "GoogleDriveUploadError";
    this.code = code;
    this.status = status;
  }
}

export const googleDriveService = {
  getCurrentGoogleAccessToken(): string | null {
    return googleDriveAuthService.getStoredAccessToken();
  },

  getGoogleDriveAuthStatus(): GoogleDriveAuthStatus {
    return googleDriveAuthService.getStoredAccessToken()
      ? "ready"
      : "google_sign_in_required";
  },

  async uploadGeneratedFile(
    file: Blob | null,
    fileName: string,
    mimeType?: string,
  ): Promise<GoogleDriveUploadedFile> {
    if (!file || file.size === 0) {
      throw buildUploadError(
        "GENERATED_FILE_MISSING",
        "This generated file is no longer available. Please generate it again and retry.",
      );
    }

    const uploadFile = toUploadFile(file, fileName, mimeType);
    const accessToken = googleDriveAuthService.getStoredAccessToken();
    if (!accessToken) {
      throw buildUploadError(
        "GOOGLE_DRIVE_TOKEN_MISSING",
        "Please continue with Google to save this file to Drive.",
      );
    }

    try {
      return await uploadWithAccessToken(uploadFile, accessToken);
    } catch (error) {
      if (
        error instanceof GoogleDriveUploadError &&
        error.code === "GOOGLE_DRIVE_TOKEN_EXPIRED"
      ) {
        googleDriveAuthService.clearAccessToken();
        throw buildUploadError(
          "GOOGLE_DRIVE_TOKEN_EXPIRED",
          "Your Google Drive access expired. Please continue with Google again.",
          error.status,
        );
      }

      throw error;
    }
  },
} as const;
