import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { adminDeleteCourseReview } from "@/lib/api/admin.service";
import { logger } from "@/lib/logger";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;
  const { id } = await params
  try {
    await adminDeleteCourseReview(id);
    return Response.json({ success: true });
  } catch (error) {
    logger.error(error, "Error deleting course review");
    return Response.json(
      { success: false, error: "Failed to delete course review" },
      { status: 500 },
    );
  }
}