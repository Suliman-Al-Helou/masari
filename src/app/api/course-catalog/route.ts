import { NextRequest, NextResponse } from "next/server";

import { listAdminCourses } from "@/lib/api/admin-course.service";
import { getCurrentUser } from "@/lib/auth/session";
import { courseCatalogQuerySchema } from "@/schemas/admin-course.schema";

export async function GET(request: NextRequest) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ message: "غير مصرح" }, { status: 401 });
  }

  const parsed = courseCatalogQuerySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return NextResponse.json(
      { message: "فلاتر المواد غير صالحة" },
      { status: 400 },
    );
  }

  const page = await listAdminCourses({
    ...parsed.data,
    status: "active",
    sort: "name_asc",
    page: 1,
    pageSize: 100,
  });

  return NextResponse.json(page.items);
}
