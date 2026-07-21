"use client";

import { ArrowLeft, BookOpen, Star } from "lucide-react";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import { SatisfactionFace } from "@/components/courses/reviews/SatisfactionFace";
import { useAdminCourse } from "@/lib/hooks/admin/query/useAdminCourses";
import type { AdminCourse } from "@/types/admin";

interface CourseExpandedStatsProps {
  course: AdminCourse;
  onViewReviews: () => void;
}

export function CourseExpandedStats({
  course,
  onViewReviews,
}: CourseExpandedStatsProps) {
  const { data, isLoading, isError, isFetching, refetch } =
    useAdminCourse(course.id);

  if (isLoading) {
    return (
      <div className="grid gap-3 p-4 sm:grid-cols-3" role="status">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
        ))}
        <span className="sr-only">جاري تحميل ملخص التقييمات</span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <AsyncErrorState
        title="تعذر تحميل تقييمات المادة"
        description="حاول إعادة تحميل الملخص."
        onRetry={refetch}
        isRetrying={isFetching}
        className="m-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4"
      />
    );
  }

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: course.rating_distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0,
  }));
  const total = course.reviews_count;

  return (
    <div className="grid gap-4 bg-muted/20 p-4 lg:grid-cols-[1.2fr_1fr_1fr]">
      <section aria-label="توزيع تقييم المادة" className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">توزيع النجوم</h3>
          {total > 0 && total < 3 && (
            <span className="text-xs text-warning">بيانات محدودة</span>
          )}
        </div>
        <div className="space-y-2">
          {distribution.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="w-3 tabular-nums text-muted-foreground">{star}</span>
              <Star aria-hidden="true" className="h-3.5 w-3.5 fill-warning text-warning" />
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-warning"
                  style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                />
              </div>
              <span className="w-5 tabular-nums text-muted-foreground">{count}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3" aria-label="مؤشرات المادة">
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">الصعوبة</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {course.average_difficulty === null
              ? "—"
              : `${Math.round(course.average_difficulty * 20)}%`}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">عبء الدراسة</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {course.average_workload === null ? "—" : `${course.average_workload}/5`}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">سيختارها مجددًا</p>
          <p className="mt-2 text-xl font-semibold text-foreground">
            {course.retake_percent === null ? "—" : `${course.retake_percent}%`}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-3 text-center">
          <p className="text-xs text-muted-foreground">جودة المحتوى</p>
          <div className="mt-2 flex justify-center">
            {course.average_content_quality === null ? (
              <span className="text-xl text-muted-foreground">—</span>
            ) : (
              <SatisfactionFace value={course.average_content_quality} showLabel />
            )}
          </div>
        </div>
      </section>

      <section className="flex flex-col justify-between rounded-xl border border-border bg-card p-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen aria-hidden="true" className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">المتطلبات السابقة</h3>
          </div>
          {data.prerequisites?.length ? (
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              {data.prerequisites.map((item) => (
                <li key={item.id} className="flex justify-between gap-3">
                  <span>{item.name}</span>
                  <span dir="ltr">{item.code}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-xs text-muted-foreground">لا توجد متطلبات سابقة.</p>
          )}
        </div>
        <button
          type="button"
          onClick={onViewReviews}
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-primary/30 text-sm font-medium text-primary hover:bg-primary/10"
        >
          عرض الآراء
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        </button>
      </section>
    </div>
  );
}
