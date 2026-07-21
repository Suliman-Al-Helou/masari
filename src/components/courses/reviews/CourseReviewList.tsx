'use client'

import { formatDistanceToNow } from 'date-fns'
import { ar } from 'date-fns/locale'
import { CourseReview } from '@/lib/api/reviews'
import Image from 'next/image'
import { Flag, Loader2 } from 'lucide-react'

interface Props {
  reviews: CourseReview[]
  currentUserId?: string | null
  reportingReviewId?: string | null
  onReport?: (reviewId: string) => void
}

// ── Avatar ──
function Avatar({ name, url }: { name: string; url?: string | null }) {
  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('')

  if (url) {
    return (
      <Image
        src={url}
        alt={name}
        className="w-9 h-9 rounded-full object-cover shrink-0"
      />
    )
  }
  return (
    <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
      <span className="text-xs font-bold text-primary">{initials}</span>
    </div>
  )
}

// ── MiniStars ──
function MiniStars({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map(i => (
        <svg
          key={i}
          className="w-3.5 h-3.5"
          viewBox="0 0 20 20"
          fill={i <= value ? 'var(--color-warning, #f59e0b)' : 'none'}
          stroke={i <= value ? 'var(--color-warning, #f59e0b)' : 'var(--color-border)'}
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

// ── Labels ──
const WORKLOAD_LABELS: Record<number, string> = {
  1: 'خفيف جداً', 2: 'خفيف', 3: 'معتدل', 4: 'ثقيل', 5: 'ثقيل جداً',
}
const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'سهل جداً', 2: 'سهل', 3: 'متوسط', 4: 'صعب', 5: 'صعب جداً',
}

// ── Badge ──
function Badge({ label, value, labelMap }: {
  label:    string
  value:    number
  labelMap: Record<number, string>
}) {
  const colorMap: Record<number, string> = {
    1: 'bg-emerald-100 text-emerald-700',
    2: 'bg-emerald-100 text-emerald-700',
    3: 'bg-amber-100 text-amber-700',
    4: 'bg-orange-100 text-orange-700',
    5: 'bg-red-100 text-red-700',
  }
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${colorMap[value]}`}>
      {label}: {labelMap[value]}
    </span>
  )
}

// ── Main Component ──
export function CourseReviewList({
  reviews,
  currentUserId,
  reportingReviewId,
  onReport,
}: Props) {
  if (reviews.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        لا توجد تقييمات بعد — كن أول من يقيّم هذه المادة!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map(review => {
        const name    = review.profiles?.full_name ?? 'مجهول'
        const timeAgo = formatDistanceToNow(new Date(review.created_at), {
          addSuffix: true,
          locale: ar,
        })

        return (
          <div
            key={review.id}
            className="rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
          >
            <div className="flex items-start gap-3">
              <Avatar
                name={name}
                url={review.profiles?.avatar_url ?? null}  // ← optional chaining
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {name}
                    </span>
                    <MiniStars value={review.rating_overall} />  {/* ← صح */}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{timeAgo}</span>
                    {onReport && review.user_id !== currentUserId && (
                      <button
                        type="button"
                        onClick={() => onReport(review.id)}
                        disabled={reportingReviewId === review.id}
                        aria-label="الإبلاغ عن الرأي"
                        title="الإبلاغ عن الرأي"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                      >
                        {reportingReviewId === review.id ? (
                          <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
                        ) : (
                          <Flag aria-hidden="true" className="h-4 w-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-2">
                  <Badge label="عبء"   value={review.rating_workload}    labelMap={WORKLOAD_LABELS} />
                  <Badge label="صعوبة" value={review.rating_difficulty}  labelMap={DIFFICULTY_LABELS} />
                </div>

                {review.review && (  // ← صح
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {review.review}
                  </p>
                )}

                {review.would_retake && (
                  <span className="inline-flex items-center gap-1 text-xs text-emerald-600 mt-1">
                    ✓ سيأخذها مجدداً
                  </span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
