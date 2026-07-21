import {
  AdminCourseServiceError,
  getManagedCourseReviews,
} from "@/lib/api/admin-course.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import {
  courseIdSchema,
  courseReviewsQuerySchema,
} from "@/schemas/admin-course.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.COURSES_MANAGE);
  if (!auth.ok) return auth.response;

  const { id: rawId } = await context.params;
  const id = courseIdSchema.safeParse(rawId);
  const rawQuery = Object.fromEntries(new URL(request.url).searchParams.entries());
  const options = courseReviewsQuerySchema.safeParse(rawQuery);

  if (!id.success || !options.success) {
    return Response.json(
      { success: false, error: "طلب التقييمات غير صالح" },
      { status: 400 },
    );
  }

  try {
    const data = await getManagedCourseReviews(id.data, {
      sort: options.data.sort,
      status: options.data.status === "all" ? undefined : options.data.status,
    });
    return Response.json({ success: true, data });
  } catch (error) {
    if (error instanceof AdminCourseServiceError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    logger.error(error, "Error fetching course review details");
    return Response.json(
      { success: false, error: "تعذر جلب تقييمات المادة" },
      { status: 500 },
    );
  }
}
