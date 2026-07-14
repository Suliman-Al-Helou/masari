import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { dbAdmin } from "@/lib/db/server-only";
import { logger } from "@/lib/logger";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;
  const { id } = await params;
  try {
    const { error } = await dbAdmin.from("admin_courses").delete().eq("id", id);

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
