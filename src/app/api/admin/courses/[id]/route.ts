import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { dbAdmin } from "@/lib/db/server-only";
import { logger } from "@/lib/logger";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const { error } = await dbAdmin
      .from("admin_courses")
      .delete()
      .eq("id", params.id);

    if (error) throw new Error(error.message);

    return Response.json({ success: true });
  } catch (error) {
    logger.error(error, "Error deleting admin course");
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}