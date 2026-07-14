"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  CheckSquare,
  FileText,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { getAdminStats } from "@/lib/api/admin";
import { queryKeys } from "@/lib/api/queryKeys";
import { QUERY_STALE_TIME } from "@/lib/constants/query-stale-time";
import { statsGridVariants } from "@/components/admin/dashboard/stats/admin-stats.motion";

import StatCard from "@/components/admin/stats/StatCard";
import { StatsCardsSkeleton } from "@/components/admin/dashboard/stats/StatsCardsSkeleton";
import PageHeader from "@/components/share/PageHeader";

import { ADMIN_STATS_MOCK } from "@/lib/mocks/admin-stats.mock";
import AsyncErrorState from "@/components/share/AsyncErrorState";
import { getAdminRecentActivities } from "@/lib/api/admin";
import RecentActivityCard from "@/components/admin/dashboard/RecentActivity/RecentActivityCard";
import StudentDistributionCard from "@/components/admin/distribution/StudentDistributionCard";
import PlatformActivityCard from "@/components/admin/activity/PlatformActivityCard";
const useMockStats = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const STAT_CONFIG = [
  {
    key: "students",
    label: "طلاب جدد خلال 7 أيام",
    icon: Users,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    showComparisonLabel: true,
  },
  {
    key: "courses",
    label: "المواد المسجلة",
    icon: BookOpen,
    iconColor: "text-info",
    iconBg: "bg-info/10",
    showComparisonLabel: false,
  },
  {
    key: "tasks",
    label: "إجمالي المهام",
    icon: CheckSquare,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    showComparisonLabel: false,
  },
  {
    key: "notes",
    label: "إجمالي الملاحظات",
    icon: FileText,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    showComparisonLabel: false,
  },
  {
    key: "messages",
    label: "إجمالي الرسائل",
    icon: MessageSquare,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
    showComparisonLabel: false,
  },
] as const;

export default function AdminOverviewPage() {
  const shouldReduceMotion = useReducedMotion();

  const {
    data: stats,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: () =>
      useMockStats ? Promise.resolve(ADMIN_STATS_MOCK) : getAdminStats(),
    staleTime: QUERY_STALE_TIME.ADMIN_STATS,
    meta: {
      // يمنع ظهور Toast لأن الخطأ معالج داخل الصفحة
      silent: true,
    },
  });

  const {
    data: activities,
    isLoading: activitiesLoading,
    isError: activitiesError,
    isFetching: activitiesFetching,
    refetch: refetchActivities,
  } = useQuery({
    queryKey: queryKeys.admin.recentActivity(),
    queryFn: getAdminRecentActivities,
    staleTime: QUERY_STALE_TIME.ADMIN_ACTIVITY,
    meta: {
      // The error is handled inside RecentActivityCard
      silent: true,
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="الرئيسية"
        description="نظرة عامة على إحصائيات المنصة والنشاط الأخير."
      />

      {/* بطاقات الإحصائيات */}
      {isError && !stats ? (
        <AsyncErrorState
          title="تعذر تحميل إحصائيات لوحة التحكم"
          description="تحقق من الاتصال ثم حاول مرة أخرى."
          onRetry={refetch}
          isRetrying={isFetching}
          className="col-span-full rounded-2xl border border-destructive/30 bg-destructive/5 p-6 mb-5"
        />
      ) : isLoading ? (
        <StatsCardsSkeleton />
      ) : (
        <motion.dl
          variants={statsGridVariants}
          initial={shouldReduceMotion ? false : "hidden"}
          animate="visible"
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
        >
          {STAT_CONFIG.map((config) => {
            const metric = stats?.[config.key];

            return (
              <StatCard
                key={config.key}
                label={config.label}
                value={(metric?.value ?? 0).toLocaleString("ar-SA")}
                changePercent={metric?.changePercent}
                trendData={metric?.trendData ?? []}
                comparisonLabel="مقارنة بالـ7 أيام السابقة"
                showComparisonLabel={config.showComparisonLabel}
                icon={config.icon}
                iconColor={config.iconColor}
                iconBg={config.iconBg}
              />
            );
          })}
        </motion.dl>
      )}

      <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3 xl:auto-rows-[450px]">
        <RecentActivityCard
          activities={activities ?? []}
          isLoading={activitiesLoading}
          isError={activitiesError && !activities}
          isFetching={activitiesFetching}
          onRetry={() => void refetchActivities()}
        />
        <StudentDistributionCard trendData={stats?.students.trendData ?? []} />
        {/* Platform activity trend */}
        <PlatformActivityCard />
      </div>
      {/* الملخص السريع */}
      <section className="rounded-2xl border border-border/50 bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp aria-hidden="true" className="h-4 w-4 text-primary" />

          <h2 className="text-sm font-bold text-foreground">ملخص سريع</h2>
        </div>

        <div className="grid grid-cols-2 gap-4 text-center sm:grid-cols-4">
          {[
            {
              label: "متوسط المواد/طالب",
              value:
                stats && stats.totalStudents > 0
                  ? (stats.courses.value / stats.totalStudents).toFixed(1)
                  : "—",
            },
            {
              label: "متوسط المهام/طالب",
              value:
                stats && stats.totalStudents > 0
                  ? (stats.tasks.value / stats.totalStudents).toFixed(1)
                  : "—",
            },
            {
              label: "متوسط الملاحظات/طالب",
              value:
                stats && stats.totalStudents > 0
                  ? (stats.notes.value / stats.totalStudents).toFixed(1)
                  : "—",
            },
            {
              label: "متوسط الرسائل/طالب",
              value:
                stats && stats.totalStudents > 0
                  ? (stats.messages.value / stats.totalStudents).toFixed(1)
                  : "—",
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl bg-muted/50 p-3">
              <p className="text-xl font-bold text-foreground">{item.value}</p>

              <p className="mt-1 text-[11px] text-muted-foreground">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
