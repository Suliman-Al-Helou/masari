// components/course/reviews/DoctorReviewSection.tsx
'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import {
  Doctor,
  DoctorReview,
  getDoctorReviews,
  getUserDoctorReview,
} from '@/lib/api/reviews'
import { AddDoctorReviewForm } from '@/components/courses/reviews/AddDoctorReviewForm'

interface DoctorCardProps {
  doctor: Doctor
  courseId: string
  userId: string | null
  canReview: boolean
}

function MiniStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className="w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill={i <= Math.round(value) ? 'var(--color-warning, #f59e0b)' : 'none'}
          stroke={i <= Math.round(value) ? 'var(--color-warning, #f59e0b)' : 'var(--color-border)'}
          strokeWidth={1.5}
        >
          <path
            strokeLinejoin="round"
            d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
          />
        </svg>
      ))}
    </div>
  )
}

function DoctorAvatar({ name, url }: { name: string; url: string | null }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')
  if (url) {
    return <img src={url} alt={name} className="w-11 h-11 rounded-full object-cover" />
  }
  return (
    <div className="w-11 h-11 rounded-full bg-[var(--color-primary)] bg-opacity-10 flex items-center justify-center">
      <span className="text-sm font-bold text-[var(--color-primary)]">{initials}</span>
    </div>
  )
}

function ReviewItem({ review }: { review: DoctorReview }) {
  const timeAgo = formatDistanceToNow(new Date(review.created_at), { addSuffix: true, locale: ar })
  const name = review.profiles?.full_name ?? 'مستخدم'
  return (
    <div className="flex gap-2.5 py-3 border-t border-[var(--color-border)] first:border-0">
      <div className="w-7 h-7 rounded-full bg-[var(--color-border)] bg-opacity-60 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-xs font-bold text-[var(--color-text-secondary)]">
          {name[0] ?? 'م'}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              {name}
            </span>
            <MiniStars value={review.rating_overall} />
          </div>
          <span className="text-xs text-[var(--color-text-secondary)]">{timeAgo}</span>
        </div>
        {review.review && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-1 leading-relaxed">
            {review.review}
          </p>
        )}
      </div>
    </div>
  )
}

function DoctorCard({ doctor, courseId, userId, canReview }: DoctorCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const { data: reviews = [] } = useQuery({
    queryKey: ['doctor-reviews', doctor.id, courseId],
    queryFn: () => getDoctorReviews(doctor.id, courseId),
    enabled: expanded,
  })

  const { data: userReview, isLoading: loadingUserReview } = useQuery({
    queryKey: ['user-doctor-review', doctor.id, courseId],
    queryFn: () => getUserDoctorReview(userId!, doctor.id, courseId),
    enabled: !!userId && canReview,
  })

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating_overall, 0) / reviews.length
      : null

  const alreadyReviewed = !!userReview

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 p-4 text-right hover:bg-[var(--color-border)] hover:bg-opacity-10 transition"
      >
        <DoctorAvatar name={doctor.name} url={doctor.avatar_url ?? null} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[var(--color-text-primary)]">{doctor.name}</p>
          {doctor.title && (
            <p className="text-xs text-[var(--color-text-secondary)]">{doctor.title}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {avgRating !== null ? (
              <>
                <MiniStars value={avgRating} />
                <span className="text-xs text-[var(--color-text-secondary)] tabular-nums">
                  {avgRating.toFixed(1)} ({reviews.length})
                </span>
              </>
            ) : (
              <span className="text-xs text-[var(--color-text-secondary)]">لا توجد تقييمات بعد</span>
            )}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-[var(--color-border)]">
          {/* User review or add button */}
          {canReview && !loadingUserReview && (
            <div className="mt-3">
              {alreadyReviewed ? (
                <div className="rounded-lg bg-[var(--color-primary)] bg-opacity-5 border border-[var(--color-primary)] border-opacity-20 p-3">
                  <p className="text-xs font-semibold text-[var(--color-primary)] mb-1">تقييمك</p>
                  <MiniStars value={userReview!.rating_overall} />
                  {userReview!.review && (
                    <p className="text-xs text-[var(--color-text-secondary)] mt-1">{userReview!.review}</p>
                  )}
                </div>
              ) : showForm ? (
                <AddDoctorReviewForm
                  courseCode={courseId}
                  doctorId={doctor.id}
                  doctorName={doctor.name}
                  onSuccess={() => setShowForm(false)}
                  onCancel={() => setShowForm(false)}
                />
              ) : (
                <button
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  قيّم هذا الدكتور
                </button>
              )}
            </div>
          )}

          {/* All reviews */}
          {reviews.length > 0 ? (
            <div className="mt-3">
              {reviews
                .filter(r => r.user_id !== userId)
                .map(r => (
                  <ReviewItem key={r.id} review={r} />
                ))}
            </div>
          ) : (
            !canReview && (
              <p className="text-xs text-[var(--color-text-secondary)] mt-3">لا توجد تقييمات بعد</p>
            )
          )}
        </div>
      )}
    </div>
  )
}

interface Props {
  doctors: Doctor[]
  courseId: string
  userId: string | null
  canReview: boolean
}

export function DoctorReviewSection({ doctors, courseId, userId, canReview }: Props) {
  if (doctors.length === 0) {
    return (
      <div className="py-6 text-center text-[var(--color-text-secondary)] text-sm">
        لا يوجد دكاترة مرتبطون بهذه المادة
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="font-bold text-[var(--color-text-primary)] text-sm">تقييمات الدكاترة</h3>
      {doctors.map(doctor => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          courseId={courseId}
          userId={userId}
          canReview={canReview}
        />
      ))}
    </div>
  )
}