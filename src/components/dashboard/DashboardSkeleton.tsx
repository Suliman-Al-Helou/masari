function Pulse({ className }: { className: string }) {
  return (
    <div className={`animate-pulse bg-muted rounded-lg ${className}`} />
  );
}

function CardSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
      {children}
    </div>
  );
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">

      {/* WelcomeCard skeleton */}
      <div className="bg-primary/20 border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Pulse className="h-3 w-20" />
            <Pulse className="h-6 w-40" />
            <div className="flex gap-2 mt-3">
              <Pulse className="h-6 w-24 rounded-full" />
              <Pulse className="h-6 w-16 rounded-full" />
            </div>
          </div>
          <div className="space-y-2">
            <Pulse className="h-6 w-28" />
            <Pulse className="h-3 w-36" />
            <Pulse className="h-3 w-28" />
          </div>
        </div>
      </div>

      {/* StatsGrid skeleton — 3 كروت */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <CardSkeleton key={i}>
            <Pulse className="h-3 w-24" />
            <div className="flex items-end gap-2">
              <Pulse className="h-7 w-16" />
              <Pulse className="h-3 w-10 mb-1" />
            </div>
            <div className="flex items-center gap-2">
              <Pulse className="h-2 w-2 rounded-full" />
              <Pulse className="h-3 w-28" />
            </div>
            <Pulse className="h-1.5 w-full rounded-full" />
          </CardSkeleton>
        ))}
      </div>

      {/* QuickFeatures skeleton */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <Pulse className="h-4 w-32 mb-4" />
        <div className="grid grid-cols-4 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Pulse className="h-12 w-12 rounded-xl" />
              <Pulse className="h-3 w-14" />
            </div>
          ))}
        </div>
      </div>

      {/* الصف الأسفل */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">

          {/* QuickStats skeleton — 3 كروت صغيرة */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <CardSkeleton key={i}>
                <Pulse className="h-7 w-10 mx-auto" />
                <Pulse className="h-3 w-16 mx-auto" />
              </CardSkeleton>
            ))}
          </div>

          {/* ProgressCard skeleton */}
          <CardSkeleton>
            <div className="flex justify-between">
              <Pulse className="h-4 w-28" />
              <Pulse className="h-5 w-10" />
            </div>
            <Pulse className="h-3 w-full rounded-full" />
            <div className="flex justify-between">
              <Pulse className="h-3 w-16" />
              <Pulse className="h-3 w-24" />
              <Pulse className="h-3 w-16" />
            </div>
          </CardSkeleton>

          {/* CurrentCourses skeleton */}
          <CardSkeleton>
            <Pulse className="h-4 w-32" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <Pulse className="h-8 w-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Pulse className="h-3 w-32" />
                  <Pulse className="h-3 w-20" />
                </div>
                <Pulse className="h-5 w-12 rounded-full" />
              </div>
            ))}
          </CardSkeleton>

        </div>

        <div className="space-y-6">

          {/* UpcomingTasks skeleton */}
          <CardSkeleton>
            <Pulse className="h-4 w-28" />
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border">
                <Pulse className="h-5 w-5 rounded flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Pulse className="h-3 w-36" />
                  <Pulse className="h-3 w-16" />
                </div>
                <Pulse className="h-3 w-12" />
                <Pulse className="h-2 w-2 rounded-full" />
              </div>
            ))}
          </CardSkeleton>

          {/* RecentNotes skeleton */}
          <CardSkeleton>
            <Pulse className="h-4 w-28" />
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border">
                <Pulse className="h-8 w-8 rounded-lg flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <Pulse className="h-3 w-40" />
                  <Pulse className="h-3 w-24" />
                </div>
                <Pulse className="h-3 w-8" />
              </div>
            ))}
          </CardSkeleton>

        </div>
      </div>
    </div>
  );
}