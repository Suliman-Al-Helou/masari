import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { getAllUsers } from "@/lib/api/user-management.service";
import { logger } from "@/lib/logger";

export async function GET(req: Request) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);

  if (!auth.ok) return auth.response;
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim() || undefined;
  const status =
    searchParams.get("status") === "deleted" ? "deleted" : "active";

  if (status === "deleted" && !auth.session.isSuperAdmin) {
    return Response.json(
      {
        success: false,
        error: "المستخدمون المعطلون متاحون للأدمن الأساسي فقط",
      },
      { status: 403 },
    );
  }

  try {
    const users = await getAllUsers(auth.session.userId, { search, status });

    return Response.json({
      success: true,
      data: users,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin users");

    return Response.json(
      { success: false, error: "Failed to fetch admin users" },
      { status: 500 },
    );
  }
}
