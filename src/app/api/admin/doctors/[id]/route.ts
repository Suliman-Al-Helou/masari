import { deleteAdminDoctor } from "@/lib/api/admin.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { AdminAuthorizationError } from "@/lib/auth/require-admin-actor";
import { requirePermission } from "@/lib/auth/require-permission";

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
    const deleted = await deleteAdminDoctor(auth.session.userId, id);

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
if (error instanceof AdminAuthorizationError) {
  return Response.json(
    {
      success: false,
      error: error.message,
    },
    { status: error.status },
  );
}
    return Response.json(
      {
        success: false,
        error: "تعذر حذف الدكتور",
      },
      { status: 500 },
    );
  }
}
