import { redirect } from "next/navigation";

import UsersPageClient from "@/components/admin/users/UsersPageClient";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AdminUsersPage() {
  const session = await getCurrentUser();

  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <UsersPageClient
      currentAdminId={session.userId}
      isSuperAdmin={session.isSuperAdmin}
    />
  );
}
