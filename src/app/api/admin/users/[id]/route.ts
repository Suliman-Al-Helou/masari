import { NextRequest } from "next/server";

import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { dbAdmin } from "@/lib/db/server-only";
import { logger } from "@/lib/logger";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);

  if (!auth.ok) {
    return auth.response;
  }

  const { id: targetUserId } = await params;

  if (auth.session.userId === targetUserId) {
    return Response.json(
      { error: "لا يمكنك تعطيل حسابك الخاص" },
      { status: 400 },
    );
  }

  try {
    const disabledAt = new Date().toISOString();

    // Block the user from signing in through Supabase Auth
    const { error: authError } =
      await dbAdmin.auth.admin.updateUserById(targetUserId, {
        ban_duration: "876000h",
      });

    if (authError) {
      throw authError;
    }

    // Mark the profile as disabled inside the application
    const { data, error: profileError } = await dbAdmin
      .from("profiles")
      .update({
        deleted_at: disabledAt,
      })
      .eq("id", targetUserId)
      .select("id")
      .maybeSingle();

    if (profileError || !data) {
      // Undo the Auth ban if updating the profile fails
      await dbAdmin.auth.admin.updateUserById(targetUserId, {
        ban_duration: "none",
      });

      if (profileError) {
        throw profileError;
      }

      return Response.json(
        { error: "المستخدم غير موجود" },
        { status: 404 },
      );
    }

    return Response.json({
      success: true,
      message: "تم تعطيل حساب المستخدم",
    });
  } catch (error) {
    logger.error(error, "Error disabling user");

    return Response.json(
      {
        success: false,
        error: "تعذر تعطيل حساب المستخدم",
      },
      { status: 500 },
    );
  }
}