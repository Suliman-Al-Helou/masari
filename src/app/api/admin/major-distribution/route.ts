import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getMajorDistribution } from "@/lib/api/admin.service";
import { logger } from "@/lib/logger";

export async function GET() {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);

  if (!auth.ok) return auth.response;

  try {
    const major = await getMajorDistribution();

    return Response.json({
      success: true,
      data: major,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin Major Distribution");

    return Response.json(
      { success: false, error: "Failed to fetch admin Major Distribution" },
      { status: 500 },
    );
  }
}
