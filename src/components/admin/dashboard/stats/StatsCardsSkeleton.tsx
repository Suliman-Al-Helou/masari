const STATS_COUNT = 5;

export function StatsCardsSkeleton() {
  return (
    <div
      role="status"
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
    >
      {/* رسالة خاصة بقارئ الشاشة */}
      <span className="sr-only">
        جارٍ تحميل إحصائيات لوحة التحكم
      </span>

      {Array.from({ length: STATS_COUNT }).map((_, index) => (
        <div
          key={index}
          aria-hidden
          className="min-h-40 animate-pulse rounded-2xl border border-border/60 bg-card p-5 motion-reduce:animate-none"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-3">
              {/* عنوان البطاقة */}
              <div className="h-4 w-24 rounded bg-muted" />

              {/* قيمة الإحصائية */}
              <div className="h-8 w-20 rounded bg-muted" />
            </div>

            {/* الأيقونة */}
            <div className="h-11 w-11 rounded-full bg-muted" />
          </div>

          <div className="mt-6 flex items-end justify-between">
            <div className="space-y-2">
              {/* نسبة التغيير */}
              <div className="h-3 w-14 rounded bg-muted" />

              {/* نص المقارنة */}
              <div className="h-3 w-24 rounded bg-muted" />
            </div>

            {/* الرسم المصغر */}
            <div className="h-7 w-20 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}