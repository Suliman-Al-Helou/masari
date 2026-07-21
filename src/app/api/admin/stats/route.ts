import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getAdminStats } from "@/lib/api/admin.service";
import { logger } from "@/lib/logger";

export async function GET() {
  const auth = await requirePermission(PERMISSION.DASHBOARD_VIEW);

  if (!auth.ok) return auth.response;

  try {
    const stats = await getAdminStats();

    return Response.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin stats");

    return Response.json(
      { success: false, error: "Failed to fetch admin stats" },
      { status: 500 },
    );
  }
}
