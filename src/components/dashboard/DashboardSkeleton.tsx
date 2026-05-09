function Bone({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded-xl ${className}`} />;
}

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* StatsGrid */}
      <div className="grid grid-cols-3 gap-3">
        <Bone className="h-20" />
        <Bone className="h-20" />
        <Bone className="h-20" />
      </div>

      {/* QuickFeatures */}
      <Bone className="h-24 rounded-2xl" />

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Bone className="h-28 rounded-2xl" />
          <Bone className="h-20 rounded-2xl" />
          <Bone className="h-32 rounded-2xl" />
        </div>
        <div className="space-y-6">
          <Bone className="h-64 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
