"use client";

import Link from "next/link";
import {
  Activity,
  BookPlus,
  RefreshCw,
  Star,
  Stethoscope,
  Trash2,
  UserPlus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import type { AdminActivity, AdminActivityType } from "@/types/admin";

import { RecentActivitySkeleton } from "./RecentActivitySkeleton";
import {
  activityItemVariants,
  activityListVariants,
} from "./admin-activity.motion";
import AsyncErrorState from "@/components/share/AsyncErrorState";

interface RecentActivityCardProps {
  activities: AdminActivity[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  onRetry: () => void;
}

type ActivityMeta = {
  icon: LucideIcon;
  iconClass: string;
  iconBg: string;
};

const ACTIVITY_META: Record<AdminActivityType, ActivityMeta> = {
  student_joined: {
    icon: UserPlus,
    iconClass: "text-primary",
    iconBg: "bg-primary/10",
  },
  course_created: {
    icon: BookPlus,
    iconClass: "text-info",
    iconBg: "bg-info/10",
  },
  doctor_created: {
    icon: Stethoscope,
    iconClass: "text-success",
    iconBg: "bg-success/10",
  },
  course_review_created: {
    icon: Star,
    iconClass: "text-warning",
    iconBg: "bg-warning/10",
  },
  doctor_review_created: {
    icon: Star,
    iconClass: "text-warning",
    iconBg: "bg-warning/10",
  },
  user_deleted: {
    icon: Trash2,
    iconClass: "text-destructive",
    iconBg: "bg-destructive/10",
  },
};

function formatRelativeTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "وقت غير معروف";
  }

  const difference = date.getTime() - Date.now();
  const absoluteDifference = Math.abs(difference);

  const units = [
    { unit: "year", milliseconds: 365 * 24 * 60 * 60 * 1_000 },
    { unit: "month", milliseconds: 30 * 24 * 60 * 60 * 1_000 },
    { unit: "week", milliseconds: 7 * 24 * 60 * 60 * 1_000 },
    { unit: "day", milliseconds: 24 * 60 * 60 * 1_000 },
    { unit: "hour", milliseconds: 60 * 60 * 1_000 },
    { unit: "minute", milliseconds: 60 * 1_000 },
  ] as const;

  const formatter = new Intl.RelativeTimeFormat("ar", {
    numeric: "auto",
  });

  for (const { unit, milliseconds } of units) {
    if (absoluteDifference >= milliseconds) {
      return formatter.format(Math.round(difference / milliseconds), unit);
    }
  }

  return "الآن";
}

export default function RecentActivityCard({
  activities,
  isLoading,
  isError,
  isFetching,
  onRetry,
}: RecentActivityCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      aria-labelledby="recent-activity-title"
      className="flex h-full min-h-0  max-h-[420px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card p-5 pb-0 "
    >
      <header className="mb-5 flex shrink-0 items-center justify-between gap-4">
        <div>
          <h2 id="recent-activity-title" className="font-bold text-foreground">
            آخر النشاطات
          </h2>

          <p className="mt-1 text-xs text-muted-foreground">
            أحدث التغييرات المهمة داخل المنصة
          </p>
        </div>
        <div
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10"
        >
          <Activity className="h-5 w-5 text-primary" />
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto pe-2">
        {isLoading ? (
          <RecentActivitySkeleton />
        ) : isError ? (
          <AsyncErrorState
            title="تعذر تحميل آخر النشاطات"
            description="تحقق من الاتصال ثم حاول مرة أخرى."
            onRetry={onRetry}
            isRetrying={isFetching}
          />
        ) : activities.length === 0 ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center ">
            <Activity
              aria-hidden="true"
              className="h-8 w-8 text-muted-foreground/50"
            />

            <p className="mt-3 font-medium text-foreground">
              لا توجد نشاطات حديثة
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              ستظهر النشاطات الجديدة هنا تلقائيًا.
            </p>
          </div>
        ) : (
          <motion.ul
            variants={activityListVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            className="divide-y divide-border/60"
          >
            {activities.map((activity) => {
              const meta = ACTIVITY_META[activity.type];
              const Icon = meta.icon;

              const content = (
                <div className="flex h-[88px] items-center gap-3 px-2 sm:px-4">
                  {" "}
                  <div
                    aria-hidden="true"
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full p-2 gpa-2 ${meta.iconBg}`}
                  >
                    <Icon
                      aria-hidden="true"
                      className={`h-5 w-5 ${meta.iconClass}`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">
                      {activity.title}
                    </p>

                    {activity.actorName && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activity.actorName}
                      </p>
                    )}

                    {activity.description && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                    )}
                  </div>
                  <time
                    dateTime={activity.createdAt}
                    className="mt-2 block text-[11px] text-muted-foreground"
                  >
                    {formatRelativeTime(activity.createdAt)}
                  </time>
                </div>
              );

              return (
                <motion.li key={activity.id} variants={activityItemVariants}>
                  {activity.href ? (
                    <Link
                      href={activity.href}
                      className="block rounded-xl outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none"
                    >
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </section>
  );
}
