import {
  createAdminDoctor,
  AdminDoctorValidationError,
  getAdminDoctors,
} from "@/lib/api/admin.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import { createAdminDoctorSchema } from "@/schemas/admin-doctor.schema";


export async function GET(request: Request) {
  const auth = await requirePermission(PERMISSION.DOCTORS_MANAGE);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const { searchParams } = new URL(request.url);

    const doctors = await getAdminDoctors({
      university: searchParams.get("university")?.trim() || undefined,
      major: searchParams.get("major")?.trim() || undefined,
    });

    return Response.json({
      success: true,
      data: doctors,
    });
  } catch (error) {
    logger.error(error, "Error fetching admin doctors");

    return Response.json(
      {
        success: false,
        error: "تعذر جلب الدكاترة",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const auth = await requirePermission(PERMISSION.DOCTORS_MANAGE);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const body = await request.json().catch(() => null);
    const result = createAdminDoctorSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        {
          success: false,
          error: "بيانات الدكتور غير صحيحة",
          fields: result.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const doctor = await createAdminDoctor(result.data);

    return Response.json(
      {
        success: true,
        data: doctor,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof AdminDoctorValidationError) {
      return Response.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 },
      );
    }

    logger.error(error, "Error creating admin doctor");

    return Response.json(
      {
        success: false,
        error: "تعذر إضافة الدكتور",
      },
      { status: 500 },
    );
  }
}
