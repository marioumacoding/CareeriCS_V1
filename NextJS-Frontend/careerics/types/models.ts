/** Domain entity types — expand as your schema grows. */

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "admin" | "user" | "guest";

/** Auth session shape (used by auth provider + middleware). */
export interface AuthSession {
  user: Pick<User, "id" | "email" | "displayName" | "role">;
  accessToken: string;
  refreshToken?: string;
  expiresAt: number; // Unix epoch seconds
}
