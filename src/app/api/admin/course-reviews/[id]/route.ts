import {
  AdminCourseServiceError,
  moderateManagedCourseReview,
  permanentlyDeleteManagedCourseReview,
} from "@/lib/api/admin-course.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import {
  courseIdSchema,
  moderateCourseReviewSchema,
} from "@/schemas/admin-course.schema";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function handleError(error: unknown) {
  if (error instanceof AdminCourseServiceError) {
    return Response.json(
      { success: false, error: error.message },
      { status: error.status },
    );
  }
  logger.error(error, "Error moderating course review");
  return Response.json(
    { success: false, error: "تعذر تحديث التقييم" },
    { status: 500 },
  );
}

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.REVIEWS_MODERATE);
  if (!auth.ok) return auth.response;

  const { id: rawId } = await context.params;
  const id = courseIdSchema.safeParse(rawId);
  const body = moderateCourseReviewSchema.safeParse(
    await request.json().catch(() => null),
  );

  if (!id.success || !body.success) {
    return Response.json(
      { success: false, error: "بيانات التقييم غير صالحة" },
      { status: 400 },
    );
  }

  try {
    await moderateManagedCourseReview(
      id.data,
      body.data.status,
      auth.session.userId,
    );
    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requirePermission(PERMISSION.REVIEWS_MODERATE);
  if (!auth.ok) return auth.response;

  if (!auth.session.isSuperAdmin) {
    return Response.json(
      { success: false, error: "الحذف النهائي متاح للأدمن الأساسي فقط" },
      { status: 403 },
    );
  }

  const { id: rawId } = await context.params;
  const id = courseIdSchema.safeParse(rawId);
  if (!id.success) {
    return Response.json(
      { success: false, error: "معرف التقييم غير صالح" },
      { status: 400 },
    );
  }

  try {
    await permanentlyDeleteManagedCourseReview(id.data);
    return Response.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
