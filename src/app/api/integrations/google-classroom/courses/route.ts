
import { google } from "googleapis";

import {
  createAuthorizedGoogleClassroomClient,
  GoogleClassroomClientError,
} from "@/features/integrations/google-classroom/server/google-classroom-client";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  logger.error(error, "Failed to fetch Google Classroom courses");

  return Response.json(
    {
      success: false,
      code: "CLASSROOM_API_FAILED",
      error: "تعذر جلب مقررات Google Classroom",
    },
    { status: 502 },
  );
}

// Return the signed-in student's active Classroom courses.
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

    const rawPageToken = new URL(request.url).searchParams.get("pageToken");
    const pageToken = rawPageToken?.trim() || undefined;

    const { auth, persistCredentials } =
      await createAuthorizedGoogleClassroomClient(
        currentUser.userId,
      );
    const classroom = google.classroom({
      version: "v1",
      auth,
    });

    const response = await classroom.courses.list({
      studentId: "me",
      courseStates: ["ACTIVE"],
      pageSize: 100,
      pageToken,
    });

    // Persist a token refreshed during the Classroom API request.
    await persistCredentials();

    const courses = (response.data.courses ?? []).map((course) => ({
      id: course.id ?? "",
      name: course.name ?? "",
      section: course.section ?? null,
      descriptionHeading: course.descriptionHeading ?? null,
      room: course.room ?? null,
      courseState: course.courseState ?? null,
      alternateLink: course.alternateLink ?? null,
      creationTime: course.creationTime ?? null,
      updateTime: course.updateTime ?? null,
    }));

    return Response.json(
      {
        success: true,
        data: {
          courses,
          nextPageToken: response.data.nextPageToken ?? null,
        },
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
