/**
 * Example domain service: Auth service.
 *
 * Services are the single source of truth for calling backend APIs.
 * Components / hooks never import HttpClient directly — they call services.
 */

import { dotnetApi } from "@/lib/api";
import type { ApiResponse, AuthSession, User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName: string;
}

export const authService = {
  login(payload: LoginPayload) {
    return dotnetApi.post<AuthSession>("/auth/login", payload, { noRetry: true });
  },

  register(payload: RegisterPayload) {
    return dotnetApi.post<AuthSession>("/auth/register", payload, { noRetry: true });
  },

  refreshToken(refreshToken: string) {
    return dotnetApi.post<AuthSession>("/auth/refresh", { refreshToken }, { noRetry: true });
  },

  me(): Promise<ApiResponse<User>> {
    return dotnetApi.get<User>("/auth/me");
  },
} as const;
