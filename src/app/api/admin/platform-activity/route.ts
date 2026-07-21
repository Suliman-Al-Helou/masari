// Path: src/app/api/admin/platform-activity/route.ts

import { getPlatformActivityTrend } from "@/lib/api/admin.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import { platformActivityFiltersSchema } from "@/schemas/admin-dashboard.schema";

// Returns the platform activity trend to authorized admins
export async function GET(request: Request) {
  const auth = await requirePermission(PERMISSION.DASHBOARD_VIEW);

  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);

  // Validates URL filters before accessing the database
  const filtersResult = platformActivityFiltersSchema.safeParse({
    metric: searchParams.get("metric") ?? "all",
    period: searchParams.get("period") ?? "30",
  });

  if (!filtersResult.success) {
    return Response.json(
      {
        success: false,
        error: "Invalid platform activity filters",
      },
      { status: 400 },
    );
  }

  try {
    const activityTrend = await getPlatformActivityTrend(filtersResult.data);

    return Response.json({
      success: true,
      data: activityTrend,
    });
  } catch (error) {
    logger.error(error, "Error fetching platform activity trend");

    return Response.json(
      {
        success: false,
        error: "Failed to fetch platform activity trend",
      },
      { status: 500 },
    );
  }
}
