import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getUniversityDistribution } from "@/lib/api/admin.service";
import { logger } from "@/lib/logger";

export async function GET() {
  const auth = await requirePermission(PERMISSION.DASHBOARD_VIEW);

  if (!auth.ok) return auth.response;

  try {
    const universityDistribution = await getUniversityDistribution();

    return Response.json({
      success: true,
      data: universityDistribution,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin University Distribution");

    return Response.json(
      {
        success: false,
        error: "Failed to fetch admin University Distribution",
      },
      { status: 500 },
    );
  }
}
