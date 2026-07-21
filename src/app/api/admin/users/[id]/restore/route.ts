import { UserManagementError } from "@/lib/api/user-management.service";
import { restoreManagedUser } from "@/lib/api/user-management.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-super-admin";
import { logger } from "@/lib/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;

  try {
    await restoreManagedUser(auth.session.userId, id);
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof UserManagementError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    logger.error(error, "Error restoring user");
    return Response.json(
      { success: false, error: "تعذر استعادة حساب المستخدم" },
      { status: 500 },
    );
  }
}
