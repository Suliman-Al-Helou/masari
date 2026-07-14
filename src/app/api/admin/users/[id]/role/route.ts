import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { dbAdmin } from "@/lib/db/server-only";
import { logger } from "@/lib/logger";
import { NextRequest } from "next/server";

type UserRole = "student" | "admin";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);
  if (!auth.ok) return auth.response;

  try {
    // Get user id from route params.
    const { id } = await context.params;

    // Read and validate request body.
    const body = (await request.json()) as { role?: UserRole };
    const role = body.role;

    if (role !== "student" && role !== "admin") {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent admin from removing their own admin role.
    if (auth.session.userId === id && role !== "admin") {
      return Response.json(
        { error: "لا يمكنك سحب صلاحية الأدمن عن حسابك الخاص" },
        { status: 400 },
      );
    }
    

    const { data, error } = await dbAdmin
      .from("profiles")
      .update({ role })
      .eq("id", id);

    if (error) throw error;

    return Response.json({ success: true, user: data });
  } catch (error) {
    logger.error(error, "Error updating user role");

    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
