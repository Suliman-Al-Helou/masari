'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addDoctorReview } from '@/lib/api/reviews'
import { useToast } from '@/lib/context/ToastContext'
import { useAuth } from '@/lib/hooks/useAuth'  // ← أضف

// ── Props ──
interface Props {
  doctorId:   string
  courseCode: string    // ← غيّر من courseId لـ courseCode
  doctorName: string
  onSuccess?: () => void
  onCancel?:  () => void
}

// ── Schema ──
const schema = z.object({
  rating:       z.number().min(1, 'يجب اختيار تقييم').max(5),
  clarity:      z.number().min(1, 'يجب تحديد وضوح الشرح').max(5),   // ← أضف
  fairness:     z.number().min(1, 'يجب تحديد العدالة').max(5),       // ← أضف
  would_retake: z.boolean(),                                          // ← أضف
  comment:      z.string().max(500, 'الحد الأقصى 500 حرف').optional(),
})

type FormValues = z.infer<typeof schema>

// ── Labels ──
const RATING_LABELS: Record<number, string> = {
  1: 'سيء جداً', 2: 'سيء', 3: 'مقبول', 4: 'جيد', 5: 'ممتاز',
}
const CLARITY_LABELS: Record<number, string> = {
  1: 'غير واضح', 2: 'أقل من المقبول', 3: 'مقبول', 4: 'واضح', 5: 'واضح جداً',
}
const FAIRNESS_LABELS: Record<number, string> = {
  1: 'غير عادل', 2: 'أقل من المقبول', 3: 'مقبول', 4: 'عادل', 5: 'عادل جداً',
}

// ── StarPicker ──
function StarPicker({
  value,
  onChange,
  labels,
}: {
  value:    number
  onChange: (v: number) => void
  labels:   Record<number, string>
}) {
  const [hovered, setHovered] = useState(0)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex gap-1" dir="ltr">
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(i)}
            className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
          >
            <svg
              className="w-6 h-6 transition-colors"
              viewBox="0 0 20 20"
              fill={i <= (hovered || value) ? 'var(--color-warning, #f59e0b)' : 'none'}
              stroke={i <= (hovered || value) ? 'var(--color-warning, #f59e0b)' : 'var(--color-border)'}
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
  )
}

// ── Main Component ──
export function AddDoctorReviewForm({ doctorId, courseCode, doctorName, onSuccess, onCancel }: Props) {
  const { user }    = useAuth()   // ← أضف
  const toast       = useToast()  // ← غيّر من showToast
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rating:       0,
      clarity:      0,
      fairness:     0,
      would_retake: false,
      comment:      '',
    },
  })

  const { comment: commentValue = '' } = watch()

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      addDoctorReview({
        user_id:         user!.id,           // ← أضف
        doctor_id:       doctorId,
        course_code:     courseCode,          // ← غيّر من course_id
        rating_overall:  values.rating,       // ← غيّر من rating
        rating_clarity:  values.clarity,      // ← أضف
        rating_fairness: values.fairness,     // ← أضف
        would_retake:    values.would_retake, // ← أضف
        review:          values.comment,      // ← غيّر من comment
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctor-reviews',      doctorId, courseCode] })
      queryClient.invalidateQueries({ queryKey: ['user-doctor-review',  doctorId, courseCode] })
      toast.success(`تم تقييم د. ${doctorName} بنجاح ✨`)  // ← غيّر من showToast
      onSuccess?.()
    },
    onError: () => {
      toast.error('حدث خطأ، حاول مرة أخرى')  // ← غيّر من showToast
    },
  })

  return (
    <form
      onSubmit={handleSubmit(v => mutation.mutate(v))}
      className="mt-3 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)] flex flex-col gap-4"
    >
      {/* التقييم العام */}
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
          تقييم د. {doctorName} <span className="text-red-500">*</span>
        </label>
        <Controller
          control={control}
          name="rating"
          render={({ field }) => (
            <StarPicker value={field.value} onChange={field.onChange} labels={RATING_LABELS} />
          )}
        />
        {errors.rating && (
          <p className="text-xs text-red-500 mt-1">{errors.rating.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* وضوح الشرح */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            وضوح الشرح <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="clarity"
            render={({ field }) => (
              <StarPicker value={field.value} onChange={field.onChange} labels={CLARITY_LABELS} />
            )}
          />
          {errors.clarity && (
            <p className="text-xs text-red-500 mt-1">{errors.clarity.message}</p>
          )}
        </div>

        {/* العدالة */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
            العدالة في التقييم <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name="fairness"
            render={({ field }) => (
              <StarPicker value={field.value} onChange={field.onChange} labels={FAIRNESS_LABELS} />
            )}
          />
          {errors.fairness && (
            <p className="text-xs text-red-500 mt-1">{errors.fairness.message}</p>
          )}
        </div>
      </div>

      {/* هل ستأخذه مجدداً؟ */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="would_retake_doctor"
          {...register('would_retake')}
          className="w-4 h-4 rounded accent-[var(--color-primary)]"
        />
        <label htmlFor="would_retake_doctor" className="text-sm text-[var(--color-text-primary)]">
          سأختار هذا الدكتور مجدداً
        </label>
      </div>

      {/* التعليق */}
      <div>
        <textarea
          {...register('comment')}
          rows={2}
          maxLength={500}
          placeholder="تعليق اختياري عن الدكتور..."
          className="w-full px-3 py-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] resize-none focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-40 transition"
        />
        <div className="flex justify-between mt-0.5">
          {errors.comment ? (
            <p className="text-xs text-red-500">{errors.comment.message}</p>
          ) : <span />}
          <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">
            {commentValue.length}/500
          </span>
        </div>
      </div>

      {/* الأزرار */}
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-border)] hover:bg-opacity-40 transition"
        >
          إلغاء
        </button>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="px-4 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition"
        >
          {mutation.isPending ? 'جاري الإرسال...' : 'إرسال'}
        </button>
      </div>
    </form>
  )
}