import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/auth/permissions";
import type { Permission } from "@/lib/auth/permissions";

export async function requirePermission(permission: Permission) {
  const session = await getCurrentUser();
  if (!session) {
    return {
      ok: false as const,
      response: Response.json(
        { success: false, error: "يجب تسجيل الدخول" },
        { status: 401 },
      ),
    };
  }
  if (!session || !can(session.role, permission) || !session.isSuperAdmin) {
    return {
      ok: false as const,
      response: Response.json(
        { success: false, error: "هذه العملية متاحة للأدمن الأساسي فقط" },
        { status: 403 },
      ),
    };
  }

  return {
    ok: true as const,
    session,
  };
}
