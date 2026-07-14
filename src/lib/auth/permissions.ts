export const PERMISSION = {
  USERS_MANAGE: "users:manage",
} as const;

export type Permission =
  (typeof PERMISSION)[keyof typeof PERMISSION];

export type Role = "student" | "admin";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  student: [],
  admin: [PERMISSION.USERS_MANAGE],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}