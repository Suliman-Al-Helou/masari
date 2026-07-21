import {
  GoogleClassroomSyncError,
  syncGoogleClassroom,
} from "@/features/integrations/google-classroom/server/google-classroom-sync";
import { GoogleClassroomClientError } from "@/features/integrations/google-classroom/server/google-classroom-client";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function errorResponse(error: unknown) {
  if (
    error instanceof GoogleClassroomClientError
  ) {
    if (error.status >= 500) {
      logger.error(
        error.originalError ?? error,
        `Google Classroom client error: ${error.code}`,
      );
    }

    return Response.json(
      {
        success: false,
        code: error.code,
        error: error.message,
      },
      {
        status: error.status,
      },
    );
  }

  if (
    error instanceof GoogleClassroomSyncError
  ) {
    if (error.status >= 500) {
      logger.error(
        error.originalError ?? error,
        `Google Classroom sync error: ${error.code}`,
      );
    }

    return Response.json(
      {
        success: false,
        code: error.code,
        error: error.message,
      },
      {
        status: error.status,
      },
    );
  }

  logger.error(
    error,
    "Failed to synchronize Google Classroom",
  );

  return Response.json(
    {
      success: false,
      code: "CLASSROOM_SYNC_FAILED",
      error:
        "تعذر مزامنة بيانات Google Classroom",
    },
    {
      status: 500,
    },
  );
}

// Synchronize the current student's Classroom data.
export async function POST() {
  try {
    const currentUser =
      await getCurrentUser();

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

    const data = await syncGoogleClassroom(
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
    return errorResponse(error);
  }
}