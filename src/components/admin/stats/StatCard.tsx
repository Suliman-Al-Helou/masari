"use client";

import type { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { statCardVariants } from "@/components/admin/dashboard/stats/admin-stats.motion";
import { MiniSparkline } from "@/components/admin/dashboard/stats/MiniSparkline";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  changePercent?: number | null;
  comparisonLabel?: string;
  trendData?: number[];
  showComparisonLabel?: boolean;
}

export default function StatCard({
  label,
  value,
  icon: Icon,
  iconColor,
  iconBg,
  changePercent,
  comparisonLabel = "عن الفترة السابقة",
  trendData = [],
  showComparisonLabel = false,
}: StatCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const hasComparison = changePercent !== null && changePercent !== undefined;

  // تحديد نوع الاتجاه
  const trend = !hasComparison
    ? "none"
    : changePercent > 0
      ? "positive"
      : changePercent < 0
        ? "negative"
        : "neutral";
  const TrendIcon =
    trend === "positive" ? ArrowUp : trend === "negative" ? ArrowDown : Minus;

  const trendColor =
    trend === "positive"
      ? "text-success"
      : trend === "negative"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <motion.div
      variants={statCardVariants}
      whileHover={shouldReduceMotion ? undefined : { y: -2 }}
      className="flex min-h-40 flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 transition-shadow hover:shadow-sm motion-reduce:transition-none"
    >
      {/* أعلى البطاقة */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="mt-3 text-3xl font-bold text-foreground">{value}</dd>
        </div>

        <div
          aria-hidden="true"
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          <Icon
            aria-hidden="true"
            focusable="false"
            className={`h-5 w-5 ${iconColor}`}
          />
        </div>
      </div>

      {/* أسفل البطاقة */}
      <div className="mt-6 flex items-end justify-between gap-3">
        <div>
          {trend === "none" ? (
            <p className="text-[11px] text-muted-foreground">
              لا توجد مقارنة متاحة
            </p>
          ) : (
            <>
              <div
                dir="ltr"
                className={`inline-flex items-center gap-1 text-sm font-semibold ${trendColor}`}
              >
                <TrendIcon aria-hidden="true" className="h-4 w-4" />

                <span>
                  {Math.abs(changePercent ?? 0).toLocaleString("en-US", {
                    maximumFractionDigits: 1,
                  })}
                  %
                </span>
              </div>
              {showComparisonLabel && (
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {comparisonLabel}
                </p>
              )}
            </>
          )}
        </div>

        {/* يظهر الرسم فقط عند وجود قيم كافية */}
        {trendData.length > 1 && (
          <MiniSparkline data={trendData} isPositive={trend !== "negative"} />
        )}
      </div>
    </motion.div>
  );
}
