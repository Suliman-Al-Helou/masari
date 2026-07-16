import { deleteAdminDoctor } from "@/lib/api/admin.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.DOCTORS_MANAGE);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;

  if (!id) {
    return Response.json(
      {
        success: false,
        error: "معرّف الدكتور مطلوب",
      },
      { status: 400 },
    );
  }

  try {
    const deleted = await deleteAdminDoctor(id);

    if (!deleted) {
      return Response.json(
        {
          success: false,
          error: "الدكتور غير موجود",
        },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "تم حذف الدكتور",
    });
  } catch (error) {
    logger.error(error, "Error deleting admin doctor");

    return Response.json(
      {
        success: false,
        error: "تعذر حذف الدكتور",
      },
      { status: 500 },
    );
  }
}