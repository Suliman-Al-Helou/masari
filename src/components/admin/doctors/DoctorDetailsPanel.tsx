"use client";

import { BookOpen, CheckCircle2, MessageSquare } from "lucide-react";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import { StarRating } from "@/components/ui/star-rating";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAdminDoctorReviewDetails } from "@/lib/hooks/admin/query/useAdminDoctorReviewDetails";

import { DoctorSpecialtyIcon } from "./DoctorSpecialtyIcon";

interface DoctorDetailsPanelProps {
  doctorId: string;
  courseCode?: string | null;
  onCourseChange: (courseCode: string | null) => void;
}

function formatReviewDate(date: string): string {
  return new Intl.DateTimeFormat("ar", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

function DoctorDetailsSkeleton() {
  return (
    <div className="space-y-5 p-5">
      <div className="h-16 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      <div className="h-24 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
      <div className="h-48 animate-pulse rounded-xl bg-muted motion-reduce:animate-none" />
    </div>
  );
}

export function DoctorDetailsPanel({
  doctorId,
  courseCode,
  onCourseChange,
}: DoctorDetailsPanelProps) {
  const {
    data,
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useAdminDoctorReviewDetails(doctorId, courseCode);

  if (isLoading) {
    return <DoctorDetailsSkeleton />;
  }

  if (isError || !data) {
    return (
      <AsyncErrorState
        title="تعذر تحميل تفاصيل الدكتور"
        description="تحقق من الاتصال ثم حاول مرة أخرى."
        onRetry={refetch}
        isRetrying={isFetching}
        className="p-6"
      />
    );
  }

  const { doctor, stats, reviews, selected_course } = data;

  return (
    <TooltipProvider delayDuration={250}>
      <div className="space-y-6 p-5">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <DoctorSpecialtyIcon
              major={doctor.major}
              className="h-11 w-11"
            />

            <div className="min-w-0">
              <h2 className="truncate text-lg font-bold text-foreground">
                {doctor.name}
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                {doctor.major} · {doctor.university}
              </p>
            </div>
          </div>

          {stats.count > 0 && (
            <div className="text-end">
              <StarRating
                value={stats.avg_overall}
                size={18}
                label={`التقييم ${stats.avg_overall} من 5`}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                {stats.count} تقييم
              </p>
            </div>
          )}
        </header>

        <section aria-labelledby="doctor-courses-title">
          <div className="mb-3 flex items-center gap-2">
            <BookOpen
              aria-hidden="true"
              className="h-4 w-4 text-primary"
            />

            <h3
              id="doctor-courses-title"
              className="text-sm font-semibold text-foreground"
            >
              المواد التي يدرّسها
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              aria-pressed={!courseCode}
              onClick={() => onCourseChange(null)}
              className={`min-h-11 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                !courseCode
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/40"
              }`}
            >
              كل المواد
            </button>

            {doctor.courses.map((course) => (
              <Tooltip key={course.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    aria-pressed={courseCode === course.code}
                    onClick={() => onCourseChange(course.code)}
                    className={`min-h-11 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      courseCode === course.code
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-foreground hover:border-primary/40"
                    }`}
                  >
                    {course.name}

                    <span
                      dir="ltr"
                      className="ms-2 font-mono text-xs opacity-70"
                    >
                      {course.code}
                    </span>
                  </button>
                </TooltipTrigger>

                <TooltipContent side="top">
                  اضغط لعرض تقييم الدكتور في هذه المادة
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </section>

        <section
          aria-label={
            selected_course
              ? `تقييم الدكتور في ${selected_course.name}`
              : "تقييم الدكتور في جميع المواد"
          }
          className="overflow-hidden rounded-2xl border border-border"
        >
          <div className="grid grid-cols-2 divide-x divide-x-reverse divide-border sm:grid-cols-4">
            <div className="p-4">
              <p className="text-xs text-muted-foreground">
                التقييم العام
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {stats.count > 0 ? stats.avg_overall.toFixed(1) : "—"}
              </p>
            </div>

            <div className="p-4">
              <p className="text-xs text-muted-foreground">
                وضوح الشرح
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {stats.count > 0 ? stats.avg_clarity.toFixed(1) : "—"}
              </p>
            </div>

            <div className="border-t border-border p-4 sm:border-t-0">
              <p className="text-xs text-muted-foreground">
                عدالة التقييم
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {stats.count > 0 ? stats.avg_fairness.toFixed(1) : "—"}
              </p>
            </div>

            <div className="border-t border-border p-4 sm:border-t-0">
              <p className="text-xs text-muted-foreground">
                يدرسون معه مجددًا
              </p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                {stats.count > 0 ? `${stats.retake_percent}%` : "—"}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="student-reviews-title">
          <div className="mb-3 flex items-center gap-2">
            <MessageSquare
              aria-hidden="true"
              className="h-4 w-4 text-primary"
            />

            <h3
              id="student-reviews-title"
              className="text-sm font-semibold text-foreground"
            >
              آراء الطلاب
            </h3>
          </div>

          {reviews.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border px-5 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                لا توجد تقييمات
              </p>

              <p className="mt-1 text-xs text-muted-foreground">
                لم يقيّم الطلاب هذا الدكتور في المادة المحددة بعد.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border rounded-2xl border border-border">
              {reviews.map((review) => (
                <article key={review.id} className="space-y-3 p-4">
                  <header className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {review.student.full_name}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {review.student.university ?? "جامعة غير محددة"}
                        {" · "}
                        {formatReviewDate(review.created_at)}
                      </p>
                    </div>

                    <StarRating
                      value={review.rating_overall}
                      size={15}
                      label={`التقييم ${review.rating_overall} من 5`}
                    />
                  </header>

                  {review.review && (
                    <p className="text-sm leading-6 text-foreground">
                      {review.review}
                    </p>
                  )}

                  {review.would_retake && (
                    <div className="flex items-center gap-1.5 text-xs text-success">
                      <CheckCircle2
                        aria-hidden="true"
                        className="h-4 w-4"
                      />
                      سيدرس مع هذا الدكتور مرة أخرى
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </TooltipProvider>
  );
}