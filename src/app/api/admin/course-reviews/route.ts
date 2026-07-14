import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { adminGetAllCourseReviews } from "@/lib/api/admin.service";
import { logger } from "@/lib/logger";

export async function GET() {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);

  if (!auth.ok) return auth.response;

  try {
    const courseReviews = await adminGetAllCourseReviews();

    return Response.json({
      success: true,
      data: courseReviews,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin course reviews ");

    return Response.json(
      { success: false, error: "Failed to fetch admin course reviews " },
      { status: 500 },
    );
  }
}
