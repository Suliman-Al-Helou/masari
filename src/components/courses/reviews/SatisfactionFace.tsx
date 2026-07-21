interface SatisfactionFaceProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

const LABELS: Record<number, string> = {
  1: "ضعيف",
  2: "دون المتوقع",
  3: "مقبول",
  4: "جيد",
  5: "ممتاز",
};

const MOUTHS: Record<number, string> = {
  1: "M7 16c2.5-3 7.5-3 10 0",
  2: "M8 15c2-1.8 6-1.8 8 0",
  3: "M8 15h8",
  4: "M8 14c2 2 6 2 8 0",
  5: "M7 13c2.5 4 7.5 4 10 0",
};

export function SatisfactionFace({
  value,
  className = "h-7 w-7",
  showLabel = false,
}: SatisfactionFaceProps) {
  const normalized = Math.min(5, Math.max(1, Math.round(value)));
  const label = LABELS[normalized];

  return (
    <span className="inline-flex items-center gap-2" aria-label={`جودة المحتوى: ${label}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          className="fill-warning/10 stroke-warning"
          strokeWidth="1.7"
        />
        <circle cx="9" cy="10" r="1" className="fill-warning" />
        <circle cx="15" cy="10" r="1" className="fill-warning" />
        <path
          d={MOUTHS[normalized]}
          className="stroke-warning"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
      {showLabel && <span className="text-xs font-medium text-foreground">{label}</span>}
    </span>
  );
}

export const SATISFACTION_LABELS = LABELS;
