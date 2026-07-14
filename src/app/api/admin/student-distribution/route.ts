import { getStudentDistribution } from "@/lib/api/admin.service";
import { PERMISSION } from "@/lib/auth/permissions";
import { requirePermission } from "@/lib/auth/require-permission";
import { logger } from "@/lib/logger";
import { getMockStudentDistribution } from "@/lib/mocks/student-distribution.mock";

export async function GET(request: Request) {
  const auth = await requirePermission(PERMISSION.USERS_MANAGE);

  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);

  const university = searchParams.get("university")?.trim() || undefined;

  const major = searchParams.get("major")?.trim() || undefined;
  const useMockData =
    process.env.NEXT_PUBLIC_USE_MOCK_DATA?.trim().toLowerCase() === "true";

  try {
    const distribution = useMockData
      ? getMockStudentDistribution({ university, major })
      : await getStudentDistribution({ university, major });

    return Response.json({
      success: true,
      data: distribution,
    });
  } catch (error) {
    logger.error(error, "Error fetching student distribution");

    return Response.json(
      {
        success: false,
        error: "تعذر تحميل توزيع الطلاب",
      },
      { status: 500 },
    );
  }
}
