"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import StudentDistributionChart from "./StudentDistributionChart";
import StudentDistributionFilter from "./StudentDistributionFilter";
import AsyncErrorState from "@/components/share/AsyncErrorState";
import { useStudentDistribution } from "@/lib/hooks/admin/query/useStudentDistribution";
import type { StudentDistributionFilters } from "@/types/admin";

interface StudentDistributionCardProps {
  trendData?: number[];
}

function getSubtitle(filters: StudentDistributionFilters) {
  if (filters.university && filters.major) {
    return `${filters.major} في ${filters.university}`;
  }

  if (filters.university) {
    return `تخصصات الطلاب في ${filters.university}`;
  }

  if (filters.major) {
    return `الجامعات ضمن تخصص ${filters.major}`;
  }

  return "حسب الجامعة والتخصص";
}

function RegistrationTrend({ data }: { data: number[] }) {
  const shouldReduceMotion = useReducedMotion();

  if (data.length < 2) return null;

  const width = 620;
  const height = 58;
  const padding = 4;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);

    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);

    return { x, y };
  });

  return (
    <div className="flex items-end gap-4 border-t border-border/60 pt-4">
      <svg
        aria-hidden="true"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="h-12 min-w-0 flex-1 overflow-visible text-primary"
      >
        <motion.polyline
          points={points.map(({ x, y }) => `${x},${y}`).join(" ")}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={shouldReduceMotion ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
        />

        {points.map(({ x, y }, index) => (
          <circle key={index} cx={x} cy={y} r="3" fill="currentColor" />
        ))}
      </svg>

      <div className="shrink-0">
        <p className="text-xs font-medium text-foreground">نشاط التسجيل</p>

        <p className="mt-0.5 text-[11px] text-muted-foreground">خلال 7 أيام</p>
      </div>
    </div>
  );
}

export default function StudentDistributionCard({
  trendData = [],
}: StudentDistributionCardProps) {
  const [filters, setFilters] = useState<StudentDistributionFilters>({});

  const { data, isLoading, isError, isFetching, refetch } =
    useStudentDistribution(filters);

  return (
  <section
  aria-labelledby="student-distribution-title"
  aria-busy={isFetching}
  className="relative flex max-h-[420px] flex-col self-start overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
>
  {/* العنوان ثابت */}
  <div className="flex shrink-0 flex-wrap items-start justify-between gap-4 p-5 pb-4 sm:p-6 sm:pb-4">
    <div>
      <h2
        id="student-distribution-title"
        className="text-xl font-bold text-foreground"
      >
        توزيع الطلاب
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        {getSubtitle(filters)}
      </p>
    </div>

    <StudentDistributionFilter
      filters={filters}
      onApply={setFilters}
    />
  </div>

  {/* المحتوى فقط يعمل له scroll */}
  <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6 sm:pb-6">
    {isError && !data ? (
      <AsyncErrorState
        title="تعذر تحميل توزيع الطلاب"
        description="تحقق من الاتصال ثم حاول مرة أخرى."
        onRetry={refetch}
        isRetrying={isFetching}
        className="rounded-2xl bg-destructive/5"
      />
    ) : (
      <StudentDistributionChart
        items={data?.items ?? []}
        isLoading={isLoading}
      />
    )}

    <div className="mt-7">
      <RegistrationTrend data={trendData} />
    </div>

    {data && (
      <p aria-live="polite" className="sr-only">
        تم عرض {data.items.length} فئات بإجمالي {data.total} طالب.
      </p>
    )}
  </div>
</section>
  );
}
