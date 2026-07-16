import {
  UserManagementError
} from "@/lib/api/user-management.service";
import { updateManagedUserRole } from "@/lib/api/user-management.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-super-admin";
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
      return Response.json(
        { success: false, error: "الدور المطلوب غير صالح" },
        { status: 400 },
      );
    }

    await updateManagedUserRole(auth.session.userId, id, role);

    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof UserManagementError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    logger.error(error, "Error updating user role");

    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 },
    );
  }
}
