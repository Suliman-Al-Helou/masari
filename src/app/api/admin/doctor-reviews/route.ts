import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { adminGetAllDoctorReviews } from "@/lib/api/admin.service";
import { logger } from "@/lib/logger";

export async function GET() {
  const auth = await requirePermission(PERMISSION.REVIEWS_MODERATE);

  if (!auth.ok) return auth.response;

  try {
    const doctor = await adminGetAllDoctorReviews();

    return Response.json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin doctor");

    return Response.json(
      { success: false, error: "Failed to fetch admin doctor" },
      { status: 500 },
    );
  }
}
