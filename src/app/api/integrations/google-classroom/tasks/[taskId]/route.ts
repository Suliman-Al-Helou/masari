import { getLocalGoogleClassroomTaskById } from "@/features/integrations/google-classroom/server/google-classroom-tasks";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    taskId: string;
  }>;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function GET(
  _request: Request,
  context: RouteContext,
) {
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

    const { taskId } = await context.params;

    if (!UUID_PATTERN.test(taskId)) {
      return Response.json(
        {
          success: false,
          code: "INVALID_TASK_ID",
          error: "معرّف المهمة غير صحيح",
        },
        {
          status: 400,
        },
      );
    }

    const task =
      await getLocalGoogleClassroomTaskById(
        currentUser.userId,
        taskId,
      );

    if (!task) {
      return Response.json(
        {
          success: false,
          code: "CLASSROOM_TASK_NOT_FOUND",
          error: "المهمة غير موجودة",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json(
      {
        success: true,
        data: task,
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
      "Failed to read Classroom task details",
    );

    return Response.json(
      {
        success: false,
        code: "CLASSROOM_TASK_READ_FAILED",
        error: "تعذر قراءة تفاصيل المهمة",
      },
      {
        status: 500,
      },
    );
  }
}