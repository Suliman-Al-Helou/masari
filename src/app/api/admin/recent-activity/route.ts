import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getAdminRecentActivities } from "@/lib/api/admin-activity.service";
import { logger } from "@/lib/logger";

export async function GET() {
  // Allow only users who have admin permissions
  const auth = await requirePermission(PERMISSION.DASHBOARD_VIEW);

  if (!auth.ok) return auth.response;

  try {
    const activities = await getAdminRecentActivities();

    return Response.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin recent activities");

    return Response.json(
      { success: false, error: "Failed to fetch admin recent activities" },
      { status: 500 },
    );
  }
}
