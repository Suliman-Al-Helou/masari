export const PERMISSION = {
  USERS_MANAGE: "users:manage",
  DOCTORS_MANAGE: "doctors:manage",
  COURSES_MANAGE: "courses:manage",
  DASHBOARD_VIEW: "dashboard:view",
  REVIEWS_MODERATE: "reviews:moderate",
} as const;

export type Permission = (typeof PERMISSION)[keyof typeof PERMISSION];

export type Role = "student" | "admin";

const ROLE_PERMISSIONS: Record<Role, readonly Permission[]> = {
  student: [],
  admin: [
    PERMISSION.USERS_MANAGE,
    PERMISSION.DOCTORS_MANAGE,
    PERMISSION.COURSES_MANAGE,
    PERMISSION.DASHBOARD_VIEW,
    PERMISSION.REVIEWS_MODERATE,
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
