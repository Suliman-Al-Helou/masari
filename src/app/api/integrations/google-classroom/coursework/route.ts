

import {
  getGoogleClassroomCoursework,
} from "@/features/integrations/google-classroom/server/google-classroom-coursework";
import {
  GoogleClassroomClientError,
} from "@/features/integrations/google-classroom/server/google-classroom-client";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DEFAULT_PAST_DAYS = 60;
const MIN_PAST_DAYS = 0;
const MAX_PAST_DAYS = 3650;

function parsePastDays(request: Request) {
  const rawValue = new URL(request.url).searchParams.get("pastDays");

  if (!rawValue) {
    return DEFAULT_PAST_DAYS;
  }

  const value = Number(rawValue);

  if (
    !Number.isInteger(value) ||
    value < MIN_PAST_DAYS ||
    value > MAX_PAST_DAYS
  ) {
    return null;
  }

  return value;
}

function errorResponse(error: unknown) {
  if (error instanceof GoogleClassroomClientError) {
    if (error.status >= 500) {
      logger.error(
        error.originalError ?? error,
        `Google Classroom error: ${error.code}`,
      );
    }

    return Response.json(
      {
        success: false,
        code: error.code,
        error: error.message,
      },
      { status: error.status },
    );
  }

  logger.error(error, "Failed to fetch Google Classroom coursework");

  return Response.json(
    {
      success: false,
      code: "CLASSROOM_COURSEWORK_FAILED",
      error: "تعذر جلب مهام Google Classroom",
    },
    { status: 502 },
  );
}

// Return coursework and the current student's submission state.
export async function GET(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return Response.json(
        {
          success: false,
          code: "UNAUTHORIZED",
          error: "يجب تسجيل الدخول أولًا",
        },
        { status: 401 },
      );
    }

    const pastDays = parsePastDays(request);

    if (pastDays === null) {
      return Response.json(
        {
          success: false,
          code: "INVALID_PAST_DAYS",
          error: "pastDays يجب أن يكون عددًا صحيحًا بين 0 و3650",
        },
        { status: 400 },
      );
    }

    const data = await getGoogleClassroomCoursework(
      currentUser.userId,
      { pastDays },
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
