import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { redirect } from "next/navigation";

import AdminOverviewClient from "@/components/admin/dashboard/AdminOverviewClient";
import {
  getAdminStats,
  getPlatformActivityTrend,
  getStudentDistribution,
} from "@/lib/api/admin.service";
import { getAdminRecentActivities } from "@/lib/api/admin-activity.service";
import { getCurrentUser } from "@/lib/auth/session";
import { queryKeys } from "@/lib/api/queryKeys";

export default async function AdminOverviewPage() {
  const session = await getCurrentUser();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "admin") {
    redirect("/");
  }

  const queryClient = new QueryClient();

  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.stats(),
      queryFn: getAdminStats,
    }),

    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.recentActivity(),
      queryFn: getAdminRecentActivities,
    }),

    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.studentDistribution({}),
      queryFn: () => getStudentDistribution({}),
    }),

    queryClient.prefetchQuery({
      queryKey: queryKeys.admin.platformActivity({
        metric: "all",
        period: 30,
      }),
      queryFn: () =>
        getPlatformActivityTrend({
          metric: "all",
          period: 30,
        }),
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <AdminOverviewClient />
    </HydrationBoundary>
  );
}