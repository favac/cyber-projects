/**
 * Represents an authenticated user inside the PARA workspace.
 */
export interface User {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly role: UserRole;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export const USER_ROLES = [
  "admin",
  "member",
  "viewer"
] as const;

export type UserRole = (typeof USER_ROLES)[number];
