import {
  AdminCourseServiceError,
  restoreManagedCourse,
} from "@/lib/api/admin-course.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import { courseIdSchema } from "@/schemas/admin-course.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PATCH(_request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.COURSES_MANAGE);
  if (!auth.ok) return auth.response;

  if (!auth.session.isSuperAdmin) {
    return Response.json(
      { success: false, error: "استعادة المواد متاحة للأدمن الأساسي فقط" },
      { status: 403 },
    );
  }

  const { id: rawId } = await context.params;
  const id = courseIdSchema.safeParse(rawId);
  if (!id.success) {
    return Response.json(
      { success: false, error: "معرف المادة غير صالح" },
      { status: 400 },
    );
  }

  try {
    const data = await restoreManagedCourse(id.data);
    return Response.json({ success: true, data });
  } catch (error) {
    if (error instanceof AdminCourseServiceError) {
      return Response.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }
    logger.error(error, "Error restoring admin course");
    return Response.json(
      { success: false, error: "تعذر استعادة المادة" },
      { status: 500 },
    );
  }
}
