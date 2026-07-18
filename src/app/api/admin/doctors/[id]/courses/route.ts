import {
  AdminDoctorCoursesError,
  updateAdminDoctorCourses,
} from "@/lib/api/admin.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import { updateAdminDoctorCoursesSchema } from "@/schemas/admin-doctor.schema";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.DOCTORS_MANAGE);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { id } = await params;
    const body = await request.json().catch(() => null);
    const result = updateAdminDoctorCoursesSchema.safeParse(body);

    if (!id) {
      return Response.json(
        {
          success: false,
          error: "معرّف الدكتور مطلوب",
        },
        { status: 400 },
      );
    }

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: "بيانات المواد غير صحيحة",
          fields: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

await updateAdminDoctorCourses(
  auth.session.userId,
  id,
  result.data.course_ids,
);
    return Response.json({
      success: true,
      message: "تم تحديث مواد الدكتور",
    });
  } catch (error) {
    if (error instanceof AdminDoctorCoursesError) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status },
      );
    }

    logger.error(error, "Error updating admin doctor courses");

    return Response.json(
      {
        success: false,
        error: "تعذر تحديث مواد الدكتور",
      },
      { status: 500 },
    );
  }
}