import { reportCourseReview, CourseReviewReportError } from "@/lib/api/course-review.service";
import { getCurrentUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { courseIdSchema } from "@/schemas/admin-course.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const session = await getCurrentUser();
  if (!session) {
    return Response.json(
      { success: false, error: "يجب تسجيل الدخول" },
      { status: 401 },
    );
  }

  const { id: rawId } = await context.params;
  const id = courseIdSchema.safeParse(rawId);
  if (!id.success) {
    return Response.json(
      { success: false, error: "معرف الرأي غير صالح" },
      { status: 400 },
    );
  }

  try {
    await reportCourseReview(id.data, session.userId);
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof CourseReviewReportError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    logger.error(error, "Error reporting course review");
    return Response.json(
      { success: false, error: "تعذر إرسال البلاغ" },
      { status: 500 },
    );
  }
}
