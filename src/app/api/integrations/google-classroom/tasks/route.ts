import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

import { getLocalGoogleClassroomTasks } from "@/features/integrations/google-classroom/server/google-classroom-tasks";
import type { LocalClassroomTaskStatus } from "@/features/integrations/google-classroom/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_STATUSES = new Set<
  LocalClassroomTaskStatus
>([
  "upcoming",
  "overdue",
  "submitted",
  "returned",
  "no_due_date",
]);

function parseLimit(
  searchParams: URLSearchParams,
): number | null {
  const rawLimit = searchParams.get("limit");

  if (!rawLimit) {
    return 100;
  }

  const limit = Number(rawLimit);

  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 200
  ) {
    return null;
  }

  return limit;
}

export async function GET(request: Request) {
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

    const searchParams = new URL(
      request.url,
    ).searchParams;

    const rawStatus =
      searchParams.get("status");

    const status =
      rawStatus &&
      rawStatus !== "all" &&
      VALID_STATUSES.has(
        rawStatus as LocalClassroomTaskStatus,
      )
        ? (rawStatus as LocalClassroomTaskStatus)
        : undefined;

    if (
      rawStatus &&
      rawStatus !== "all" &&
      !status
    ) {
      return Response.json(
        {
          success: false,
          code: "INVALID_STATUS",
          error: "حالة المهمة غير صحيحة",
        },
        {
          status: 400,
        },
      );
    }

    const limit = parseLimit(searchParams);

    if (limit === null) {
      return Response.json(
        {
          success: false,
          code: "INVALID_LIMIT",
          error:
            "limit يجب أن يكون عددًا بين 1 و200",
        },
        {
          status: 400,
        },
      );
    }

    const googleCourseId =
      searchParams.get("courseId") ??
      undefined;

    const data =
      await getLocalGoogleClassroomTasks(
        currentUser.userId,
        {
          status,
          googleCourseId,
          limit,
        },
      );

    return Response.json(
      {
        success: true,
        source: "supabase",
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
      "Failed to read synchronized Classroom tasks",
    );

    return Response.json(
      {
        success: false,
        code: "CLASSROOM_TASKS_READ_FAILED",
        error:
          "تعذر قراءة مهام Google Classroom",
      },
      {
        status: 500,
      },
    );
  }
}