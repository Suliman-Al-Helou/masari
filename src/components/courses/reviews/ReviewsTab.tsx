// components/course/reviews/ReviewsTab.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/context/AuthContext";
import {
  getCourseReviews,
  getCourseReviewStats,
  getUserCourseReview,
  getDoctorsByCourse,
} from "@/lib/api/reviews";
import { CourseReviewStats } from "@/components/courses/reviews/CourseReviewStats";
import { CourseReviewList } from "@/components/courses/reviews/CourseReviewList";
import { AddCourseReviewForm } from "@/components/courses/reviews/AddCourseReviewForm";
import { DoctorReviewSection } from "@/components/courses/reviews/DoctorReviewSection";

interface Props {
  courseId: string;
  /** الحالة من جدول user_courses */
  courseStatus: string ;
  /** كود المادة */
  courseCode: string;
  /** جامعة المادة (اختياري) */
  university: string;
}

/** Skeleton بسيط */
function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-[var(--color-border)] bg-opacity-40 ${className}`}
    />
  );
}

export function ReviewsTab({ courseId, courseStatus,courseCode,university }: Props) {
  const { user } = useAuth();

  const isCompleted = courseStatus === "مكتملة";
  const userId = user?.id ?? null;

  // ─── Queries ──────────────────────────────────────────────────────────────

  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["course-review-stats", courseId],
    queryFn: () => getCourseReviewStats(courseId),
    staleTime: 60_000,
  });

  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ["course-reviews", courseId],
    queryFn: () => getCourseReviews(courseId),
    staleTime: 60_000,
  });

  const { data: userReview, isLoading: loadingUserReview } = useQuery({
    queryKey: ["user-course-review", courseId],
    queryFn: () => getUserCourseReview(courseId, userId!),
    enabled: !!userId && isCompleted,
    staleTime: 60_000,
  });

const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
  queryKey: ["course-doctors", courseCode, university],
  queryFn: () => getDoctorsByCourse(courseCode, university),
  enabled: Boolean(courseCode && university),
  staleTime: 300_000,
});

  // ─── Derived ──────────────────────────────────────────────────────────────

  const alreadyReviewed = !!userReview;
  const showAddForm = isCompleted && !alreadyReviewed && !loadingUserReview;

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 py-2" dir="rtl">
      {/* ── إحصاءات ── */}
      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
          إحصاءات التقييم
        </h2>
        {loadingStats ? (
          <SkeletonBlock className="h-36" />
        ) : (
          <CourseReviewStats stats={stats!} />
        )}
      </section>

      {/* ── تقييم الطالب الحالي ── */}
      {isCompleted && (
        <section>
          {loadingUserReview ? (
            <SkeletonBlock className="h-20" />
          ) : alreadyReviewed ? (
            /* عرض تقييمه السابق */
            <div className="rounded-2xl border border-[var(--color-primary)] border-opacity-30 bg-[var(--color-primary)] bg-opacity-5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <svg
                  className="w-4 h-4 text-[var(--color-primary)]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-semibold text-[var(--color-primary)]">
                  لقد قيّمت هذه المادة مسبقاً
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-[var(--color-text-secondary)]">
                <span>التقييم: {"⭐".repeat(userReview!.rating_overall)}</span>
                <span>عبء العمل: {userReview!.rating_workload}/5</span>
                <span>الصعوبة: {userReview!.rating_difficulty}/5</span>
              </div>
              {userReview!.review && (
                <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {userReview!.review}
                </p>
              )}
            </div>
          ) : (
            <AddCourseReviewForm
              courseId={courseId}
              courseCode={courseCode}
              university={university}
            />
          )}
        </section>
      )}

      {/* رسالة لمن لم يكمل المادة بعد */}
      {!isCompleted && userId && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 flex items-center gap-3">
          <svg
            className="w-5 h-5 text-[var(--color-text-secondary)] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 110 20A10 10 0 0112 2z"
            />
          </svg>
          <p className="text-sm text-[var(--color-text-secondary)]">
            يمكنك إضافة تقييم بعد إكمال هذه المادة
          </p>
        </div>
      )}

      {/* ── قائمة التقييمات ── */}
      <section>
        <h2 className="text-base font-bold text-[var(--color-text-primary)] mb-4">
          آراء الطلاب
          {!loadingReviews && reviews.length > 0 && (
            <span className="mr-2 text-sm font-normal text-[var(--color-text-secondary)]">
              ({reviews.length})
            </span>
          )}
        </h2>
        {loadingReviews ? (
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <SkeletonBlock key={i} className="h-24" />
            ))}
          </div>
        ) : (
          <CourseReviewList reviews={reviews} />
        )}
      </section>

      {/* ── تقييمات الدكاترة ── */}
      <section>
        {loadingDoctors ? (
          <SkeletonBlock className="h-32" />
        ) : (
          <DoctorReviewSection
            doctors={doctors}
            courseId={courseId}
            userId={userId}
            canReview={isCompleted}
          />
        )}
      </section>
    </div>
  );
}
