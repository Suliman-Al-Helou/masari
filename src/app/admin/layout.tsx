import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { getCurrentUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: {
    default: "لوحة الإدارة",
    template: "%s | لوحة الإدارة",
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
  },
};

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const session = await getCurrentUser();
  // Temporary server session diagnostics.
  
  // المستخدم غير مسجل أو حسابه معطل
  if (!session) {
    redirect("/login");
  }

  // المستخدم مسجل لكنه ليس مديرًا
  if (session.role !== "admin") {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
