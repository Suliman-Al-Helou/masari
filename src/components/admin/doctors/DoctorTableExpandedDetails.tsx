"use client";

import { BookOpen, Star } from "lucide-react";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import { StarRating } from "@/components/ui/star-rating";
import { useAdminDoctorReviewDetails } from "@/lib/hooks/admin/query/useAdminDoctorReviewDetails";
import type { AdminDoctor } from "@/types/admin";

interface DoctorTableExpandedDetailsProps {
  doctor: AdminDoctor;
  onView: (doctor: AdminDoctor, courseCode?: string) => void;
}

function ExpandedDetailsSkeleton() {
  return (
    <div className="grid gap-8 p-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="h-5 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        <div className="h-20 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-4 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        ))}
      </div>
    </div>
  );
}

export function DoctorTableExpandedDetails({
  doctor,
  onView,
}: DoctorTableExpandedDetailsProps) {
  const { data, isLoading, isError, isFetching, refetch } =
    useAdminDoctorReviewDetails(doctor.id);

  if (isLoading) return <ExpandedDetailsSkeleton />;

  if (isError || !data) {
    return (
      <AsyncErrorState
        title="تعذر تحميل ملخص التقييمات"
        description="حاول إعادة تحميل تفاصيل الدكتور."
        onRetry={refetch}
        isRetrying={isFetching}
        className="m-6 rounded-xl border border-destructive/30 bg-destructive/5 p-5"
      />
    );
  }

  const distribution = [5, 4, 3, 2, 1].map((rating) => {
    const count = data.reviews.filter(
      (review) => Math.round(review.rating_overall) === rating,
    ).length;
    const percent = data.reviews.length
      ? Math.round((count / data.reviews.length) * 100)
      : 0;

    return { rating, count, percent };
  });

  return (
    <div className="grid gap-8 border-t border-border px-6 py-6 lg:grid-cols-[1.15fr_1fr]">
      <section aria-labelledby={`doctor-courses-${doctor.id}`}>
        <div className="mb-4 flex items-center gap-2">
          <BookOpen aria-hidden="true" className="h-5 w-5 text-primary" />
          <h3
            id={`doctor-courses-${doctor.id}`}
            className="text-base font-bold text-foreground"
          >
            المواد التي يدرّسها
          </h3>
        </div>

        {data.doctor.courses.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {data.doctor.courses.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => onView(doctor, course.code)}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-card px-3 text-xs text-foreground transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span>{course.name}</span>
                <span dir="ltr" className="font-mono text-xs text-muted-foreground">
                  {course.code}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">لا توجد مواد مرتبطة بهذا الدكتور.</p>
        )}

        <div className="mt-7">
          {data.stats.count > 0 ? (
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <p className="text-3xl font-bold tabular-nums text-warning">
                  {data.stats.avg_overall.toFixed(1)}
                </p>
                <StarRating
                  value={data.stats.avg_overall}
                  size={18}
                  label={`تقييم الدكتور ${data.stats.avg_overall.toFixed(1)} من 5`}
                  className="mt-1"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {data.stats.count} تقييم
                </p>
              </div>
              <button
                type="button"
                onClick={() => onView(doctor)}
                className="min-h-11 rounded-xl px-3 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                عرض جميع الآراء
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد تقييمات لهذا الدكتور بعد.</p>
          )}
        </div>
      </section>

      <section aria-labelledby={`doctor-rating-summary-${doctor.id}`}>
        <div className="mb-4 flex items-center gap-2">
          <Star aria-hidden="true" className="h-5 w-5 text-warning" />
          <h3
            id={`doctor-rating-summary-${doctor.id}`}
            className="text-base font-bold text-foreground"
          >
            ملخص التقييمات
          </h3>
        </div>

        <div className="space-y-3" aria-label="توزيع التقييمات من خمس نجوم إلى نجمة واحدة">
          {distribution.map(({ rating, count, percent }) => (
            <div key={rating} className="grid grid-cols-[2rem_1fr_3rem] items-center gap-3">
              <span className="flex items-center gap-1 text-xs tabular-nums text-foreground">
                {rating}
                <Star aria-hidden="true" className="h-3.5 w-3.5 fill-warning text-warning" />
              </span>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-warning transition-[width] duration-300 motion-reduce:transition-none"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <span className="text-end text-xs tabular-nums text-muted-foreground">
                {count}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}