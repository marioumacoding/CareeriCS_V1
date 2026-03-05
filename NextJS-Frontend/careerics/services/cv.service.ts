/**
 * CV service — all backend calls for the CV feature.
 *
 * Maps directly to the FastAPI routers:
 *   POST /cv/upload/{user_id}   — upload a PDF or DOCX file for AI extraction
 *   POST /cv/build/{user_id}    — build or update the structured CV profile
 *
 * Components and hooks must never call fastapiApi directly.
 */

import { fastapiApi } from "@/lib/api";
import type { ApiResponse, CVProfile } from "@/types";

export const cvService = {
  /**
   * Upload a PDF or DOCX CV file.
   * The server runs AI extraction, persists the structured data, and maps skills.
   */
  uploadCV(
    userId: string,
    file: File,
  ): Promise<ApiResponse<{ message: string }>> {
    const form = new FormData();
    form.append("file", file);
    return fastapiApi.post<{ message: string }>(`/cv/upload/${userId}`, form);
  },

  /**
   * Build or update the structured CV for a user.
   *
   * - Omit `updateData` (or pass an empty object) to generate the full CV from
   *   existing database records.
   * - Pass a partial `CVProfile` to patch specific fields before building.
   */
  buildCV(
    userId: string,
    updateData?: Partial<CVProfile>,
  ): Promise<ApiResponse<CVProfile>> {
    return fastapiApi.post<CVProfile>(`/cv/build/${userId}`, updateData ?? {});
  },
} as const;
