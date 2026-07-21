"use client";

import { useState } from "react";
import {
  Check,
  EyeOff,
  Loader2,
  Pencil,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";

import AsyncErrorState from "@/components/share/AsyncErrorState";
import CustomSelect from "@/components/ui/CustomSelect";
import { SatisfactionFace } from "@/components/courses/reviews/SatisfactionFace";
import {
  useAdminCourseReviewDetails,
  useModerateAdminCourseReview,
  usePermanentlyDeleteAdminCourseReview,
} from "@/lib/hooks/admin/query/useAdminCourses";
import { useToast } from "@/lib/context/ToastContext";
import type { AdminCourse, AdminCourseReviewStatus } from "@/types/admin";

interface CourseDetailsPanelProps {
  course: AdminCourse;
  isSuperAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const STATUS_LABELS: Record<AdminCourseReviewStatus, string> = {
  published: "منشور",
  hidden: "مخفي",
  rejected: "مرفوض",
};

const STATUS_OPTIONS = [
  { value: "all", label: "كل الحالات" },
  { value: "published", label: "منشور" },
  { value: "hidden", label: "مخفي" },
  { value: "rejected", label: "مرفوض" },
];

export function CourseDetailsPanel({
  course,
  isSuperAdmin,
  onEdit,
  onDelete,
}: CourseDetailsPanelProps) {
  const [sort, setSort] = useState<"newest" | "highest">("newest");
  const [status, setStatus] = useState("all");
  const { Success, Error: showError } = useToast();
  const query = useAdminCourseReviewDetails(course.id, { sort, status });
  const moderate = useModerateAdminCourseReview(course.id);
  const permanentlyDelete = usePermanentlyDeleteAdminCourseReview(course.id);

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count:
      query.data?.rating_distribution[star as 1 | 2 | 3 | 4 | 5] ?? 0,
  }));

  const changeStatus = async (
    reviewId: string,
    nextStatus: AdminCourseReviewStatus,
  ) => {
    try {
      await moderate.mutateAsync({ reviewId, status: nextStatus });
      Success("تم تحديث التقييم", `أصبحت حالة التقييم: ${STATUS_LABELS[nextStatus]}`);
    } catch (error) {
      showError(
        "تعذر تحديث التقييم",
        error instanceof globalThis.Error ? error.message : undefined,
      );
    }
  };

  const removeReview = async (reviewId: string) => {
    if (!window.confirm("حذف هذا التقييم نهائيًا؟ لا يمكن التراجع عن العملية.")) return;
    try {
      await permanentlyDelete.mutateAsync(reviewId);
      Success("تم حذف التقييم نهائيًا");
    } catch (error) {
      showError(
        "تعذر حذف التقييم",
        error instanceof globalThis.Error ? error.message : undefined,
      );
    }
  };

  return (
    <div className="min-w-0 space-y-5 p-4 sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{course.name}</h2>
            <span dir="ltr" className="text-sm text-muted-foreground">{course.code}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {[course.credits && `${course.credits} ساعات`, course.category, course.semester]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            aria-label="تعديل المادة"
            title="تعديل المادة"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={onDelete}
              aria-label="حذف المادة"
              title="حذف المادة"
              className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border text-muted-foreground hover:border-destructive/40 hover:text-destructive"
            >
              <Trash2 aria-hidden="true" className="h-4 w-4" />
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-3" aria-label="ملخص تقييم المادة">
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">التقييم العام</p>
          <div className="mt-2 flex items-center justify-center gap-2">
            <Star aria-hidden="true" className="h-5 w-5 fill-warning text-warning" />
            <span className="text-3xl font-semibold text-foreground">
              {course.average_rating ?? "—"}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{course.reviews_count} تقييم</p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">مستوى الصعوبة</p>
          <p className="mt-3 text-2xl font-semibold text-foreground">
            {course.average_difficulty === null
              ? "—"
              : `${Math.round(course.average_difficulty * 20)}%`}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/20 p-4 text-center">
          <p className="text-xs text-muted-foreground">جودة المحتوى</p>
          <div className="mt-3 flex justify-center">
            {course.average_content_quality === null ? (
              <span className="text-2xl text-muted-foreground">—</span>
            ) : (
              <SatisfactionFace value={course.average_content_quality} showLabel />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border p-4" aria-label="توزيع النجوم">
        <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="space-y-2">
            {distribution.map(({ star, count }) => (
              <div key={star} className="flex items-center gap-2 text-xs">
                <span className="w-3 tabular-nums text-muted-foreground">{star}</span>
                <Star aria-hidden="true" className="h-3.5 w-3.5 fill-warning text-warning" />
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-warning"
                    style={{
                      width: `${course.reviews_count ? (count / course.reviews_count) * 100 : 0}%`,
                    }}
                  />
                </div>
                <span className="w-6 tabular-nums text-muted-foreground">{count}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-1">
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <span className="block text-xs text-muted-foreground">عبء الدراسة</span>
              <strong className="text-sm text-foreground">{course.average_workload ?? "—"}/5</strong>
            </div>
            <div className="rounded-lg bg-muted/40 px-3 py-2">
              <span className="block text-xs text-muted-foreground">سيختارها مجددًا</span>
              <strong className="text-sm text-foreground">
                {course.retake_percent === null ? "—" : `${course.retake_percent}%`}
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-3" aria-labelledby="course-reviews-title">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 id="course-reviews-title" className="font-semibold text-foreground">
            آراء الطلاب
          </h3>
          <div className="flex min-w-0 gap-2">
            <CustomSelect
              value={sort}
              onChange={(value) => setSort(value as "newest" | "highest")}
              options={[
                { value: "newest", label: "الأحدث" },
                { value: "highest", label: "الأعلى تقييمًا" },
              ]}
              placeholder="ترتيب الآراء"
              showPlaceholderOption={false}
              className="w-36"
            />
            <CustomSelect
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              placeholder="حالة الرأي"
              showPlaceholderOption={false}
              className="w-36"
            />
          </div>
        </div>

        {query.isLoading ? (
          <div className="flex justify-center py-12" role="status">
            <Loader2 aria-hidden="true" className="h-6 w-6 animate-spin text-primary" />
            <span className="sr-only">جاري تحميل الآراء</span>
          </div>
        ) : query.isError ? (
          <AsyncErrorState
            title="تعذر تحميل الآراء"
            description="تحقق من الاتصال ثم حاول مرة أخرى."
            onRetry={query.refetch}
            isRetrying={query.isFetching}
            className="rounded-xl border border-destructive/30 bg-destructive/5 p-4"
          />
        ) : query.data?.reviews.length ? (
          <div className="divide-y divide-border rounded-xl border border-border">
            {query.data.reviews.map((review) => (
              <article key={review.id} className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {review.student?.full_name ?? "طالب غير معروف"}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {review.semester_taken ?? "الفصل غير محدد"} · {new Intl.DateTimeFormat("ar", {
                        dateStyle: "medium",
                      }).format(new Date(review.created_at))}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">
                      {STATUS_LABELS[review.status]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                      <Star aria-hidden="true" className="h-4 w-4 fill-warning text-warning" />
                      {review.rating_overall ?? "—"}
                    </span>
                  </div>
                </div>

                {review.review && (
                  <p className="text-sm leading-7 text-foreground">{review.review}</p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>الصعوبة {review.rating_difficulty ?? "—"}/5</span>
                    <span>العبء {review.rating_workload ?? "—"}/5</span>
                    {review.content_quality && (
                      <SatisfactionFace value={review.content_quality} showLabel />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {review.status !== "published" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(review.id, "published")}
                        aria-label="نشر التقييم"
                        title="نشر"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-success hover:bg-success/10"
                      >
                        <Check aria-hidden="true" className="h-4 w-4" />
                      </button>
                    )}
                    {review.status !== "hidden" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(review.id, "hidden")}
                        aria-label="إخفاء التقييم"
                        title="إخفاء"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
                      >
                        <EyeOff aria-hidden="true" className="h-4 w-4" />
                      </button>
                    )}
                    {review.status !== "rejected" && (
                      <button
                        type="button"
                        onClick={() => changeStatus(review.id, "rejected")}
                        aria-label="رفض التقييم"
                        title="رفض"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-warning hover:bg-warning/10"
                      >
                        <XCircle aria-hidden="true" className="h-4 w-4" />
                      </button>
                    )}
                    {isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => removeReview(review.id)}
                        aria-label="حذف التقييم نهائيًا"
                        title="حذف نهائي"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
            لا توجد آراء ضمن هذا الفلتر.
          </div>
        )}
      </section>
    </div>
  );
}
