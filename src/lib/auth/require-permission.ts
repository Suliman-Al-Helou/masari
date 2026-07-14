
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import type { Permission } from "@/lib/auth/permissions";

export async function requirePermission(permission: Permission) {
  const session = await getCurrentUser();

  if (!session || !can(session.role, permission)) {
    return {
      ok: false as const,
      response: Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}