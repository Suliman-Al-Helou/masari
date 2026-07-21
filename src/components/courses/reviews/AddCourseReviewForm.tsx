"use client";

import { useState } from "react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addCourseReview } from "@/lib/api/reviews";
import { useToast } from "@/lib/context/ToastContext";
import { useAuth } from "@/lib/hooks/useAuth";
import { SatisfactionFace } from "@/components/courses/reviews/SatisfactionFace";

// ── Props ──
interface Props {
  adminCourseId?: string | null;
  courseCode: string;
  university: string;
  onSuccess?: () => void;
}

// ── Schema ──
const schema = z.object({
  rating: z.number().min(1, "يجب اختيار تقييم").max(5),
  workload: z.number().min(1, "يجب تحديد عبء العمل").max(5),
  difficulty: z.number().min(1, "يجب تحديد مستوى الصعوبة").max(5),
  content_quality: z.number().min(1, "يجب تقييم جودة المحتوى").max(5),
  would_retake: z.boolean(), // ← احذف .default(false)
  comment: z.string().max(500, "الحد الأقصى 500 حرف").optional(),
});

type FormValues = z.infer<typeof schema>;

// ── Labels ──
const RATING_LABELS: Record<number, string> = {
  1: "ضعيف",
  2: "دون المتوقع",
  3: "مقبول",
  4: "جيد",
  5: "ممتاز",
};
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

// ── StarPicker ──
function StarPicker({
  value,
  onChange,
  labels,
}: {
  value: number;
  onChange: (v: number) => void;
  labels: Record<number, string>;
}) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              className="w-7 h-7 transition-colors"
              viewBox="0 0 20 20"
              fill={
                i <= (hovered || value)
                  ? "var(--color-warning, #f59e0b)"
                  : "none"
              }
              stroke={
                i <= (hovered || value)
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
          </button>
        ))}
      </div>
      {(hovered || value) > 0 && (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  );
}

// ── Main Component ──
export function AddCourseReviewForm({
  adminCourseId,
  courseCode,
  university,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const { Success, Error } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating: 0,
      workload: 0,
      difficulty: 0,
      content_quality: 0,
      would_retake: false,
      comment: "",
    },
  });

  const commentValue = useWatch({ control, name: "comment" }) ?? "";

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      addCourseReview({
        user_id: user!.id,
        admin_course_id: adminCourseId ?? null,
        course_code: courseCode,
        university: university,
        rating_overall: values.rating,
        rating_difficulty: values.difficulty,
        rating_workload: values.workload,
        content_quality: values.content_quality,
        would_retake: values.would_retake,
        review: values.comment,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["course-reviews", adminCourseId ?? courseCode],
      });

      queryClient.invalidateQueries({
        queryKey: ["course-review-stats", adminCourseId ?? courseCode],
      });

      queryClient.invalidateQueries({
        queryKey: [
          "user-course-review",
          user!.id,
          adminCourseId ?? courseCode,
        ],
      });
      Success("تم إضافة تقييمك بنجاح ✨");
      reset();
      setOpen(false);
      onSuccess?.();
    },
    onError: () => {
      Error("حدث خطأ، حاول مرة أخرى");
    },
  });

  // ── Closed State ──
  if (!open) {
    return (
      <div className="flex justify-center">
        <button
          onClick={() => setOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4v16m8-8H4"
            />
          </svg>
          أضف تقييمك
        </button>
      </div>
    );
  }

  // ── Form ──
  return (
    <div className="rounded-2xl border border-[var(--color-primary)] border-opacity-30 bg-[var(--color-surface)] p-5">
      <h3 className="font-bold text-[var(--color-text-primary)] mb-5 text-base">
        أضف تقييمك للمادة
      </h3>

      <form
        onSubmit={handleSubmit((v) => mutation.mutate(v))}
        className="flex flex-col gap-5"
      >
        {/* التقييم العام */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            التقييم العام <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="rating"
            render={({ field }) => (
              <StarPicker
                value={field.value}
                onChange={field.onChange}
                labels={RATING_LABELS}
              />
            )}
          />
          {errors.rating && (
            <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* عبء العمل */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              عبء العمل <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="workload"
              render={({ field }) => (
                <StarPicker
                  value={field.value}
                  onChange={field.onChange}
                  labels={WORKLOAD_LABELS}
                />
              )}
            />
            {errors.workload && (
              <p className="text-xs text-red-500 mt-1">
                {errors.workload.message}
              </p>
            )}
          </div>

          {/* مستوى الصعوبة */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              مستوى الصعوبة <span className="text-red-500">*</span>
            </label>
            <Controller
              control={control}
              name="difficulty"
              render={({ field }) => (
                <StarPicker
                  value={field.value}
                  onChange={field.onChange}
                  labels={DIFFICULTY_LABELS}
                />
              )}
            />
            {errors.difficulty && (
              <p className="text-xs text-red-500 mt-1">
                {errors.difficulty.message}
              </p>
            )}
          </div>
        </div>

        {/* جودة المحتوى */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-3">
            جودة المحتوى <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="content_quality"
            render={({ field }) => (
              <div className="grid grid-cols-5 gap-2" role="radiogroup" aria-label="جودة المحتوى">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={field.value === value}
                    onClick={() => field.onChange(value)}
                    className={`flex min-w-0 flex-col items-center gap-1.5 rounded-xl border p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] ${
                      field.value === value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/10"
                        : "border-[var(--color-border)] hover:bg-[var(--color-bg)]"
                    }`}
                  >
                    <SatisfactionFace value={value} className="h-8 w-8" />
                    <span className="text-[10px] text-[var(--color-text-secondary)] sm:text-xs">
                      {RATING_LABELS[value]}
                    </span>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.content_quality && (
            <p className="mt-1 text-xs text-red-500">
              {errors.content_quality.message}
            </p>
          )}
        </div>

        {/* هل ستأخذها مجدداً؟ */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="would_retake"
            {...register("would_retake")}
            className="w-4 h-4 rounded accent-[var(--color-primary)]"
          />
          <label
            htmlFor="would_retake"
            className="text-sm text-[var(--color-text-primary)]"
          >
            سأختار هذه المادة مجدداً
          </label>
        </div>

        {/* التعليق */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            تعليقك (اختياري)
          </label>
          <textarea
            {...register("comment")}
            rows={3}
            maxLength={500}
            placeholder="شاركنا رأيك عن هذه المادة..."
            className="w-full px-3 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-40 transition"
          />
          <div className="flex justify-between mt-1">
            {errors.comment ? (
              <p className="text-xs text-red-500">{errors.comment.message}</p>
            ) : (
              <span />
            )}
            <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">
              {commentValue.length}/500
            </span>
          </div>
        </div>

        {/* الأزرار */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={() => {
              reset();
              setOpen(false);
            }}
            className="px-4 py-2 rounded-xl text-sm font-medium text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:bg-opacity-40 transition"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            className="px-5 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition"
          >
            {mutation.isPending ? "جاري الإرسال..." : "إرسال التقييم"}
          </button>
        </div>
      </form>
    </div>
  );
}
