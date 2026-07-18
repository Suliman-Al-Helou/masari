import "server-only";

import { dbAdmin } from "@/lib/db/server-only";
import { can, type Permission } from "@/lib/auth/permissions";

export class AdminAuthorizationError extends Error {
  constructor(
    message: string,
    readonly status: number = 403,
  ) {
    super(message);
    this.name = "AdminAuthorizationError";
  }
}

interface RequireAdminActorOptions {
  superAdminOnly?: boolean;
}

export async function requireAdminActor(
  actorUserId: string,
  permission: Permission,
  options: RequireAdminActorOptions = {},
) {
  const { data: actor, error } = await dbAdmin
    .from("profiles")
    .select("id, role, deleted_at, is_super_admin")
    .eq("id", actorUserId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!actor || actor.deleted_at || actor.role !== "admin") {
    throw new AdminAuthorizationError("ليس لديك صلاحية", 403);
  }

  if (!can("admin", permission)) {
    throw new AdminAuthorizationError("ليس لديك صلاحية", 403);
  }

  if (options.superAdminOnly && !actor.is_super_admin) {
    throw new AdminAuthorizationError(
      "هذه العملية متاحة للأدمن الأساسي فقط",
      403,
    );
  }

  return actor;
}