const SKELETON_ITEMS = 6;

export function RecentActivitySkeleton() {
  return (
    <div role="status" className="space-y-4">
      <span className="sr-only">جارٍ تحميل آخر النشاطات</span>

      {Array.from({ length: SKELETON_ITEMS }).map((_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="flex animate-pulse items-start gap-3 motion-reduce:animate-none"
        >
          <div className="h-10 w-10 shrink-0 rounded-xl bg-muted" />

          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-56 max-w-full rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}