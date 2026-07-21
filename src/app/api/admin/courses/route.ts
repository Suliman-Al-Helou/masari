import {
  adminCourseListQuerySchema,
  createAdminCourseSchema,
} from "@/schemas/admin-course.schema";
import {
  AdminCourseServiceError,
  createManagedCourse,
  listAdminCourses,
} from "@/lib/api/admin-course.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";

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

export async function GET(request: Request) {
  const auth = await requirePermission(PERMISSION.COURSES_MANAGE);
  if (!auth.ok) return auth.response;

  const raw = Object.fromEntries(new URL(request.url).searchParams.entries());
  const parsed = adminCourseListQuerySchema.safeParse(raw);

  if (!parsed.success) {
    return Response.json(
      { success: false, error: "فلاتر المواد غير صالحة" },
      { status: 400 },
    );
  }

  if (parsed.data.status === "deleted" && !auth.session.isSuperAdmin) {
    return Response.json(
      { success: false, error: "المواد المحذوفة متاحة للأدمن الأساسي فقط" },
      { status: 403 },
    );
  }

  try {
    const data = await listAdminCourses(parsed.data);
    return Response.json({ success: true, data });
  } catch (error) {
    return errorResponse(error, "فشل جلب بيانات المواد");
  }
}

export async function POST(request: Request) {
  const auth = await requirePermission(PERMISSION.COURSES_MANAGE);
  if (!auth.ok) return auth.response;

  const body = await request.json().catch(() => null);
  const parsed = createAdminCourseSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "بيانات المادة غير صالحة",
      },
      { status: 400 },
    );
  }

  try {
    const data = await createManagedCourse(parsed.data);
    return Response.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "فشل اضافة مادة");
  }
}
