import { NextRequest, NextResponse } from "next/server";
import type {
  GoogleDriveUploadedFile,
  GoogleDriveUploadErrorCode,
} from "@/types";

export const runtime = "nodejs";

const GOOGLE_DRIVE_UPLOAD_URL = "https://www.googleapis.com/upload/drive/v3/files";
const GOOGLE_DRIVE_RESPONSE_FIELDS = "id,name,mimeType,webViewLink,webContentLink";

type GoogleDriveApiError = {
  error?: {
    code?: number;
    message?: string;
    status?: string;
    errors?: Array<{
      message?: string;
      reason?: string;
    }>;
  };
};

function jsonError(
  status: number,
  code: GoogleDriveUploadErrorCode,
  message: string,
) {
  return NextResponse.json(
    {
      code,
      detail: message,
      message,
    },
    { status },
  );
}

function readJson<T>(value: string): T | null {
  if (!value.trim()) {
    return null;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function getStringFormValue(value: FormDataEntryValue | null): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeFileName(file: File, requestedName: string | null): string {
  return requestedName || file.name || "careerics-file";
}

function normalizeMimeType(file: File, requestedMimeType: string | null): string {
  return requestedMimeType || file.type || "application/octet-stream";
}

function toMultipartBody(file: File, fileName: string, mimeType: string) {
  const boundary = `careerics_drive_${crypto.randomUUID()}`;
  const metadata = JSON.stringify({
    name: fileName,
  });

  const body = new Blob([
    `--${boundary}\r\n`,
    "Content-Type: application/json; charset=UTF-8\r\n\r\n",
    metadata,
    "\r\n",
    `--${boundary}\r\n`,
    `Content-Type: ${mimeType}\r\n\r\n`,
    file,
    "\r\n",
    `--${boundary}--`,
  ]);

  return {
    body,
    boundary,
  };
}

function extractGoogleProjectId(message: string): string | null {
  const match = message.match(/project\s+(\d{6,})/i);
  return match?.[1] ?? null;
}

function buildEnableDriveApiMessage(googleMessage: string): string {
  const projectId = extractGoogleProjectId(googleMessage);
  if (!projectId) {
    return "Google Drive API is not enabled for this Google Cloud project yet. Enable the Google Drive API in Google Cloud Console, wait a few minutes, then retry.";
  }

  return `Google Drive API is not enabled for this Google Cloud project yet. Enable it here: https://console.developers.google.com/apis/api/drive.googleapis.com/overview?project=${projectId} Then wait a few minutes and retry.`;
}

function mapGoogleDriveError(status: number, bodyText: string) {
  const parsed = readJson<GoogleDriveApiError>(bodyText);
  const googleMessage =
    parsed?.error?.message?.trim() || "Google Drive upload failed. Please try again.";
  const normalizedMessage = googleMessage.toLowerCase();
  const reasons = (parsed?.error?.errors ?? [])
    .map((item) => item.reason?.toLowerCase() ?? "")
    .filter(Boolean);

  if (
    reasons.includes("accessnotconfigured") ||
    reasons.includes("servicedisabled") ||
    normalizedMessage.includes("google drive api has not been used in project") ||
    normalizedMessage.includes("drive.googleapis.com") && normalizedMessage.includes("is disabled")
  ) {
    return jsonError(
      403,
      "GOOGLE_DRIVE_API_DISABLED",
      buildEnableDriveApiMessage(googleMessage),
    );
  }

  if (
    reasons.includes("insufficientpermissions") ||
    normalizedMessage.includes("insufficient authentication scopes") ||
    normalizedMessage.includes("insufficient permission")
  ) {
    return jsonError(
      403,
      "GOOGLE_DRIVE_SCOPE_MISSING",
      "Google Drive permission was not granted yet. Please continue with Google and allow Drive access.",
    );
  }

  if (status === 401 || normalizedMessage.includes("invalid credentials")) {
    return jsonError(
      401,
      "GOOGLE_DRIVE_TOKEN_EXPIRED",
      "Your Google session expired. Please try again.",
    );
  }

  return jsonError(status >= 400 ? status : 502, "GOOGLE_DRIVE_UPLOAD_FAILED", googleMessage);
}

export async function POST(req: NextRequest) {
  const googleAccessToken = req.headers.get("x-google-access-token")?.trim();
  if (!googleAccessToken) {
    return jsonError(
      401,
      "GOOGLE_DRIVE_TOKEN_MISSING",
      "Google Drive permission is missing. Please continue with Google to save this file.",
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError(
      400,
      "GENERATED_FILE_MISSING",
      "No generated file was provided for the Google Drive upload.",
    );
  }

  const fileEntry = form.get("file");
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return jsonError(
      404,
      "GENERATED_FILE_MISSING",
      "The generated file could not be found. Please generate it again and retry.",
    );
  }

  const fileName = normalizeFileName(fileEntry, getStringFormValue(form.get("fileName")));
  const mimeType = normalizeMimeType(fileEntry, getStringFormValue(form.get("mimeType")));
  const { body, boundary } = toMultipartBody(fileEntry, fileName, mimeType);

  let uploadResponse: Response;
  try {
    uploadResponse = await fetch(
      `${GOOGLE_DRIVE_UPLOAD_URL}?uploadType=multipart&fields=${encodeURIComponent(GOOGLE_DRIVE_RESPONSE_FIELDS)}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          "Content-Type": `multipart/related; boundary=${boundary}`,
        },
        body,
        cache: "no-store",
      },
    );
  } catch {
    return jsonError(
      502,
      "GOOGLE_DRIVE_UPLOAD_FAILED",
      "Google Drive upload failed. Please try again.",
    );
  }

  const responseText = await uploadResponse.text();
  if (!uploadResponse.ok) {
    return mapGoogleDriveError(uploadResponse.status, responseText);
  }

  const uploadedFile = readJson<GoogleDriveUploadedFile>(responseText);
  if (!uploadedFile?.id) {
    return jsonError(
      502,
      "GOOGLE_DRIVE_UPLOAD_FAILED",
      "Google Drive returned an invalid upload response.",
    );
  }

  return NextResponse.json(uploadedFile);
}
