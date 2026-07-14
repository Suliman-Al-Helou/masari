// components/course/reviews/CourseReviewStats.tsx
"use client";

import { CourseReviewStats as Stats } from "@/lib/api/reviews";

interface Props {
  stats: Stats;
}

function StarBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
        <div
          className="absolute inset-y-0 right-0 rounded-full bg-[var(--color-primary)] transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-[var(--color-text-secondary)] w-6 text-left tabular-nums">
        {value.toFixed(1)}
      </span>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className="w-5 h-5"
          viewBox="0 0 20 20"
          fill={
            i <= Math.round(value) ? "var(--color-warning, #f59e0b)" : "none"
          }
          stroke={
            i <= Math.round(value)
              ? "var(--color-warning, #f59e0b)"
              : "var(--color-border)"
          }
          strokeWidth={1.5}
        >
          <path
            strokeLinejoin="round"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  );
}

const WORKLOAD_LABELS: Record<number, string> = {
  1: "خفيف جداً",
  2: "خفيف",
  3: "معتدل",
  4: "ثقيل",
  5: "ثقيل جداً",
};

const DIFFICULTY_LABELS: Record<number, string> = {
  1: "سهل جداً",
  2: "سهل",
  3: "متوسط",
  4: "صعب",
  5: "صعب جداً",
};

export function CourseReviewStats({ stats }: Props) {
  if (stats.total === 0) {
    return (
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-center">
        <p className="text-[var(--color-text-secondary)] text-sm">
          لا توجد تقييمات بعد
        </p>
      </div>
    );
  }

  const roundedRating = Math.round(stats.avg_rating * 10) / 10;
  const safeStats = stats ?? {
    total: 0,
    avg_rating: 0,
    avg_workload: 0,
    avg_difficulty: 0,
    distribution: {},
  };

  return (
    <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Score big */}
        <div className="flex flex-col items-center justify-center gap-2 min-w-[120px]">
          <span
            className="text-5xl font-bold text-[var(--color-text-primary)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {roundedRating.toFixed(1)}
          </span>
          <Stars value={stats.avg_rating} />
          <span className="text-xs text-[var(--color-text-secondary)]">
            {stats.total} {stats.total === 1 ? "تقييم" : "تقييمات"}
          </span>
        </div>

        {/* Distribution */}
        <div className="flex-1 flex flex-col justify-center gap-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const distribution = safeStats.distribution ?? {};
            const count = distribution[star] ?? 0;
            const pct =
              safeStats.total > 0 ? (count / safeStats.total) * 100 : 0;

            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-[var(--color-text-secondary)] w-4 text-left">
                  {star}
                </span>
                <svg
                  className="w-3 h-3 text-[var(--color-warning,#f59e0b)] shrink-0"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <div className="relative flex-1 h-2 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="absolute inset-y-0 right-0 rounded-full bg-[var(--color-warning,#f59e0b)] transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-xs text-[var(--color-text-secondary)] w-6 text-left tabular-nums">
                  {count}
                </span>
              </div>
            );
          })}
        </div>

        {/* Workload + Difficulty */}
        <div className="flex flex-col justify-center gap-4 min-w-[160px]">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-[var(--color-text-primary)]">
                عبء العمل
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {WORKLOAD_LABELS[Math.round(stats.avg_workload)] ?? ""}
              </span>
            </div>
            <StarBar value={stats.avg_workload} />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-medium text-[var(--color-text-primary)]">
                مستوى الصعوبة
              </span>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {DIFFICULTY_LABELS[Math.round(stats.avg_difficulty)] ?? ""}
              </span>
            </div>
            <StarBar value={stats.avg_difficulty} />
          </div>
        </div>
      </div>
    </div>
  );
}
