import { getGoogleClassroomConnectionStatus } from "@/features/integrations/google-classroom/server/google-classroom-status";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          error: "يجب تسجيل الدخول أولًا",
        },
        {
          status: 401,
        },
      );
    }

    const data =
      await getGoogleClassroomConnectionStatus(
        currentUser.userId,
      );

    return Response.json(
      {
        success: true,
        data,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (error) {
    logger.error(
      error,
      "Failed to read Google Classroom connection status",
    );

    return Response.json(
      {
        success: false,
        code: "CLASSROOM_STATUS_READ_FAILED",
        error: "تعذر قراءة حالة ربط Google Classroom",
      },
      {
        status: 500,
      },
    );
  }
}