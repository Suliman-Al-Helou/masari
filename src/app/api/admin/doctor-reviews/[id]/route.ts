import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { adminDeleteDoctorReview } from "@/lib/api/admin.service";
import { logger } from "@/lib/logger";
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.REVIEWS_MODERATE);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    await adminDeleteDoctorReview(id);
    return Response.json({ success: true });
  } catch (error) {
    logger.error(error, "Error deleting doctor review");
    return Response.json(
      { success: false, error: "Failed to delete doctor review" },
      { status: 500 },
    );
  }
}
