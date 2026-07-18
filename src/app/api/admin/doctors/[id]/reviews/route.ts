import {
  AdminDoctorReviewDetailsError,
  getAdminDoctorReviewDetails,
} from "@/lib/api/admin.service";
import { AdminAuthorizationError } from "@/lib/auth/require-admin-actor";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import { adminDoctorReviewDetailsSchema } from "@/schemas/admin-doctor-review.schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission(PERMISSION.DOCTORS_MANAGE);

  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await params;
  const { searchParams } = new URL(request.url);

  const parsed = adminDoctorReviewDetailsSchema.safeParse({
    doctorId: id,
    courseCode: searchParams.get("courseCode")?.trim() || undefined,
  });

  if (!parsed.success) {
    return Response.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "بيانات الطلب غير صحيحة",
      },
      { status: 400 },
    );
  }

  try {
    const details = await getAdminDoctorReviewDetails(
      auth.session.userId,
      parsed.data.doctorId,
      parsed.data.courseCode,
    );

    return Response.json({
      success: true,
      data: details,
    });
  } catch (error) {
    if (error instanceof AdminDoctorReviewDetailsError) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status },
      );
    }

    if (error instanceof AdminAuthorizationError) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: error.status },
      );
    }

    logger.error(error, "Error fetching admin doctor review details");

    return Response.json(
      {
        success: false,
        error: "تعذر جلب تقييمات الدكتور",
      },
      { status: 500 },
    );
  }
}