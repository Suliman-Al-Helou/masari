// Path: src/components/admin/activity/PlatformActivityCard.tsx

"use client";

import { useState } from "react";
import { Activity, ArrowDown, ArrowUp, Minus } from "lucide-react";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import PlatformActivityChart from "./PlatformActivityChart";
import PlatformActivityFilters from "./PlatformActivityFilters";
import { usePlatformActivityTrend } from "@/lib/hooks/admin/query/usePlatformActivityTrend";
import type { PlatformActivityFilters as ActivityFilters } from "@/types/admin";

export default function PlatformActivityCard() {
  // Stores the selected chart filters
  const [filters, setFilters] = useState<ActivityFilters>({
    metric: "all",
    period: 30,
  });

  const { data, isLoading, isError, isFetching, refetch } =
    usePlatformActivityTrend(filters);

  const changePercent = data?.changePercent ?? null;

  const ChangeIcon =
    changePercent === null || changePercent === 0
      ? Minus
      : changePercent > 0
        ? ArrowUp
        : ArrowDown;

  const changeClass =
    changePercent === null || changePercent === 0
      ? "text-muted-foreground"
      : changePercent > 0
        ? "text-success"
        : "text-destructive";

  return (
    <section
      aria-labelledby="platform-activity-title"
      aria-busy={isFetching}
      className="flex h-full max-h-[420px] flex-col self-start overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
    >
      {/* Chart header and filters */}
      <header className="flex shrink-0 items-start justify-between gap-4 p-5 pb-4 sm:p-6 sm:pb-4">
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10"
          >
            <Activity className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2
              id="platform-activity-title"
              className="text-lg font-bold text-foreground"
            >
              نمو نشاط المنصة
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              مقارنة الفترة الحالية بالفترة السابقة
            </p>
          </div>
        </div>

        <PlatformActivityFilters filters={filters} onChange={setFilters} />
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
        {/* Activity summary */}
        {data && (
          <div className="mt-6 flex flex-wrap  items-center gap-x-6 gap-y-3 min-h-0 flex-1 ">
            <div>
              <p className="text-xs text-muted-foreground">
                نشاط الفترة الحالية
              </p>

              <p className="mt-1 text-2xl font-bold text-foreground">
                {data.currentTotal.toLocaleString("ar-SA")}
              </p>
            </div>

            <div className={`flex items-center gap-1 ${changeClass}`}>
              <ChangeIcon aria-hidden="true" className="h-4 w-4" />

              <span className="text-sm font-semibold">
                {changePercent === null
                  ? "لا توجد مقارنة"
                  : `${Math.abs(changePercent).toLocaleString("ar-SA")}%`}
              </span>
            </div>
          </div>
        )}

        {/* Chart states */}
        <div className="mt-5">
          {isError && !data ? (
            <AsyncErrorState
              title="تعذر تحميل نشاط المنصة"
              description="تحقق من الاتصال ثم حاول مرة أخرى."
              onRetry={refetch}
              isRetrying={isFetching}
              className="min-h-72 rounded-2xl bg-destructive/5"
            />
          ) : (
            <PlatformActivityChart
              points={data?.points ?? []}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Chart legend */}
        <div className="mt-4  flex flex-wrap items-center gap-5 border-t border-border/60 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0.5 w-7 rounded-full bg-primary"
            />

            <span>الفترة الحالية</span>
          </div>

          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="w-7 border-t-2 border-dashed border-muted-foreground"
            />

            <span>الفترة السابقة</span>
          </div>
        </div>

        {/* Announces chart updates to screen readers */}
        {data && (
          <p aria-live="polite" className="sr-only">
            إجمالي نشاط الفترة الحالية {data.currentTotal}، وإجمالي الفترة
            السابقة {data.previousTotal}.
          </p>
        )}
      </div>
    </section>
  );
}
