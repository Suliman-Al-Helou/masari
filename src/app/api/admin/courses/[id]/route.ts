import {
  AdminCourseServiceError,
  getAdminCourse,
  softDeleteManagedCourse,
  updateManagedCourse,
} from "@/lib/api/admin-course.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import {
  courseIdSchema,
  updateAdminCourseSchema,
} from "@/schemas/admin-course.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function errorResponse(error: unknown, context: string) {
  if (error instanceof AdminCourseServiceError) {
    return Response.json(
      { success: false, error: error.message },
      { status: error.status },
    );
  }
  logger.error(error, context);
  return Response.json(
    { success: false, error: "تعذر تنفيذ العملية" },
    { status: 500 },
  );
}

async function parseCourseId(context: RouteContext) {
  const { id } = await context.params;
  return courseIdSchema.safeParse(id);
}

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.COURSES_MANAGE);
  if (!auth.ok) return auth.response;

  const id = await parseCourseId(context);
  if (!id.success) {
    return Response.json(
      { success: false, error: "معرف المادة غير صالح" },
      { status: 400 },
    );
  }

  try {
    const data = await getAdminCourse(id.data);
    return Response.json({ success: true, data });
  } catch (error) {
    return errorResponse(error, "Error fetching admin course");
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.COURSES_MANAGE);
  if (!auth.ok) return auth.response;

  const [id, body] = await Promise.all([
    parseCourseId(context),
    request.json().catch(() => null),
  ]);
  const input = updateAdminCourseSchema.safeParse(body);

  if (!id.success || !input.success) {
    return Response.json(
      {
        success: false,
        error: input.success
          ? "معرف المادة غير صالح"
          : (input.error.issues[0]?.message ?? "بيانات التعديل غير صالحة"),
      },
      { status: 400 },
    );
  }

  try {
    const data = await updateManagedCourse(id.data, input.data);
    return Response.json({ success: true, data });
  } catch (error) {
    return errorResponse(error, "Error updating admin course");
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.COURSES_MANAGE);
  if (!auth.ok) return auth.response;

  if (!auth.session.isSuperAdmin) {
    return Response.json(
      { success: false, error: "حذف المواد متاح للأدمن الأساسي فقط" },
      { status: 403 },
    );
  }

  const id = await parseCourseId(context);
  if (!id.success) {
    return Response.json(
      { success: false, error: "معرف المادة غير صالح" },
      { status: 400 },
    );
  }

  try {
    await softDeleteManagedCourse(id.data);
    return Response.json({ success: true });
  } catch (error) {
    return errorResponse(error, "Error deleting admin course");
  }
}
