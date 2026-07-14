import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { dbAdmin } from "@/lib/db/server-only";
import { logger } from "@/lib/logger";
import type { CreateAdminCourseInput } from "@/types/admin";

export async function POST(request: Request) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;

  const body: CreateAdminCourseInput = await request.json();

  if (!body.name || !body.code) {
    return Response.json(
      { success: false, error: "name و code مطلوبين" },
      { status: 400 },
    );
  }

  try {
    const { data, error } = await dbAdmin
      .from("admin_courses")
      .insert(body)
      .select()
      .single();

    if (error) throw new Error(error.message);

    return Response.json({ success: true, data });
  } catch (error) {
    logger.error(error, "Error creating admin course");
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    const { data, error } = await dbAdmin.from("admin_courses").select("*");
    if (error) throw new Error(error.message);
    return Response.json({ success: true, data });
  } catch (error) {
    logger.error(error, "Error fetching admin courses");
    return Response.json({ success: false, error: "Server error" }, { status: 500 });
  }
}