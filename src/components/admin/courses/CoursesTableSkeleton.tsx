export function CoursesTableSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-card"
      aria-label="جاري تحميل المواد"
      role="status"
    >
      <div className="h-14 animate-pulse border-b border-border bg-muted/50 motion-reduce:animate-none" />
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          className="flex h-16 items-center gap-4 border-b border-border px-5 last:border-b-0"
        >
          <div className="h-9 w-14 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-40 animate-pulse rounded bg-muted motion-reduce:animate-none" />
            <div className="h-2.5 w-24 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          </div>
          <div className="h-8 w-24 animate-pulse rounded-lg bg-muted motion-reduce:animate-none" />
        </div>
      ))}
      <span className="sr-only">جاري تحميل المواد</span>
    </div>
  );
}
