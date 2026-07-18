import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  max?: number;
  size?: number;
  className?: string;
  label?: string;
}

export function StarRating({
  value,
  max = 5,
  size = 16,
  className,
  label,
}: StarRatingProps) {
  const safeValue = Number.isFinite(value)
    ? Math.min(Math.max(value, 0), max)
    : 0;

  return (
    <div
      role="img"
      dir="ltr"
      aria-label={label ?? `التقييم ${safeValue.toFixed(1)} من ${max}`}
      className={cn("flex items-center gap-0.5", className)}
    >
      {Array.from({ length: max }, (_, index) => {
        const fillAmount = Math.min(
          Math.max(safeValue - index, 0),
          1,
        );

        return (
          <span
            key={index}
            aria-hidden="true"
            className="relative inline-flex shrink-0"
            style={{ width: size, height: size }}
          >
            {/* النجمة الفارغة */}
            <Star
              size={size}
              strokeWidth={1.8}
              className="absolute inset-0 text-muted-foreground/40"
            />

            {/* الجزء الممتلئ من النجمة */}
            {fillAmount > 0 && (
              <span
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${fillAmount * 100}%` }}
              >
                <Star
                  size={size}
                  strokeWidth={1.8}
                  className="fill-warning text-warning"
                />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}