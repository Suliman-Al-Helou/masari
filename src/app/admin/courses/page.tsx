import { redirect } from "next/navigation";

import CoursesPageClient from "@/components/admin/courses/CoursesPageClient";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminCoursesPage() {
  const session = await getCurrentUser();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return <CoursesPageClient isSuperAdmin={session.isSuperAdmin} />;
}
