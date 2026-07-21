import { UserManagementError } from "@/lib/api/user-management.service";
import { updateManagedUserDeletionNote } from "@/lib/api/user-management.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-super-admin";
import { logger } from "@/lib/logger";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const body = (await request.json()) as { note?: unknown };

  if (typeof body.note !== "string" || body.note.length > 500) {
    return Response.json(
      { success: false, error: "الملاحظة يجب ألا تتجاوز 500 حرف" },
      { status: 400 },
    );
  }

  try {
    await updateManagedUserDeletionNote(auth.session.userId, id, body.note);
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof UserManagementError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    logger.error(error, "Error updating user deletion note");
    return Response.json(
      { success: false, error: "تعذر حفظ سبب التعطيل" },
      { status: 500 },
    );
  }
}
