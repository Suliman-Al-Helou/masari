import {
  disableManagedUser,
  UserManagementError,
} from "@/lib/api/user-management.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-super-admin";
import { logger } from "@/lib/logger";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);

  if (!auth.ok) {
    return auth.response;
  }

  const { id: targetUserId } = await params;

  try {
    // Soft-disables the user and blocks Auth access.
    await disableManagedUser(
      auth.session.userId,
      targetUserId,
    );

    return Response.json({
      success: true,
      message: "تم تعطيل حساب المستخدم",
    });
  } catch (error) {
    if (error instanceof UserManagementError) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status },
      );
    }

    logger.error(error, "Error disabling user");

    return Response.json(
      {
        success: false,
        error: "تعذر تعطيل حساب المستخدم",
      },
      { status: 500 },
    );
  }
}