/**
 * CV service — all backend calls for the CV feature.
 *
 * Maps directly to the FastAPI routers:
 *   POST /cv/extract/{user_id}   — upload a PDF or DOCX file for AI extraction
 *   POST /cv/build/{user_id}     — generate CV PDF from user data
 *   POST /cv/enhance/{user_id}   — upload CV and return enhanced PDF
 *
 * Components and hooks must never call fastapiApi directly.
 */

import { fastapiApi } from "@/lib/api";
import { getAuthToken } from "@/lib/auth/token";
import type { ApiResponse } from "@/types";

async function postCvPdf(path: string, body: BodyInit | object): Promise<Blob> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    Accept: "application/pdf",
  };

  const isFormData = body instanceof FormData;
  if (!isFormData) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api/fastapi${path}`, {
    method: "POST",
    headers,
    body: isFormData ? body : JSON.stringify(body),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "CV request failed");
  }

  return response.blob();
}

export const cvService = {
  /**
   * Upload a PDF or DOCX CV file.
   * The server runs AI extraction, persists the structured data, and maps skills.
   */
  extractCV(
    userId: string,
    file: File,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const form = new FormData();
    form.append("file", file);
    return fastapiApi.post<Record<string, unknown>>(`/cv/extract/${userId}`, form);
  },

  uploadCV(
    userId: string,
    file: File,
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const form = new FormData();
    form.append("file", file);
    return fastapiApi.post<Record<string, unknown>>(`/cv/extract/${userId}`, form);
  },

  /**
   * Build user CV and return generated PDF blob.
   */
  buildCV(userId: string, cvData: Record<string, unknown>): Promise<Blob> {
    return postCvPdf(`/cv/build/${userId}`, cvData);
  },

  /**
   * Upload an existing CV and return enhanced PDF blob.
   */
  enhanceCV(userId: string, file: File): Promise<Blob> {
    const form = new FormData();
    form.append("file", file);
    return postCvPdf(`/cv/enhance/${userId}`, form);
  },
} as const;
